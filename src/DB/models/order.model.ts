import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { OrderStatusEnum, PaymentMethodEnum } from "../../common";


@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class Order {
    @Prop({ required: true, type: Types.ObjectId, ref: "User" })
    userId: Types.ObjectId;

    @Prop({ required: true, type: Types.ObjectId, ref: "Cart" })
    cart: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: "Coupon" })
    coupon: Types.ObjectId;

    @Prop({ type: Number, required: true })
    totalPrice: number;

    @Prop({ type: String, required: true })
    address: string;

    @Prop({ type: String, required: true })
    phone: string;

    @Prop({ type: String, enum: PaymentMethodEnum, required: true })
    paymentMethod: PaymentMethodEnum;

    @Prop({ type: String, enum: OrderStatusEnum, required: true })
    orderStatus: OrderStatusEnum;

    @Prop({ type: Date, default: Date.now() + 3 * 24 * 60 * 60 * 1000 })
    arrivesAt: Date;

    @Prop({ type: String })
    paymentIntent: string;

    @Prop({
        type: {
            paidAt: Date,
            deliveredAt: Date,
            deliveredBy: { type: Types.ObjectId, ref: "User" },
            canceledAt: Date,
            canceledBy: { type: Types.ObjectId, ref: "User" },
            refundedAt: Date,
            refundedBy: { type: Types.ObjectId, ref: "User" }
        }
    })
    orderChanges: object
}

export type HOrderDocument = HydratedDocument<Order>;
export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.pre(["findOne", "find", "findOneAndUpdate"], async function (next) {
    const { paranoid, ...rest } = this.getQuery();
    if (paranoid === false)
        this.setQuery({ ...rest });
    else
        this.setQuery({ ...rest, deletedAt: { $exists: false } });
    next();
})

export const OrderModel = MongooseModule.forFeature([{
    name: Order.name,
    schema: OrderSchema
}]);