import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { UserModel, ProductModel, ProductRepo, UserRepo, CartModel, CartRepo } from '../../DB';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from '../../common';
import { SocketGateway } from '../gateway/socket.gateway';

@Module({
  imports: [UserModel, ProductModel, CartModel],
  controllers: [CartController],
  providers: [CartService, ProductRepo, UserRepo, JwtService, TokenService, CartRepo, SocketGateway]
})
export class CartModule { }
