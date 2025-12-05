import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { BrandService } from './brand.service';
import { TokenTypeEnum, Auth, UserDecorator, multerCloud, filevalidation, UserRoleEnum } from '../../common';
import { createBrandDto, idDto, queryDto, updateBrandDto } from './brand.dto';
import type { HUserDocument } from '../../DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('brands')
export class BrandController {

    constructor(private readonly brandService: BrandService) { }

    // ============ Create Brand ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @UseInterceptors(FileInterceptor("attachment", multerCloud({ fileType: filevalidation.image })))
    @Post()
    async createBrand(@Body() brandDto: createBrandDto, @UserDecorator() user: HUserDocument, @UploadedFile(ParseFilePipe) file: Express.Multer.File) {
        const brand = await this.brandService.createBrand(brandDto, user, file);
        return { message: "Done", brand };
    }
    // ====================================== //


    // ============ Update Brand ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/update/:id")
    async updateBrand(@Param() params: idDto, @Body() brandDto: updateBrandDto, @UserDecorator() user: HUserDocument) {
        const brand = await this.brandService.updateBrand(params.id, brandDto, user);
        return { message: "Done", brand };
    }
    // ====================================== //


    // ========= Update Brand Image ========= //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @UseInterceptors(FileInterceptor("attachment", multerCloud({ fileType: filevalidation.image })))
    @Patch("/updateImage/:id")
    async updateBrandImage(@Param() params: idDto, @UserDecorator() user: HUserDocument, @UploadedFile(ParseFilePipe) file: Express.Multer.File) {
        const brand = await this.brandService.updateBrandImage(params.id, user, file);
        return { message: "Done", brand };
    }
    // ====================================== //


    // ============ Freeze Brand ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/freezeBrand/:id")
    async freezeBrand(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const brand = await this.brandService.freezeBrand(params.id, user);
        return { message: "Done", brand };
    }
    // ====================================== //


    // =========== Restore Brand ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/restoreBrand/:id")
    async restoreBrand(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const brand = await this.brandService.restoreBrand(params.id, user);
        return { message: "Done", brand };
    }
    // ====================================== //


    // ============ Delete Brand ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Delete("/deleteBrand/:id")
    async deleteBrand(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const brand = await this.brandService.deleteBrand(params.id, user);
        return { message: "Done" };
    }
    // ====================================== //


    // ====== Get All Brand Paginated ======= //
    @Get()
    async getAllBrandsPaginated(@Query() query: queryDto) {
        const { currentPage, count, numOfPages, docs } = await this.brandService.getAllBrandsPaginated(query);
        return { message: "Done", currentPage, count, numOfPages, docs };
    }
    // ====================================== //


    // =========== Get All Brand ============ //
    @Get()
    async getAllBrands() {
        const brands = await this.brandService.getAllBrands();
        return { message: "Done", brands };
    }
    // ====================================== //
}
