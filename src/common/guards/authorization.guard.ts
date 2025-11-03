import { BadRequestException, CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { UserRole } from "../enums";
import { roleName } from "../decorators/role.decorator.js";



@Injectable()
export class AuthorizationGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const tokenType = this.reflector.get("tokenType", context.getHandler());
        const req = context.switchToHttp().getRequest()
        const accessRoles: UserRole[] = this.reflector.get(roleName, context.getHandler());

        if (!accessRoles.includes(req.user.role))
            throw new UnauthorizedException();

        try {
            return true
        } catch (error) {
            throw new BadRequestException(error.message)
        }
    }
}