import express, { Request, Response } from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 4000;

// 1. MIDDLEWARE: Ensure cors() and express.json() are correctly applied at the top
app.use(cors());
app.use(express.json());

// Debugging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`);
  next();
});

// Helper: Ensure dummy relations exist for standalone testing
async function ensureDummyRelations() {
  let user = await prisma.user.findFirst();
  if (!user) user = await prisma.user.create({ data: { name: 'Demo User', email: 'demo@example.com', password: 'pwd' } });
  
  let project = await prisma.project.findFirst();
  if (!project) project = await prisma.project.create({ data: { name: 'Demo Project', createdById: user.id } });
  
  let module = await prisma.module.findFirst();
  if (!module) module = await prisma.module.create({ data: { name: 'Demo Module', projectId: project.id, createdById: user.id } });
  
  return { userId: user.id, projectId: project.id, moduleId: module.id };
}

// ==========================================
// SEEDING LOGIC
// ==========================================
async function seedData() {
  try {
    const count = await prisma.testCase.count();
    if (count === 0) {
      const dummy = await ensureDummyRelations();
      await prisma.testCase.create({
        data: {
          title: 'Verify Login Functionality',
          description: 'Ensures users can log in with valid credentials.',
          priority: 'critical',
          severity: 'blocker',
          status: 'pass',
          projectId: dummy.projectId,
          moduleId: dummy.moduleId,
          createdById: dummy.userId,
          steps: {
            create: [
              { order: 1, description: 'Navigate to login page', expectedResult: 'Login page is displayed' },
              { order: 2, description: 'Enter valid username and password', expectedResult: 'Fields are populated' },
            ]
          }
        }
      });
      console.log('Seeded initial data.');
    }
  } catch (e) {
    console.error('Seed error:', e);
  }
}

// ==========================================
// 2. RESPONSES & 3. TYPE CASTING (Integer Parsing)
// ==========================================

// GET ALL
app.get('/api/testcases', async (req: Request, res: Response) => {
  try {
    const testCases = await prisma.testCase.findMany({
      include: { steps: { orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    res.status(200).json(testCases);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch test cases' });
  }
});

// GET ONE
app.get('/api/testcases/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const testCase = await prisma.testCase.findUnique({
      where: { id },
      include: { steps: { orderBy: { order: 'asc' } } },
    });

    if (!testCase) return res.status(404).json({ error: 'Not found' });
    res.status(200).json(testCase);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST
app.post('/api/testcases', async (req: Request, res: Response) => {
  try {
    const dummy = await ensureDummyRelations();
    const { title, description, priority, severity, status, steps } = req.body;

    const newTestCase = await prisma.testCase.create({
      data: {
        title, description, priority, severity, status,
        projectId: dummy.projectId,
        moduleId: dummy.moduleId,
        createdById: dummy.userId,
        steps: steps ? {
          create: steps.map((s: any, i: number) => ({
            order: i + 1,
            description: s.description,
            expectedResult: s.expectedResult || '',
          }))
        } : undefined
      },
      include: { steps: true }
    });
    res.status(201).json(newTestCase);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create test case' });
  }
});

// PUT
app.put('/api/testcases/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    const { title, description, priority, severity, status, steps } = req.body;

    const updated = await prisma.$transaction(async (tx) => {
      if (steps) await tx.testCaseStep.deleteMany({ where: { testCaseId: id } });

      return tx.testCase.update({
        where: { id },
        data: {
          title, description, priority, severity, status,
          steps: steps ? {
            create: steps.map((s: any, i: number) => ({
              order: i + 1,
              description: s.description,
              expectedResult: s.expectedResult || '',
            }))
          } : undefined
        },
        include: { steps: true }
      });
    });
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update' });
  }
});

// DELETE
app.delete('/api/testcases/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id as string, 10);
    if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

    await prisma.testCase.delete({ where: { id } });
    res.status(200).json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete' });
  }
});

app.get('/health', (req, res) => res.json({ status: 'ok' }));

const portNumber = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;

app.listen(portNumber, '0.0.0.0', () => {
  console.log(`Server listening on http://0.0.0.0:${portNumber}`);
  seedData();
});
