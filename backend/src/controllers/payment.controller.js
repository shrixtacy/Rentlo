import { asyncHandler } from '../utils/asyncHandler.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  createRazorpayOrder,
  verifyPayment,
  handleWebhook,
} from '../services/payment.service.js';

export const createOrder = asyncHandler(async (req, res) => {
  const { bookingId } = req.body;
  const result = await createRazorpayOrder(bookingId, req.user.id);
  return successResponse(res, 200, 'Order created', result);
});

export const verifyPaymentController = asyncHandler(async (req, res) => {
  const { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;
  const result = await verifyPayment({ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature });
  return successResponse(res, 200, 'Payment verified', result);
});

export const webhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-razorpay-signature'];
  const payload = req.body;
  await handleWebhook(payload, signature);
  return res.status(200).json({ received: true });
});
