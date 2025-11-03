import { Request } from "express";
import { HUserDocument } from "../../DB";
import { JwtPayload } from "jsonwebtoken";


export interface RequestWithUser extends Request {
    user: HUserDocument,
    decodedToken: JwtPayload
}