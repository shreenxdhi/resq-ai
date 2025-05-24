import axios from 'axios';
import notificationService from './notificationService';

interface WeatherAlert {
  id: string;
  event: string;
  description: string;
  severity: string;
  time: number;
  expires: number;
  areas: string;
}

// Time interval in milliseconds to check for alerts
const CHECK_INTERVAL = 30 * 60 * 1000; // 30 minutes

class WeatherAlertService {
  private checkIntervalId: number | null = null;
  private currentLocation: { lat: number; lon: number } | null = null;
  private lastAlertIds: string[] = [];

  // Start checking for weather alerts
  startAlertCheck(location: { lat: number; lon: number }): void {
    this.currentLocation = location;
    
    // Clear any existing interval
    this.stopAlertCheck();
    
    // Immediately check for alerts
    this.checkForAlerts();
    
    // Set up interval to check regularly
    this.checkIntervalId = window.setInterval(() => {
      this.checkForAlerts();
    }, CHECK_INTERVAL);
  }
  
  // Stop checking for weather alerts
  stopAlertCheck(): void {
    if (this.checkIntervalId !== null) {
      window.clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
    }
  }
  
  // Check for weather alerts
  private async checkForAlerts(): Promise<void> {
    if (!this.currentLocation) {
      return;
    }
    
    try {
      const { lat, lon } = this.currentLocation;
      const response = await axios.get('/api/weather/alerts', {
        params: { lat, lon }
      });
      
      const alerts: WeatherAlert[] = response.data.alerts || [];
      
      // Filter out alerts we've already notified about
      const newAlerts = alerts.filter(alert => !this.lastAlertIds.includes(alert.id));
      
      // Update our list of notified alert IDs
      this.lastAlertIds = alerts.map(alert => alert.id);
      
      // Notify about new alerts
      this.notifyNewAlerts(newAlerts);
      
    } catch (error) {
      console.error('Error checking weather alerts:', error);
    }
  }
  
  // Send notifications for new alerts
  private notifyNewAlerts(alerts: WeatherAlert[]): void {
    for (const alert of alerts) {
      notificationService.notify({
        title: `Weather Alert: ${alert.event}`,
        body: alert.description.substring(0, 100) + (alert.description.length > 100 ? '...' : ''),
        requireInteraction: alert.severity === 'extreme',
        tag: `weather-alert-${alert.id}`,
        data: alert,
        onClick: () => {
          // Could navigate to a detailed view of the alert
          console.log('Alert clicked:', alert);
        }
      });
    }
  }
}

// Create and export a singleton instance
const weatherAlertService = new WeatherAlertService();
export default weatherAlertService; 