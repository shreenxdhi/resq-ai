import express from 'express';
import axios from 'axios';

const router = express.Router();
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// Get current weather data for a location
router.get('/', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ error: 'OpenWeather API key is not configured' });
    }
    
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// Get weather alerts for a location
router.get('/alerts', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    if (!OPENWEATHER_API_KEY) {
      return res.status(500).json({ error: 'OpenWeather API key is not configured' });
    }
    
    // Use OneCall API to get weather alerts
    const response = await axios.get(
      `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&exclude=minutely,hourly&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    // Extract alerts or return empty array if none
    const alerts = response.data.alerts || [];
    
    // Format alerts for easier consumption
    const formattedAlerts = alerts.map((alert: any) => ({
      id: alert.event.replace(/\s+/g, '-').toLowerCase() + '-' + Date.now(),
      event: alert.event,
      description: alert.description,
      severity: alert.severity || 'moderate',
      time: alert.start,
      expires: alert.end,
      areas: alert.tags?.join(', ') || 'Not specified'
    }));
    
    res.json({
      alerts: formattedAlerts,
      location: {
        lat,
        lon,
        name: response.data.timezone || 'Unknown'
      }
    });
  } catch (error) {
    console.error('Error fetching weather alerts:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather alerts',
      alerts: []
    });
  }
});

export default router; 