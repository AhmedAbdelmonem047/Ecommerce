import multer from "multer";
import os from "os"
import { StoreEnumType } from "../../enums/multer.enum";
import { filevalidation } from "./multer.fileValidation";
import type { Request } from "express";
import { BadRequestException } from "@nestjs/common";


export const multerCloud = ({
    fileType = filevalidation.image,
    storeType = StoreEnumType.MEMORY,
    maxSize = 5
}: {
    fileType?: string[],
    storeType?: StoreEnumType,
    maxSize?: number
}) => {
    return {
        storage: storeType === StoreEnumType.MEMORY ? multer.memoryStorage() : multer.diskStorage({
            destination: os.tmpdir(),
            filename: (req: Request, file: Express.Multer.File, cb: Function) => {
                cb(null, `${Date.now()}_${file.originalname}`);
            }
        }),
        fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
            if (!fileType.includes(file.mimetype))
                cb(new BadRequestException("Invalid file type"));
            else
                cb(null, true);
        },
        limits: {
            fileSize: 1024 * 1024 * maxSize
        }
    }
}