
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { DrizzleModule } from '../drizzle/drizzle.module';
import { UsersController } from './users.controller';

@Module({
  imports: [DrizzleModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
