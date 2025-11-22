import { Module } from '@nestjs/common';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService, S3Service } from '../../common';
import { BrandModel, BrandRepo, CategoryModel, CategoryRepo, UserModel, UserRepo } from '../../DB';

@Module({
  imports: [UserModel, CategoryModel, BrandModel],
  controllers: [CategoryController],
  providers: [CategoryService, CategoryRepo, UserRepo, JwtService, TokenService, S3Service, BrandRepo]
})
export class CategoryModule { }
