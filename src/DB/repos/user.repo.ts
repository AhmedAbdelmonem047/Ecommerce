import { DBRepo } from './db.repo';
import { Model } from "mongoose";
import { User } from "../models";
import { InjectModel } from "@nestjs/mongoose";
import { Injectable } from "@nestjs/common";


@Injectable()
export class UserRepo extends DBRepo<User> {
    constructor(@InjectModel(User.name) protected override readonly model: Model<User>) {
        super(model)
    }
}