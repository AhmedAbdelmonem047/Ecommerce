import { SetMetadata } from "@nestjs/common";
import { UserRoleEnum } from "../enums";

export const roleName = "accessRoles"

export const Role = (accessRoles: UserRoleEnum[]) => {
    return SetMetadata(roleName, accessRoles);
}