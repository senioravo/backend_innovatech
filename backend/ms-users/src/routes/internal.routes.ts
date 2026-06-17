import express from 'express';
import * as internalController from '../controllers/internal.controller.js';
import { validateInternalToken } from '../middleware/internal.middleware.js';

const router = express.Router();

router.use(validateInternalToken);

router.get('/by-email/:email', internalController.getUserByEmailWithPassword);
router.post('/', internalController.createUserInternal);

export default router;
