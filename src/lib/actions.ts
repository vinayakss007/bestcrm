

'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import type { User, RegisterDto, CreateAccountDto, CreateContactDto, CreateLeadDto, CreateOpportunityDto, CreateInvoiceDto, CreateTaskDto, UpdateAccountDto, UpdateContactDto, UpdateLeadDto, UpdateOpportunityDto, UpdateTaskDto, UpdateUserDto, ConvertLeadDto, UpdateOrganizationDto, CreateCommentDto, RelatedToType, InviteUserDto, Attachment, CreateRoleDto, UpdateRoleDto, Organization, Activity, OpportunityStats } from "@/lib/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function getHealthCheck() {
  const response = await fetch(`${API_URL}/health`, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Health check failed');
  }
  return response.json();
}

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

export async function loginAsSuperAdmin(
  prevState: { error: string } | undefined,
) {
    const formData = new FormData();
    // These are the hardcoded credentials for the default super admin
    formData.append('email', 'super@admin.com');
    formData.append('password', 'password123');
    return login(prevState, formData);
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
  // When sending FormData, we don't set Content-Type
  // The browser does it automatically with the correct boundary
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function getCurrentUser(): Promise<User | null> {
    const token = cookies().get('token')?.value;
    if (!token) {
        return null;
    }
    try {
        const decodedToken: { sub: number; email: string; role: any } = jwtDecode(token);
        // This is inefficient but works for now. A dedicated /users/me endpoint would be better.
        const users = await getUsers();
        const currentUser = users.find((user: User) => user.id === decodedToken.sub) || null;
        
        // The role in the JWT might be stale, so we use the role from the full user object
        if (currentUser) {
            return {
                ...currentUser,
                role: currentUser.role
            };
        }
        return null;

    } catch (error) {
        console.error("Failed to decode token or fetch user:", error);
        return null;
    }
}


export async function getAccounts(
  { query = '', status = 'active', sort = 'name', order = 'asc', page = 1, limit = 10 }:
  { query?: string; status?: 'active' | 'archived'; sort?: 'name' | 'industry'; order?: 'asc' | 'desc'; page?: number; limit?: number; } = {}
) {
  const headers = await getAuthHeaders()
  const url = new URL(`${API_URL}/accounts`);
  url.searchParams.append('query', query);
  url.searchParams.append('status', status);
  url.searchParams.append('sort', sort);
  url.searchParams.append('order', order);
  url.searchParams.append('page', String(page));
  url.searchParams.append('limit', String(limit));

  const response = await fetch(url.toString(), { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' })
  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login')
    }
    throw new Error('Failed to fetch accounts')
  }
  return response.json()
}

export async function getAccountById(id: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/${id}`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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
      headers: {...headers, 'Content-Type': 'application/json'},
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
            headers: {...headers, 'Content-Type': 'application/json'},
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
        revalidatePath(`/accounts/${id}`);
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the account.');
    }
}

export async function exportAccountsToCsv(): Promise<{ jobId: string }> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/export`, { method: 'POST', headers: {...headers, 'Content-Type': 'application/json'} });
    if (!response.ok) {
        throw new Error('Failed to start account export job');
    }
    return response.json();
}

export async function getJobStatus(jobId: string) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/jobs/${jobId}`, { headers: {...headers, 'Content-Type': 'application/json'} });
    if (!response.ok) {
        throw new Error('Failed to get job status');
    }
    return response.json();
}


export async function getContacts({ query = '', page = 1, limit = 10 }: { query?: string; page?: number, limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_URL}/contacts`);
    url.searchParams.append('query', query);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));

    const response = await fetch(url.toString(), { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch contacts');
    }
    return response.json();
}

export async function getContactById(id: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/contacts/${id}`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 404) return null;
        throw new Error('Failed to fetch contact');
    }
    return response.json();
}

export async function getContactsByAccountId(accountId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/${accountId}/contacts`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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
            headers: {...headers, 'Content-Type': 'application/json'},
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
            headers: {...headers, 'Content-Type': 'application/json'},
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

        if (response.status !== 204) {
             const errorData = await response.text();
             throw new Error(errorData.message || 'Failed to delete contact');
        }
        
        revalidatePath('/contacts');
        revalidatePath(`/contacts/${id}`);
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the contact.');
    }
}


export async function getLeads({ query = '', status = '', page = 1, limit = 10 }: { query?: string, status?: string, page?: number, limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_URL}/leads`);
    url.searchParams.append('query', query);
    url.searchParams.append('status', status);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));

    const response = await fetch(url.toString(), { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch leads');
    }
    return response.json();
}

export async function getLeadById(id: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/leads/${id}`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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
            headers: {...headers, 'Content-Type': 'application/json'},
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
            headers: {...headers, 'Content-Type': 'application/json'},
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

        if (response.status !== 204) {
             const errorData = await response.text();
             throw new Error(errorData.message || 'Failed to delete lead');
        }
        
        revalidatePath('/leads');
        revalidatePath(`/leads/${id}`);
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the lead.');
    }
}

