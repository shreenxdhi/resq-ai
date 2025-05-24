import axios from 'axios';
import { getOfflinePlans, savePlanOffline, deleteOfflinePlan, updateOfflinePlan, isOnline } from './offlineStorage';
import { Plan, WeatherData, WeatherAlert, EmergencyTips, City } from '../types/api';

// API base URL - can be configured based on environment
const API_BASE_URL = '/api';

// Create an axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// API service for plans with offline support
export const planService = {
  // Get all plans
  async getPlans(): Promise<Plan[]> {
    if (isOnline()) {
      try {
        const response = await api.get<Plan[]>('/plans');
        // Cache plans for offline use
        response.data.forEach((plan: Plan) => {
          savePlanOffline(plan);
        });
        return response.data;
      } catch (error) {
        console.error('Error fetching plans:', error);
        // Fallback to offline data
        return getOfflinePlans();
      }
    } else {
      // Use offline data
      return getOfflinePlans();
    }
  },

  // Get a plan by ID
  async getPlan(id: string): Promise<Plan | null> {
    if (isOnline()) {
      try {
        const response = await api.get<Plan>(`/plans/${id}`);
        return response.data;
      } catch (error) {
        console.error(`Error fetching plan ${id}:`, error);
        // Try to get from offline storage
        const offlinePlans = await getOfflinePlans();
        return offlinePlans.find(plan => plan.id === id) || null;
      }
    } else {
      // Use offline data
      const offlinePlans = await getOfflinePlans();
      return offlinePlans.find(plan => plan.id === id) || null;
    }
  },

  // Create a new plan
  async createPlan(planData: Omit<Plan, 'id' | 'createdAt'>): Promise<Plan> {
    if (isOnline()) {
      try {
        const response = await api.post<Plan>('/plans', planData);
        // Save to offline storage
        savePlanOffline(response.data);
        return response.data;
      } catch (error) {
        console.error('Error creating plan:', error);
        // Create a temporary plan with a local ID for offline use
        const offlinePlan: Plan = {
          id: `local-${Date.now()}`,
          ...planData,
          createdAt: new Date().toISOString()
        };
        await savePlanOffline(offlinePlan);
        return offlinePlan;
      }
    } else {
      // Create a local plan
      const offlinePlan: Plan = {
        id: `local-${Date.now()}`,
        ...planData,
        createdAt: new Date().toISOString()
      };
      await savePlanOffline(offlinePlan);
      return offlinePlan;
    }
  },

  // Update a plan
  async updatePlan(id: string, planData: Partial<Plan>): Promise<Plan> {
    if (isOnline()) {
      try {
        const response = await api.put<Plan>(`/plans/${id}`, planData);
        // Update in offline storage
        savePlanOffline(response.data);
        return response.data;
      } catch (error) {
        console.error(`Error updating plan ${id}:`, error);
        // Update in offline storage only
        const currentPlan = await this.getPlan(id);
        if (!currentPlan) {
          throw new Error(`Plan with ID ${id} not found`);
        }
        const updatedPlan: Plan = {
          ...currentPlan,
          ...planData,
          updatedAt: new Date().toISOString()
        };
        await updateOfflinePlan(updatedPlan);
        return updatedPlan;
      }
    } else {
      // Update in offline storage only
      const currentPlan = await this.getPlan(id);
      if (!currentPlan) {
        throw new Error(`Plan with ID ${id} not found`);
      }
      const updatedPlan: Plan = {
        ...currentPlan,
        ...planData,
        updatedAt: new Date().toISOString()
      };
      await updateOfflinePlan(updatedPlan);
      return updatedPlan;
    }
  },

  // Delete a plan
  async deletePlan(id: string): Promise<boolean> {
    if (isOnline()) {
      try {
        await api.delete(`/plans/${id}`);
        // Remove from offline storage
        await deleteOfflinePlan(id);
        return true;
      } catch (error) {
        console.error(`Error deleting plan ${id}:`, error);
        // If 404, remove from offline storage
        if (axios.isAxiosError(error) && error.response?.status === 404) {
          await deleteOfflinePlan(id);
          return true;
        }
        return false;
      }
    } else {
      // Delete from offline storage only
      await deleteOfflinePlan(id);
      return true;
    }
  }
};

// Service for top cities data
export const cityService = {
  async getTopCities(): Promise<City[]> {
    try {
      const response = await api.get<City[]>('/top-cities');
      return response.data;
    } catch (error) {
      console.error('Error fetching top cities:', error);
      // Return empty array if request fails
      return [];
    }
  }
};

// Service for weather data
export const weatherService = {
  async getWeather(lat: number, lon: number): Promise<WeatherData | null> {
    try {
      const response = await api.get<WeatherData>('/weather', {
        params: { lat, lon }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching weather data:', error);
      return null;
    }
  },
  
  async getAlerts(lat: number, lon: number): Promise<WeatherAlert[]> {
    try {
      const response = await api.get<{ alerts: WeatherAlert[] }>('/weather/alerts', {
        params: { lat, lon }
      });
      return response.data.alerts || [];
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
      return [];
    }
  }
};

// Service for generating emergency tips
export const emergencyService = {
  async generateTips(location: string, disasterType: string): Promise<EmergencyTips> {
    if (!isOnline()) {
      // Return fallback tips when offline
      return {
        tips: [
          "Stay calm and assess the situation",
          "Follow your emergency plan",
          "Listen to local authorities",
          "Check on neighbors, especially elderly or those with special needs",
          "Conserve phone battery and limit calls to emergencies"
        ]
      };
    }
    
    try {
      const response = await api.post<EmergencyTips>('/generate-tips', {
        location,
        disasterType
      });
      return response.data;
    } catch (error) {
      console.error('Error generating emergency tips:', error);
      // Return fallback tips on error
      return {
        tips: [
          "Stay calm and assess the situation",
          "Follow your emergency plan",
          "Listen to local authorities",
          "Check on neighbors, especially elderly or those with special needs",
          "Conserve phone battery and limit calls to emergencies"
        ]
      };
    }
  }
};

// Analytics service
export const analyticsService = {
  trackLocationSearch(location: string): void {
    if (isOnline()) {
      api.post('/analytics/location', { location }).catch(error => {
        console.error('Error tracking location search:', error);
      });
    }
  },
  
  trackDisasterType(disasterType: string): void {
    if (isOnline()) {
      api.post('/analytics/disaster', { disasterType }).catch(error => {
        console.error('Error tracking disaster type:', error);
      });
    }
  }
};

export default api; 