import { Router } from 'express';
import { verifyToken, isAdminOrQA } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { testCaseUpdateSchema } from '../schemas';
import {
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
} from '../controllers/testCaseController';

const router = Router();

router.get('/:id', verifyToken, getTestCaseById);
router.put('/:id', verifyToken, isAdminOrQA, validate(testCaseUpdateSchema), updateTestCase);
router.delete('/:id', verifyToken, isAdminOrQA, deleteTestCase);

export default router;
