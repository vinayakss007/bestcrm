
import { Module } from '@nestjs/common';
import { ActivitiesService } from './activities.service';
import { ActivitiesController } from './activities.controller';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { AccountsModule } from '../accounts/accounts.module';

@Module({
  imports: [DrizzleModule, AccountsModule],
  controllers: [ActivitiesController],
  providers: [ActivitiesService],
})
export class ActivitiesModule {}
