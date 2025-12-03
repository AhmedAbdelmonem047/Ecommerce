import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { OrderRepo, CartRepo, CouponRepo, ProductRepo } from "../../DB"
import { createOrderDto } from './order.dto';
import type { HUserDocument } from '../../DB';
import { OrderStatusEnum, PaymentMethodEnum, StripeService } from '../../common';
import { Types } from 'mongoose';

@Injectable()
export class OrderService {

    constructor(
        private readonly orderRepo: OrderRepo,
        private readonly cartRepo: CartRepo,
        private readonly productRepo: ProductRepo,
        private readonly couponRepo: CouponRepo,
        private readonly stripeService: StripeService
    ) { }

    // ============ Create Order =========== //
    async createOrder(orderDto: createOrderDto, user: HUserDocument) {
        const { address, phone, paymentMethod, couponCode } = orderDto;

        let coupon: any;
        if (couponCode) {
            coupon = await this.couponRepo.findOne({ code: couponCode, usedBy: { $ne: [user._id] } });
            if (!coupon)
                throw new NotFoundException("Coupon not found");
        }

        const cart = await this.cartRepo.findOne({ createdBy: user._id });
        if (!cart || !cart.products.length)
            throw new NotFoundException("Cart not found or is empty");

        for (const product of cart.products) {
            const productData = await this.productRepo.findOne({ _id: product.productId, stock: { $gte: product.quantity } });
            if (!productData)
                throw new BadRequestException("Product not found");
        }

        const order = await this.orderRepo.create({
            userId: user._id,
            cart: cart._id,
            coupon: couponCode ? coupon._id : undefined,
            totalPrice: couponCode ? cart.subTotal - (cart.subTotal * (coupon.amount / 100)) : cart.subTotal,
            address,
            phone,
            paymentMethod,
            orderStatus: paymentMethod === PaymentMethodEnum.CASH ? OrderStatusEnum.PLACED : OrderStatusEnum.PENDING,
        })
        if (!order)
            throw new InternalServerErrorException("Order could't be created");

        for (const product of cart.products)
            await this.productRepo.findOneAndUpdate({ _id: product.productId }, { $inc: { stock: -product.quantity } });

        if (coupon)
            await this.couponRepo.findOneAndUpdate({ _id: coupon._id }, { $push: { usedBy: user._id } });

        if (paymentMethod === PaymentMethodEnum.CASH)
            await this.cartRepo.findOneAndUpdate({ _id: cart._id }, { products: [] })

        return order;
    }
    // ====================================== //


    // ========= Payment With Stripe ======== //
    async paymentWithStripe(orderId: Types.ObjectId, user: HUserDocument) {

        const order = await this.orderRepo.findOne({ _id: orderId, orderStatus: OrderStatusEnum.PENDING }, undefined, {
            populate: [
                {
                    path: "cart",
                    populate: [{
                        path: "products.productId"
                    }]
                },
                {
                    path: "coupon"
                }
            ]
        });
        if (!order || !order.cart["products"].length)
            throw new NotFoundException("Order not found");

        let coupon: any
        if (order.coupon)
            coupon = await this.stripeService.createCoupon({ percent_off: (order.coupon as any).amount });


        const session = this.stripeService.createCheckoutSession({
            customer_email: user.email,
            metadata: { orderId: order._id.toString() },
            line_items: order.cart["products"].map((product: any) => ({
                price_data: {
                    currency: 'egp',
                    product_data: { name: product.productId.name },
                    unit_amount: product.productId.price * 100
                },
                quantity: product.quantity,
            })),
            discounts: coupon ? [{ coupon: coupon.id }] : []
        })

        return session;
    }
    // ====================================== //


    // ============ Stripe Webhook ========== //
    async stripeWebhook(body: any, user: HUserDocument) {
        const orderId = body.data.object.metadata.orderId;
        const order = await this.orderRepo.findOneAndUpdate(
            { _id: orderId },
            {
                orderStatus: OrderStatusEnum.PAID,
                orderChanges: { paidAt: new Date() },
                paymentIntent: body.data.object.Payment_intent
            })
        return order;
    }
    // ====================================== //


    // ============= Refund Order =========== //
    async refundOrder(orderId: Types.ObjectId, user: HUserDocument) {
        let order = await this.orderRepo.findOneAndUpdate(
            { _id: orderId, orderStatus: { $in: [OrderStatusEnum.PENDING, OrderStatusEnum.PLACED, OrderStatusEnum.PAID] } },
            {
                orderStatus: OrderStatusEnum.CANCELED,
                orderChanges: {
                    canceledAt: new Date(),
                    canceledBy: user._id
                }
            }
        );
        if (!order)
            throw new NotFoundException("Order not found");

        if (order.paymentMethod === PaymentMethodEnum.CARD) {
            await this.stripeService.createRefundPayment({ payment_intent: order.paymentIntent });
            order = await this.orderRepo.findOneAndUpdate(
                { _id: orderId },
                {
                    orderStatus: OrderStatusEnum.REFUNDED,
                    orderChanges: {
                        refundedAt: new Date(),
                        refundedBy: user._id
                    }
                }
            );
        }

        return order;
    }
    // ====================================== //
}