import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { OrderService } from './order.service';
import { TokenTypeEnum, Auth, UserDecorator, UserRoleEnum } from '../../common';
import type { HUserDocument } from '../../DB';
import { createOrderDto, idDto } from './order.dto';

@Controller('order')
export class OrderController {

    constructor(private readonly orderService: OrderService) { }

    // ============ Create Order ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN, UserRoleEnum.USER] })
    @Post()
    async createOrder(@Body() orderDto: createOrderDto, @UserDecorator() user: HUserDocument) {
        const order = await this.orderService.createOrder(orderDto, user);
        return { message: "Done", order };
    }
    // ====================================== //

    // ========= Payment With Stripe ======== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN, UserRoleEnum.USER] })
    @Post("/stripe/:id")
    async paymentWithStripe(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const order = await this.orderService.paymentWithStripe(params.id, user);
        return { message: "Done", order };
    }
    // ====================================== //


    // ============ Stripe Webhook ========== //
    @Post("/webhook")
    async stripeWebhook(@Body() body: any, @UserDecorator() user: HUserDocument) {
        const order = await this.orderService.stripeWebhook(body, user);
        return { message: "Done", order };
    }
    // ====================================== //


    // ============= Refund Order =========== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/refund/:id")
    async refundOrder(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const order = await this.orderService.refundOrder(params.id, user);
        return { message: "Done", order };
    }
    // ====================================== //
}