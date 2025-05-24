import express from 'express';
import { generateTips } from '../services/ai';

const router = express.Router();

// POST /api/generate-tips - Generate tips for a disaster in a specific city
router.post('/', async (req, res, next) => {
  try {
    const { disaster, city } = req.body;
    
    // Validate required fields
    if (!disaster || !city) {
      return res.status(400).json({
        error: { message: 'Disaster type and city are required' }
      });
    }
    
    // Generate tips
    const tips = await generateTips(disaster, city);
    
    // Return the tips
    res.json({ tips });
  } catch (error) {
    next(error);
  }
});

export default router; 