// API Configuration
export const API_CONFIG = {
  // OpenWeatherMap API Key - Get your free key at: https://openweathermap.org/api
  OPENWEATHER_API_KEY: process.env.VITE_OPENWEATHER_API_KEY || 'YOUR_API_KEY',
  
  // USGS API doesn't require a key - it's free and open
  USGS_API_URL: 'https://earthquake.usgs.gov/fdsnws/event/1/query',
  
  // OpenWeatherMap API URL
  OPENWEATHER_API_URL: 'https://api.openweathermap.org/data/2.5/weather',
  
  // Default cities to monitor for weather disasters
  DEFAULT_CITIES: [
    'Delhi, IN',
    'Mumbai, IN', 
    'Chennai, IN',
    'Kolkata, IN',
    'Bangalore, IN',
    'Hyderabad, IN',
    'Pune, IN',
    'Ahmedabad, IN'
  ],
  
  // Earthquake monitoring settings
  EARTHQUAKE_CONFIG: {
    MIN_MAGNITUDE: 4.5,
    DAYS_BACK: 7,
    MAX_EVENTS: 50
  },
  
  // Weather alert thresholds
  WEATHER_THRESHOLDS: {
    EXTREME_HEAT: 40, // Celsius
    CRITICAL_HEAT: 45, // Celsius
    HIGH_WIND: 20, // m/s
    CRITICAL_WIND: 30, // m/s
    HEAVY_RAIN_KEYWORDS: ['heavy rain', 'thunderstorm', 'downpour', 'torrential']
  }
};

// Helper function to check if API keys are configured
export const checkApiConfiguration = () => {
  const issues: string[] = [];
  
  if (!API_CONFIG.OPENWEATHER_API_KEY || API_CONFIG.OPENWEATHER_API_KEY === 'YOUR_API_KEY') {
    issues.push('OpenWeatherMap API key not configured');
  }
  
  return {
    isValid: issues.length === 0,
    issues
  };
};
