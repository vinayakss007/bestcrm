
'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { contacts, leads, opportunities, recentActivities, tasks, users } from '@/lib/data'
import { CreateAccountDto } from '@/lib/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'

export async function login(prevState: { error: string } | undefined, formData: FormData) {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json();

    if (!response.ok) {
        return { error: data.message || 'Login failed. Please check your credentials.' };
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
    const token = cookies().get('token')?.value;
    if (!token) {
        // In a real app, you'd probably redirect to login
        redirect('/login');
    }
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }
}


export async function getAccounts() {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}/accounts`, { headers });
  if (!response.ok) {
      if (response.status === 401) {
          redirect('/login');
      }
      throw new Error('Failed to fetch accounts');
  }
  return response.json();
}

export async function createAccount(accountData: CreateAccountDto) {
    const headers = await getAuthHeaders();
    try {
        const response = await fetch(`${API_URL}/accounts`, {
            method: 'POST',
            headers,
            body: JSON.stringify(accountData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create account');
        }

        revalidatePath('/accounts'); // Re-fetches the accounts list on the page
        return await response.json();

    } catch (error) {
        console.error(error);
        throw new Error('An unexpected error occurred while creating the account.');
    }
}


export async function getContacts() {
  return contacts;
}

export async function getLeads() {
  return leads;
}

export async function getOpportunities() {
  return opportunities;
}

export async function getTasks() {
  return tasks;
}

export async function getUsers() {
    return users;
}

export async function getRecentActivities() {
    return recentActivities;
}
