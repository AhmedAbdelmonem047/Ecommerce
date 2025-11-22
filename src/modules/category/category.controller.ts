import { Body, Controller, Delete, Get, Param, ParseFilePipe, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CategoryService } from './category.service';
import { TokenTypeEnum, Auth, UserDecorator, multerCloud, filevalidation, UserRoleEnum } from '../../common';
import { createCategoryDto, idDto, queryDto, updateCategoryDto } from './category.dto';
import type { HUserDocument } from '../../DB';
import { FileInterceptor } from '@nestjs/platform-express';
import { Types } from 'mongoose';

@Controller('categories')
export class CategoryController {

    constructor(private readonly categoryService: CategoryService) { }

    // ============ Create Category ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @UseInterceptors(FileInterceptor("attachment", multerCloud({ fileType: filevalidation.image })))
    @Post()
    async createCategory(@Body() categoryDto: createCategoryDto, @UserDecorator() user: HUserDocument, @UploadedFile(ParseFilePipe) file: Express.Multer.File) {
        const category = await this.categoryService.createCategory(categoryDto, user, file);
        return { message: "Done", category };
    }
    // ====================================== //


    // ============ Update Category ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/update/:id")
    async updateCategory(@Param() params: idDto, @Body() CategoryDto: updateCategoryDto, @UserDecorator() user: HUserDocument) {
        const category = await this.categoryService.updateCategory(params.id, CategoryDto, user);
        return { message: "Done", category };
    }
    // ====================================== //


    // ========= Update Category Image ========= //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @UseInterceptors(FileInterceptor("attachment", multerCloud({ fileType: filevalidation.image })))
    @Patch("/updateImage/:id")
    async updateCategoryImage(@Param() params: idDto, @UserDecorator() user: HUserDocument, @UploadedFile(ParseFilePipe) file: Express.Multer.File) {
        const category = await this.categoryService.updateCategoryImage(params.id, user, file);
        return { message: "Done", category };
    }
    // ====================================== //


    // ============ Freeze Category ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/freezeCategory/:id")
    async freezeCategory(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const category = await this.categoryService.freezeCategory(params.id, user);
        return { message: "Done", category };
    }
    // ====================================== //


    // =========== Restore Category ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Patch("/restoreCategory/:id")
    async restoreCategory(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const category = await this.categoryService.restoreCategory(params.id, user);
        return { message: "Done", category };
    }
    // ====================================== //


    // ============ Delete Category ============ //
    @Auth({ tokenType: TokenTypeEnum.access, role: [UserRoleEnum.ADMIN] })
    @Delete("/deleteCategory/:id")
    async deleteCategory(@Param() params: idDto, @UserDecorator() user: HUserDocument) {
        const category = await this.categoryService.deleteCategory(params.id, user);
        return { message: "Done" };
    }
    // ====================================== //


    // =========== Get All Categories ============ //
    @Get()
    async getAllCategories(@Query() query: queryDto) {
        const { currentPage, count, numOfPages, docs } = await this.categoryService.getAllCategories(query);
        return { message: "Done", currentPage, count, numOfPages, docs };
    }
    // ====================================== //
}