export async function convertLead(leadId: number, convertData: ConvertLeadDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/leads/${leadId}/convert`, {
            method: 'POST',
            headers: {...headers, 'Content-Type': 'application/json'},
            body: JSON.stringify(convertData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to convert lead');
        }

        const { opportunityId } = await response.json();
        revalidatePath('/leads');
        revalidatePath('/accounts');
        revalidatePath('/contacts');
        revalidatePath('/opportunities');
        revalidatePath('/dashboard');

        redirect(`/opportunities/${opportunityId}`);
        
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while converting the lead.');
    }
}


export async function getOpportunities(query?: string, sort?: string, order?: 'asc' | 'desc') {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_URL}/opportunities`);
    if (query) {
      url.searchParams.append('query', query);
    }
    if (sort) {
      url.searchParams.append('sort', sort);
    }
    if (order) {
        url.searchParams.append('order', order);
    }
    const response = await fetch(url.toString(), { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch opportunities');
    }
    return response.json();
}

export async function getOpportunityById(id: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/opportunities/${id}`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 404) return null;
        throw new Error('Failed to fetch opportunity');
    }
    return response.json();
}

export async function getOpportunitiesByAccountId(accountId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/accounts/${accountId}/opportunities`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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
            headers: {...headers, 'Content-Type': 'application/json'},
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
            headers: {...headers, 'Content-Type': 'application/json'},
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

        if (response.status !== 204) {
            const errorData = await response.text();
            throw new Error(errorData.message || 'Failed to delete opportunity');
        }

        revalidatePath('/opportunities');
        revalidatePath('/dashboard');
        revalidatePath(`/opportunities/${id}`);
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the opportunity.');
    }
}

export async function getOpportunityForecast() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/opportunities/forecast`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) {
            redirect('/login');
        }
        throw new Error('Failed to fetch opportunity forecast');
    }
    return response.json();
}

export async function getOpportunityStats(): Promise<OpportunityStats> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/opportunities/stats`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
  if (!response.ok) {
    if (response.status === 401) {
      redirect('/login');
    }
    throw new Error('Failed to fetch opportunity stats');
  }
  return response.json();
}

export async function getInvoices({ page = 1, limit = 10 }: { page?: number; limit?: number } = {}) {
    const headers = await getAuthHeaders();
    const url = new URL(`${API_URL}/invoices`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));

    const response = await fetch(url.toString(), { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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
            headers: {...headers, 'Content-Type': 'application/json'},
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

export async function deleteInvoice(id: number) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/invoices/${id}`, {
            method: 'DELETE',
            headers,
        });

        if (response.status !== 204) {
            const errorData = await response.text();
            throw new Error(errorData.message || 'Failed to delete invoice');
        }

        revalidatePath('/invoices');
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the invoice.');
    }
}

export async function getTasks() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/tasks`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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
            headers: {...headers, 'Content-Type': 'application/json'},
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
            headers: {...headers, 'Content-Type': 'application/json'},
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
            throw new Error(errorData.message || 'Failed to delete task');
        }

        revalidatePath('/tasks');
        revalidatePath(`/tasks/${id}`);
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while deleting the task.');
    }
}


export async function getUsers() {
  const headers = await getAuthHeaders()
  const response = await fetch(`${API_URL}/users`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
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

export async function inviteUser(userData: InviteUserDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/users/invite`, {
            method: 'POST',
            headers: {...headers, 'Content-Type': 'application/json'},
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to invite user');
        }

        revalidatePath('/settings/users');
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while inviting the user.');
    }
}


export async function updateUser(id: number, userData: UpdateUserDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'PATCH',
            headers: {...headers, 'Content-Type': 'application/json'},
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

export async function impersonateUser(userId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/users/${userId}/impersonate`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
    });
    
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || 'Impersonation failed.');
    }

    cookies().set('token', data.access_token, {
        maxAge: 30 * 24 * 60 * 60,
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
    });

    redirect('/dashboard');
}

export async function getActivities(): Promise<Activity[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/activities`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        throw new Error('Failed to fetch activities');
    }
    return response.json();
}


export async function getActivitiesForAccount(accountId: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/activities/accounts/${accountId}`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        throw new Error('Failed to fetch activities for account');
    }
    return response.json();
}


