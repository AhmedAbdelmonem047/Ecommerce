import { Body, Controller, Param, Patch, Post } from '@nestjs/common';
import { CouponService } from './coupon.service';
import { TokenTypeEnum, Auth, UserDecorator, UserRoleEnum } from '../../common';
import type { HUserDocument } from '../../DB';
import { createCouponDto, idDto, updateCouponDto } from './coupon.dto';

@Controller('coupon')
export class CouponController {

    constructor(private readonly couponService: CouponService) { }

    // ============ Create Coupon ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Post()
    async createCoupon(@Body() couponDto: createCouponDto, @UserDecorator() user: HUserDocument) {
        const coupon = await this.couponService.createCoupon(couponDto, user);
        return { message: "Done", coupon };
    }
    // ====================================== //


    // ============ Update Coupon =========== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/update/:id")
    async updateCoupon(@Param() params: idDto, @Body() CouponDto: updateCouponDto, @UserDecorator() user: HUserDocument) {
        const coupon = await this.couponService.updateCoupon(params.id, CouponDto, user);
        return { message: "Done", coupon };
    }
    // ====================================== //
}