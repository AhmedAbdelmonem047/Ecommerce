import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { TokenTypeEnum, Auth, UserDecorator, multerCloud, filevalidation, UserRoleEnum } from '../../common';
import { createProductDto, idDto, queryDto, updateProductDto } from './product.dto';
import type { HUserDocument } from '../../DB';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('products')
export class ProductController {

    constructor(private readonly productService: ProductService) { }

    // ============ Create Product ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @UseInterceptors(FileFieldsInterceptor([{ name: "mainImage", maxCount: 1 }, { name: "subImages", maxCount: 5 }], multerCloud({ fileType: filevalidation.image })))
    @Post()
    async createProduct(
        @Body() productDto: createProductDto,
        @UserDecorator() user: HUserDocument,
        @UploadedFiles(ParseFilePipe) files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] }
    ) {
        const product = await this.productService.createProduct(productDto, user, files);
        return { message: "Done", product };
    }
    // ====================================== //


    // =========== Update Product =========== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/update/:id")
    async updateProduct(@Param() params: idDto, @Body() ProductDto: updateProductDto, @UserDecorator() user: HUserDocument) {
        const product = await this.productService.updateProduct(params.id, ProductDto, user);
        return { message: "Done", product };
    }
    // ====================================== //


    // ======== Update Product Image ======== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @UseInterceptors(FileFieldsInterceptor([{ name: "mainImage", maxCount: 1 }, { name: "subImages", maxCount: 5 }], multerCloud({ fileType: filevalidation.image })))
    @Patch("/updateImages/:id")
    async updateProductImages(
        @Param() params: idDto,
        @UserDecorator() user: HUserDocument,
        @UploadedFiles(ParseFilePipe) files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] }
    ) {
        const product = await this.productService.updateProductImages(params.id, user, files);
        return { message: "Done", product };
    }
    // ====================================== //


    // =========== Freeze Product =========== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/freezeProduct/:id")
    async freezeProduct(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const product = await this.productService.freezeProduct(params.id, user);
        return { message: "Done", product };
    }
    // ====================================== //


    // ========== Restore Product =========== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/restoreProduct/:id")
    async restoreProduct(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const product = await this.productService.restoreProduct(params.id, user);
        return { message: "Done", product };
    }
    // ====================================== //


    // =========== Delete Product =========== //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Delete("/deleteProduct/:id")
    async deleteProduct(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const product = await this.productService.deleteProduct(params.id, user);
        return { message: "Done" };
    }
    // ====================================== //


    // ========== Get All Products =========== //
    @Get()
    async getAllProducts(@Query() query: queryDto) {
        const { currentPage, count, numOfPages, docs } = await this.productService.getAllProducts(query);
        return { message: "Done", currentPage, count, numOfPages, docs };
    }
    // ====================================== //
}
