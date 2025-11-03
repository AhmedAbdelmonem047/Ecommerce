import { SetMetadata } from "@nestjs/common";
import { TokenTypeEnum } from "../enums/token.enum.js";
import { UserRole } from "../enums/user.enum.js";

export const roleName = "accessRoles"

export const Role = (accessRoles: UserRole[]) => {
    return SetMetadata(roleName, accessRoles);
}