import express from 'express';

const router = express.Router();

// GET /api/health - Health check endpoint
router.get('/', (req, res) => {
  res.json({ status: 'OK' });
});

export default router; 