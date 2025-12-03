import { Module } from '@nestjs/common';
import { CouponController } from './coupon.controller';
import { CouponService } from './coupon.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../common';
import { CouponModel, CouponRepo, UserModel, UserRepo } from '../../DB';

@Module({
  imports: [UserModel, CouponModel],
  controllers: [CouponController],
  providers: [CouponService, CouponRepo, UserRepo, JwtService, TokenService]
})
export class CouponModule { }
