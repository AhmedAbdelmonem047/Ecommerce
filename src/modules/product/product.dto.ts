import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, Max, MaxLength, Min, MinLength } from "class-validator";
import { PartialType } from "nestjs-mapped-types";
import { AtLeastOne } from "../../common/decorators";
import { Types } from "mongoose";
import { Type } from "class-transformer";



export class createProductDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @IsNotEmpty()
    name: string

    @IsString()
    @MinLength(10)
    @MaxLength(100000)
    @IsNotEmpty()
    description: string

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    price: number

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(100)
    @Type(() => Number)
    discount: number

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Type(() => Number)
    quantity: number

    @IsNumber()
    @IsNotEmpty()
    @Type(() => Number)
    stock: number

    @IsMongoId()
    @IsNotEmpty()
    brand: Types.ObjectId

    @IsMongoId()
    @IsNotEmpty()
    category: Types.ObjectId
}

@AtLeastOne(["name", "description", "price", "discount", "quantity", "stock", "brand", "category"])
export class updateProductDto extends PartialType(createProductDto) { }

export class idDto {
    @IsNotEmpty()
    @IsMongoId()
    id: Types.ObjectId
}

export class queryDto {
    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    page?: number

    @IsNumber()
    @IsOptional()
    @Type(() => Number)
    limit?: number

    @IsOptional()
    @IsString()
    search?: string
}