
import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
// Import Drizzle and schema if you set up a database module
// import { DrizzleModule } from '../drizzle/drizzle.module';

@Module({
  // imports: [DrizzleModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
