import { IsDateString, IsMongoId, IsNotEmpty, IsNumber, IsPositive, IsString, Max, MaxLength, Min, MinLength, Validate } from "class-validator";
import { Type } from "class-transformer";
import { AtLeastOne, CouponDateValidator } from "../../common";
import { Types } from "mongoose";
import { PartialType } from "nestjs-mapped-types";


export class createCouponDto {
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    code: string

    @IsNumber()
    @IsNotEmpty()
    @Min(1)
    @Max(100)
    @IsPositive()
    @Type(() => Number)
    amount: number

    @IsDateString()
    @IsNotEmpty()
    @Validate(CouponDateValidator)
    fromDate: Date

    @IsDateString()
    @IsNotEmpty()
    toDate: Date
}

@AtLeastOne(["code", "amount", "fromDate", "toDate"])
export class updateCouponDto extends PartialType(createCouponDto) { }


export class idDto {
    @IsNotEmpty()
    @IsMongoId()
    id: Types.ObjectId
}
