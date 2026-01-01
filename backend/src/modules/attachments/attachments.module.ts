
import { Module } from '@nestjs/common';
import { AttachmentsService } from './attachments.service';
import { AttachmentsController } from './attachments.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { MulterModule } from '@nestjs/platform-express';

@Module({
  imports: [
    DrizzleModule,
    MulterModule.register({
      dest: './uploads',
    }),
  ],
  controllers: [AttachmentsController],
  providers: [AttachmentsService],
})
export class AttachmentsModule {}
