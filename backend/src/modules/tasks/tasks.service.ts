
import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq, and } from 'drizzle-orm';
import * as schema from '@/db/schema';
import { DrizzleProvider } from '../drizzle/drizzle.provider';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  private async verifyRelatedEntity(
    type: 'Account' | 'Contact' | 'Lead' | 'Opportunity',
    id: number,
    organizationId: number,
  ) {
    let entity: any;
    switch (type) {
      case 'Account':
        entity = await this.db.query.crmAccounts.findFirst({
          where: and(
            eq(schema.crmAccounts.id, id),
            eq(schema.crmAccounts.organizationId, organizationId),
          ),
        });
        break;
      case 'Contact':
        entity = await this.db.query.crmContacts.findFirst({
          where: and(
            eq(schema.crmContacts.id, id),
            eq(schema.crmContacts.organizationId, organizationId),
          ),
        });
        break;
      case 'Lead':
        entity = await this.db.query.crmLeads.findFirst({
          where: and(
            eq(schema.crmLeads.id, id),
            eq(schema.crmLeads.organizationId, organizationId),
          ),
        });
        break;
      case 'Opportunity':
        entity = await this.db.query.crmOpportunities.findFirst({
          where: and(
            eq(schema.crmOpportunities.id, id),
            eq(schema.crmOpportunities.organizationId, organizationId),
          ),
        });
        break;
    }
    if (!entity) {
      throw new ForbiddenException(
        `Related ${type} not found or does not belong to your organization.`,
      );
    }
  }

  async create(createTaskDto: CreateTaskDto, organizationId: number) {
    if (createTaskDto.relatedToType && createTaskDto.relatedToId) {
      await this.verifyRelatedEntity(
        createTaskDto.relatedToType,
        createTaskDto.relatedToId,
        organizationId,
      );
    }

    const newTask = await this.db
      .insert(schema.crmTasks)
      .values({
        ...createTaskDto,
        organizationId,
      })
      .returning();

    return newTask[0];
  }

  async findAll(organizationId: number) {
    return await this.db.query.crmTasks.findMany({
      where: eq(schema.crmTasks.organizationId, organizationId),
      with: {
        assignedTo: {
          columns: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: (tasks, { desc }) => [desc(tasks.createdAt)],
    });
  }

  async findOne(id: number, organizationId: number) {
    const task = await this.db.query.crmTasks.findFirst({
      where: and(
        eq(schema.crmTasks.id, id),
        eq(schema.crmTasks.organizationId, organizationId),
      ),
      with: {
        assignedTo: {
          columns: {
            name: true,
            avatarUrl: true,
          }
        }
      }
    });

    if (!task) {
      throw new NotFoundException('Task not found');
    }
    return task;
  }

  async update(
    id: number,
    updateTaskDto: UpdateTaskDto,
    organizationId: number,
  ) {
    await this.findOne(id, organizationId); // Verify ownership

    if (updateTaskDto.relatedToType && updateTaskDto.relatedToId) {
        await this.verifyRelatedEntity(
          updateTaskDto.relatedToType,
          updateTaskDto.relatedToId,
          organizationId,
        );
      }

    const updatedTask = await this.db
      .update(schema.crmTasks)
      .set({
        ...updateTaskDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.crmTasks.id, id))
      .returning();

    return updatedTask[0];
  }

  async remove(id: number, organizationId: number) {
    await this.findOne(id, organizationId); // Verify ownership

    await this.db.delete(schema.crmTasks).where(eq(schema.crmTasks.id, id));

    return;
  }
}
