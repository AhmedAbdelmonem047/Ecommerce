import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types, UpdateQuery } from "mongoose";
import slugify from "slugify";



@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class Product {
    @Prop({ required: true, type: String, minLength: 3, maxLength: 500, trim: true })
    name: string;

    @Prop({ type: String, default: function () { return slugify(this.name, { replacement: "-", lower: true, trim: true }) } })
    slug: string;

    @Prop({ required: true, type: String, minLength: 10, maxLength: 100000, trim: true })
    description: string;

    @Prop({ required: true, type: String })
    mainImage: string;

    @Prop([{ type: String }])
    subImages: string[];

    @Prop({ type: String })
    assetFolderId: string;

    @Prop({ required: true, type: Number })
    price: number;

    @Prop({ type: Number, min: 1, max: 100 })
    discount: number;

    @Prop({ type: Number, min: 1 })
    quantity: number;

    @Prop({ type: Number })
    stock: number;

    @Prop({ type: Number })
    rateNumber: number;

    @Prop({ type: Number })
    rateAvg: number;

    @Prop({ type: Types.ObjectId, ref: "Brand", required: true })
    brand: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Category", required: true })
    category: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId;

    @Prop({ type: Date })
    deletedAt: Date;

    @Prop({ type: Date })
    restoredAt: Date;
}

export type HProductDocument = HydratedDocument<Product>;
export const ProductSchema = SchemaFactory.createForClass(Product);

ProductSchema.pre(["updateOne", "findOneAndUpdate"], async function (next) {
    const update = this.getUpdate() as UpdateQuery<Product>
    if (update.name)
        update.slug = slugify(update.name, { replacement: "-", lower: true, trim: true });
    next();
})
ProductSchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false)
        this.setQuery({ ...rest });
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    next();
})

export const ProductModel = MongooseModule.forFeature([{
    name: Product.name,
    schema: ProductSchema
}])
