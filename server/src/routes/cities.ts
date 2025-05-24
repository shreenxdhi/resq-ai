import express from 'express';
import { topCities } from '../data/cities';

const router = express.Router();

// GET /api/top-cities - Get list of top cities
router.get('/', (req, res) => {
  res.json(topCities);
});

export default router; 