import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { roleName } from "../decorators";
import { UserRoleEnum } from "../enums";



@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        try {
            let req: any;
            if (context.getType() === "http")
                req = context.switchToHttp().getRequest();

            else if (context.getType() === "ws")
                req = context.switchToWs().getClient();

            const accessRoles: UserRoleEnum[] = this.reflector.get(roleName, context.getHandler());

            if (!accessRoles.includes(req.user.role))
                throw new UnauthorizedException();

            return true
        }
        catch (error: any) {
            throw new BadRequestException(error.message)
        }
    }
}