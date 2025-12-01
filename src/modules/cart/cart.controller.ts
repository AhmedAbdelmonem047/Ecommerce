import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { CartService } from './cart.service';
import { Auth, TokenTypeEnum, UserRoleEnum, UserDecorator } from '../../common';
import { createCartDto, idDto, updateCartDto } from './cart.dto';
import type { HUserDocument } from '../../DB';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) { }

    // ============= Add to Cart ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.USER, UserRoleEnum.ADMIN] })
    @Post()
    async createCart(@Body() cartDto: createCartDto, @UserDecorator() user: HUserDocument) {
        const cart = await this.cartService.createCart(cartDto, user);
        return { message: "Done", cart };
    }
    // ====================================== //

    // =========== Remove from Cart ========= //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.USER, UserRoleEnum.ADMIN] })
    @Delete(":id")
    async removeFromCart(@Param() param: idDto, @UserDecorator() user: HUserDocument) {
        const cart = await this.cartService.removeFromCart(param.id, user);
        return { message: "Done", cart };
    }
    // ====================================== //

    // ========= Update Cart Quantity ======= //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.USER, UserRoleEnum.ADMIN] })
    @Patch(":id")
    async updateCartQuantity(@Param() param: idDto, @Body() cartDto: updateCartDto, @UserDecorator() user: HUserDocument) {
        const cart = await this.cartService.updateCartQuantity(param.id, cartDto, user);
        return { message: "Done", cart };
    }
    // ====================================== //
}
