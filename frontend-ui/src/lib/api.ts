import { useAppStore } from '@/store/useAppStore';
import {
  Element,
  TestCase,
  TestCaseFormData,
  User,
  Role,
  GeneratedTestCase,
  GenerateTestCasesRequest,
} from '@/types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// Auth is carried by an httpOnly cookie, so every request includes credentials
// and no token is read from or stored in JavaScript.
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    },
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      useAppStore.getState().clearAuth();
      window.location.href = '/login';
    }
    throw new Error('Unauthorized');
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${res.status}`);
  }

  return res.json() as Promise<T>;
}

export const authApi = {
  login: (email: string, password: string) =>
    request<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name: string, email: string, password: string) =>
    request<{ user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  logout: () => request<{ message: string }>('/api/auth/logout', { method: 'POST' }),
};

export const elementsApi = {
  getAll: () => request<Element[]>('/api/elements'),

  create: (data: { name: string; description?: string }) =>
    request<Element>('/api/elements', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: number, data: { name?: string; description?: string | null }) =>
    request<Element>(`/api/elements/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/elements/${id}`, { method: 'DELETE' }),
};

export const usersApi = {
  getAll: () => request<User[]>('/api/users'),

  updateRole: (id: number, role: Role) =>
    request<User>(`/api/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};

export const testCasesApi = {
  getByElement: (elementId: number) =>
    request<TestCase[]>(`/api/elements/${elementId}/testcases`),

  create: (elementId: number, data: TestCaseFormData) =>
    request<TestCase>(`/api/elements/${elementId}/testcases`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: number, data: Partial<TestCaseFormData>) =>
    request<TestCase>(`/api/testcases/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  delete: (id: number) =>
    request<{ message: string }>(`/api/testcases/${id}`, { method: 'DELETE' }),

  generate: (elementId: number, data: GenerateTestCasesRequest) =>
    request<{ testCases: GeneratedTestCase[] }>(
      `/api/elements/${elementId}/testcases/generate`,
      { method: 'POST', body: JSON.stringify(data) }
    ),

  bulkCreate: (elementId: number, testCases: GeneratedTestCase[]) =>
    request<TestCase[]>(`/api/elements/${elementId}/testcases/bulk`, {
      method: 'POST',
      body: JSON.stringify({ testCases }),
    }),
};
