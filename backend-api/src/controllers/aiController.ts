import { Response } from 'express';
import { Priority } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { generateTestCases } from '../services/aiGenerator';
import type { GeneratedTestCase } from '@testflow/shared';
import { prisma } from '../lib/prisma';

const VALID_PRIORITIES = new Set<string>(['Low', 'Medium', 'High', 'Critical']);
function toPriority(val: string): Priority {
  return VALID_PRIORITIES.has(val) ? (val as Priority) : 'Medium';
}

const MAX_TITLE_LENGTH = 190;

/**
 * POST /api/elements/:elementId/testcases/generate
 * Generates test case suggestions with AI. Returns a preview WITHOUT saving.
 */
export async function generateTestCasesPreview(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementId = parseInt(req.params.elementId as string, 10);
    if (isNaN(elementId)) { res.status(400).json({ error: 'Invalid element ID' }); return; }

    // Body validated by Zod (generateRequestSchema): count defaulted/clamped.
    const { requirements, count } = req.body as { requirements: string; count: number };

    const element = await prisma.element.findUnique({ where: { id: elementId } });
    if (!element) { res.status(404).json({ error: 'Element not found' }); return; }

    const testCases = await generateTestCases(element.name, requirements, count);
    res.status(200).json({ testCases });
  } catch (error) {
    console.error(error);
    const isConfigError = error instanceof Error && error.message.includes('ANTHROPIC_API_KEY');
    res.status(isConfigError ? 503 : 500).json({
      error: isConfigError ? 'AI is not configured on the server' : 'Failed to generate test cases',
    });
  }
}

/**
 * POST /api/elements/:elementId/testcases/bulk
 * Persists a reviewed list of test cases under the element (all as DRAFT).
 */
export async function bulkCreateTestCases(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementId = parseInt(req.params.elementId as string, 10);
    if (isNaN(elementId)) { res.status(400).json({ error: 'Invalid element ID' }); return; }

    // Body validated by Zod (bulkCreateSchema): non-empty, each case well-formed.
    const { testCases } = req.body as { testCases: GeneratedTestCase[] };

    const element = await prisma.element.findUnique({ where: { id: elementId } });
    if (!element) { res.status(404).json({ error: 'Element not found' }); return; }

    const authorId = req.user!.id;

    const created = await prisma.$transaction(
      testCases.map((tc) =>
        prisma.testCase.create({
          data: {
            title: tc.title.slice(0, MAX_TITLE_LENGTH),
            description: tc.description,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expectedResult: tc.expectedResult,
            status: 'DRAFT',
            priority: toPriority(tc.priority),
            elementId,
            authorId,
          },
          include: {
            author: { select: { id: true, name: true, email: true } },
            element: { select: { id: true, name: true } },
          },
        })
      )
    );

    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to save test cases' });
  }
}
