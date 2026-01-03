
import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  serial,
  varchar,
  boolean,
  date,
  pgEnum,
  jsonb,
} from "drizzle-orm/pg-core"
import { relations } from "drizzle-orm"

// =================================================================//
// =================== ABETWORKS CRM DATABASE SCHEMA ===================//
// =================================================================//

// The top-level table representing a tenant in the multi-tenant system.
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userRoleEnum = pgEnum('user_role', ['user', 'company-admin', 'super-admin']);

// Users within the CRM system, scoped to an organization.
export const crmUsers = pgTable("crm_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  // Every user belongs to one organization.
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmUsersRelations = relations(crmUsers, ({ one }) => ({
	organization: one(organizations, {
		fields: [crmUsers.organizationId],
		references: [organizations.id],
	}),
}));

// Accounts represent customer companies or organizations, scoped to an organization.
export const crmAccounts = pgTable("crm_accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  // Every account belongs to one organization, ensuring data isolation.
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  // Soft delete fields
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  // For storing dynamic, user-defined fields.
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contacts are individuals associated with an Account, scoped to an organization.
export const crmContacts = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  // Each contact is linked to one account.
  accountId: integer("account_id").references(() => crmAccounts.id, { onDelete: 'cascade' }),
  // Every contact belongs to one organization.
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enums provide a fixed set of values for specific fields, ensuring data integrity.
export const leadStatusEnum = pgEnum('lead_status', ['New', 'Contacted', 'Qualified', 'Lost']);

// Leads are potential customers, scoped to an organization.
export const crmLeads = pgTable("crm_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  source: varchar("source", { length: 100 }),
  status: leadStatusEnum("status").default("New"),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const opportunityStageEnum = pgEnum('opportunity_stage', ['Prospecting', 'Qualification', 'Proposal', 'Closing', 'Won', 'Lost']);

// Opportunities are qualified leads, scoped to an organization.
export const crmOpportunities = pgTable("crm_opportunities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accountId: integer("account_id").notNull().references(() => crmAccounts.id, { onDelete: 'cascade' }),
  stage: opportunityStageEnum("stage").default("Prospecting"),
  amount: integer("amount"),
  closeDate: date("close_date"),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskStatusEnum = pgEnum('task_status', ['Pending', 'Completed']);
export const relatedToTypeEnum = pgEnum('related_to_type', ['Account', 'Contact', 'Opportunity', 'Lead']);

// Tasks are actions that need to be completed, scoped to an organization.
export const crmTasks = pgTable("crm_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").default("Pending"),
  assignedToId: integer("assigned_to_id").references(() => crmUsers.id),
  relatedToType: relatedToTypeEnum("related_to_type"),
  relatedToId: integer("related_to_id"),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceStatusEnum = pgEnum('invoice_status', ['Draft', 'Sent', 'Paid', 'Void']);

// Invoices are created for leads, scoped to an organization.
export const crmInvoices = pgTable("crm_invoices", {
    id: serial("id").primaryKey(),
    invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
    leadId: integer("lead_id").references(() => crmLeads.id),
    amount: integer("amount").notNull(),
    status: invoiceStatusEnum("status").default("Draft"),
    dueDate: date("due_date"),
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
