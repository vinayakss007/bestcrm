
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import {
  users,
} from "@/lib/data"
import type { CreateAccountDto, CreateContactDto, CreateLeadDto, CreateOpportunityDto, CreateInvoiceDto, CreateTaskDto } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function login(
  prevState: { error: string } | undefined,
  formData: FormData
) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.message || 'Login failed. Please check your credentials.' }
    }

    // Set cookie
    cookies().set('token', data.access_token, {
      maxAge: 30 * 24 * 60 * 60,
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    })
  } catch (e: any) {
    console.error(e)
    return { error: 'An unexpected error occurred.' }
  }

  // Redirect to dashboard on successful login
  redirect('/dashboard')
}

async function getAuthHeaders() {
  const token = cookies().get('token')?.value
  if (!token) {
    // In a real app, you'd probably redirect to login
    redirect('/login')
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

export async function getAccounts() {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}/accounts`, { headers, cache: 'no-store' })
  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login')
    }
    throw new Error('Failed to fetch accounts')
  }
  return response.json()
}

export async function getAccountById(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/${id}`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 404) return null;
        throw new Error('Failed to fetch account');
    }
    return response.json();
}

export async function createAccount(accountData: CreateAccountDto) {
  const headers = await getAuthHeaders()
  try {
    const response = await fetch(`${API_URL}/accounts`, {
      method: 'POST',
      headers,
      body: JSON.stringify(accountData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'Failed to create account')
    }

    revalidatePath('/accounts') // Re-fetches the accounts list on the page
    revalidatePath('/dashboard')
    return await response.json()
  } catch (error) {
    console.error(error)
    throw new Error('An unexpected error occurred while creating the account.')
  }
}

export async function getContacts() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/contacts`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch contacts');
    }
    return response.json();
}

export async function getContactById(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/contacts/${id}`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 404) return null;
        throw new Error('Failed to fetch contact');
    }
    return response.json();
}

export async function getContactsByAccountId(accountId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/${accountId}/contacts`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        throw new Error('Failed to fetch contacts for account');
    }
    return response.json();
}


export async function createContact(contactData: CreateContactDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/contacts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(contactData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create contact');
        }

        revalidatePath('/contacts');
        revalidatePath(`/accounts/${contactData.accountId}`)
        return await response.json();

    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while creating the contact.');
    }
}

export async function getLeads() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/leads`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch leads');
    }
    return response.json();
}

export async function getLeadById(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/leads/${id}`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 404) return null;
        throw new Error('Failed to fetch lead');
    }
    return response.json();
}

export async function createLead(leadData: CreateLeadDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/leads`, {
            method: 'POST',
            headers,
            body: JSON.stringify(leadData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create lead');
        }

        revalidatePath('/leads');
        revalidatePath('/dashboard');
        return await response.json();

    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while creating the lead.');
    }
}

export async function getOpportunities() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/opportunities`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch opportunities');
    }
    return response.json();
}

export async function getOpportunityById(id: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/opportunities/${id}`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 404) return null;
        throw new Error('Failed to fetch opportunity');
    }
    return response.json();
}

export async function getOpportunitiesByAccountId(accountId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/${accountId}/opportunities`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        throw new Error('Failed to fetch opportunities for account');
    }
    return response.json();
}

export async function createOpportunity(opportunityData: CreateOpportunityDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/opportunities`, {
            method: 'POST',
            headers,
            body: JSON.stringify(opportunityData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create opportunity');
        }

        revalidatePath('/opportunities');
        revalidatePath('/dashboard');
        revalidatePath(`/accounts/${opportunityData.accountId}`);
        return await response.json();

    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while creating the opportunity.');
    }
}

export async function getInvoices() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/invoices`, { headers, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch invoices');
    }
    return response.json();
}

export async function createInvoice(invoiceData: CreateInvoiceDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/invoices`, {
            method: 'POST',
            headers,
            body: JSON.stringify(invoiceData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create invoice');
        }

        revalidatePath('/invoices');
        return await response.json();

    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while creating the invoice.');
    }
}

export async function getTasks() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks`, { headers, cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    throw new Error('Failed to fetch tasks');
  }
  return response.json();
}

export async function createTask(taskData: CreateTaskDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/tasks`, {
            method: 'POST',
            headers,
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create task');
        }

        revalidatePath('/tasks');
        return await response.json();

    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while creating the task.');
    }
}


export async function getUsers() {
  return users
}

    