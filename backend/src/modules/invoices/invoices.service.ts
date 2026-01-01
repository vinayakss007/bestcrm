
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
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(
    @Inject(DrizzleProvider)
    private db: PostgresJsDatabase<typeof schema>,
  ) {}

  async create(createInvoiceDto: CreateInvoiceDto, organizationId: number) {
    // Verify that the associated lead belongs to the same organization
    const lead = await this.db.query.crmLeads.findFirst({
      where: and(
        eq(schema.crmLeads.id, createInvoiceDto.leadId),
        eq(schema.crmLeads.organizationId, organizationId),
      ),
    });

    if (!lead) {
      throw new ForbiddenException(
        'Lead not found or does not belong to your organization.',
      );
    }

    // Generate a unique invoice number (simplified for now)
    const invoiceCount = await this.db
      .select()
      .from(schema.crmInvoices)
      .where(eq(schema.crmInvoices.organizationId, organizationId));
    const invoiceNumber = `INV-${new Date().getFullYear()}-${(
      invoiceCount.length + 1
    )
      .toString()
      .padStart(4, '0')}`;

    const newInvoice = await this.db
      .insert(schema.crmInvoices)
      .values({
        ...createInvoiceDto,
        organizationId,
        invoiceNumber,
      })
      .returning();

    return newInvoice[0];
  }

  async findAll(organizationId: number) {
    return await this.db.query.crmInvoices.findMany({
      where: eq(schema.crmInvoices.organizationId, organizationId),
      with: {
        lead: {
          columns: {
            name: true,
          },
        },
      },
      orderBy: (invoices, { desc }) => [desc(invoices.createdAt)],
    });
  }

  async findOne(id: number, organizationId: number) {
    const invoice = await this.db.query.crmInvoices.findFirst({
      where: and(
        eq(schema.crmInvoices.id, id),
        eq(schema.crmInvoices.organizationId, organizationId),
      ),
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }
    return invoice;
  }

  async update(
    id: number,
    updateInvoiceDto: UpdateInvoiceDto,
    organizationId: number,
  ) {
    await this.findOne(id, organizationId); // Verify ownership

    const updatedInvoice = await this.db
      .update(schema.crmInvoices)
      .set({
        ...updateInvoiceDto,
        updatedAt: new Date(),
      })
      .where(eq(schema.crmInvoices.id, id))
      .returning();

    return updatedInvoice[0];
  }

  async remove(id: number, organizationId: number) {
    await this.findOne(id, organizationId); // Verify ownership

    await this.db.delete(schema.crmInvoices).where(eq(schema.crmInvoices.id, id));

    return;
  }
}
