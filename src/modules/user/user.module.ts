import { Module } from "@nestjs/common";
import { OtpModel, OtpRepo, UserModel, UserRepo } from "../../DB";
import { UserController } from "./user.controller";
import { UserService } from "./user.service";
import { TokenService } from "../../common/service/token.service";
import { JwtService } from "@nestjs/jwt";



@Module({
    imports: [UserModel, OtpModel],
    controllers: [UserController],
    providers: [UserService, UserRepo, OtpRepo, JwtService, TokenService],
    exports: [UserRepo]
})
export class UserModule { };