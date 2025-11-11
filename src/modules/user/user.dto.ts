import { IsEmail, IsEnum, IsNotEmpty, IsNumber, IsString, IsStrongPassword, Length, Matches, Max, Min, ValidateIf } from "class-validator";
import { UserGender, IsMatch } from "src/common";

export class ResendOtpDto {
    @IsNotEmpty()
    @IsString()
    @IsEmail()
    email: string;
}

export class LoginDto extends ResendOtpDto {
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;
}

export class SignupDto extends LoginDto {
    @IsString()
    @IsNotEmpty()
    @Length(3, 15)
    @ValidateIf((data: SignupDto) => Boolean(!data.userName))
    fName: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 15)
    @ValidateIf((data: SignupDto) => Boolean(!data.userName))
    lName: string;

    @IsString()
    @IsNotEmpty()
    @Length(3, 15)
    @ValidateIf((data: SignupDto) => Boolean(!data.fName && !data.lName))
    userName: string;

    @IsNumber()
    @IsNotEmpty()
    @Min(18)
    @Max(60)
    age: number;

    @IsNotEmpty()
    @IsString()
    @IsEnum(UserGender)
    gender: UserGender;

    @ValidateIf((data: SignupDto) => {
        return Boolean(data.password);
    })
    @IsMatch(["password"])
    cPassword: string;

    // provider: string
}

export class ConfirmEmailDto extends ResendOtpDto {
    @IsString()
    @IsNotEmpty()
    @Matches(/^\d{6}$/, {
        message: "OTP must be a six digit number"
    })
    otp: string;
}

export class ResetPasswordDto extends ConfirmEmailDto {
    @IsStrongPassword()
    @IsNotEmpty()
    password: string;


    @ValidateIf((data: SignupDto) => {
        return Boolean(data.password);
    })
    @IsMatch(["password"])
    cPassword: string;
}

export class LoginGmailDto {
    @IsString()
    @IsNotEmpty()
    idToken: string
}