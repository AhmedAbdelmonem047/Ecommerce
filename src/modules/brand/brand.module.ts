import { Module } from '@nestjs/common';
import { BrandController } from './brand.controller';
import { BrandService } from './brand.service';
import { JwtService } from '@nestjs/jwt';
import { TokenService, S3Service } from '../../common';
import { BrandModel, BrandRepo, UserModel, UserRepo } from '../../DB';

@Module({
  imports: [UserModel, BrandModel],
  controllers: [BrandController],
  providers: [BrandService, BrandRepo, UserRepo, JwtService, TokenService, S3Service]
})
export class BrandModule { }
