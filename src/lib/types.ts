

export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

// This type is based on the Drizzle schema `crmAccounts`
export type Account = {
  id: number;
  name: string;
  industry: string | null;
  ownerId: number | null;
  organizationId: number;
  isDeleted: boolean;
  deletedAt: string | null;
  customFields: any | null; // JSONB can be any object
  createdAt: string;
  updatedAt: string;
};

// This DTO type is based on the backend `CreateAccountDto`
export type CreateAccountDto = {
    name: string;
    industry?: string;
    ownerId?: number;
};

// This type is based on the Drizzle schema `crmContacts`
export type Contact = {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  accountId: number;
  organizationId: number;
  isDeleted: boolean;
  deletedAt: string | null;
  customFields: any | null;
  createdAt: string;
  updatedAt: string;
}

export type CreateContactDto = {
  name: string;
  email?: string;
  phone?: string;
  accountId: number;
}


export const leadStatus = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
export type LeadStatus = (typeof leadStatus)[number];

export type Lead = {
  id: number;
  name: string;
  email: string | null;
  source: string | null;
  status: LeadStatus | null;
  ownerId: number | null;
  organizationId: number;
  isDeleted: boolean;
  deletedAt: string | null;
  customFields: any | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateLeadDto = {
  name: string;
  email?: string;
  source?: string;
  status?: LeadStatus;
  ownerId?: number;
}


export const opportunityStages = ['Prospecting', 'Qualification', 'Proposal', 'Closing', 'Won', 'Lost'] as const;
export type OpportunityStage = (typeof opportunityStages)[number];

export type Opportunity = {
  id: number;
  name: string;
  accountId: number;
  stage: OpportunityStage | null;
  amount: number | null;
  closeDate: string | null;
  ownerId: number | null;
  organizationId: number;
  isDeleted: boolean;
  deletedAt: string | null;
  customFields: any | null;
  createdAt: string;
  updatedAt: string;
  account: {
    name: string;
  };
  owner: {
    name: string;
    avatarUrl: string | null;
  } | null;
};

export type CreateOpportunityDto = {
  name: string;
  accountId: number;
  stage?: OpportunityStage;
  amount?: number;
  closeDate?: string;
  ownerId?: number;
};

export type TaskStatus = 'Pending' | 'Completed';
export type Task = {
  id: string;
  title: string;
  dueDate: string;
  status: TaskStatus;
  assignedTo: User;
  relatedTo: {
    type: 'Account' | 'Contact' | 'Opportunity';
    name: string;
  };
};

export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Void';
export type Invoice = {
    id: string;
    invoiceNumber: string;
    leadId: string;
    leadName: string;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
}

export type RecentActivity = {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
};
