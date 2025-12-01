import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { HydratedDocument, Types } from "mongoose";
import type { HOtpDocument } from "./otp.model.js";
import { UserGender, UserProvider, UserRoleEnum } from "../../common/enums";


@Schema({ timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true }, strictQuery: true })
export class User {
    @Prop({ type: String, required: true, minLength: 3, maxLength: 20, trim: true })
    fName: string;

    @Prop({ type: String, required: true, minLength: 3, maxLength: 20, trim: true })
    lName: string;

    @Virtual({
        get() {
            return `${this.fName} ${this.lName}`
        },
        set(val) {
            this.fName = val.split(' ')[0];
            this.lName = val.split(' ')[1];
        }
    })
    userName: string;

    @Prop({ type: String, required: true, unique: true, lowercase: true, trim: true })
    email: string;

    @Prop({ type: String, required: true, trim: true })
    password: string;

    @Prop({ type: Number, required: true, min: 18, max: 65 })
    age: number;

    @Prop({ type: Boolean })
    isConfirmed: boolean;

    @Prop({ type: String, enum: UserRoleEnum, default: UserRoleEnum.USER })
    role: UserRoleEnum;

    @Prop({ type: String, enum: UserGender, required: true })
    gender: UserGender;

    @Prop({ type: String, enum: UserProvider, default: UserProvider.LOCAL })
    provider: UserProvider;

    @Prop({ type: Date, default: Date.now() })
    changeCredentialsAt: Date;

    @Virtual()
    otp: HOtpDocument;

    @Prop({ type: [{ type: Types.ObjectId, ref: "Product" }] })
    wishlist: Types.ObjectId[];
}

export const UserSchema = SchemaFactory.createForClass(User);
export type HUserDocument = HydratedDocument<User>;

UserSchema.virtual("otp", { ref: "Otp", localField: "_id", foreignField: "createdBy" });

export const UserModel = MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]);