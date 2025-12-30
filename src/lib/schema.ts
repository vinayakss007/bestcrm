
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

// Zenith CRM Schemas

export const crmUsers = pgTable("crm_users", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  avatarUrl: text("avatar_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmAccounts = pgTable("crm_accounts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  industry: varchar("industry", { length: 255 }),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmContacts = pgTable("crm_contacts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  phone: varchar("phone", { length: 50 }),
  accountId: integer("account_id").references(() => crmAccounts.id, { onDelete: 'cascade' }),
  customFields: jsonb("custom_fields"),
});

export const leadStatusEnum = pgEnum('lead_status', ['New', 'Contacted', 'Qualified', 'Lost']);

export const crmLeads = pgTable("crm_leads", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }),
  source: varchar("source", { length: 100 }),
  status: leadStatusEnum("status").default("New"),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const opportunityStageEnum = pgEnum('opportunity_stage', ['Prospecting', 'Qualification', 'Proposal', 'Closing', 'Won', 'Lost']);

export const crmOpportunities = pgTable("crm_opportunities", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  accountId: integer("account_id").references(() => crmAccounts.id),
  stage: opportunityStageEnum("stage").default("Prospecting"),
  amount: integer("amount"),
  closeDate: date("close_date"),
  ownerId: integer("owner_id").references(() => crmUsers.id),
  customFields: jsonb("custom_fields"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const taskStatusEnum = pgEnum('task_status', ['Pending', 'Completed']);
export const relatedToTypeEnum = pgEnum('related_to_type', ['Account', 'Contact', 'Opportunity', 'Lead']);

export const crmTasks = pgTable("crm_tasks", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  dueDate: date("due_date"),
  status: taskStatusEnum("status").default("Pending"),
  assignedToId: integer("assigned_to_id").references(() => crmUsers.id),
  relatedToType: relatedToTypeEnum("related_to_type"),
  relatedToId: integer("related_to_id"), // This would need a more complex setup in a real scenario
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
