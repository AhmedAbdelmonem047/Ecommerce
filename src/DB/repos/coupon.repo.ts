import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Coupon } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class CouponRepo extends DBRepo<Coupon> {
    constructor(@InjectModel(Coupon.name) protected override readonly model: Model<Coupon>) {
        super(model)
    }
}