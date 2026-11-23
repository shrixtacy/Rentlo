import Razorpay from 'razorpay';

const isConfigured =
  process.env.RAZORPAY_KEY_ID &&
  process.env.RAZORPAY_KEY_ID !== 'your_razorpay_key_id';

export const razorpayInstance = isConfigured
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET || '',
    })
  : null;
