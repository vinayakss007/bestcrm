import { Controller, Post, UploadedFile, UseInterceptors, Body, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { S3Service } from '../s3/s3.service';
import { ConfigService } from '@nestjs/config';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'crypto';

@Controller('files')
export class FilesController {
  constructor(
    private s3Service: S3Service,
    private configService: ConfigService,
  ) {}

  @Post('upload')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Body('folder') folder?: string) {
    const bucketName = this.configService.get<string>('S3_BUCKET_NAME');
    
    // Generate a unique key for the file
    const fileKey = `${folder ? folder + '/' : ''}${randomUUID()}-${file.originalname}`;
    
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    });

    await this.s3Service.client.send(command);

    return {
      key: fileKey,
      url: `http://localhost:9000/${bucketName}/${fileKey}`,
      originalName: file.originalname,
      size: file.size,
      mimetype: file.mimetype,
    };
  }
}