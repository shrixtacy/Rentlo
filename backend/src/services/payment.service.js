import crypto from 'crypto';
import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import { razorpayInstance } from '../configs/razorpay.config.js';

const isRealRazorpay = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  return keyId && keyId !== 'your_razorpay_key_id';
};

export const createRazorpayOrder = async (bookingId, renterId) => {
  const booking = await Booking.findById(bookingId);
  if (!booking) {
    const err = new Error('Booking not found');
    err.statusCode = 404;
    throw err;
  }
  if (booking.renter.toString() !== renterId) {
    const err = new Error('Not authorized');
    err.statusCode = 403;
    throw err;
  }

  let orderId;
  const amount = Math.round(booking.totalAmount * 100);
  const currency = 'INR';

  if (isRealRazorpay() && razorpayInstance) {
    const order = await razorpayInstance.orders.create({
      amount,
      currency,
      receipt: bookingId.toString(),
    });
    orderId = order.id;
  } else {
    orderId = 'mock_order_' + Date.now();
  }

  await Payment.create({
    booking: bookingId,
    renter: renterId,
    razorpayOrderId: orderId,
    amount: booking.totalAmount,
    currency,
    status: 'PENDING',
    breakdown: {
      rentAmount: booking.rentalFee,
      depositAmount: booking.securityDeposit,
      serviceFee: booking.serviceFee,
    },
  });

  return {
    orderId,
    amount,
    currency,
    keyId: isRealRazorpay() ? process.env.RAZORPAY_KEY_ID : 'mock',
  };
};

export const verifyPayment = async ({ bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }) => {
  const isMock = razorpayOrderId.startsWith('mock_');

  if (!isMock) {
    const body = razorpayOrderId + '|' + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body)
      .digest('hex');
    if (expectedSignature !== razorpaySignature) {
      const err = new Error('Invalid payment signature');
      err.statusCode = 400;
      throw err;
    }
  }

  const payment = await Payment.findOneAndUpdate(
    { booking: bookingId, razorpayOrderId },
    {
      razorpayPaymentId,
      razorpaySignature,
      status: 'HELD',
    },
    { new: true }
  );

  const booking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: 'CONFIRMED' },
    { new: true }
  );

  return { payment, booking };
};

export const handleWebhook = async (payload, signature) => {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (webhookSecret) {
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    if (expectedSignature !== signature) {
      const err = new Error('Invalid webhook signature');
      err.statusCode = 400;
      throw err;
    }
  }

  const event = payload.event;

  if (event === 'payment.captured') {
    const razorpayOrderId = payload.payload?.payment?.entity?.order_id;
    const razorpayPaymentId = payload.payload?.payment?.entity?.id;
    if (razorpayOrderId) {
      const payment = await Payment.findOneAndUpdate(
        { razorpayOrderId },
        { status: 'HELD', razorpayPaymentId },
        { new: true }
      );
      if (payment) {
        await Booking.findByIdAndUpdate(payment.booking, { status: 'CONFIRMED' });
      }
    }
  } else if (event === 'refund.processed') {
    const razorpayOrderId = payload.payload?.refund?.entity?.acquirer_data?.rrn;
    const razorpayPaymentId = payload.payload?.refund?.entity?.payment_id;
    if (razorpayPaymentId) {
      await Payment.findOneAndUpdate(
        { razorpayPaymentId },
        { status: 'REFUNDED' }
      );
    }
  }
};
