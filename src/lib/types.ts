
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  role: 'user' | 'company-admin' | 'super-admin';
  createdAt: string;
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

export type UpdateAccountDto = {
  name?: string;
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
  account?: {
    name: string;
  }
}

export type CreateContactDto = {
  name: string;
  email?: string;
  phone?: string;
  accountId: number;
}

export type UpdateContactDto = {
  name?: string;
  email?: string;
  phone?: string;
  accountId?: number;
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
  owner?: {
    name: string;
    avatarUrl: string | null;
  } | null;
};

export type CreateLeadDto = {
  name: string;
  email?: string;
  source?: string;
  status?: LeadStatus;
  ownerId?: number;
}

export type UpdateLeadDto = {
  name?: string;
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

export type UpdateOpportunityDto = {
  name?: string;
  accountId?: number;
  stage?: OpportunityStage;
  amount?: number;
  closeDate?: string;
  ownerId?: number;
};


export const invoiceStatuses = ['Draft', 'Sent', 'Paid', 'Void'] as const;
export type InvoiceStatus = (typeof invoiceStatuses)[number];

export type Invoice = {
    id: number;
    invoiceNumber: string;
    leadId: number;
    amount: number;
    dueDate: string;
    status: InvoiceStatus;
    organizationId: number;
    createdAt: string;
    updatedAt: string;
    lead?: {
      name: string;
    }
}

export type CreateInvoiceDto = {
    leadId: number;
    amount: number;
    dueDate: string;
    status?: 'Draft' | 'Sent';
}

export const taskStatuses = ['Pending', 'Completed'] as const;
export type TaskStatus = (typeof taskStatuses)[number];

export const relatedToTypes = ['Account', 'Contact', 'Opportunity', 'Lead'] as const;
export type RelatedToType = (typeof relatedToTypes)[number];

export type Task = {
  id: number;
  title: string;
  dueDate: string;
  status: TaskStatus | null;
  assignedToId: number | null;
  relatedToType: RelatedToType | null;
  relatedToId: number | null;
  organizationId: number;
  createdAt: string;
  updatedAt: string;
  assignedTo: {
    name: string;
    avatarUrl: string | null;
  } | null;
};

export type CreateTaskDto = {
  title: string;
  dueDate: string;
  status?: TaskStatus;
  assignedToId: number;
  relatedToType?: RelatedToType;
  relatedToId?: number;
};

export type UpdateTaskDto = {
  title?: string;
  dueDate?: string;
  status?: TaskStatus;
  assignedToId?: number;
  relatedToType?: RelatedToType;
  relatedToId?: number;
};

export type RecentActivity = {
  id: string;
  user: User;
  action: string;
  target: string;
  timestamp: string;
};
