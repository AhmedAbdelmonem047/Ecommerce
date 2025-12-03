import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { JwtService } from '@nestjs/jwt';
import { StripeService, TokenService } from '../../common';
import { CartModel, CartRepo, CouponModel, CouponRepo, OrderModel, OrderRepo, ProductModel, ProductRepo, UserModel, UserRepo } from '../../DB';

@Module({
  imports: [UserModel, OrderModel, CartModel, ProductModel, CouponModel],
  controllers: [OrderController],
  providers: [OrderService, JwtService, TokenService, StripeService, OrderRepo, UserRepo, CartRepo, ProductRepo, CouponRepo]
})
export class OrderModule { }
