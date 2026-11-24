import { Router } from 'express';
import { createOrder, verifyPaymentController, webhook } from '../controllers/payment.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/order', verifyToken, createOrder);
router.post('/verify', verifyToken, verifyPaymentController);
router.post('/webhook', webhook);

export default router;
