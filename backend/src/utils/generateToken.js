import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
  return jwt.sign(
    { id: user._id ?? user.id, role: user.role, kycStatus: user.kycStatus },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};
