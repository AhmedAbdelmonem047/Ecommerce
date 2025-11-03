import { SetMetadata } from "@nestjs/common";
import { TokenTypeEnum } from "../enums/token.enum.js";

export const tokenName = "tokenType"

export const Token = (tokenType: TokenTypeEnum = TokenTypeEnum.access) => {
    return SetMetadata(tokenName, tokenType);
}