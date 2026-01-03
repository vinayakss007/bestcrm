
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
import type { AdapterAccount } from "@auth/core/adapters"

// This section defines tables for NextAuth.js if you integrate it directly.
// These are standard and should not be modified unless you are customizing Auth.js behavior.
export const users = pgTable("user", {
  id: text("id").notNull().primaryKey(),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey(account.provider, account.providerAccountId),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").notNull().primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey(vt.identifier, vt.token),
  })
);


// =================================================================//
// =================== ABETWORKS CRM DATABASE SCHEMA ===================//
// =================================================================//

// The top-level table representing a tenant in the multi-tenant system.
export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const organizationsRelations = relations(organizations, ({ many }) => ({
	users: many(crmUsers),
  roles: many(crmRoles),
}));


// Users within the CRM system, scoped to an organization.
export const crmUsers = pgTable("crm_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  avatarUrl: text("avatar_url"),
  // Every user belongs to one organization.
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  roleId: integer("role_id").notNull().references(() => crmRoles.id),
  isDeleted: boolean("is_deleted").default(false).notNull(),
  deletedAt: timestamp("deleted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmUsersRelations = relations(crmUsers, ({ one }) => ({
	organization: one(organizations, {
		fields: [crmUsers.organizationId],
		references: [organizations.id],
	}),
  role: one(crmRoles, {
    fields: [crmUsers.roleId],
    references: [crmRoles.id],
  }),
}));

// Stores custom roles created by Company Admins for their organization.
export const crmRoles = pgTable("crm_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  // 'super-admin' is a global role, so organizationId can be null.
  organizationId: integer("organization_id").references(() => organizations.id, { onDelete: 'cascade' }),
  // is_system_role prevents deletion/modification of foundational roles.
  isSystemRole: boolean("is_system_role").default(false).notNull(),
});

export const crmRolesRelations = relations(crmRoles, ({ many }) => ({
	permissions: many(crmRolePermissions),
}));

// A dictionary of all possible permissions in the system.
export const crmPermissions = pgTable("crm_permissions", {
  id: serial("id").primaryKey(),
  // e.g., 'account:create', 'lead:delete'
  key: varchar("key", { length: 100 }).notNull().unique(),
  description: text("description"),
});

export const crmPermissionsRelations = relations(crmPermissions, ({ many }) => ({
	roles: many(crmRolePermissions),
}));

// Join table for the many-to-many relationship between roles and permissions.
export const crmRolePermissions = pgTable("crm_role_permissions", {
  roleId: integer("role_id").notNull().references(() => crmRoles.id, { onDelete: 'cascade' }),
  permissionId: integer("permission_id").notNull().references(() => crmPermissions.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.roleId, t.permissionId] }),
}));

export const crmRolePermissionsRelations = relations(crmRolePermissions, ({ one }) => ({
  role: one(crmRoles, {
    fields: [crmRolePermissions.roleId],
    references: [crmRoles.id],
  }),
  permission: one(crmPermissions, {
    fields: [crmRolePermissions.permissionId],
    references: [crmPermissions.id],
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

export const crmAccountsRelations = relations(crmAccounts, ({ one, many }) => ({
  owner: one(crmUsers, {
    fields: [crmAccounts.ownerId],
    references: [crmUsers.id],
  }),
  contacts: many(crmContacts),
  opportunities: many(crmOpportunities),
}));


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

export const crmContactsRelations = relations(crmContacts, ({ one }) => ({
  account: one(crmAccounts, {
    fields: [crmContacts.accountId],
    references: [crmAccounts.id],
  }),
}));


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

export const crmLeadsRelations = relations(crmLeads, ({ one }) => ({
  owner: one(crmUsers, {
    fields: [crmLeads.ownerId],
    references: [crmUsers.id],
  }),
}));

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

export const crmOpportunitiesRelations = relations(crmOpportunities, ({ one }) => ({
  account: one(crmAccounts, {
    fields: [crmOpportunities.accountId],
    references: [crmAccounts.id],
  }),
  owner: one(crmUsers, {
    fields: [crmOpportunities.ownerId],
    references: [crmUsers.id],
  }),
}));


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

export const crmTasksRelations = relations(crmTasks, ({ one }) => ({
  assignedTo: one(crmUsers, {
    fields: [crmTasks.assignedToId],
    references: [crmUsers.id],
  }),
}));


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

export const crmInvoicesRelations = relations(crmInvoices, ({ one }) => ({
  lead: one(crmLeads, {
    fields: [crmInvoices.leadId],
    references: [crmLeads.id],
  }),
}));


// Comments can be attached to various CRM records.
export const crmComments = pgTable("crm_comments", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  userId: integer("user_id").notNull().references(() => crmUsers.id),
  relatedToType: relatedToTypeEnum("related_to_type").notNull(),
  relatedToId: integer("related_to_id").notNull(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmCommentsRelations = relations(crmComments, ({ one }) => ({
  user: one(crmUsers, {
    fields: [crmComments.userId],
    references: [crmUsers.id],
  }),
}));

// A log of all significant actions taken within an organization.
export const activityTypeEnum = pgEnum('activity_type', [
    'account_created',
    'contact_created',
    'lead_created',
    'opportunity_created'
]);

export const crmActivities = pgTable("crm_activities", {
    id: serial("id").primaryKey(),
    type: activityTypeEnum("type").notNull(),
    details: jsonb("details").notNull(),
    // The user who performed the action.
    userId: integer("user_id").notNull().references(() => crmUsers.id),
    // All activities are scoped to an organization for security and filtering.
    organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
    // Polymorphic association to the primary record (e.g., the account that was created).
    relatedToType: relatedToTypeEnum("related_to_type"),
    relatedToId: integer("related_to_id"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmActivitiesRelations = relations(crmActivities, ({ one }) => ({
    user: one(crmUsers, {
        fields: [crmActivities.userId],
        references: [crmUsers.id],
    }),
}));

export const crmAttachments = pgTable("crm_attachments", {
  id: serial("id").primaryKey(),
  originalName: varchar("original_name", { length: 255 }).notNull(),
  fileName: varchar("file_name", { length: 255 }).notNull().unique(),
  fileType: varchar("file_type", { length: 100 }).notNull(),
  fileSize: integer("file_size").notNull(),
  userId: integer("user_id").notNull().references(() => crmUsers.id),
  relatedToType: relatedToTypeEnum("related_to_type").notNull(),
  relatedToId: integer("related_to_id").notNull(),
  organizationId: integer("organization_id").notNull().references(() => organizations.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmAttachmentsRelations = relations(crmAttachments, ({ one }) => ({
  user: one(crmUsers, {
    fields: [crmAttachments.userId],
    references: [crmUsers.id],
  }),
}));

      