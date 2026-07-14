import { Response } from 'express';
import { Role } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { prisma, isRecordNotFound } from '../lib/prisma';

export async function listUsers(_req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
}

export async function updateUserRole(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) { res.status(400).json({ error: 'Invalid user ID' }); return; }

    // Body validated by Zod (updateRoleSchema).
    const { role } = req.body as { role: Role };

    // Prevent an admin from demoting themselves (avoids accidental lockout).
    if (req.user!.id === id && role !== 'ADMIN') {
      res.status(400).json({ error: 'You cannot change your own admin role' });
      return;
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: { id: true, name: true, email: true, role: true },
    });
    res.status(200).json(user);
  } catch (error) {
    if (isRecordNotFound(error)) { res.status(404).json({ error: 'User not found' }); return; }
    console.error(error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
}
