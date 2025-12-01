import type { HProductDocument, HUserDocument } from '../../DB';
import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { ProductRepo, BrandRepo, CategoryRepo, Category, UserRepo } from "../../DB"
import { createProductDto, queryDto, updateProductDto } from './product.dto';
import { S3Service } from '../../common';
import { Types } from 'mongoose';
import { randomUUID } from 'crypto';

@Injectable()
export class ProductService {

    constructor(
        private readonly productRepo: ProductRepo,
        private readonly userRepo: UserRepo,
        private readonly categoryRepo: CategoryRepo,
        private readonly brandRepo: BrandRepo,
        private readonly s3Service: S3Service
    ) { }

    // ========== Create Product ============ //
    async createProduct(productDto: createProductDto, user: HUserDocument, files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] }) {
        const { name, description, price, brand, category, discount, quantity, stock } = productDto;

        if (stock > quantity)
            throw new BadRequestException("Stock must be less than or equal to quantity");

        const isBrand = await this.brandRepo.findOne({ _id: brand });
        if (!isBrand)
            throw new NotFoundException("Brand not found");
        const isCategory = await this.categoryRepo.findOne({ _id: category });
        if (!isCategory)
            throw new NotFoundException("Category not found");

        const finalPrice = price - (price * ((discount || 0) / 100));

        const assetFolderId = randomUUID();
        const mainImage = await this.s3Service.uploadFile({
            file: files.mainImage[0],
            path: `Categories/${isCategory.assetFolderId}/products/${assetFolderId}/mainImage`
        })

        const subImages = await this.s3Service.uploadFiles({
            files: files.subImages || [],
            path: `Categories/${isCategory.assetFolderId}/products/${assetFolderId}/subImages`
        })

        const product = await this.productRepo.create({
            name,
            description,
            price: finalPrice,
            discount,
            quantity,
            stock,
            brand: Types.ObjectId.createFromHexString(brand.toString()),
            category: Types.ObjectId.createFromHexString(category.toString()),
            mainImage,
            subImages,
            createdBy: user._id,
            assetFolderId
        });
        if (!product) {
            await this.s3Service.deleteFile({ Key: mainImage });
            await this.s3Service.deleteFiles({ urls: subImages });
            throw new InternalServerErrorException("Failed to creeate Product");
        }

        return product;
    }
    // ====================================== //


    // =========== Update Product =========== //
    async updateProduct(productId: Types.ObjectId, ProductDto: updateProductDto, user: HUserDocument) {
        const { name, description, price, discount, stock, quantity, brand, category } = ProductDto;

        let product = await this.productRepo.findOne({ _id: productId });
        if (!product)
            throw new NotFoundException("Product doesn't exist");

        if (name) product.name = name;
        if (description) product.description = description;

        if (category) {
            const isCategory = await this.categoryRepo.findOne({ _id: category });
            if (!isCategory)
                throw new NotFoundException("Category not found");
            product.category = isCategory._id;
        }

        if (brand) {
            const isBrand = await this.brandRepo.findOne({ _id: brand });
            if (!isBrand)
                throw new NotFoundException("Brand not found");
            product.brand = isBrand._id;
        }

        if (price && discount) {
            product.price = price - (price * (discount / 100));
            product.discount = discount;
        }
        else if (price)
            product.price = price - (price * (product.discount / 100));
        else if (discount) {
            product.price = product.price - (product.price * (discount / 100));
            product.discount = discount;
        }

        if (stock) {
            if (stock > product.quantity)
                throw new BadRequestException("Stock must be less than or equal to quantity");
            product.stock = stock;
        }

        if (quantity) {
            if (quantity < product.stock)
                throw new BadRequestException("Stock must be less than or equal to quantity");
            product.quantity = quantity;
        }

        await product.save();
        return product
    }
    // ====================================== //


    // ======== Update Product Images ======= //
    async updateProductImages(productId: Types.ObjectId, user: HUserDocument, files: { mainImage: Express.Multer.File[], subImages: Express.Multer.File[] }) {
        const product = await this.productRepo.findOne({ _id: productId }, undefined, { populate: { path: "category", select: "assetFolderId" } }) as HProductDocument & {
            category: Category;
        };
        if (!product)
            throw new NotFoundException("Product doesn't exist");

        if (files.mainImage) {
            product.mainImage = await this.s3Service.uploadFile({
                file: files.mainImage[0],
                path: `Categories/${product.category.assetFolderId}/products/${product.assetFolderId}/mainImage`
            })
        }

        if (files.subImages) {
            product.subImages = await this.s3Service.uploadFiles({
                files: files.subImages || [],
                path: `Categories/${product.category.assetFolderId}/products/${product.assetFolderId}/subImages`
            })
        }

        product.updatedBy = user._id;
        await product.save();
        return product;
    }
    // ====================================== //


    // =========== Freeze Product =========== //
    async freezeProduct(productId: Types.ObjectId, user: HUserDocument) {
        const product = await this.productRepo.findOneAndUpdate(
            { _id: productId, deletedAt: { $exists: false } },
            { deletedAt: new Date(), updatedBy: user._id }
        );
        if (!product)
            throw new NotFoundException("Product doesn't exist or already freezed");
        return product
    }
    // ====================================== //


    // ========== Restore Product =========== //
    async restoreProduct(productId: Types.ObjectId, user: HUserDocument) {
        const product = await this.productRepo.findOneAndUpdate(
            { _id: productId, deletedAt: { $exists: true }, paranoid: false },
            { restoredAt: new Date(), $unset: { deletedAt: "" }, updatedBy: user._id }
        );
        if (!product)
            throw new NotFoundException("Product doesn't exist or already restored");
        return product
    }
    // ====================================== //


    // =========== Delete Product =========== //
    async deleteProduct(productId: Types.ObjectId, user: HUserDocument) {
        const product = await this.productRepo.findOneAndDelete({ _id: productId, deletedAt: { $exists: true }, paranoid: false });
        if (!product)
            throw new NotFoundException("product doesn't exist");

        await Promise.all([
            this.s3Service.deleteFile({ Key: product.mainImage }),
            this.s3Service.deleteFiles({ urls: product.subImages })
        ])

        return product
    }
    // ====================================== //


    // ========== Get All Product =========== //
    async getAllProducts(query: queryDto) {
        const { page = 1, limit = 5, search } = query;
        const { currentPage, count, numOfPages, docs } = await this.productRepo.getAllPaginated({
            filter: {
                ...(search ? {
                    $or: [
                        { name: { $regex: search, $options: "i" } },
                        { description: { $regex: search, $options: "i" } },
                    ]
                } : {})
            },
            query: { page, limit }
        });
        return { currentPage, count, numOfPages, docs }
    }
    // ====================================== //


    // ======= Add Product to Wishlist ====== //
    async addProductToWishlist(productId: Types.ObjectId, user: HUserDocument) {
        const product = await this.productRepo.findOne({ _id: productId });
        if (!product)
            throw new NotFoundException("Product doesn't exist");

        let userWishlist = await this.userRepo.findOneAndUpdate({ _id: user._id, wishlist: { $in: productId } }, { $pull: { wishlist: productId } });
        if (!userWishlist)
            userWishlist = await this.userRepo.findOneAndUpdate({ _id: user._id }, { $push: { wishlist: productId } });

        return userWishlist;
    }
    // ====================================== //
}
