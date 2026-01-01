// Enum definitions for use in DTOs and other parts of the application
// These should match the enum definitions in the database schema

export const LeadStatusEnum = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
export type LeadStatus = (typeof LeadStatusEnum)[number];

export const OpportunityStageEnum = ['Prospecting', 'Qualification', 'Proposal', 'Closing', 'Won', 'Lost'] as const;
export type OpportunityStage = (typeof OpportunityStageEnum)[number];

export const InvoiceStatusEnum = ['Draft', 'Sent', 'Paid', 'Void'] as const;
export type InvoiceStatus = (typeof InvoiceStatusEnum)[number];

export const TaskStatusEnum = ['Pending', 'Completed'] as const;
export type TaskStatus = (typeof TaskStatusEnum)[number];

export const RelatedToTypeEnum = ['Account', 'Contact', 'Opportunity', 'Lead'] as const;
export type RelatedToType = (typeof RelatedToTypeEnum)[number];

export const UserRoleEnum = ['user', 'company-admin', 'super-admin'] as const;
export type UserRole = (typeof UserRoleEnum)[number];