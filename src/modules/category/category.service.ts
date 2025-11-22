import { BadRequestException, ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CategoryRepo, BrandRepo, getAllDescendants } from "../../DB"
import { createCategoryDto, queryDto, updateCategoryDto } from './category.dto';
import { S3Service } from '../../common';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';
import type { HUserDocument } from '../../DB';

@Injectable()
export class CategoryService {

    constructor(
        private readonly categoryRepo: CategoryRepo,
        private readonly brandRepo: BrandRepo,
        private readonly s3Service: S3Service
    ) { }

    // ============ Create Category ============ //
    async createCategory(categoryDto: createCategoryDto, user: HUserDocument, file: Express.Multer.File) {
        const { name, brands, isSub, parentId } = categoryDto;

        const isCategory = await this.categoryRepo.findOne({ name });
        if (isCategory)
            throw new ConflictException("Category already exists");


        const strictIds = [...new Set(brands || [])];
        if (brands && ((await this.brandRepo.find({ _id: { $in: strictIds } })).length !== strictIds.length))
            throw new NotFoundException("Some of the brands don't exist");

        if (isSub) {
            const isCategory = await this.categoryRepo.find({ _id: parentId });
            if (!isCategory)
                throw new NotFoundException("Parent category not found");
        }


        const assetFolderId = randomUUID()
        const path = isSub && parentId ? `categories/${assetFolderId}/${parentId}` : `categories/${assetFolderId}`;
        const url = await this.s3Service.uploadFile({
            path,
            file
        });

        const category = this.categoryRepo.create({
            name,
            image: url,
            assetFolderId,
            isSub,
            parentId,
            brands: strictIds,
            createdBy: user._id
        });
        if (!category) {
            await this.s3Service.deleteFile({ Key: url });
            throw new InternalServerErrorException("Failed to creeate Category");
        }

        return category;
    }
    // ====================================== //


    // ============ Update Category ============ //
    async updateCategory(categoryId: Types.ObjectId, categoryDto: updateCategoryDto, user: HUserDocument) {
        const { name, brands } = categoryDto;
        let category = await this.categoryRepo.findOne({ _id: categoryId, createdBy: user._id });
        if (!category)
            throw new NotFoundException("Category doesn't exist or you're not the owner of this Category");

        const strictIds = [...new Set(brands || [])];
        if (brands && ((await this.brandRepo.find({ _id: { $in: strictIds } })).length !== strictIds.length))
            throw new NotFoundException("Some of the brands don't exist");

        if (name == category.name)
            throw new ConflictException("Category name already exists");

        category = await this.categoryRepo.findOneAndUpdate({ _id: categoryId }, { name, brands: strictIds, updatedBy: user._id });

        return category
    }
    // ====================================== //


    // ========= Update Category Image ========= //
    async updateCategoryImage(categoryId: Types.ObjectId, user: HUserDocument, file: Express.Multer.File) {
        const category = await this.categoryRepo.findOne({ _id: categoryId, createdBy: user._id });
        if (!category)
            throw new NotFoundException("Category doesn't exist or you're not the owner of this category");

        const url = await this.s3Service.uploadFile({
            path: `categories/${category.assetFolderId}`,
            file
        });

        const updatedCategory = await this.categoryRepo.findOneAndUpdate({ _id: categoryId }, { image: url, updatedBy: user._id });
        if (!updatedCategory)
            throw new InternalServerErrorException("Failed to update Category image");

        await this.s3Service.deleteFile({ Key: category.image });
        return updatedCategory;
    }
    // ====================================== //


    // ============ Freeze Category ============ //
    async freezeCategory(categoryId: Types.ObjectId, user: HUserDocument) {
        const category = await this.categoryRepo.findOneAndUpdate(
            { _id: categoryId, createdBy: user._id, deletedAt: { $exists: false } },
            { deletedAt: new Date(), updatedBy: user._id }
        );
        if (!category)
            throw new NotFoundException("Category doesn't exist or you're not the owner of this category or already freezed");

        const subCategories = await getAllDescendants(this.categoryRepo.getModel(), categoryId);
        await Promise.all(subCategories.map(c => this.categoryRepo.findOneAndUpdate({ _id: c._id, createdBy: user._id }, { deletedAt: new Date(), updatedBy: user._id })));

        return category
    }
    // ====================================== //


    // =========== Restore Category ============ //
    async restoreCategory(categoryId: Types.ObjectId, user: HUserDocument) {
        const category = await this.categoryRepo.findOneAndUpdate(
            { _id: categoryId, createdBy: user._id, deletedAt: { $exists: true }, paranoid: false },
            { restoredAt: new Date(), $unset: { deletedAt: "" }, updatedBy: user._id }
        );
        if (!category)
            throw new NotFoundException("Category doesn't exist or you're not the owner of this category or already restored");

        const subCategories = await getAllDescendants(this.categoryRepo.getModel(), categoryId);
        await Promise.all(subCategories.map(c => this.categoryRepo.findOneAndUpdate({ _id: c._id, createdBy: user._id, paranoid: false }, { restoredAt: new Date(), $unset: { deletedAt: "" }, updatedBy: user._id })));

        return category
    }
    // ====================================== //


    // ============ Delete Category ============ //
    async deleteCategory(categoryId: Types.ObjectId, user: HUserDocument) {
        const subCategories = await getAllDescendants(this.categoryRepo.getModel(), categoryId);
        const notFrozen = subCategories.filter(c => !c.deletedAt);
        if (notFrozen.length)
            throw new BadRequestException('All categories must be frozen before delete');

        const category = await this.categoryRepo.findOneAndDelete({ _id: categoryId, createdBy: user._id, deletedAt: { $exists: true }, paranoid: false });
        if (!category)
            throw new NotFoundException("Category doesn't exist or you're not the owner of this Category");
        const ids = subCategories.map(c => c._id);
        await this.categoryRepo.deleteMany({ _id: { $in: ids } });

        await this.s3Service.deleteFile({ Key: category.image });
        await Promise.all(subCategories.map(c => this.s3Service.deleteFile({ Key: category.image })));

        return category
    }
    // ====================================== //


    // =========== Get All Categories ============ //
    async getAllCategories(query: queryDto) {
        const { page = 1, limit = 5, search } = query;
        const { currentPage, count, numOfPages, docs } = await this.categoryRepo.getAllPaginated({
            filter: { ...(search ? { name: { $regex: search, $options: "i" } } : {}) },
            query: { page, limit }
        });
        return { currentPage, count, numOfPages, docs }
    }
    // ====================================== //
}
