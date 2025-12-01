import { Type } from "class-transformer";
import { IsNumber, IsNotEmpty, IsMongoId } from "class-validator";
import { Types } from "mongoose";


export class updateCartDto {
    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    quantity: number
}

export class createCartDto extends updateCartDto {
    @IsMongoId()
    @IsNotEmpty()
    productId: Types.ObjectId
}

export class idDto {
    @IsNotEmpty()
    @IsMongoId()
    id: Types.ObjectId
}