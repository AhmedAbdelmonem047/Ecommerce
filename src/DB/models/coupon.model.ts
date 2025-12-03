import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class Coupon {
    @Prop({ required: true, type: String, minLength: 3, maxLength: 20, trim: true, unique: true, lowercase: true })
    code: string;

    @Prop({ type: Number, required: true })
    amount: number;

    @Prop({ type: Date, required: true })
    fromDate: Date;

    @Prop({ type: Date, required: true })
    toDate: Date;

    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    createdBy: Types.ObjectId;

    @Prop({ type: [{ required: true, type: Types.ObjectId, ref: "User" }] })
    usedBy: Types.ObjectId[];

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId;

    @Prop({ type: Date })
    deletedAt: Date;

    @Prop({ type: Date })
    restoredAt: Date;
}

export type HCouponDocument = HydratedDocument<Coupon>;
export const CouponSchema = SchemaFactory.createForClass(Coupon);

CouponSchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false)
        this.setQuery({ ...rest });
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    next();
})

export const CouponModel = MongooseModule.forFeature([{
    name: Coupon.name,
    schema: CouponSchema
}])