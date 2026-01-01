
import { FactoryProvider } from '@nestjs/common';
import { drizzle, PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { ConfigService } from '@nestjs/config';
import * as schema from '../../db/schema';

// Define a symbol to use as the injection token
export const DrizzleProvider = 'DrizzleProvider';

// Create the provider
export const drizzleProvider: FactoryProvider<
  PostgresJsDatabase<typeof schema>
> = {
  provide: DrizzleProvider,
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const connectionString = configService.get<string>('DATABASE_URL');
    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Use require for CommonJS compatibility
    const postgres = require('postgres');
    const client = postgres(connectionString);

    return drizzle(client, { schema });
  },
};
