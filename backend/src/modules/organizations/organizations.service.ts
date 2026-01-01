
import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

type AuthenticatedUser = {
    userId: number;
    organizationId: number;
    role: 'user' | 'company-admin' | 'super-admin';
}

@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>
  ) {}

  async findOne(id: number) {
    const org = await this.db.query.organizations.findFirst({
        where: eq(schema.organizations.id, id),
    });
    if (!org) {
        throw new NotFoundException('Organization not found');
    }
    return org;
  }

  async update(id: number, updateOrganizationDto: UpdateOrganizationDto, user: AuthenticatedUser) {
    // Security check: ensure the user is an admin of the organization they're trying to update
    if (user.role !== 'super-admin' && user.organizationId !== id) {
        throw new ForbiddenException('You are not authorized to update this organization.');
    }
    if (user.role === 'user') {
        throw new ForbiddenException('You do not have permission to update organization settings.');
    }

    // Verify the organization exists
    await this.findOne(id);
    
    const updatedOrg = await this.db
      .update(schema.organizations)
      .set(updateOrganizationDto)
      .where(eq(schema.organizations.id, id))
      .returning();

    return updatedOrg[0];
  }
}
