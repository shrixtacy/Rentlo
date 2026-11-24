import { Router } from 'express';
import { register, login, requestOTP, verifyOTP, getMe, logout } from '../controllers/auth.controller.js';
import { verifyToken } from '../middlewares/auth.middleware.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/otp/request', requestOTP);
router.post('/otp/verify', verifyOTP);
router.get('/me', verifyToken, getMe);
router.post('/logout', verifyToken, logout);

export default router;
