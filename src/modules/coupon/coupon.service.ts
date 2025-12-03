import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import type { HUserDocument } from '../../DB';
import { CouponRepo } from "../../DB"
import { createCouponDto, updateCouponDto } from './coupon.dto';
import { Types } from 'mongoose';

@Injectable()
export class CouponService {

    constructor(
        private readonly couponRepo: CouponRepo,
    ) { }

    // ============ Create Coupon =========== //
    async createCoupon(couponDto: createCouponDto, user: HUserDocument) {
        const { code, amount, fromDate, toDate } = couponDto;

        if (await this.couponRepo.findOne({ code: code.toLowerCase() }))
            throw new ConflictException("Code already exists");

        const coupon = await this.couponRepo.create({
            code,
            amount,
            fromDate,
            toDate,
            createdBy: user._id
        })
        if (!coupon)
            throw new InternalServerErrorException("Couldn't create coupon");

        return coupon;
    }
    // ====================================== //


    // ============ Update Coupon =========== //
    async updateCoupon(couponId: Types.ObjectId, couponDto: updateCouponDto, user: HUserDocument) {
        const { code, amount, fromDate, toDate } = couponDto;

        let coupon = await this.couponRepo.findOne({ _id: couponId, createdBy: user._id });
        if (!coupon)
            throw new BadRequestException("Coupon not found or you're not its creator");

        if (code === coupon.code)
            throw new ConflictException("Coupon code already exists");

        coupon = await this.couponRepo.findOneAndUpdate({ _id: couponId }, { code, amount, fromDate, toDate });
        return coupon;
    }
    // ====================================== //

}