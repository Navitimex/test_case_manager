import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { prisma, isRecordNotFound, isUniqueConstraint } from '../lib/prisma';

const COUNT_INCLUDE = { _count: { select: { testCases: true } } } as const;

export async function getElements(req: AuthRequest, res: Response): Promise<void> {
  try {
    const elements = await prisma.element.findMany({
      orderBy: { createdAt: 'asc' },
      include: COUNT_INCLUDE,
    });
    res.status(200).json(elements);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch elements' });
  }
}

export async function getElementById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    const element = await prisma.element.findUnique({
      where: { id },
      include: COUNT_INCLUDE,
    });
    if (!element) { res.status(404).json({ error: 'Element not found' }); return; }

    res.status(200).json(element);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch element' });
  }
}

export async function createElement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { name, description } = req.body;
    const element = await prisma.element.create({
      data: { name, description },
      include: COUNT_INCLUDE,
    });
    res.status(201).json(element);
  } catch (error) {
    if (isUniqueConstraint(error)) {
      res.status(409).json({ error: 'Element name already in use' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Failed to create element' });
  }
}

export async function updateElement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    const { name, description } = req.body;
    const element = await prisma.element.update({
      where: { id },
      data: { name, description },
      include: COUNT_INCLUDE,
    });
    res.status(200).json(element);
  } catch (error) {
    if (isRecordNotFound(error)) { res.status(404).json({ error: 'Element not found' }); return; }
    if (isUniqueConstraint(error)) {
      res.status(409).json({ error: 'Element name already in use' });
      return;
    }
    res.status(500).json({ error: 'Failed to update element' });
  }
}

export async function deleteElement(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid ID' }); return; }

    await prisma.element.delete({ where: { id } });
    res.status(200).json({ message: 'Element deleted' });
  } catch (error) {
    if (isRecordNotFound(error)) { res.status(404).json({ error: 'Element not found' }); return; }
    res.status(500).json({ error: 'Failed to delete element' });
  }
}
