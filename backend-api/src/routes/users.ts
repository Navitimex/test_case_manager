import { Router } from 'express';
import { verifyToken, isAdmin } from '../middleware/auth';
import { listUsers, updateUserRole } from '../controllers/userController';
import { validate } from '../middleware/validate';
import { updateRoleSchema } from '../schemas';

const router = Router();

router.get('/', verifyToken, isAdmin, listUsers);
router.patch('/:id/role', verifyToken, isAdmin, validate(updateRoleSchema), updateUserRole);

export default router;
