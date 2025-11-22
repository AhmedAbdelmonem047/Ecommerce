import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Model, Types } from "mongoose";
import slugify from "slugify";


export async function getAllDescendants(model: Model<any>, parentId: string | Types.ObjectId) {
    const parentObjectId = typeof parentId === 'string' ? new Types.ObjectId(parentId) : parentId;

    const result = await model.aggregate([
        { $match: { _id: parentObjectId } },
        {
            $graphLookup: {
                from: model.collection.name,
                startWith: '$_id',
                connectFromField: '_id',
                connectToField: 'parentId',
                as: 'descendants',
            },
        },
    ]);

    if (!result[0]) return [];

    // Combine parent and descendants into a single array
    return [result[0], ...result[0].descendants];
}

@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class Category {
    @Prop({ required: true, type: String, minLength: 3, maxLength: 50, trim: true, unique: true })
    name: string;

    @Prop({ type: String, default: function () { return slugify(this.name, { replacement: "-", lower: true, trim: true }) } })
    slug: string;

    @Prop({ required: true, type: String })
    image: string;

    @Prop({ type: String })
    assetFolderId: string;

    @Prop([{ type: Types.ObjectId, ref: "Brand" }])
    brands: Types.ObjectId[];

    @Prop({ type: Boolean, default: false })
    isSub: boolean

    @Prop({ required: function (this: Category) { return this.isSub === true }, type: Types.ObjectId, ref: "Category", set: (value: string | Types.ObjectId) => value ? new Types.ObjectId(value) : undefined })
    parentId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    createdBy: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId;

    @Prop({ type: Date })
    deletedAt: Date;

    @Prop({ type: Date })
    restoredAt: Date;
}

export type HCategoryDocument = HydratedDocument<Category>;
export const CategorySchema = SchemaFactory.createForClass(Category);

CategorySchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false)
        this.setQuery({ ...rest });
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    next();
})

export const CategoryModel = MongooseModule.forFeature([{
    name: Category.name,
    schema: CategorySchema
}])