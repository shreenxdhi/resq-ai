import express from 'express';
import { analyticsService } from '../models/analytics';

const router = express.Router();

// Track location search
router.post('/location', async (req, res) => {
  try {
    const { location } = req.body;
    
    if (!location) {
      return res.status(400).json({ error: 'Location is required' });
    }
    
    await analyticsService.trackLocationSearch(location);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in location analytics endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Track disaster type
router.post('/disaster-type', async (req, res) => {
  try {
    const { disasterType } = req.body;
    
    if (!disasterType) {
      return res.status(400).json({ error: 'Disaster type is required' });
    }
    
    await analyticsService.trackDisasterType(disasterType);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error in disaster type analytics endpoint:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top searched locations
router.get('/top-locations', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const locations = await analyticsService.getTopLocations(limit);
    res.status(200).json(locations);
  } catch (error) {
    console.error('Error fetching top locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get top searched disaster types
router.get('/top-disaster-types', async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const disasterTypes = await analyticsService.getTopDisasterTypes(limit);
    res.status(200).json(disasterTypes);
  } catch (error) {
    console.error('Error fetching top disaster types:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 