import { Router } from 'express';
import {
  raiseDisputeController,
  getDispute,
  resolveDisputeController,
} from '../controllers/dispute.controller.js';
import { verifyToken, requireRole } from '../middlewares/auth.middleware.js';
import { uploadDisputeEvidence } from '../middlewares/upload.middleware.js';

const router = Router();

router.post('/', verifyToken, uploadDisputeEvidence, raiseDisputeController);
router.get('/:id', verifyToken, getDispute);
router.patch('/:id/resolve', verifyToken, requireRole('admin'), resolveDisputeController);

export default router;
