
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { JobsController } from './jobs.controller';
import { JobsProducerService } from './jobs.producer.service';
import { AccountExportProcessor } from './jobs.processor';

@Module({
  imports: [
    DrizzleModule,
    BullModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host'),
          port: configService.get<number>('redis.port'),
        },
      }),
    }),
    BullModule.registerQueue({
      name: 'export',
    }),
  ],
  controllers: [JobsController],
  providers: [JobsProducerService, AccountExportProcessor],
  exports: [JobsProducerService],
})
export class JobsModule {}
