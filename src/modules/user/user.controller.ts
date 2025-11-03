import { Body, Controller, Get, Patch, Post, Res, UseGuards } from "@nestjs/common";
import { UserService } from "./user.service";
import type { Response } from "express";
import { ConfirmEmailDto, LoginDto, LoginGmailDto, ResendOtpDto, ResetPasswordDto, SignupDto } from "./dto/user.dto";
import { AuthenticationGuard, AuthorizationGuard, Role, Token, TokenTypeEnum, User } from "../../common";
import type { HUserDocument } from "../../DB";

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) { }

    // =============== Signup =============== //
    @Post("signup")
    signup(@Body() body: SignupDto, @Res() res: Response) {
        return this.userService.signup(body, res)
    }
    // ====================================== //

    // ============= Resend Otp ============= //
    @Post("resendOtp")
    resendOtp(@Body() body: ResendOtpDto, @Res() res: Response) {
        return this.userService.resendOtp(body, res)
    }
    // ====================================== //


    // ================ Login =============== //
    @Post("login")
    login(@Body() body: LoginDto, @Res() res: Response) {
        return this.userService.login(body, res)
    }
    // ====================================== //


    // ========== Login With Gmail ========== //
    @Post('loginGmail')
    loginWithGmail(@Body() body: LoginGmailDto, @Res() res: Response) {
        return this.userService.loginWithGmail(body, res)
    }
    // ====================================== //


    // ============ Confirm Email =========== //
    @Patch('confirmEmail')
    confirmEmail(@Body() body: ConfirmEmailDto, @Res() res: Response) {
        return this.userService.confirmEmail(body, res)
    }
    // ====================================== //


    // =========== Forget Password ========== //
    @Patch('forgetPassword')
    forgetPassword(@Body() body: ResendOtpDto, @Res() res: Response) {
        return this.userService.forgetPassword(body, res)
    }
    // ====================================== //


    // =========== Reset Password ========== //
    @Patch('resetPassword')
    resetPassword(@Body() body: ResetPasswordDto, @Res() res: Response) {
        return this.userService.resetPassword(body, res)
    }
    // ====================================== //

    // ============= Get Profile ============ //
    @Token(TokenTypeEnum.access)
    @UseGuards(AuthenticationGuard)
    @Get('profile')
    getProfile(@User() user: HUserDocument) {
        return { message: "Done", user }
    }
    // ====================================== //
}