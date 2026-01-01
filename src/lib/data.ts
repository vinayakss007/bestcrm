
import type { User, Account, RecentActivity, Contact } from './types';

// All mock data below this line is now obsolete and will be removed
// as we connect the frontend to the backend.
export const users: User[] = [
  { id: '1', name: 'Alex Doe', email: 'alex.doe@example.com', avatarUrl: 'https://picsum.photos/seed/alex/100/100' },
  { id: '2', name: 'Jane Smith', email: 'jane.smith@example.com', avatarUrl: 'https://picsum.photos/seed/jane/100/100' },
  { id: '3', name: 'Sam Wilson', email: 'sam.wilson@example.com', avatarUrl: 'https://picsum.photos/seed/sam/100/100' },
];

export const recentActivities: RecentActivity[] = [
    { id: '1', user: users[0], action: 'updated', target: 'Innovate Inc.', timestamp: '2 hours ago' },
    { id: '2', user: users[1], action: 'created a new contact', target: 'John Doe', timestamp: '1 day ago' },
    { id: '3', user: users[0], action: 'closed a deal', target: 'Project Phoenix', timestamp: '3 days ago' },
];

export const mockAccounts = [
    // This is now fetched from the live backend
];

export const contacts = [
    // This is now fetched from the live backend
];

export const opportunities = [
    // This is now fetched from the live backend
];
