import express from 'express';
import jwtAuthMiddleware from '../middlewares/jwtAuthMiddleware.js';
import authOrchestrationController from '../controllers/auth-orchestration-controller.js';

/** Rutas /api/auth/* que exigen JWT válido antes de delegar en Auth. */
const router = express.Router();

router.use(jwtAuthMiddleware);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Cerrar sesión con JWT válido
 * /api/v1/auth/usuarios/{id}/rol:
 *   put:
 *     tags: [Auth]
 *     summary: Actualizar rol de usuario
 */
router.post('/logout', authOrchestrationController.logout);
router.put('/usuarios/:id/rol', authOrchestrationController.updateUserRole);

export default router;