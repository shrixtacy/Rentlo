import { Router } from 'express';
const router = Router();

// Placeholder route
router.get('/', (req, res) => {
    res.json({ success: true, message: 'booking route working' });
});

export default router;
