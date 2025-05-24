import express from 'express';
import Plan from '../models/Plan';

const router = express.Router();

// POST /api/plan - Create a new emergency plan
router.post('/', async (req, res, next) => {
  try {
    const { userId, country, city, disaster, tips } = req.body;
    
    // Validate required fields
    if (!userId || !country || !city || !disaster) {
      return res.status(400).json({
        error: { message: 'Missing required fields' }
      });
    }
    
    // Create new plan
    const newPlan = new Plan({
      userId,
      country,
      city,
      disaster,
      tips: tips || [],
      createdAt: new Date()
    });
    
    // Save to database
    await newPlan.save();
    
    res.status(201).json(newPlan);
  } catch (error) {
    next(error);
  }
});

// GET /api/plans - Get all plans for a user
router.get('/', async (req, res, next) => {
  try {
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(400).json({
        error: { message: 'userId parameter is required' }
      });
    }
    
    // Find plans for this user
    const plans = await Plan.find({ userId }).sort({ createdAt: -1 });
    
    res.json(plans);
  } catch (error) {
    next(error);
  }
});

export default router; 