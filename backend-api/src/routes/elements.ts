import { Router } from 'express';
import { verifyToken, isAdminOrQA } from '../middleware/auth';
import {
  getElements,
  getElementById,
  createElement,
  updateElement,
  deleteElement,
} from '../controllers/elementController';
import {
  getTestCasesByElement,
  createTestCase,
} from '../controllers/testCaseController';
import {
  generateTestCasesPreview,
  bulkCreateTestCases,
} from '../controllers/aiController';
import { aiLimiter } from '../middleware/rateLimit';
import { validate } from '../middleware/validate';
import {
  elementCreateSchema,
  elementUpdateSchema,
  testCaseCreateSchema,
  generateRequestSchema,
  bulkCreateSchema,
} from '../schemas';

const router = Router();

router.get('/', verifyToken, getElements);
router.get('/:id', verifyToken, getElementById);
router.post('/', verifyToken, isAdminOrQA, validate(elementCreateSchema), createElement);
router.put('/:id', verifyToken, isAdminOrQA, validate(elementUpdateSchema), updateElement);
router.delete('/:id', verifyToken, isAdminOrQA, deleteElement);

// Nested test cases under an element
router.get('/:elementId/testcases', verifyToken, getTestCasesByElement);
router.post('/:elementId/testcases', verifyToken, isAdminOrQA, validate(testCaseCreateSchema), createTestCase);

// AI generation: preview (no save) and bulk save of reviewed cases
router.post('/:elementId/testcases/generate', verifyToken, isAdminOrQA, aiLimiter, validate(generateRequestSchema), generateTestCasesPreview);
router.post('/:elementId/testcases/bulk', verifyToken, isAdminOrQA, validate(bulkCreateSchema), bulkCreateTestCases);

export default router;
