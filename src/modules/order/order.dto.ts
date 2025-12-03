import { IsEnum, IsMongoId, IsNotEmpty, IsOptional, IsString } from "class-validator";
import { PaymentMethodEnum } from "../../common";
import { Types } from "mongoose";


export class createOrderDto {
    @IsString()
    @IsNotEmpty()
    phone: string;

    @IsString()
    @IsNotEmpty()
    address: string;

    @IsEnum(PaymentMethodEnum)
    paymentMethod: PaymentMethodEnum;

    @IsOptional()
    @IsString()
    couponCode?: string
}

export class idDto {
    @IsNotEmpty()
    @IsMongoId()
    id: Types.ObjectId
}
