import express from 'express';

const router = express.Router();

// GET /api/health - Server health check endpoint
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'CodeAlpha E-commerce Backend API is running smoothly',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

export default router;
