import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";


@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class CartProduct {
    @Prop({ type: Types.ObjectId, ref: "Product", unique: true })
    productId: Types.ObjectId;

    @Prop({ type: Number, required: true })
    quantity: number;

    @Prop({ type: Number, required: true })
    price: number;
}


@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class Cart {
    @Prop({ type: [CartProduct] })
    products: CartProduct[]

    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    createdBy: Types.ObjectId;

    @Prop({ type: Number })
    subTotal: number;

    @Prop({ type: Types.ObjectId, ref: "User" })
    updatedBy: Types.ObjectId;

    @Prop({ type: Date })
    deletedAt: Date;

    @Prop({ type: Date })
    restoredAt: Date;
}

export type HCartDocument = HydratedDocument<Cart>;
export const CartSchema = SchemaFactory.createForClass(Cart);

CartSchema.pre("save", function (next) {
    this.subTotal = this.products.reduce((total, product) => total + (product.price * product.quantity), 0);
    next();
})

CartSchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false)
        this.setQuery({ ...rest });
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    next();
})

export const CartModel = MongooseModule.forFeature([{
    name: Cart.name,
    schema: CartSchema
}])

