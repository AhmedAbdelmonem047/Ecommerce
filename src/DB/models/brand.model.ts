import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";



@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class Brand {
    @Prop({ required: true, type: String, minLength: 3, maxLength: 50, trim: true, unique: true })
    name: string;

    @Prop({ type: String, default: function () { return slugify(this.name, { replacement: "-", lower: true, trim: true }) } })
    slug: string;

    @Prop({ required: true, type: String, minLength: 3, maxLength: 20, trim: true })
    slogan: string;

    @Prop({ required: true, type: String })
    image: string;

    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId;

    @Prop({ type: Date })
    deletedAt: Date;

    @Prop({ type: Date })
    restoredAt: Date;
}

export type HBrandDocument = HydratedDocument<Brand>;
export const BrandSchema = SchemaFactory.createForClass(Brand);

BrandSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
    const update = this.getUpdate() as UpdateQuery<Brand>
    if (update.name)
        update.slug = slugify(update.name, { replacement: "-", lower: true, trim: true });
    next();
})
BrandSchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false)
        this.setQuery({ ...rest });
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    next();
})

export const BrandModel = MongooseModule.forFeature([{
    name: Brand.name,
    schema: BrandSchema
}])