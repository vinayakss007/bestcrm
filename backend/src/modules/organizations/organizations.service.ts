
import { Injectable, Inject, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, sql } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import type { AuthenticatedUser } from '../users/users.service';


@Injectable()
export class OrganizationsService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>
  ) {}

  async findAll(user: AuthenticatedUser) {
    // This permission check is now handled by the PermissionsGuard on the controller
    const organizationsWithUserCounts = await this.db
      .select({
        id: schema.organizations.id,
        name: schema.organizations.name,
        createdAt: schema.organizations.createdAt,
        userCount: sql<number>`count(${schema.crmUsers.id})`.mapWith(Number),
      })
      .from(schema.organizations)
      .leftJoin(schema.crmUsers, eq(schema.organizations.id, schema.crmUsers.organizationId))
      .groupBy(schema.organizations.id)
      .orderBy(schema.organizations.name);
      
    return organizationsWithUserCounts;
  }

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
    // This is now handled by the PermissionsGuard on the controller.
    // The service can trust that the user has the 'setting:brand:update' permission.
    
    // We still need to ensure they are updating their OWN organization unless they are a super-admin.
    if (user.role.name !== 'super-admin' && user.organizationId !== id) {
        throw new ForbiddenException('You are not authorized to update this organization.');
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
