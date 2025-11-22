import { IsBoolean, IsMongoId, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, MinLength, Validate, ValidateIf } from "class-validator";
import { PartialType } from "nestjs-mapped-types";
import { AtLeastOne, IsMongoIds } from "../../common/decorators";
import { Types } from "mongoose";
import { Type } from "class-transformer";



export class createCategoryDto {
    @IsString()
    @MinLength(3)
    @MaxLength(50)
    @IsNotEmpty()
    name: string;

    @Validate(IsMongoIds)
    @IsOptional()
    brands: Types.ObjectId[];

    @IsOptional()
    @IsBoolean()
    @Type(() => Boolean)
    isSub: boolean;

    @IsMongoId()
    @IsNotEmpty()
    @ValidateIf((data: createCategoryDto) => Boolean(data.isSub))
    parentId: Types.ObjectId;
}

@AtLeastOne(["name", "slogan"])
export class updateCategoryDto extends PartialType(createCategoryDto) { }

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