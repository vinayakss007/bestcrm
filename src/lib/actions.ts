
'use server'

import { accounts, contacts, leads, opportunities, recentActivities, tasks, users } from '@/lib/data'

// For now, these actions will return mock data.
// In the future, they will interact with the PostgreSQL database.

export async function getAccounts() {
  // Replace with DB query: db.select().from(crmAccounts)
  return accounts;
}

export async function getContacts() {
  // Replace with DB query
  return contacts;
}

export async function getLeads() {
  // Replace with DB query
  return leads;
}

export async function getOpportunities() {
  // Replace with DB query
  return opportunities;
}

export async function getTasks() {
  // Replace with DB query
  return tasks;
}

export async function getUsers() {
    // Replace with DB query
    return users;
}

export async function getRecentActivities() {
    return recentActivities;
}
