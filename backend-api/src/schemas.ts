import { z } from 'zod';

export const PRIORITY_VALUES = ['Low', 'Medium', 'High', 'Critical'] as const;
export const STATUS_VALUES = ['DRAFT', 'PASSED', 'FAILED', 'SKIPPED'] as const;

const PRIORITY = z.enum(PRIORITY_VALUES);
const STATUS = z.enum(STATUS_VALUES);

export const registerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const elementCreateSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
});

export const elementUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().nullable().optional(),
});

export const testCaseCreateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().default(''),
  preconditions: z.string().optional().default(''),
  steps: z.string().min(1, 'Steps are required'),
  expectedResult: z.string().min(1, 'Expected result is required'),
  status: STATUS.optional().default('DRAFT'),
  priority: PRIORITY.optional().default('Medium'),
});

export const testCaseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  preconditions: z.string().optional(),
  steps: z.string().min(1).optional(),
  expectedResult: z.string().min(1).optional(),
  status: STATUS.optional(),
  priority: PRIORITY.optional(),
});

export const generateRequestSchema = z.object({
  requirements: z
    .string()
    .min(1, 'requirements is required')
    .max(8000, 'requirements must be at most 8000 characters'),
  count: z.number().int().min(1).max(20).optional().default(6),
});

export const generatedTestCaseSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  preconditions: z.string().optional().default(''),
  steps: z.string().min(1),
  expectedResult: z.string().min(1),
  priority: PRIORITY.optional().default('Medium'),
});

export const bulkCreateSchema = z.object({
  testCases: z.array(generatedTestCaseSchema).min(1, 'testCases must be a non-empty array'),
});

export const updateRoleSchema = z.object({
  role: z.enum(['ADMIN', 'QA', 'USER']),
});
