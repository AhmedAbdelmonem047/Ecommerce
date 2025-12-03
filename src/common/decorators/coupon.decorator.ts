import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Types } from "mongoose";


@ValidatorConstraint({ name: "CouponDateValidator", async: false })
export class CouponDateValidator implements ValidatorConstraintInterface {
    validate(val: any, args: ValidationArguments): Promise<boolean> | boolean {
        const obj = args.object as any;
        const fromDate = new Date(obj.fromDate);
        const toDate = new Date(obj.toDate);
        const now = new Date();
        return fromDate >= now && fromDate < toDate
    };

    defaultMessage(args: ValidationArguments): string {
        return `fromDate must be greater than or equal to now and less than toDate`;
    }
}