import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { Otp } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class OtpRepo extends DBRepo<Otp> {
    constructor(@InjectModel(Otp.name) protected override readonly model: Model<Otp>) {
        super(model)
    }
}