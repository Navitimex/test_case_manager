import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors()); // Allow all for debugging
app.use(express.json());

// Log middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// ==========================================
// SEEDING LOGIC
// ==========================================

async function seedData() {
  try {
    console.log('Checking database for initial data...');
    
    let user = await prisma.user.findFirst();
    if (!user) {
      user = await prisma.user.create({
        data: { name: 'Demo User', email: 'demo@example.com', password: 'pwd' },
      });
      console.log('Created Demo User');
    }

    let project = await prisma.project.findFirst();
    if (!project) {
      project = await prisma.project.create({
        data: { name: 'Demo Project', createdById: user.id },
      });
      console.log('Created Demo Project');
    }

    let module = await prisma.module.findFirst();
    if (!module) {
      module = await prisma.module.create({
        data: { name: 'Demo Module', projectId: project.id, createdById: user.id },
      });
      console.log('Created Demo Module');
    }

    const testCaseCount = await prisma.testCase.count();
    if (testCaseCount === 0) {
      await prisma.testCase.create({
        data: {
          title: 'Verify Login Functionality',
          description: 'Ensures users can log in with valid credentials.',
          priority: 'critical',
          severity: 'blocker',
          status: 'pass',
          projectId: project.id,
          moduleId: module.id,
          createdById: user.id,
          steps: {
            create: [
              { order: 1, description: 'Navigate to login page', expectedResult: 'Login page is displayed' },
              { order: 2, description: 'Enter valid username and password', expectedResult: 'Fields are populated' },
              { order: 3, description: 'Click Login button', expectedResult: 'User is redirected to dashboard' },
            ]
          }
        }
      });

      await prisma.testCase.create({
        data: {
          title: 'Check Forgot Password Link',
          description: 'Verify that the forgot password link redirects correctly.',
          priority: 'medium',
          severity: 'minor',
          status: 'pending',
          projectId: project.id,
          moduleId: module.id,
          createdById: user.id,
          steps: {
            create: [
              { order: 1, description: 'Navigate to login page', expectedResult: 'Login page is displayed' },
              { order: 2, description: 'Click Forgot Password link', expectedResult: 'Reset password page is displayed' },
            ]
          }
        }
      });
      console.log('Created 2 initial Test Cases');
    }

    console.log('Seeding check complete.');
  } catch (error) {
    console.error('Error seeding data:', error);
  }
}

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
    const testCaseId = parseInt(id as string, 10);
    
    if (isNaN(testCaseId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    const testCase = await prisma.testCase.findUnique({
      where: { id: testCaseId },
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

// Helper: lazily create dummy relations so the frontend works without auth
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
    let { title, description, preconditions, moduleId, projectId, priority,
          severity, status, assignedToId, tags, createdById, steps } = req.body;

    // Auto-fill relations if missing
    if (!moduleId || !projectId || !createdById) {
      const dummy = await ensureDummyRelations();
      moduleId    = moduleId    || dummy.moduleId;
      projectId   = projectId   || dummy.projectId;
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
            order:          index + 1,
            description:    step.description,
            expectedResult: step.expectedResult ?? null,
            actualResult:   step.actualResult   ?? null,
          })),
        } : undefined,
      },
      include: { steps: true },
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
    let { title, description, preconditions, moduleId, projectId, priority,
          severity, status, assignedToId, tags, steps } = req.body;

    const testCaseId = parseInt(id as string, 10);
    if (isNaN(testCaseId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    if (!moduleId || !projectId) {
      const dummy = await ensureDummyRelations();
      moduleId  = moduleId  || dummy.moduleId;
      projectId = projectId || dummy.projectId;
    }

    const updatedTestCase = await prisma.$transaction(async (tx) => {
      if (steps) {
        await tx.testCaseStep.deleteMany({ where: { testCaseId } });
      }

      return tx.testCase.update({
        where: { id: testCaseId },
        data: {
          title, description, preconditions,
          moduleId, projectId, priority, severity, status,
          assignedToId, tags,
          steps: steps ? {
            create: steps.map((step: any, index: number) => ({
              order:          index + 1,
              description:    step.description,
              expectedResult: step.expectedResult ?? null,
              actualResult:   step.actualResult   ?? null,
            })),
          } : undefined,
        },
        include: { steps: true },
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
    const testCaseId = parseInt(id as string, 10);
    if (isNaN(testCaseId)) {
        res.status(400).json({ error: 'Invalid ID' });
        return;
    }

    await prisma.testCase.delete({ where: { id: testCaseId } });
    res.status(200).json({ message: 'TestCase deleted successfully' });
  } catch (error) {
    console.error('Error deleting test case:', error);
    res.status(500).json({ error: 'Internal server error while deleting test case' });
  }
});

// Health Check Route
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend API is running' });
});

// Start Server
app.listen(PORT as number, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  seedData(); // Seed data on startup
});
