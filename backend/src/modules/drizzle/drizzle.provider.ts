
import { FactoryProvider } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { ConfigService } from '@nestjs/config';

// Define a symbol to use as the injection token
export const DrizzleAsyncProvider = Symbol('DrizzleAsyncProvider');

// Create the provider
export const drizzleProvider: FactoryProvider<
  Promise<PostgresJsDatabase<typeof schema>>
> = {
  provide: DrizzleAsyncProvider,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const client = postgres(connectionString);
    return drizzle(client, { schema });
  },
};

// Re-export the provider under a more conventional name
export { drizzleProvider as DrizzleAsyncProvider };
