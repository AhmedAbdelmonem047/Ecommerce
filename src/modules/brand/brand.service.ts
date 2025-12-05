import { ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { HUserDocument } from '../../DB';
import { BrandRepo } from "../../DB"
import { createBrandDto, queryDto, updateBrandDto } from './brand.dto';
import { S3Service } from '../../common';
import { Types } from 'mongoose';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class BrandService {

    constructor(
        private readonly brandRepo: BrandRepo,
        private readonly s3Service: S3Service,
        @Inject(CACHE_MANAGER) private cacheManager: Cache
    ) { }

    // ============ Create Brand ============ //
    async createBrand(brandDto: createBrandDto, user: HUserDocument, file: Express.Multer.File) {
        const { name, slogan } = brandDto;

        const isBrand = await this.brandRepo.findOne({ name });
        if (isBrand)
            throw new ConflictException("Brand already exists");

        const url = await this.s3Service.uploadFile({
            path: "brands",
            file
        });

        const brand = this.brandRepo.create({
            name,
            slogan,
            image: url,
            createdBy: user._id
        });
        if (!brand) {
            await this.s3Service.deleteFile({ Key: url });
            throw new InternalServerErrorException("Failed to creeate brand");
        }

        return brand;
    }
    // ====================================== //


    // ============ Update Brand ============ //
    async updateBrand(brandId: Types.ObjectId, brandDto: updateBrandDto, user: HUserDocument) {
        const { name, slogan } = brandDto;
        let brand = await this.brandRepo.findOne({ _id: brandId, createdBy: user._id });
        if (!brand)
            throw new NotFoundException("Brand doesn't exist or you're not the owner of this brand");

        if (name == brand.name)
            throw new ConflictException("Brand name already exists");

        brand = await this.brandRepo.findOneAndUpdate({ _id: brandId }, { name, slogan, updatedBy: user._id });

        return brand
    }
    // ====================================== //


    // ========= Update Brand Image ========= //
    async updateBrandImage(brandId: Types.ObjectId, user: HUserDocument, file: Express.Multer.File) {
        const brand = await this.brandRepo.findOne({ _id: brandId, createdBy: user._id });
        if (!brand)
            throw new NotFoundException("Brand doesn't exist or you're not the owner of this brand");

        const url = await this.s3Service.uploadFile({
            path: "brands",
            file
        });

        const updatedBrand = await this.brandRepo.findOneAndUpdate({ _id: brandId }, { image: url, updatedBy: user._id });
        if (!updatedBrand)
            throw new InternalServerErrorException("Failed to update brand image");

        await this.s3Service.deleteFile({ Key: brand.image });
        return updatedBrand;
    }
    // ====================================== //


    // ============ Freeze Brand ============ //
    async freezeBrand(brandId: Types.ObjectId, user: HUserDocument) {
        const brand = await this.brandRepo.findOneAndUpdate(
            { _id: brandId, createdBy: user._id, deletedAt: { $exists: false } },
            { deletedAt: new Date(), updatedBy: user._id }
        );
        if (!brand)
            throw new NotFoundException("Brand doesn't exist or you're not the owner of this brand or already freezed");
        return brand
    }
    // ====================================== //


    // =========== Restore Brand ============ //
    async restoreBrand(brandId: Types.ObjectId, user: HUserDocument) {
        const brand = await this.brandRepo.findOneAndUpdate(
            { _id: brandId, createdBy: user._id, deletedAt: { $exists: true }, paranoid: false },
            { restoredAt: new Date(), $unset: { deletedAt: "" }, updatedBy: user._id }
        );
        if (!brand)
            throw new NotFoundException("Brand doesn't exist or you're not the owner of this brand or already restored");
        return brand
    }
    // ====================================== //


    // ============ Delete Brand ============ //
    async deleteBrand(brandId: Types.ObjectId, user: HUserDocument) {
        const brand = await this.brandRepo.findOneAndDelete({ _id: brandId, createdBy: user._id, deletedAt: { $exists: true }, paranoid: false });
        if (!brand)
            throw new NotFoundException("Brand doesn't exist or you're not the owner of this brand");

        await this.s3Service.deleteFile({ Key: brand.image });
        return brand
    }
    // ====================================== //


    // ====== Get All Brand Paginated ======= //
    async getAllBrandsPaginated(query: queryDto) {
        const { page = 1, limit = 5, search } = query;
        const { currentPage, count, numOfPages, docs } = await this.brandRepo.getAllPaginated({
            filter: {
                ...(search ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { slogan: { $regex: search, $options: "i" } },
                    ]
                } : {})
            },
            query: { page, limit }
        });
        return { currentPage, count, numOfPages, docs }
    }
    // ====================================== //


    // =========== Get All Brand ============ //
    async getAllBrands() {
        let brands = await this.cacheManager.get("brands");
        if (!brands) {
            brands = await this.brandRepo.find({});
            await this.cacheManager.set("brands", brands);
        }
        return brands;
    }
    // ====================================== //
}
