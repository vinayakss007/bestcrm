import type { User, Account, Contact, Lead, Opportunity, Task, RecentActivity } from './types';

export const users: User[] = [
  { id: '1', name: 'Alex Doe', email: 'alex.doe@example.com', avatarUrl: 'https://picsum.photos/seed/alex/100/100' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', avatarUrl: 'https://picsum.photos/seed/jane/100/100' },
  { id: '3', name: 'Sam Wilson', email: 'sam.wilson@example.com', avatarUrl: 'https://picsum.photos/seed/sam/100/100' },
];

export const mockAccounts: Omit<Account, "id" | "organizationId" | "isDeleted" | "deletedAt" | "customFields" | "createdAt" | "updatedAt"> & { owner: User, contactsCount: number, createdAt: string }[] = [
  { name: 'Innovate Inc.', industry: 'Technology', owner: users[0], contactsCount: 3, createdAt: '2023-01-15', ownerId: 1 },
  { name: 'Apex Solutions', industry: 'Consulting', owner: users[1], contactsCount: 2, createdAt: '2023-02-20', ownerId: 2 },
  { name: 'Quantum Corp', industry: 'Finance', owner: users[0], contactsCount: 5, createdAt: '2023-03-10', ownerId: 1 },
  { name: 'Synergy Ltd.', industry: 'Healthcare', owner: users[2], contactsCount: 4, createdAt: '2023-04-05', ownerId: 3 },
  { name: 'Pioneer LLC', industry: 'Manufacturing', owner: users[1], contactsCount: 1, createdAt: '2023-05-21', ownerId: 2 },
];


export const contacts: Contact[] = [
  { id: 'con-1', name: 'John Doe', email: 'john.doe@innovate.com', phone: '123-456-7890', accountId: 'acc-1', accountName: 'Innovate Inc.' },
  { id: 'con-2', name: 'Emily White', email: 'emily.white@innovate.com', phone: '123-456-7891', accountId: 'acc-1', accountName: 'Innovate Inc.' },
  { id: 'con-3', name: 'Michael Brown', email: 'michael.brown@apex.com', phone: '234-567-8901', accountId: 'acc-2', accountName: 'Apex Solutions' },
  { id: 'con-4', name: 'Sarah Green', email: 'sarah.green@quantum.com', phone: '345-678-9012', accountId: 'acc-3', accountName: 'Quantum Corp' },
  { id: 'con-5', name: 'David Black', email: 'david.black@synergy.com', phone: '456-789-0123', accountId: 'acc-4', accountName: 'Synergy Ltd.' },
];

export const leads: Lead[] = [
  { id: 'lead-1', name: 'New Project Inquiry', email: 'contact@website.com', source: 'Web Form', status: 'New', owner: users[0] },
  { id: 'lead-2', name: 'Trade Show Follow-up', email: 'tradeshow@visitor.com', source: 'Event', status: 'Contacted', owner: users[1] },
  { id: 'lead-3', name: 'Referral from Apex', email: 'referral@client.com', source: 'Referral', status: 'Qualified', owner: users[0] },
  { id: 'lead-4', name: 'Cold Call Prospect', email: 'prospect@coldcall.com', source: 'Cold Call', status: 'Lost', owner: users[2] },
  { id: 'lead-5', name: 'Website Download', email: 'download@resource.com', source: 'Web', status: 'New', owner: users[1] },
];

export const opportunities: Opportunity[] = [
  { id: 'opp-1', name: 'Innovate Inc. - Website Redesign', accountId: 'acc-1', accountName: 'Innovate Inc.', stage: 'Proposal', amount: 25000, closeDate: '2024-08-30', owner: users[0] },
  { id: 'opp-2', name: 'Apex Solutions - Consulting Deal', accountId: 'acc-2', accountName: 'Apex Solutions', stage: 'Qualification', amount: 50000, closeDate: '2024-09-15', owner: users[1] },
  { id: 'opp-3', name: 'Quantum Corp - Financial Software', accountId: 'acc-3', accountName: 'Quantum Corp', stage: 'Won', amount: 120000, closeDate: '2024-07-20', owner: users[0] },
  { id: 'opp-4', name: 'Synergy Ltd. - Yearly Contract', accountId: 'acc-4', accountName: 'Synergy Ltd.', stage: 'Closing', amount: 75000, closeDate: '2024-07-28', owner: users[2] },
  { id: 'opp-5', name: 'Pioneer LLC - System Upgrade', accountId: 'acc-5', accountName: 'Pioneer LLC', stage: 'Lost', amount: 30000, closeDate: '2024-06-30', owner: users[1] },
];

export const tasks: Task[] = [
  { id: 'task-1', title: 'Follow up with John Doe', dueDate: '2024-07-25', status: 'Pending', assignedTo: users[0], relatedTo: { type: 'Contact', name: 'John Doe' } },
  { id: 'task-2', title: 'Prepare proposal for Innovate Inc.', dueDate: '2024-07-28', status: 'Pending', assignedTo: users[0], relatedTo: { type: 'Opportunity', name: 'Innovate Inc. - Website Redesign' } },
  { id: 'task-3', title: 'Schedule meeting with Apex Solutions', dueDate: '2024-07-22', status: 'Completed', assignedTo: users[1], relatedTo: { type: 'Account', name: 'Apex Solutions' } },
  { id: 'task-4', title: 'Onboarding for Quantum Corp', dueDate: '2024-08-01', status: 'Pending', assignedTo: users[0], relatedTo: { type: 'Account', name: 'Quantum Corp' } },
  { id: 'task-5', title: 'Send final contract to Synergy Ltd.', dueDate: '2024-07-26', status: 'Pending', assignedTo: users[2], relatedTo: { type: 'Opportunity', name: 'Synergy Ltd. - Yearly Contract' } },
];

export const recentActivities: RecentActivity[] = [
    { id: 'act-1', user: users[0], action: 'updated opportunity', target: 'Innovate Inc. - Website Redesign', timestamp: '2 hours ago' },
    { id: 'act-2', user: users[1], action: 'created contact', target: 'Michael Brown', timestamp: '5 hours ago' },
    { id: 'act-3', user: users[2], action: 'logged a call for', target: 'Synergy Ltd.', timestamp: '1 day ago' },
    { id: 'act-4', user: users[0], action: 'changed status of lead', target: 'Referral from Apex', timestamp: '2 days ago' },
    { id: 'act-5', user: users[1], action: 'deleted task', target: 'Initial research for Pioneer LLC', timestamp: '3 days ago' },
];
