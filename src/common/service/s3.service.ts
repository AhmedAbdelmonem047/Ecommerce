import { DeleteObjectCommand, DeleteObjectsCommand, GetObjectCommand, ListObjectsV2Command, ObjectCannedACL, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { BadRequestException, Injectable } from "@nestjs/common";
import { StoreEnumType } from "../enums";
import { randomUUID } from "crypto";
import { createReadStream } from "fs";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


@Injectable()
export class S3Service {
    private readonly s3Client: S3Client;
    // ============ S3Client Config ========= //
    constructor() {
        this.s3Client = new S3Client({
            region: process.env.AWS_REGION!,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY!,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
            }
        })
    }
    // ====================================== //

    // ============= Upload File ============ //
    uploadFile = async ({
        storeType = StoreEnumType.MEMORY,
        Bucket = process.env.AWS_BUCKET_NAME!,
        path,
        file,
        ACL = "private"
    }: {
        storeType?: StoreEnumType,
        Bucket?: string,
        path: string,
        file: Express.Multer.File,
        ACL?: ObjectCannedACL
    }): Promise<string> => {

        const command = new PutObjectCommand({
            Bucket,
            Key: `${process.env.APPLICATION_NAME!}/${path}/${randomUUID()}_${file.originalname}`,
            Body: storeType === StoreEnumType.MEMORY ? file.buffer : createReadStream(file.path),
            ContentType: file.mimetype,
            ACL
        });

        await this.s3Client.send(command)
        if (!command.input.Key)
            throw new BadRequestException("Failed to upload file");

        return command.input.Key;
    }
    // ====================================== //

    // ========== Upload Large File ========= //
    uploadLargeFile = async ({
        storeType = StoreEnumType.DISK,
        Bucket = process.env.AWS_BUCKET_NAME!,
        path = "general",
        ACL = "private" as ObjectCannedACL,
        file
    }: {
        storeType?: StoreEnumType,
        Bucket?: string,
        path?: string,
        ACL?: ObjectCannedACL,
        file: Express.Multer.File
    }): Promise<string> => {
        const upload = new Upload({
            client: this.s3Client,
            params: {
                Bucket,
                ACL,
                Key: `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_${file.originalname}}`,
                Body: storeType === StoreEnumType.MEMORY ? file.buffer : createReadStream(file.path),
                ContentType: file.mimetype
            }
        });

        upload.on("httpUploadProgress", (progress) => {
            console.log(progress);
        });
        const { Key } = await upload.done()
        if (!Key)
            throw new BadRequestException("Failed to upload file to s3");
        return Key;
    }
    // ====================================== //

    // ============ Upload Files ============ //
    uploadFiles = async (
        {
            storeType = StoreEnumType.MEMORY,
            Bucket = process.env.AWS_BUCKET_NAME!,
            path = "general",
            ACL = "private" as ObjectCannedACL,
            files,
            useLarge = false
        }: {
            storeType?: StoreEnumType,
            Bucket?: string,
            path: string,
            ACL?: ObjectCannedACL,
            files: Express.Multer.File[],
            useLarge?: boolean
        }
    ): Promise<string[]> => {
        let urls: string[] = [];
        if (useLarge)
            urls = await Promise.all(files.map(file => this.uploadLargeFile({ storeType, Bucket, path, ACL, file })));
        else
            urls = await Promise.all(files.map(file => this.uploadFile({ storeType, Bucket, path, ACL, file })));
        return urls;
    }
    // ====================================== //

    // ===== Upload Files Presigned URL ===== //
    createUploadFilePresignedURL = async (
        {
            Bucket = process.env.AWS_BUCKET_NAME!,
            path = "general",
            originalname,
            ContentType,
            expiresIn = 60 * 60
        }: {
            Bucket?: string,
            path: string,
            originalname: string,
            ContentType: string,
            expiresIn?: number
        }
    ) => {
        const Key = `${process.env.APPLICATION_NAME}/${path}/${randomUUID()}_presigned_${originalname}}`;
        const command = new PutObjectCommand({
            Bucket,
            Key,
            ContentType
        })
        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        if (!command.input.Key)
            throw new BadRequestException("Failed to upload file");
        return { url, key: command.input.Key };
    }
    // ====================================== //

    // =============== Get File ============= //
    getFile = async (
        {
            Bucket = process.env.AWS_BUCKET_NAME,
            Key
        }: {
            Bucket?: string,
            Key: string
        }
    ) => {
        const command = new GetObjectCommand({
            Bucket,
            Key
        })
        return await this.s3Client.send(command);
    }
    // ====================================== //

    // ======= Get File Presigned URL ======= //
    createGetFilePresignedURL = async (
        {
            Bucket = process.env.AWS_BUCKET_NAME,
            Key,
            expiresIn = 60,
            downloadName
        }: {
            Bucket?: string,
            Key: string,
            expiresIn?: number,
            downloadName?: string | undefined
        }
    ) => {
        const command = new GetObjectCommand({
            Bucket,
            Key,
            ResponseContentDisposition: downloadName ? `attachment: filename="${downloadName}"` : undefined
        })
        const url = await getSignedUrl(this.s3Client, command, { expiresIn });
        return url;
    }
    // ====================================== //

    // ============= Delete File ============ //
    deleteFile = async (
        {
            Bucket = process.env.AWS_BUCKET_NAME,
            Key
        }: {
            Bucket?: string,
            Key: string
        }
    ) => {
        const command = new DeleteObjectCommand({
            Bucket,
            Key
        })
        return await this.s3Client.send(command);
    }
    // ====================================== //

    // ============ Delete Files ============ //
    deleteFiles = async (
        {
            Bucket = process.env.AWS_BUCKET_NAME,
            urls,
            Quiet = false
        }: {
            Bucket?: string,
            urls: string[],
            Quiet?: boolean
        }
    ) => {
        const command = new DeleteObjectsCommand({
            Bucket,
            Delete: { Objects: urls.map(url => ({ Key: url })), Quiet }
        })
        return await this.s3Client.send(command);
    }
    // ====================================== //

    // ============= List Files ============= //
    listFiles = async (
        {
            Bucket = process.env.AWS_BUCKET_NAME,
            path
        }: {
            Bucket?: string,
            path: string
        }
    ) => {
        const command = new ListObjectsV2Command({
            Bucket,
            Prefix: `${process.env.APPLICATION_NAME!}/${path}`
        })
        return await this.s3Client.send(command);
    }
    // ====================================== //
}