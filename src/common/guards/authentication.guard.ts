import { BadRequestException, CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { TokenService } from "../service";
import { Reflector } from "@nestjs/core";
import { tokenName } from "../decorators";



@Injectable()
export class AuthenticationGuard implements CanActivate {
    constructor(private readonly tokenService: TokenService, private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const tokenType = this.reflector.get(tokenName, context.getHandler());
        let req: any;
        let authorization: string = ''
        if (context.getType() === "http") {
            req = context.switchToHttp().getRequest()
            authorization = req?.headers?.authorization!;
        }

        try {
            const [prefix, token] = authorization?.split(" ") || []

            if (!prefix || !token)
                throw new BadRequestException("Invalid token");

            const signature = await this.tokenService.getSignature(prefix, tokenType);
            if (!signature)
                throw new BadRequestException("Invalid signature");

            const { user, decodedToken } = await this.tokenService.decodeTokenAndFetchUser(token, signature);
            req.user = user;
            req.decodedToken = decodedToken;

            return true
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}