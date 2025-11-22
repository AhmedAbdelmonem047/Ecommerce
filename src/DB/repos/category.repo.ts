import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Category } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class CategoryRepo extends DBRepo<Category> {
    constructor(@InjectModel(Category.name) protected override readonly model: Model<Category>) {
        super(model)
    }
    getModel(): Model<Category> {
        return this.model;
    }
}