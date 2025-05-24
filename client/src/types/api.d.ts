export interface Plan {
  id: string;
  location: string;
  disasterType: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
}

export interface WeatherData {
  temperature: number;
  conditions: string;
  humidity: number;
  windSpeed: number;
}

export interface WeatherAlert {
  type: string;
  severity: string;
  message: string;
  startTime: string;
  endTime: string;
}

export interface EmergencyTips {
  tips: string[];
}

export interface City {
  name: string;
  country: string;
  population: number;
  coordinates: {
    lat: number;
    lon: number;
  };
} 