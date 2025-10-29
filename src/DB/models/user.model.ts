import { MongooseModule, Prop, Schema, SchemaFactory, Virtual } from "@nestjs/mongoose";
import { UserGender, UserProvider, UserRole } from "src/common";
import { HydratedDocument } from "mongoose";
import type { HOtpDocument } from "./otp.model.js";


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

    @Prop({ type: String, enum: UserRole, default: UserRole.USER })
    role: UserRole;

    @Prop({ type: String, enum: UserGender, required: true })
    gender: UserGender;

    @Prop({ type: String, enum: UserProvider, default: UserProvider.LOCAL })
    provider: UserProvider;

    @Prop({ type: Date, default: Date.now() })
    changeCredentialsAt: Date;

    @Virtual()
    otp: HOtpDocument;
}

export const UserSchema = SchemaFactory.createForClass(User);
export type HUserDocument = HydratedDocument<User>;

UserSchema.virtual("otp", { ref: "Otp", localField: "_id", foreignField: "createdBy" });

export const UserModel = MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]);