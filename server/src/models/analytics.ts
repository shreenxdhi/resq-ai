import mongoose from 'mongoose';

// Location search analytics schema
const locationSearchSchema = new mongoose.Schema({
  location: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Disaster type analytics schema
const disasterTypeSchema = new mongoose.Schema({
  disasterType: {
    type: String,
    required: true,
    trim: true
  },
  count: {
    type: Number,
    default: 1
  },
  lastSearched: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create models
export const LocationSearch = mongoose.model('LocationSearch', locationSearchSchema);
export const DisasterType = mongoose.model('DisasterType', disasterTypeSchema);

// Analytics service
export const analyticsService = {
  // Track location search
  async trackLocationSearch(location: string): Promise<void> {
    try {
      // Try to find existing record
      const existingLocation = await LocationSearch.findOne({ location });
      
      if (existingLocation) {
        // Update existing record
        await LocationSearch.updateOne(
          { location },
          { 
            $inc: { count: 1 },
            lastSearched: new Date()
          }
        );
      } else {
        // Create new record
        await LocationSearch.create({ location });
      }
    } catch (error) {
      console.error('Error tracking location search:', error);
    }
  },
  
  // Track disaster type selection
  async trackDisasterType(disasterType: string): Promise<void> {
    try {
      // Try to find existing record
      const existingType = await DisasterType.findOne({ disasterType });
      
      if (existingType) {
        // Update existing record
        await DisasterType.updateOne(
          { disasterType },
          { 
            $inc: { count: 1 },
            lastSearched: new Date()
          }
        );
      } else {
        // Create new record
        await DisasterType.create({ disasterType });
      }
    } catch (error) {
      console.error('Error tracking disaster type:', error);
    }
  },
  
  // Get top searched locations
  async getTopLocations(limit = 10): Promise<any[]> {
    try {
      return await LocationSearch.find()
        .sort({ count: -1 })
        .limit(limit)
        .select('location count lastSearched')
        .lean();
    } catch (error) {
      console.error('Error getting top locations:', error);
      return [];
    }
  },
  
  // Get top searched disaster types
  async getTopDisasterTypes(limit = 10): Promise<any[]> {
    try {
      return await DisasterType.find()
        .sort({ count: -1 })
        .limit(limit)
        .select('disasterType count lastSearched')
        .lean();
    } catch (error) {
      console.error('Error getting top disaster types:', error);
      return [];
    }
  }
}; 