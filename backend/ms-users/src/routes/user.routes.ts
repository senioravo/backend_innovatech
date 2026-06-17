import express from 'express';
import * as userController from '../controllers/user.controller.js';
import { verifyToken, requireRole } from '../middleware/auth.middleware.js';
import { metricsMiddleware } from '../middleware/metricsMiddleware.js';

const router = express.Router();

router.use(metricsMiddleware);

router.post('/', verifyToken, userController.createUser);
router.get('/', verifyToken, userController.listUsers);
router.get('/:id', verifyToken, userController.getUserById);
router.put('/:id', verifyToken, userController.updateUser);
router.delete('/:id', verifyToken, requireRole(['gestor', 'directivo']), userController.deleteUser);
router.put('/:id/role', verifyToken, requireRole(['gestor', 'directivo']), userController.changeUserRole);
router.get('/email/:email', verifyToken, userController.getUserByEmail);

export default router;
