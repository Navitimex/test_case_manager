import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma, isRecordNotFound } from '../lib/prisma';

export async function getTestCasesByElement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementId = parseInt(req.params.elementId as string, 10);
    if (isNaN(elementId)) { res.status(400).json({ error: 'Invalid element ID' }); return; }

    const testCases = await prisma.testCase.findMany({
      where: { elementId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, email: true } },
        element: { select: { id: true, name: true } },
      },
    });
    res.status(200).json(testCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
}

export async function getTestCaseById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, email: true } },
        element: { select: { id: true, name: true } },
      },
    });
    if (!testCase) { res.status(404).json({ error: 'Test case not found' }); return; }

    res.status(200).json(testCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch test case' });
  }
}

export async function createTestCase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elementId = parseInt(req.params.elementId as string, 10);
    if (isNaN(elementId)) { res.status(400).json({ error: 'Invalid element ID' }); return; }

    // Body validated by Zod (testCaseCreateSchema): status/priority defaulted.
    const { title, description, preconditions, steps, expectedResult, status, priority } = req.body;

    const element = await prisma.element.findUnique({ where: { id: elementId } });
    if (!element) { res.status(404).json({ error: 'Element not found' }); return; }

    const testCase = await prisma.testCase.create({
      data: {
        title,
        description,
        preconditions,
        steps,
        expectedResult,
        status,
        priority,
        elementId,
        authorId: req.user!.id,
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        element: { select: { id: true, name: true } },
      },
    });
    res.status(201).json(testCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create test case' });
  }
}

export async function updateTestCase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    // Body validated by Zod (testCaseUpdateSchema): every field optional.
    const { title, description, preconditions, steps, expectedResult, status, priority } = req.body;

    const testCase = await prisma.testCase.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(preconditions !== undefined && { preconditions }),
        ...(steps !== undefined && { steps }),
        ...(expectedResult !== undefined && { expectedResult }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
      },
      include: {
        author: { select: { id: true, name: true, email: true } },
        element: { select: { id: true, name: true } },
      },
    });
    res.status(200).json(testCase);
  } catch (error) {
    if (isRecordNotFound(error)) { res.status(404).json({ error: 'Test case not found' }); return; }
    console.error(error);
    res.status(500).json({ error: 'Failed to update test case' });
  }
}

export async function deleteTestCase(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    await prisma.testCase.delete({ where: { id } });
    res.status(200).json({ message: 'Test case deleted' });
  } catch (error) {
    if (isRecordNotFound(error)) { res.status(404).json({ error: 'Test case not found' }); return; }
    res.status(500).json({ error: 'Failed to delete test case' });
  }
}
