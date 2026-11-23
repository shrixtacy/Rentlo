import { Router } from 'express';
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import listingRoutes from './listing.routes.js';
import bookingRoutes from './booking.routes.js';
import paymentRoutes from './payment.routes.js';
import reviewRoutes from './review.routes.js';
import disputeRoutes from './dispute.routes.js';
import chatRoutes from './chat.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/listings', listingRoutes);
router.use('/bookings', bookingRoutes);
router.use('/payments', paymentRoutes);
router.use('/reviews', reviewRoutes);
router.use('/disputes', disputeRoutes);
router.use('/chat', chatRoutes);
router.use('/admin', adminRoutes);

export default router;
