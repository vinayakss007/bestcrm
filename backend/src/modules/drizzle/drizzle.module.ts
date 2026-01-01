
import { Module } from '@nestjs/common';
import { DrizzleAsyncProvider } from './drizzle.provider';

@Module({
  providers: [DrizzleAsyncProvider],
  exports: [DrizzleAsyncProvider],
})
export class DrizzleModule {}
