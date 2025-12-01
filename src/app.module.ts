import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './modules/user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { S3Service } from './common';
import { BrandModule } from './modules/brand/brand.module';
import { CategoryModule } from './modules/category/category.module';
import { ProductModule } from './modules/product/product.module';
import { CartModule } from './modules/cart/cart.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: "./config/.env",
      isGlobal: true
    }),
    MongooseModule.forRoot(process.env.DB_URL as string, {
      onConnectionCreate: (connection: Connection) => {
        connection.on('connected', () => console.log(`DB connected on ${process.env.DB_URL}`));
        return connection
      },
    }),
    UserModule,
    BrandModule,
    CategoryModule,
    ProductModule,
    CartModule
  ],
  controllers: [AppController],
  providers: [AppService, S3Service],
})
export class AppModule { }
