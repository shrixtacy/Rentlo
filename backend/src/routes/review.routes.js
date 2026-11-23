import { Router } from 'express';
import {
  submitReviewController,
  getUserReviewsController,
} from '../controllers/review.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/', verifyToken, submitReviewController);
router.get('/users/:id', getUserReviewsController);

export default router;
