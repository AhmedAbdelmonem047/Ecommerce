import { JwtPayload } from "jsonwebtoken"
import { TokenTypeEnum } from "../enums";
import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { JwtService, JwtSignOptions, JwtVerifyOptions } from "@nestjs/jwt";
import { UserRepo } from "../../DB";
import { ModuleRef } from "@nestjs/core";


@Injectable()
export class TokenService {
    private userRepo: UserRepo;
    constructor(
        private readonly jwtService: JwtService,
        private readonly moduleRef: ModuleRef,
    ) { }

    async onModuleInit() {
        this.userRepo = await this.moduleRef.get(UserRepo, { strict: false });
        if (!this.userRepo) {
            console.error('TokenService: could not resolve UserRepo at runtime');
        }
    }

    GenerateToken = async ({ payload, options }: { payload: Object, options?: JwtSignOptions }) => {
        return this.jwtService.signAsync(payload, options);
    }

    VerifyToken = async ({ token, options }: { token: string, options?: JwtVerifyOptions }): Promise<JwtPayload> => {
        return this.jwtService.verifyAsync(token, options);
    }

    getSignature = async (prefix: string, tokenType: TokenTypeEnum = TokenTypeEnum.access) => {
        if (tokenType === TokenTypeEnum.access) {
            if (prefix === process.env.BEARER_USER)
                return process.env.ACCESS_TOKEN_USER!
            else if (prefix === process.env.BEARER_ADMIN)
                return process.env.ACCESS_TOKEN_ADMIN!
            else
                return null
        }
        if (tokenType === TokenTypeEnum.refresh) {
            if (prefix === process.env.BEARER_USER)
                return process.env.REFRESH_TOKEN_USER!
            else if (prefix === process.env.BEARER_ADMIN)
                return process.env.REFRESH_TOKEN_ADMIN!
            else
                return null
        }
        return null
    }

    decodeTokenAndFetchUser = async (token: string, signature: string) => {
        const decodedToken = await this.VerifyToken({ token, options: { secret: signature } });
        if (!decodedToken)
            throw new BadRequestException("Invalid token");
        const user = await this.userRepo.findOne({ _id: decodedToken.userId });
        if (!user)
            throw new NotFoundException("User not found");
        if (!user?.isConfirmed)
            throw new BadRequestException("Please confrim your email first before login");
        // // // if (await _revokeTokenModel.findOne({ tokenId: decodedToken?.jti }))
        // //     throw new UnauthorizedException("Token has been revoked, please login again");
        // // if (user?.changeCredentials?.getTime()! > decodedToken.iat! * 1000)
        // //     throw new UnauthorizedException("Token has been revoked, please login again");
        // // if (!user?.isDeleted)
        // //     throw new AppError("User has been deleted, contact admin for more info", 400);
        return { decodedToken, user };
    }
}
