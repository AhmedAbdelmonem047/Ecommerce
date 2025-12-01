import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Cart } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class CartRepo extends DBRepo<Cart> {
    constructor(@InjectModel(Cart.name) protected override readonly model: Model<Cart>) {
        super(model)
    }
}