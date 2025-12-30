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
// =================== ZENITH CRM DATABASE SCHEMA ===================//
// =================================================================//

// Users within the CRM system.
export const crmUsers = pgTable("crm_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accounts represent customer companies or organizations.
export const crmAccounts = pgTable("crm_accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  // For storing dynamic, user-defined fields.
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Contacts are individuals associated with an Account.
export const crmContacts = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  // Each contact is linked to one account.
  accountId: integer("account_id").references(() => crmAccounts.id, { onDelete: 'cascade' }),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Enums provide a fixed set of values for specific fields, ensuring data integrity.
export const leadStatusEnum = pgEnum('lead_status', ['New', 'Contacted', 'Qualified', 'Lost']);

// Leads are potential customers that are not yet qualified.
export const crmLeads = pgTable("crm_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  source: varchar("source", { length: 100 }),
  status: leadStatusEnum("status").default("New"),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const opportunityStageEnum = pgEnum('opportunity_stage', ['Prospecting', 'Qualification', 'Proposal', 'Closing', 'Won', 'Lost']);

// Opportunities are qualified leads that represent potential sales deals.
export const crmOpportunities = pgTable("crm_opportunities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  // Each opportunity must be linked to an account.
  accountId: integer("account_id").notNull().references(() => crmAccounts.id, { onDelete: 'cascade' }),
  stage: opportunityStageEnum("stage").default("Prospecting"),
  amount: integer("amount"),
  closeDate: date("close_date"),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const taskStatusEnum = pgEnum('task_status', ['Pending', 'Completed']);
export const relatedToTypeEnum = pgEnum('related_to_type', ['Account', 'Contact', 'Opportunity', 'Lead']);

// Tasks are actions that need to be completed, related to other CRM objects.
export const crmTasks = pgTable("crm_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").default("Pending"),
  assignedToId: integer("assigned_to_id").references(() => crmUsers.id),
  // Polymorphic relationship: A task can be related to different types of objects.
  relatedToType: relatedToTypeEnum("related_to_type"),
  relatedToId: integer("related_to_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
