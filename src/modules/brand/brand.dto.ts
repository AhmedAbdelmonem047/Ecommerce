import { IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength } from "class-validator";
import { PartialType } from "nestjs-mapped-types";
import { AtLeastOne } from "../../common/decorators/brand.decorator.js";
import { Types } from "mongoose";
import { Type } from "class-transformer";



export class createBrandDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @IsNotEmpty()
    name: string

    @IsString()
    @MinLength(3)
    @MaxLength(20)
    @IsNotEmpty()
    slogan: string
}

@AtLeastOne(["name", "brands"])
export class updateBrandDto extends PartialType(createBrandDto) { }

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