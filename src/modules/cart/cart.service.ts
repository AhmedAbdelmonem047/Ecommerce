import { SocketGateway } from './../gateway/socket.gateway';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepo, CartRepo } from '../../DB';
import { Types } from 'mongoose';
import { createCartDto, updateCartDto } from './cart.dto';
import type { HUserDocument } from '../../DB';

@Injectable()
export class CartService {
    constructor(
        private readonly productRepo: ProductRepo,
        private readonly cartRepo: CartRepo,
        private readonly socketGateway: SocketGateway,
    ) { }

    // ============ Add to Cart ============= //
    async createCart(cartDto: createCartDto, user: HUserDocument) {
        const { productId, quantity } = cartDto;

        const product = await this.productRepo.findOne({ _id: productId, stock: { $gte: quantity } });
        if (!product)
            throw new BadRequestException("Product not found or out of stock");

        const cart = await this.cartRepo.findOne({ createdBy: user._id });
        if (!cart) {
            const newCart = await this.cartRepo.create({
                createdBy: user._id,
                products: [{
                    productId,
                    price: product.price,
                    quantity
                }]
            })
            return newCart;
        }

        const productInCart = cart.products.find((product) => product.productId.toString() === productId.toString());
        if (productInCart)
            throw new BadRequestException("Product already in cart");

        cart.products.push({
            productId,
            price: product.price,
            quantity
        })

        this.socketGateway.handleProductQuantityChange(productId, quantity);

        await product.save();
        return cart;
    }
    // ====================================== //


    // ========= Remove from Cart =========== //
    async removeFromCart(productId: Types.ObjectId, user: HUserDocument) {
        const product = await this.productRepo.findOne({ _id: productId });
        if (!product)
            throw new BadRequestException("Product not found");

        let cart = await this.cartRepo.findOne({ createdBy: user._id, "products.productId": productId });
        if (!cart)
            throw new NotFoundException("Cart not found");

        cart.products = cart.products.filter((product) => product.productId.toString() !== productId.toString());

        await cart.save()
        return cart;
    }
    // ====================================== //


    // ======= Update Cart Quantity ======== //
    async updateCartQuantity(productId: Types.ObjectId, cartDto: updateCartDto, user: HUserDocument) {
        const { quantity } = cartDto;

        const product = await this.productRepo.findOne({ _id: productId });
        if (!product)
            throw new BadRequestException("Product not found");

        const cart = await this.cartRepo.findOne({ createdBy: user._id, "products.productId": productId });
        if (!cart)
            throw new NotFoundException("Cart not found");

        const productInCart = cart.products.find((p) => p.productId.toString() === productId.toString());

        if (!productInCart)
            throw new NotFoundException("Product not found in cart");

        product.quantity = quantity;

        this.socketGateway.handleProductQuantityChange(productId, quantity);

        await cart.save()
        return cart;
    }
    // ====================================== //
}
