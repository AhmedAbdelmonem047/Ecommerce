import { Controller, Get, Req, Res } from '@nestjs/common';
import { AppService } from './app.service';
import type { NextFunction, Request, Response } from 'express';
import { S3Service } from './common';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService, private readonly s3Service: S3Service) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get("upload/*path")
  async GetFile(@Req() req: Request, @Res() res: Response, next: NextFunction) {
    const { path } = req.params as unknown as { path: string[] };
    const Key = path.join("/");
    const result = await this.s3Service.getFile({ Key });
    const stream = result.Body as NodeJS.ReadableStream;
    res.set("cross-origin-resource-policy", "cross-origin");
    res.setHeader("Content-Type", result?.ContentType || "application/octet-stream");
    stream.pipe(res);
  }
}
