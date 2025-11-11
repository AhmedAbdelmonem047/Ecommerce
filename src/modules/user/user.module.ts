import { Module } from "@nestjs/common";
import { OtpModel, OtpRepo, UserModel, UserRepo } from "../../DB";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TokenService, S3Service } from "../../common";
import { JwtService } from "@nestjs/jwt";



@Module({
    imports: [UserModel, OtpModel],
    controllers: [UserController],
    providers: [UserService, UserRepo, OtpRepo, JwtService, TokenService, S3Service],
    exports: [UserRepo]
})
export class UserModule { };