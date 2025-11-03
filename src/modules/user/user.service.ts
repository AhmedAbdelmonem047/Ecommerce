import { BadRequestException, Body, ConflictException, Injectable, NotFoundException, Res, ServiceUnavailableException } from "@nestjs/common";
import type { Response } from "express";
import { OtpRepo, UserRepo } from "src/DB";
import { ConfirmEmailDto, LoginDto, LoginGmailDto, ResendOtpDto, ResetPasswordDto, SignupDto } from "./dto/user.dto";
import { CompareHash, GenerateHash, generateOTP, OtpTypeEnum, UserProvider, UserRole } from "../../common";
import { Types } from "mongoose";
import { v4 as uuidv4 } from 'uuid';
import { OAuth2Client, TokenPayload } from "google-auth-library";
import { TokenService } from "../../common/service/token.service";



@Injectable()
export class UserService {
    constructor(
        private readonly userRepo: UserRepo,
        private readonly otpRepo: OtpRepo,
        private readonly tokenService: TokenService
    ) { }


    // ============== Send Otp ============== //
    private async sendOtp(userId: Types.ObjectId, type: OtpTypeEnum) {
        const generatedOtp = await generateOTP();
        await this.otpRepo.create({
            code: generatedOtp.toString(),
            createdBy: userId,
            type,
            expiresAt: new Date(Date.now() + 60 * 10 * 1000)
        });
    }
    // ====================================== //


    // =============== Signup =============== //
    async signup(@Body() body: SignupDto, @Res() res: Response) {
        const { fName, lName, userName, email, password, age, gender } = body;

        if (await this.userRepo.findOne({ email }))
            throw new ConflictException("Email already exists");

        const hashedPassword = await GenerateHash(password);
        const user = await this.userRepo.create({ fName, lName, userName, email, password: hashedPassword, age, gender });
        if (!user)
            throw new ServiceUnavailableException("Couldn't create a user right now");
        await this.sendOtp(user._id, OtpTypeEnum.CONFIRM_EMAIL);

        return res.status(201).json({ message: "User created successfully", user });
    }
    // ====================================== //


    // ============= Resend Otp ============= //
    async resendOtp(@Body() body: ResendOtpDto, @Res() res: Response) {
        const { email } = body;
        const user = await this.userRepo.findOne({ email, isConfirmed: { $exists: false } }, undefined, { populate: { path: "otp" } });
        if (!user)
            throw new NotFoundException("User not found");

        const result = Array.isArray(user?.otp) ? user?.otp.find(item => item.type === OtpTypeEnum.CONFIRM_EMAIL) : undefined
        if (result)
            throw new BadRequestException("OTP already sent");

        await this.sendOtp(user._id, OtpTypeEnum.CONFIRM_EMAIL);

        return res.status(201).json({ message: "Otp sent" });
    }
    // ====================================== //


