import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { S3Service } from '../s3/s3.service';

@Module({
  controllers: [FilesController],
  providers: [S3Service],
  exports: [],
})
export class FilesModule {}