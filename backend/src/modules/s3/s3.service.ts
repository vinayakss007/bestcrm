import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';

@Injectable()
export class S3Service implements OnModuleInit {
  public client: S3Client;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.client = new S3Client({
      endpoint: this.configService.get<string>('S3_ENDPOINT') || 'http://localhost:9000',
      region: this.configService.get<string>('S3_REGION') || 'us-east-1', // MinIO ignores this
      credentials: {
        accessKeyId: this.configService.get<string>('S3_ACCESS_KEY') || 'minioadmin',
        secretAccessKey: this.configService.get<string>('S3_SECRET_KEY') || 'minioadmin123',
      },
      forcePathStyle: true, // Needed for MinIO
    });
  }
}