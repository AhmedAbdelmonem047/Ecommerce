import { SetMetadata } from "@nestjs/common";
import { TokenTypeEnum } from "../enums";

export const tokenName = "tokenType"

export const Token = (tokenType: TokenTypeEnum = TokenTypeEnum.access) => {
    return SetMetadata(tokenName, tokenType);
}