    // ================ Login =============== //
    async login(@Body() body: LoginDto, @Res() res: Response) {
        const { email, password } = body;

        const user = await this.userRepo.findOne({ email, isConfirmed: true, provider: UserProvider.LOCAL });
        if (!user)
            throw new NotFoundException("User not found or not confirmed yet or invalid provider");
        if (!await CompareHash(password, user?.password!))
            throw new BadRequestException("Invalid password");

        const tokenId = uuidv4();
        const signatureAccess = user.role == UserRole.USER ? process.env.ACCESS_TOKEN_USER! : process.env.ACCESS_TOKEN_ADMIN!
        const signatureRefresh = user.role == UserRole.USER ? process.env.REFRESH_TOKEN_USER! : process.env.REFRESH_TOKEN_ADMIN!

        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.GenerateToken({ payload: { userId: user._id }, options: { secret: signatureAccess, expiresIn: "1h", jwtid: tokenId } }),
            this.tokenService.GenerateToken({ payload: { userId: user._id }, options: { secret: signatureRefresh, expiresIn: "1y", jwtid: tokenId } })
        ]);

        return res.status(200).json({ message: "Done", accessToken, refreshToken });
    }
    // ====================================== //


    // ========== Login With Gmail ========== //
    async loginWithGmail(@Body() body: LoginGmailDto, @Res() res: Response) {
        const { idToken } = body;
        const client = new OAuth2Client();
        async function verify() {
            const ticket = await client.verifyIdToken({
                idToken,
                audience: process.env.WEB_CLIENT_ID!,
            });
            const payload = ticket.getPayload();
            return payload;
        }
        const { email, email_verified, picture, name } = await verify() as TokenPayload;

        let user = await this.userRepo.findOne({ email });
        if (!user) {
            user = await this.userRepo.create({
                email: email!,
                userName: name!,
                isConfirmed: email_verified!,
                provider: UserProvider.GOOGLE
            })
        }

        if (user.provider !== UserProvider.GOOGLE)
            throw new BadRequestException("Please login on system");

        const tokenId = uuidv4();
        const signatureAccess = user.role == UserRole.USER ? process.env.ACCESS_TOKEN_USER! : process.env.ACCESS_TOKEN_ADMIN!
        const signatureRefresh = user.role == UserRole.USER ? process.env.REFRESH_TOKEN_USER! : process.env.REFRESH_TOKEN_ADMIN!

        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.GenerateToken({ payload: { userId: user._id }, options: { secret: signatureAccess, expiresIn: "1h", jwtid: tokenId } }),
            this.tokenService.GenerateToken({ payload: { userId: user._id }, options: { secret: signatureRefresh, expiresIn: "1y", jwtid: tokenId } })
        ]);

        return res.status(200).json({ message: "Login successful", accessToken, refreshToken });
    }
    // ====================================== //


    // ============ Confirm Email =========== //
    async confirmEmail(@Body() body: ConfirmEmailDto, @Res() res: Response) {
        const { email, otp } = body;

        const user = await this.userRepo.findOne({ email, isConfirmed: { $exists: false } }, undefined, { populate: { path: "otp" } });
        if (!user)
            throw new NotFoundException("User not found or already confirmed");

        const code = Array.isArray(user?.otp) ? user?.otp.find(item => item.type === OtpTypeEnum.CONFIRM_EMAIL)?.code : undefined;
        if (!await CompareHash(otp, code))
            throw new BadRequestException("Invalid Otp");

        await this.userRepo.updateOne({ email: user?.email }, { isConfirmed: true })
        return res.status(200).json({ message: "User confirmed successfully" });
    }
    // ====================================== //


    // =========== Forget Password ========== //
    async forgetPassword(@Body() body: ResendOtpDto, @Res() res: Response) {
        const { email } = body;

        const user = await this.userRepo.findOne({ email, isConfirmed: { $exists: true } }, undefined, { populate: [{ path: "otp" }] });
        if (!user)
            throw new NotFoundException("User doesn't exist or not confirmed yet");

        const result = Array.isArray(user?.otp) ? user?.otp.find(item => item.type === OtpTypeEnum.FORGET_PASSWORD) : undefined
        if (result)
            throw new BadRequestException("OTP already sent");

        await this.sendOtp(user._id, OtpTypeEnum.FORGET_PASSWORD);
        return res.status(200).json({ message: "OTP sent to email" });
    }
    // ====================================== //


    // =========== Reset Password ========== //
    async resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response) {
        const { email, otp, password, cPassword } = body;

        const user = await this.userRepo.findOne({ email }, undefined, { populate: [{ path: "otp" }] });
        if (!user)
            throw new NotFoundException("User doesn't exist");

        const code = Array.isArray(user?.otp) ? user?.otp.find(item => item.type === OtpTypeEnum.FORGET_PASSWORD)?.code : undefined;
        if (!await CompareHash(otp, code))
            throw new BadRequestException("Invalid Otp");

        const hashedPassword = await GenerateHash(password);

        await this.userRepo.updateOne({ email: user?.email }, { password: hashedPassword });

        return res.status(200).json({ message: "Done" });
    }
    // ====================================== //
}