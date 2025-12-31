
export type User = {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
};

export type Account = {
  id: string;
  name: string;
  industry: string;
  owner: User;
  contactsCount: number;
  createdAt: string;
};

export type Contact = {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountId: string;
  accountName: string;
};

export const leadStatus = ['New', 'Contacted', 'Qualified', 'Lost'] as const;
export type LeadStatus = (typeof leadStatus)[number];

export type Lead = {
  id: string;
  name: string;
  email: string;
  source: string;
  status: LeadStatus;
  owner: User;
};

export type OpportunityStage = 'Prospecting' | 'Qualification' | 'Proposal' | 'Closing' | 'Won' | 'Lost';
export type Opportunity = {
  id: string;
  name: string;
  accountId: string;
  accountName: string;
  stage: OpportunityStage;
  amount: number;
  closeDate: string;
  owner: User;
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
