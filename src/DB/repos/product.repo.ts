import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Product } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class ProductRepo extends DBRepo<Product> {
    constructor(@InjectModel(Product.name) protected override readonly model: Model<Product>) {
        super(model)
    }
}