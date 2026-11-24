import bcrypt from 'bcryptjs';

export const generateOTP = () => {
  return String(Math.floor(100000 + Math.random() * 900000));
};

export const hashOTP = async (otp) => {
  return bcrypt.hash(otp, 10);
};

export const verifyOTP = async (otp, hash) => {
  return bcrypt.compare(otp, hash);
};