export async function updateOrganization(id: number, orgData: UpdateOrganizationDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/organizations/${id}`, {
            method: 'PATCH',
            headers: {...headers, 'Content-Type': 'application/json'},
            body: JSON.stringify(orgData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update organization');
        }

        revalidatePath('/settings/brand');
        revalidatePath('/(app)/layout'); // To update the workspace switcher
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while updating the organization.');
    }
}

export async function getOrganizations(): Promise<Organization[]> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/organizations`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        if (response.status === 403) return []; // Non-super-admins will get a 403
        throw new Error('Failed to fetch organizations');
    }
    return response.json();
}

export async function getComments(entityType: RelatedToType, entityId: number) {
    const headers = await getAuthHeaders();
    const entityPath = entityType.toLowerCase() + 's';
    const response = await fetch(`${API_URL}/${entityPath}/${entityId}/comments`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        throw new Error(`Failed to fetch comments for ${entityType}`);
    }
    return response.json();
}

export async function addComment(
    entityType: RelatedToType, 
    entityId: number, 
    formData: FormData
) {
    const headers = await getAuthHeaders();
    const content = formData.get('content') as string;
    const entityPath = entityType.toLowerCase() + 's';

    if (!content || !entityPath) {
        return; // Or throw an error
    }

    try {
        const response = await fetch(`${API_URL}/${entityPath}/${entityId}/comments`, {
            method: 'POST',
            headers: {...headers, 'Content-Type': 'application/json'},
            body: JSON.stringify({ content }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add comment');
        }

        revalidatePath(`/${entityPath}/${entityId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while adding the comment.');
    }
}


// Attachment Actions
const getEntityPath = (entityType: RelatedToType) => {
    const map = {
        'Account': 'accounts',
        'Contact': 'contacts',
        'Lead': 'leads',
        'Opportunity': 'opportunities',
    };
    return map[entityType];
}

export async function getAttachments(entityType: RelatedToType, entityId: number): Promise<Attachment[]> {
    const headers = await getAuthHeaders();
    const entityPath = getEntityPath(entityType);
    const response = await fetch(`${API_URL}/${entityPath}/${entityId}/attachments`, {
        headers: {...headers, 'Content-Type': 'application/json'},
        cache: 'no-store',
    });
    if (!response.ok) {
        if (response.status === 401) redirect('/login');
        throw new Error('Failed to fetch attachments');
    }
    return response.json();
}

export async function uploadAttachment(entityType: RelatedToType, entityId: number, formData: FormData) {
    const headers = await getAuthHeaders();
    const entityPath = getEntityPath(entityType);

    try {
        const response = await fetch(`${API_URL}/${entityPath}/${entityId}/attachments`, {
            method: 'POST',
            headers: headers, // No Content-Type, browser will set it for FormData
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to upload file');
        }

        revalidatePath(`/${entityPath}/${entityId}`);
        return await response.json();
    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while uploading the file.');
    }
}

export async function downloadAttachment(attachmentId: number): Promise<{blob: Blob, filename: string}> {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/attachments/${attachmentId}/download`, {
        headers: headers,
    });

    if (!response.ok) {
        throw new Error('Failed to download attachment');
    }

    const contentDisposition = response.headers.get('content-disposition');
    let filename = 'downloaded-file';
    if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch.length > 1) {
            filename = filenameMatch[1];
        }
    }

    const blob = await response.blob();
    return { blob, filename };
}


// Roles & Permissions Actions
export async function getRoles() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/roles`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch roles');
    return response.json();
}

export async function getPermissions() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/roles/permissions`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch permissions');
    return response.json();
}

export async function createRole(roleData: CreateRoleDto) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/roles`, {
        method: 'POST',
        headers: {...headers, 'Content-Type': 'application/json'},
        body: JSON.stringify(roleData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create role');
    }
    revalidatePath('/settings/roles');
    return response.json();
}

export async function updateRole(id: number, roleData: UpdateRoleDto) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'PATCH',
        headers: {...headers, 'Content-Type': 'application/json'},
        body: JSON.stringify(roleData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update role');
    }
    revalidatePath('/settings/roles');
    return response.json();
}

export async function deleteRole(id: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/roles/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete role');
    }
    revalidatePath('/settings/roles');
}


// Assignment Rules
export async function getAssignmentRules() {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/assignment-rules`, { headers: {...headers, 'Content-Type': 'application/json'}, cache: 'no-store' });
    if (!response.ok) throw new Error('Failed to fetch assignment rules');
    return response.json();
}

export async function createAssignmentRule(ruleData: any) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/assignment-rules`, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(ruleData),
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create assignment rule');
    }
    revalidatePath('/settings/assignment-rules');
    return response.json();
}

export async function deleteAssignmentRule(id: number) {
    const headers = await getAuthHeaders();
    const response = await fetch(`${API_URL}/assignment-rules/${id}`, {
        method: 'DELETE',
        headers,
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete assignment rule');
    }
    revalidatePath('/settings/assignment-rules');
}
