
import { Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and, inArray } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import type { AuthenticatedUser } from '../users/users.service';

@Injectable()
export class RolesService {
    constructor(
        @Inject(DrizzleProvider)
        private db: PostgresJsDatabase<typeof schema>,
    ) {}

    async create(createRoleDto: CreateRoleDto, user: AuthenticatedUser) {
        return this.db.transaction(async (tx) => {
            const [newRole] = await tx
                .insert(schema.crmRoles)
                .values({
                    ...createRoleDto,
                    organizationId: user.organizationId,
                    isSystemRole: false, // Custom roles are never system roles
                })
                .returning();
            
            if (createRoleDto.permissionIds && createRoleDto.permissionIds.length > 0) {
                // Verify permissions exist
                const permissions = await tx.select().from(schema.crmPermissions).where(inArray(schema.crmPermissions.id, createRoleDto.permissionIds));
                if (permissions.length !== createRoleDto.permissionIds.length) {
                    throw new NotFoundException('One or more permissions not found.');
                }

                await tx.insert(schema.crmRolePermissions).values(
                    createRoleDto.permissionIds.map(pid => ({
                        roleId: newRole.id,
                        permissionId: pid,
                    }))
                );
            }
            return newRole;
        });
    }

    async findAll(organizationId: number) {
        return this.db.query.crmRoles.findMany({
            where: eq(schema.crmRoles.organizationId, organizationId),
            with: {
                permissions: {
                    with: {
                        permission: true
                    }
                }
            }
        });
    }

    async findOne(id: number, organizationId: number) {
        const role = await this.db.query.crmRoles.findFirst({
            where: and(
                eq(schema.crmRoles.id, id),
                eq(schema.crmRoles.organizationId, organizationId)
            ),
             with: {
                permissions: {
                    with: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            throw new NotFoundException('Role not found.');
        }
        return role;
    }

    async update(id: number, updateRoleDto: UpdateRoleDto, user: AuthenticatedUser) {
        const role = await this.findOne(id, user.organizationId);
        if (role.isSystemRole) {
            throw new ForbiddenException('Cannot modify a system role.');
        }

        return this.db.transaction(async (tx) => {
            if (updateRoleDto.name || updateRoleDto.description) {
                await tx.update(schema.crmRoles).set({
                    name: updateRoleDto.name,
                    description: updateRoleDto.description,
                }).where(eq(schema.crmRoles.id, id));
            }

            if (updateRoleDto.permissionIds) {
                // Clear existing permissions and set new ones
                await tx.delete(schema.crmRolePermissions).where(eq(schema.crmRolePermissions.roleId, id));

                if (updateRoleDto.permissionIds.length > 0) {
                     const permissions = await tx.select().from(schema.crmPermissions).where(inArray(schema.crmPermissions.id, updateRoleDto.permissionIds));
                    if (permissions.length !== updateRoleDto.permissionIds.length) {
                        throw new NotFoundException('One or more permissions not found.');
                    }
                    await tx.insert(schema.crmRolePermissions).values(
                        updateRoleDto.permissionIds.map(pid => ({
                            roleId: id,
                            permissionId: pid,
                        }))
                    );
                }
            }
            return this.findOne(id, user.organizationId);
        });
    }

    async remove(id: number, user: AuthenticatedUser) {
        const role = await this.findOne(id, user.organizationId);
        if (role.isSystemRole) {
            throw new ForbiddenException('Cannot delete a system role.');
        }
        
        // Before deleting, check if any users are assigned this role
        const usersWithRole = await this.db.query.crmUsers.findFirst({
            where: eq(schema.crmUsers.roleId, id)
        });

        if (usersWithRole) {
            throw new ForbiddenException('Cannot delete role as it is currently assigned to one or more users.');
        }

        await this.db.delete(schema.crmRoles).where(eq(schema.crmRoles.id, id));
        return;
    }

    async findAllPermissions() {
        return this.db.query.crmPermissions.findMany();
    }
}
