
import { FactoryProvider } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import { ConfigService } from '@nestjs/config';

// Define a symbol to use as the injection token
export const DrizzleProvider = 'DrizzleProvider';

// Create the provider
export const drizzleProvider: FactoryProvider<
  PostgresJsDatabase<typeof schema>
> = {
  provide: DrizzleProvider,
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const connectionString = configService.get<string>('database.url');
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    const client = postgres(connectionString);
    return drizzle(client, { schema });
  },
};
