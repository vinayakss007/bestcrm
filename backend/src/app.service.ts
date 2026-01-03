
import { Inject, Injectable } from '@nestjs/common';
import { DrizzleProvider } from './modules/drizzle/drizzle.provider';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from './db/schema';
import { sql } from 'drizzle-orm';

@Injectable()
export class AppService {
  constructor(
    @Inject(DrizzleProvider) private db: PostgresJsDatabase<typeof schema>,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getHealth() {
    try {
      // A simple query to check if the database connection is alive
      await this.db.execute(sql`SELECT 1`);
      return {
        status: 'ok',
        api: 'Operational',
        database: 'Operational',
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        status: 'error',
        api: 'Operational',
        database: 'Error',
        details: error instanceof Error ? error.message : 'Unknown database error',
      };
    }
  }
}
