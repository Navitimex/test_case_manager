// Shared domain types used by both the backend API and the frontend UI.
// Consumed type-only (import type), so this package ships no runtime code.

export type Role = 'ADMIN' | 'QA' | 'USER';
export type Status = 'DRAFT' | 'PASSED' | 'FAILED' | 'SKIPPED';
export type Priority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
}

export interface Element {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { testCases: number };
}

export interface TestCase {
  id: number;
  title: string;
  description: string | null;
  preconditions: string | null;
  steps: string;
  expectedResult: string;
  status: Status;
  priority: Priority;
  elementId: number;
  authorId: number;
  author: Pick<User, 'id' | 'name' | 'email'>;
  element: Pick<Element, 'id' | 'name'>;
  createdAt: string;
  updatedAt: string;
}

export interface TestCaseFormData {
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  status: Status;
  priority: string;
}

export interface GeneratedTestCase {
  title: string;
  description: string;
  preconditions: string;
  steps: string;
  expectedResult: string;
  priority: string;
}

export interface GenerateTestCasesRequest {
  requirements: string;
  count: number;
}
