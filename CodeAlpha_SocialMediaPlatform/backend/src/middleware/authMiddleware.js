const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - requires valid JWT token
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'codealpha_secret_jwt_key_2026');
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists',
      });
    }

    next();
  } catch (error) {
    console.error('JWT Auth Middleware Error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Not authorized, invalid or expired token',
    });
  }
};

// Optional auth - populates req.user if token is valid, but does not block if missing
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'codealpha_secret_jwt_key_2026');
    req.user = await User.findById(decoded.id).select('-password');
  } catch (error) {
    req.user = null;
  }

  next();
};

module.exports = { protect, optionalAuth };
