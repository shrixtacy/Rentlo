import jwt from 'jsonwebtoken';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, statusCode: 401, message: 'No token provided', errors: [] });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role, kycStatus: decoded.kycStatus };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, statusCode: 401, message: 'Invalid or expired token', errors: [] });
  }
};

export const requireKYC = (req, res, next) => {
  if (req.user.kycStatus !== 'VERIFIED') {
    return res.status(403).json({ success: false, statusCode: 403, message: 'KYC verification required', errors: [] });
  }
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, statusCode: 403, message: 'Insufficient permissions', errors: [] });
  }
  next();
};
