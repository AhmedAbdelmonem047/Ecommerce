import multer from "multer"
import fs from "fs"
import type { Request } from "express"
import { BadRequestException } from "@nestjs/common";


export const multerLocal = ({
    fileType = [],
    customPath = "generals",
    maxSize = 5
}: {
    fileType?: string[],
    customPath?: string,
    maxSize?: number
}) => {
    const fullPath = `uploads/${customPath}`
    if (!fs.existsSync(fullPath))
        fs.mkdirSync(fullPath, { recursive: true });

    return {
        storage: multer.diskStorage({
            destination: (req: Request, file: Express.Multer.File, cb: Function) => {
                cb(null, fullPath);
            },
            filename: (req: Request, file: Express.Multer.File, cb: Function) => {
                cb(null, Date.now() + "_" + file.originalname);
            }
        }),
        fileFilter: (req: Request, file: Express.Multer.File, cb: Function) => {
            if (fileType.includes(file.mimetype))
                cb(null, true)
            else
                cb(new BadRequestException("Invalid file type"));
        },
        limits: {
            fileSize: 1024 * 1024 * maxSize
        }
    }
}