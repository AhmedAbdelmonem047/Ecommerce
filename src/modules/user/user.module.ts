import { Module } from "@nestjs/common";
import { UserController } from "./user.controller";
import { UserSerivce } from "./user.service";
import { OtpModel, OtpRepo, UserModel, UserRepo } from "src/DB";
import { JwtService } from "@nestjs/jwt";


@Module({
    imports: [UserModel, OtpModel],
    controllers: [UserController],
    providers: [UserSerivce, UserRepo, OtpRepo, JwtService],
    exports: []
})
export class UserModule { };