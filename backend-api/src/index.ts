import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';
import dotenv from 'dotenv';

dotenv.config();

// Provide connection URL directly to the adapter
const adapter = new PrismaMariaDb(process.env.DATABASE_URL as string);

const prisma = new PrismaClient({ adapter });
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend API is running' });
});

// ==========================================
// TEST CASE CRUD OPERATIONS
// ==========================================

// GET ALL: Retrieve all test cases including their steps
app.get('/api/testcases', async (req: Request, res: Response) => {
  try {
    const testCases = await prisma.testCase.findMany({
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(testCases);
  } catch (error) {
    console.error('Error fetching test cases:', error);
    res.status(500).json({ error: 'Internal server error while fetching test cases' });
  }
});

// GET ONE: Retrieve a specific test case by ID
app.get('/api/testcases/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const testCase = await prisma.testCase.findUnique({
      where: { id: parseInt(id as string, 10) },
      include: {
        steps: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!testCase) {
      res.status(404).json({ error: 'TestCase not found' });
      return;
    }

    res.status(200).json(testCase);
  } catch (error) {
    console.error('Error fetching test case:', error);
    res.status(500).json({ error: 'Internal server error while fetching test case' });
  }
});

// Helper to lazily create relations if the frontend doesn't provide them yet
async function ensureDummyRelations() {
  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { name: 'Demo User', email: 'demo@example.com', password: 'pwd' } });
  
  let project = await prisma.project.findFirst();
  if (!project) project = await prisma.project.create({ data: { name: 'Demo Project', createdById: user.id } });
  
  let module = await prisma.module.findFirst();
  if (!module) module = await prisma.module.create({ data: { name: 'Demo Module', projectId: project.id, createdById: user.id } });
  
  return { userId: user.id, projectId: project.id, moduleId: module.id };
}

// POST: Create a new test case
app.post('/api/testcases', async (req: Request, res: Response) => {
  try {
    let {
      title,
      description,
      preconditions,
      moduleId,
      projectId,
      priority,
      severity,
      status,
      assignedToId,
      tags,
      createdById,
      steps,
    } = req.body;

    // Automatically assign dummy relations if missing (for easy CRUD testing)
    if (!moduleId || !projectId || !createdById) {
      const dummy = await ensureDummyRelations();
      moduleId = moduleId || dummy.moduleId;
      projectId = projectId || dummy.projectId;
      createdById = createdById || dummy.userId;
    }

    const newTestCase = await prisma.testCase.create({
      data: {
        title,
        description,
        preconditions,
        moduleId,
        projectId,
        priority,
        severity,
        status,
        assignedToId,
        tags,
        createdById,
        steps: steps && steps.length > 0 ? {
          create: steps.map((step: any, index: number) => ({
            order: step.order ?? index + 1,
            description: step.description,
            expectedResult: step.expectedResult,
            actualResult: step.actualResult,
          }))
        } : undefined,
      },
      include: {
        steps: true,
      },
    });

    res.status(201).json(newTestCase);
  } catch (error) {
    console.error('Error creating test case:', error);
    res.status(500).json({ error: 'Internal server error while creating test case' });
  }
});

// PUT: Update an existing test case
app.put('/api/testcases/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    let {
      title,
      description,
      preconditions,
      moduleId,
      projectId,
      priority,
      severity,
      status,
      assignedToId,
      tags,
      steps,
    } = req.body;

    if (!moduleId || !projectId) {
      const dummy = await ensureDummyRelations();
      moduleId = moduleId || dummy.moduleId;
      projectId = projectId || dummy.projectId;
    }

    const testCaseId = parseInt(id as string, 10);

    // We use a transaction to safely clear old steps and insert the new ones
    // in case the array of steps has been completely overwritten by the frontend.
    const updatedTestCase = await prisma.$transaction(async (tx) => {
      if (steps) {
        await tx.testCaseStep.deleteMany({
          where: { testCaseId },
        });
      }

      return tx.testCase.update({
        where: { id: testCaseId },
        data: {
          title,
          description,
          preconditions,
          moduleId,
          projectId,
          priority,
          severity,
          status,
          assignedToId,
          tags,
          steps: steps ? {
            create: steps.map((step: any, index: number) => ({
              order: step.order ?? index + 1,
              description: step.description,
              expectedResult: step.expectedResult,
              actualResult: step.actualResult,
            }))
          } : undefined,
        },
        include: {
          steps: true,
        },
      });
    });

    res.status(200).json(updatedTestCase);
  } catch (error) {
    console.error('Error updating test case:', error);
    res.status(500).json({ error: 'Internal server error while updating test case' });
  }
});

// DELETE: Remove a test case
app.delete('/api/testcases/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Deleting the TestCase will also delete its Steps because of `onDelete: Cascade` in schema
    await prisma.testCase.delete({
      where: { id: parseInt(id as string, 10) },
    });

    res.status(200).json({ message: 'TestCase deleted successfully' });
  } catch (error) {
    console.error('Error deleting test case:', error);
    res.status(500).json({ error: 'Internal server error while deleting test case' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
