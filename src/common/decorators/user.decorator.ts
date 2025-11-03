import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { registerDecorator, ValidationArguments, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from "class-validator";


@ValidatorConstraint({ name: "MatchFields", async: false })
export class MatchFields implements ValidatorConstraintInterface {
    validate(value: any, args?: ValidationArguments): Promise<boolean> | boolean {
        return value == args?.object[args.constraints[0]];
    }

    defaultMessage(args?: ValidationArguments): string {
        return `${args?.property} don't match with ${args?.constraints[0]}`;
    }
}

export function IsMatch(constraints: string[], validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName,
            options: validationOptions,
            constraints,
            validator: MatchFields
        })
    }
}

export const User = createParamDecorator(
    (data:unknown, ctx:ExecutionContext)=>{
        const request = ctx.switchToHttp().getRequest();
        return request.user;
    }
)