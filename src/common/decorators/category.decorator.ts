import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";
import { Types } from "mongoose";


@ValidatorConstraint({ name: "IsMongoIds", async: false })
export class IsMongoIds implements ValidatorConstraintInterface {
    validate(ids: string[], args?: ValidationArguments): Promise<boolean> | boolean {
        return ids.filter(id => Types.ObjectId.isValid(id)).length === ids.length
    };

    defaultMessage(args?: ValidationArguments): string {
        return `Some of the brands ids aren't valid`;
    }
}