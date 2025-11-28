import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService, S3Service } from '../../common';
import { BrandModel, BrandRepo, CategoryModel, CategoryRepo, ProductModel, ProductRepo, UserModel, UserRepo } from '../../DB';

@Module({
  imports: [UserModel, ProductModel, CategoryModel, BrandModel],
  controllers: [ProductController],
  providers: [ProductService, ProductRepo, UserRepo, JwtService, TokenService, S3Service, CategoryRepo, BrandRepo]
})
export class ProductModule { }
