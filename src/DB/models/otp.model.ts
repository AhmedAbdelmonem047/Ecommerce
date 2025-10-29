import { MongooseModule, Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import { eventEmitter, GenerateHash, OtpTypeEnum } from "src/common";


@Schema({ timestamps: true })
export class Otp {
    @Prop({ type: String, required: true })
    code: string;

    @Prop({ type: Types.ObjectId, required: true, ref: "User" })
    createdBy: Types.ObjectId;

    @Prop({ type: String, required: true, enum: OtpTypeEnum })
    type: OtpTypeEnum;

    @Prop({ type: Date, required: true })
    expiresAt: Date;
}

export const OtpSchema = SchemaFactory.createForClass(Otp);
export type HOtpDocument = HydratedDocument<Otp>;

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

OtpSchema.pre("save", async function (this: HOtpDocument & { is_new: boolean, plainCode: string }, next) {
    this.plainCode = this.code,
        this.is_new = this.isNew
    if (this.isModified("code"))
        this.code = await GenerateHash(this.code);
    await this.populate([{ path: "createdBy", select: "email" }]);
    next();
})

OtpSchema.post("save", async function (doc, next) {
    const that = this as HOtpDocument & { is_new: boolean, plainCode: string };
    if (that.is_new)
        eventEmitter.emit(doc.type, { otp: that.plainCode, email: (doc.createdBy as any).email });
    next();
})


export const OtpModel = MongooseModule.forFeature([{ name: Otp.name, schema: OtpSchema }]);
