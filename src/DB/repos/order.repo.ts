import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Order } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class OrderRepo extends DBRepo<Order> {
    constructor(@InjectModel(Order.name) protected override readonly model: Model<Order>) {
        super(model)
    }
}