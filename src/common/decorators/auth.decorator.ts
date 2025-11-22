import { applyDecorators, UseGuards } from "@nestjs/common";
import { TokenTypeEnum, UserRoleEnum } from "../enums";
import { Token } from "./token.decorator";
import { Role } from "./role.decorator";
import { AuthorizationGuard, AuthenticationGuard } from '../guards';



export function Auth({ tokenType = TokenTypeEnum.access, role = [UserRoleEnum.USER] }: { tokenType?: TokenTypeEnum, role?: UserRoleEnum[] }) {
    return applyDecorators(
        Token(tokenType),
        Role(role),
        UseGuards(AuthenticationGuard, AuthorizationGuard)
    );
}