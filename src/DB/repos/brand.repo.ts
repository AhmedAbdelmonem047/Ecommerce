import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Brand } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class BrandRepo extends DBRepo<Brand> {
    constructor(@InjectModel(Brand.name) protected override readonly model: Model<Brand>) {
        super(model)
    }
}