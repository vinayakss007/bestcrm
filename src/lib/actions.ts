
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import type { RegisterDto, CreateAccountDto, CreateContactDto, CreateLeadDto, CreateOpportunityDto, CreateInvoiceDto, CreateTaskDto, UpdateAccountDto, UpdateContactDto, UpdateLeadDto, UpdateOpportunityDto, UpdateTaskDto, UpdateUserDto } from "@/lib/types"

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

export async function register(
  prevState: { error?: string, message?: string } | undefined,
  formData: FormData
): Promise<{ error?: string, message?: string }> {
  try {
    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    if (password.length < 8) {
      return { error: 'Password must be at least 8 characters long.' }
    }

    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.message || 'Registration failed. Please try again.' }
    }

    // Don't log the user in automatically, make them sign in.
    return { message: 'Registration successful!' }
    
  } catch (e: any) {
    console.error(e)
    return { error: 'An unexpected error occurred during registration.' }
  }
}

export async function logout() {
  cookies().delete('token');
  redirect('/login');
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

export async function getAccounts(query?: string) {
  const headers = await getAuthHeaders()
  const url = new URL(`${API_URL}/accounts`);
  if (query) {
      url.searchParams.append('query', query);
  }
  const response = await fetch(url.toString(), { headers, cache: 'no-store' })
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

export async function updateAccount(id: number, accountData: UpdateAccountDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/accounts/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(accountData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update account');
        }

        revalidatePath('/accounts');
        revalidatePath(`/accounts/${id}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the account.');
    }
}

export async function deleteAccount(id: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/accounts/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || 'Failed to delete account');
        }
        
        revalidatePath('/accounts');
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the account.');
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

export async function updateContact(id: number, contactData: UpdateContactDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/contacts/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(contactData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update contact');
        }

        revalidatePath('/contacts');
        revalidatePath(`/contacts/${id}`);
        if (contactData.accountId) {
            revalidatePath(`/accounts/${contactData.accountId}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the contact.');
    }
}

export async function deleteContact(id: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/contacts/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || 'Failed to delete contact');
        }
        
        revalidatePath('/contacts');
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the contact.');
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

export async function updateLead(id: number, leadData: UpdateLeadDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(leadData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update lead');
        }

        revalidatePath('/leads');
        revalidatePath(`/leads/${id}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the lead.');
    }
}

export async function deleteLead(id: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/leads/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.message || 'Failed to delete lead');
        }
        
        revalidatePath('/leads');
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the lead.');
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

export async function updateOpportunity(id: number, opportunityData: UpdateOpportunityDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/opportunities/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(opportunityData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update opportunity');
        }

        revalidatePath('/opportunities');
        revalidatePath(`/opportunities/${id}`);
        revalidatePath('/dashboard');
        if (opportunityData.accountId) {
            revalidatePath(`/accounts/${opportunityData.accountId}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the opportunity.');
    }
}

export async function deleteOpportunity(id: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/opportunities/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to delete opportunity');
        }

        revalidatePath('/opportunities');
        revalidatePath('/dashboard');
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the opportunity.');
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

export async function updateTask(id: number, taskData: UpdateTaskDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(taskData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update task');
        }

        revalidatePath('/tasks');
        revalidatePath(`/tasks/${id}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the task.');
    }
}

export async function deleteTask(id: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/tasks/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (response.status !== 204) {
            const errorData = await response.text();
            throw new Error(errorData || 'Failed to delete task');
        }

        revalidatePath('/tasks');
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the task.');
    }
}


export async function getUsers() {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}/users`, { headers, cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 401) {
      // This can happen if the token is expired/invalid.
      // Don't redirect here, as this function is called on client components too.
      // The redirect will be handled by the page/layout's loader.
      console.error("Auth error fetching users");
    }
    throw new Error('Failed to fetch users');
  }
  return response.json();
}

export async function updateUser(id: number, userData: UpdateUserDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update user');
        }

        revalidatePath('/settings/profile');
        revalidatePath('/(app)/layout'); // To update the user-nav component
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the user profile.');
    }
}
