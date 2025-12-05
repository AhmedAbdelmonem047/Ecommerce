import { Module } from "@nestjs/common";
import { SocketGateway } from "./socket.gateway";
import { TokenService } from "../../common";
import { JwtService } from "@nestjs/jwt";
import { UserModel, UserRepo } from "../../DB";


@Module({
    imports: [UserModel],
    controllers: [],
    providers: [SocketGateway, TokenService, JwtService, UserRepo],
})
export class GatewayModule { }