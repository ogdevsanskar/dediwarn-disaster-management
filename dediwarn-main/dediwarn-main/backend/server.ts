import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import axios from 'axios';
import nodemailer from 'nodemailer';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: [
      'http://localhost:5173', 
      'http://localhost:5174',
      'http://localhost:3000', 
      'http://localhost:4173',
      'https://disaster-management-frontend.onrender.com',
      process.env.FRONTEND_URL
    ].filter((origin): origin is string => typeof origin === 'string'),
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

const PORT = process.env.PORT || 3001;

// Environment variables
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY || 'demo_key';
const USGS_EARTHQUAKE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER || '';
const EMAIL_USER = process.env.EMAIL_USER || '';
const EMAIL_PASS = process.env.EMAIL_PASS || '';

// Initialize Email transporter
const emailTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173', 
    'http://localhost:5174',
    'http://localhost:3000', 
    'http://localhost:4173',
    'https://disaster-management-frontend.onrender.com',
    process.env.FRONTEND_URL
  ].filter((origin): origin is string => typeof origin === 'string'),
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// In-memory storage (replace with database in production)
interface EmergencyReport {
  id: string;
  userId: string;
  type: 'earthquake' | 'flood' | 'fire' | 'storm' | 'medical' | 'other';
  description: string;
  location: { lat: number; lng: number; address?: string };
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: Date;
  status: 'pending' | 'acknowledged' | 'responded' | 'resolved';
  images?: string[];
  contacts?: string[];
}

interface EnvironmentalData {
  id: string;
  userId: string;
  location: { lat: number; lng: number };
  temperature?: number;
  humidity?: number;
  airQuality?: number;
  windSpeed?: number;
  pressure?: number;
  timestamp: Date;
}

interface AlertSubscription {
  id: string;
  userId: string;
  location: { lat: number; lng: number; radius: number };
  alertTypes: string[];
  contactMethod: 'sms' | 'email' | 'push';
  contactInfo: string;
  isActive: boolean;
}

// In-memory storage
const emergencyReports: EmergencyReport[] = [];
const environmentalData: EnvironmentalData[] = [];
const alertSubscriptions: AlertSubscription[] = [];
const activeAlerts: any[] = [];

// Utility functions
const generateId = () => Date.now().toString() + Math.random().toString(36).substr(2, 9);

const sendSMS = async (phoneNumber: string, message: string) => {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    console.log('SMS would be sent to:', phoneNumber, 'Message:', message);
    return { success: true, message: 'SMS simulation (no Twilio configured)' };
  }
  
  try {
    const twilio = require('twilio')(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
    const result = await twilio.messages.create({
      body: message,
      from: TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    return { success: true, messageId: result.sid };
  } catch (error) {
    console.error('SMS Error:', error);
    return { success: false, error: (error as Error).message };
  }
};

const sendEmail = async (to: string, subject: string, body: string) => {
  if (!EMAIL_USER || !EMAIL_PASS) {
    console.log('Email would be sent to:', to, 'Subject:', subject);
    return { success: true, message: 'Email simulation (no email configured)' };
  }

  try {
    const result = await emailTransporter.sendMail({
      from: EMAIL_USER,
      to: to,
      subject: subject,
      html: body
    });
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error('Email Error:', error);
    return { success: false, error: (error as Error).message };
  }
};

const getLocationName = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await axios.get(
      `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${OPENWEATHER_API_KEY}`
    );
    const location = response.data[0];
    return location ? `${location.name}, ${location.country}` : `${lat}, ${lng}`;
  } catch (error) {
    return `${lat}, ${lng}`;
  }
};

// API Routes

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      weather: true,
      earthquake: true,
      disaster_alerts: true
    }
  });
});

// AI Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    
    // Enhanced AI response logic
    const response = await generateAIResponse(message, location);
    
    res.json({
      response: response.content,
      intent: response.intent,
      location: response.location,
      actions: response.actions,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Chat Error:', error);
    res.status(500).json({ 
      error: 'Failed to process AI chat request',
      response: 'I apologize, but I\'m having trouble processing your request right now. Please try again or contact emergency services directly if this is urgent.'
    });
  }
});

// Emergency Reports endpoint
app.post('/api/emergency-reports', async (req, res) => {
  try {
    const { userId, type, description, location, severity, images, contacts } = req.body;
    
    const report: EmergencyReport = {
      id: generateId(),
      userId: userId || 'anonymous',
      type,
      description,
      location,
      severity: severity || 'medium',
      timestamp: new Date(),
      status: 'pending',
      images: images || [],
      contacts: contacts || []
    };
    
    emergencyReports.push(report);
    
    // Notify emergency services
    await notifyEmergencyServices(report);
    
    // Broadcast to connected clients
    io.emit('emergency_report', report);
    
    res.json({ 
      success: true, 
      reportId: report.id,
      message: 'Emergency report submitted successfully'
    });
  } catch (error) {
    console.error('Emergency Report Error:', error);
    res.status(500).json({ error: 'Failed to submit emergency report' });
  }
});

// Get emergency reports
app.get('/api/emergency-reports', (req, res) => {
  const { type, severity, status, limit = '50' } = req.query;
  
  let filteredReports = emergencyReports;
  
  if (type) filteredReports = filteredReports.filter(r => r.type === type);
  if (severity) filteredReports = filteredReports.filter(r => r.severity === severity);
  if (status) filteredReports = filteredReports.filter(r => r.status === status);
  
  // Sort by timestamp (newest first) and limit results
  const sortedReports = filteredReports
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, parseInt(limit as string));
  
  res.json({ reports: sortedReports });
});

// Environmental data endpoint
app.post('/api/environmental-data', async (req, res) => {
  try {
    const { userId, location, temperature, humidity, airQuality, windSpeed, pressure } = req.body;
    
    const data: EnvironmentalData = {
      id: generateId(),
      userId: userId || 'anonymous',
      location,
      temperature,
      humidity,
      airQuality,
      windSpeed,
      pressure,
      timestamp: new Date()
    };
    
    environmentalData.push(data);
    
    // Check for environmental alerts
    await checkEnvironmentalThresholds(data);
    
    res.json({ 
      success: true, 
      dataId: data.id,
      message: 'Environmental data recorded successfully'
    });
  } catch (error) {
    console.error('Environmental Data Error:', error);
    res.status(500).json({ error: 'Failed to record environmental data' });
  }
});

// Weather alerts endpoint
app.get('/api/weather-alerts', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const weatherData = await getWeatherAlerts(parseFloat(lat as string), parseFloat(lng as string));
    res.json(weatherData);
  } catch (error) {
    console.error('Weather Alerts Error:', error);
    res.status(500).json({ error: 'Failed to fetch weather alerts' });
  }
});

// Seismic data endpoint
app.get('/api/seismic-data', async (req, res) => {
  try {
    const { lat, lng, radius = '100' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    
    const earthquakeData = await getEarthquakeData(
      parseFloat(lat as string), 
      parseFloat(lng as string), 
      parseFloat(radius as string)
    );
    res.json(earthquakeData);
  } catch (error) {
    console.error('Seismic Data Error:', error);
    res.status(500).json({ error: 'Failed to fetch seismic data' });
  }
});

// SMS sending endpoint
app.post('/api/send-sms', async (req, res) => {
  try {
    const { phoneNumber, message, type = 'general' } = req.body;
    
    if (!phoneNumber || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }
    
    const result = await sendSMS(phoneNumber, message);
    
    // Log the SMS for tracking
    console.log(`SMS sent - Type: ${type}, To: ${phoneNumber}, Success: ${result.success}`);
    
    res.json(result);
  } catch (error) {
    console.error('SMS Send Error:', error);
    res.status(500).json({ error: 'Failed to send SMS' });
  }
});

// Email sending endpoint
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, body, type = 'general' } = req.body;
    
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'To, subject, and body are required' });
    }
    
    const result = await sendEmail(to, subject, body);
    
    // Log the email for tracking
    console.log(`Email sent - Type: ${type}, To: ${to}, Success: ${result.success}`);
    
    res.json(result);
  } catch (error) {
    console.error('Email Send Error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Alert subscription endpoint
app.post('/api/subscribe-notifications', async (req, res) => {
  try {
    const { userId, location, alertTypes, contactMethod, contactInfo } = req.body;
    
    const subscription: AlertSubscription = {
      id: generateId(),
      userId: userId || 'anonymous',
      location: {
        lat: location.lat,
        lng: location.lng,
        radius: location.radius || 50 // Default 50km radius
      },
      alertTypes: alertTypes || ['earthquake', 'flood', 'fire', 'storm'],
      contactMethod: contactMethod || 'push',
      contactInfo,
      isActive: true
    };
    
    alertSubscriptions.push(subscription);
    
    res.json({ 
      success: true, 
      subscriptionId: subscription.id,
      message: 'Successfully subscribed to alerts'
    });
  } catch (error) {
    console.error('Alert Subscription Error:', error);
    res.status(500).json({ error: 'Failed to subscribe to alerts' });
  }
});

// Helper functions for data processing

const generateAIResponse = async (message: string, location?: any) => {
  const lowerMessage = message.toLowerCase();
  
  let content = "I'm here to help with disaster management and emergency information.";
  let intent = 'general';
  let actions: any[] = [];
  
  if (lowerMessage.includes('earthquake')) {
    intent = 'earthquake';
    content = `🌍 **EARTHQUAKE INFORMATION**\n\nI can provide real-time earthquake monitoring for your area. Based on recent seismic data:\n\n• **Safety Protocol**: Drop, Cover, and Hold On\n• **Preparedness**: Keep emergency kit ready\n• **After Shaking**: Check for injuries and hazards\n\nWould you like me to check current earthquake activity in your area or send an emergency alert?`;
    actions = [
      { type: 'sms', label: 'Send Earthquake Alert', data: 'earthquake_alert' },
      { type: 'call', label: 'Emergency Services', data: 'emergency' }
    ];
  } else if (lowerMessage.includes('flood')) {
    intent = 'flood';
    content = `🌊 **FLOOD SAFETY INFORMATION**\n\nFlood safety guidelines:\n\n• **Immediate Action**: Move to higher ground\n• **Avoid**: Walking/driving through flood waters\n• **Monitor**: Local emergency broadcasts\n• **Emergency Kit**: Keep supplies ready\n\nShall I check current flood warnings for your area?`;
    actions = [
      { type: 'sms', label: 'Flood Warning SMS', data: 'flood_warning' },
      { type: 'call', label: 'Rescue Services', data: 'rescue' }
    ];
  } else if (lowerMessage.includes('weather') || lowerMessage.includes('storm')) {
    intent = 'weather';
    content = `🌪️ **WEATHER MONITORING**\n\nI can provide real-time weather alerts including:\n\n• Storm warnings and wind speeds\n• Temperature extremes\n• Precipitation forecasts\n• Visibility conditions\n\nWould you like current weather alerts for your location?`;
    actions = [
      { type: 'sms', label: 'Weather Alert', data: 'weather_alert' }
    ];
  } else if (lowerMessage.includes('fire')) {
    intent = 'fire';
    content = `🔥 **FIRE SAFETY**\n\nFire emergency protocols:\n\n• **Evacuate**: Leave area immediately if instructed\n• **Stay Low**: Avoid smoke inhalation\n• **Emergency Services**: Call fire department\n• **Escape Plan**: Know your evacuation routes\n\nDo you need immediate fire emergency assistance?`;
    actions = [
      { type: 'call', label: 'Fire Department', data: 'fire' },
      { type: 'sms', label: 'Fire Alert SMS', data: 'fire_alert' }
    ];
  } else if (lowerMessage.includes('emergency') || lowerMessage.includes('help')) {
    intent = 'emergency';
    content = `🚨 **EMERGENCY RESPONSE**\n\nEmergency services available:\n\n• **Police**: 100 (India) / 911 (US)\n• **Fire**: 101 (India) / 911 (US)\n• **Ambulance**: 108 (India) / 911 (US)\n• **Disaster Helpline**: 1077 (India)\n\nWhat type of emergency assistance do you need?`;
    actions = [
      { type: 'call', label: 'Call 911/100', data: 'emergency' },
      { type: 'sms', label: 'Emergency SMS', data: 'emergency_sms' }
    ];
  }
  
  return {
    content,
    intent,
    location: location || 'Unknown',
    actions
  };
};

const notifyEmergencyServices = async (report: EmergencyReport) => {
  try {
    const locationName = await getLocationName(report.location.lat, report.location.lng);
    
    // Simulate emergency service notification
    const notificationMessage = `EMERGENCY REPORT\n` +
      `Type: ${report.type.toUpperCase()}\n` +
      `Severity: ${report.severity.toUpperCase()}\n` +
      `Location: ${locationName}\n` +
      `Description: ${report.description}\n` +
      `Time: ${report.timestamp.toISOString()}\n` +
      `Report ID: ${report.id}`;
    
    console.log('Emergency Services Notified:', notificationMessage);
    
    // In production, you would send this to actual emergency services
    // await sendSMS('+1234567890', notificationMessage);
    // await sendEmail('emergency@services.com', `Emergency Report ${report.id}`, notificationMessage);
    
    return { success: true };
  } catch (error) {
    console.error('Failed to notify emergency services:', error);
    return { success: false, error };
  }
};

const checkEnvironmentalThresholds = async (data: EnvironmentalData) => {
  const alerts: Array<{
    type: string;
    severity: string;
    message: string;
  }> = [];
  
  // Temperature thresholds
  if (data.temperature && (data.temperature > 40 || data.temperature < -10)) {
    alerts.push({
      type: 'temperature',
      severity: data.temperature > 45 || data.temperature < -20 ? 'high' : 'medium',
      message: `Extreme temperature detected: ${data.temperature}°C`
    });
  }
  
  // Air quality thresholds
  if (data.airQuality && data.airQuality > 150) {
    alerts.push({
      type: 'air_quality',
      severity: data.airQuality > 300 ? 'high' : 'medium',
      message: `Poor air quality detected: AQI ${data.airQuality}`
    });
  }
  
  // Wind speed thresholds
  if (data.windSpeed && data.windSpeed > 50) {
    alerts.push({
      type: 'wind',
      severity: data.windSpeed > 80 ? 'high' : 'medium',
      message: `High wind speeds detected: ${data.windSpeed} km/h`
    });
  }
  
  // Broadcast alerts if any thresholds exceeded
  if (alerts.length > 0) {
    for (const alert of alerts) {
      io.emit('environmental_alert', { 
        type: alert.type,
        severity: alert.severity,
        message: alert.message,
        location: data.location, 
        timestamp: new Date() 
      });
    }
  }
};

const getWeatherAlerts = async (lat: number, lng: number) => {
  try {
    // Current weather
    const currentWeatherResponse = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&units=metric`
    );
    
    // Weather alerts (if available)
    let alertsData = [];
    try {
      const alertsResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lng}&appid=${OPENWEATHER_API_KEY}&exclude=minutely,hourly,daily`
      );
      alertsData = alertsResponse.data.alerts || [];
    } catch (error) {
      console.log('Weather alerts not available for this location');
    }
    
    const currentWeather = currentWeatherResponse.data;
    
    return {
      location: {
        name: currentWeather.name,
        country: currentWeather.sys.country,
        coordinates: { lat, lng }
      },
      current: {
        temperature: currentWeather.main.temp,
        feels_like: currentWeather.main.feels_like,
        humidity: currentWeather.main.humidity,
        pressure: currentWeather.main.pressure,
        wind_speed: currentWeather.wind.speed,
        wind_direction: currentWeather.wind.deg,
        weather: currentWeather.weather[0].main,
        description: currentWeather.weather[0].description,
        visibility: currentWeather.visibility
      },
      alerts: alertsData.map((alert: any) => ({
        title: alert.event,
        description: alert.description,
        severity: alert.tags?.[0] || 'medium',
        start: new Date(alert.start * 1000),
        end: new Date(alert.end * 1000)
      })),
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Weather API Error:', error);
    throw new Error('Failed to fetch weather data');
  }
};

const getEarthquakeData = async (lat: number, lng: number, radiusKm: number = 100) => {
  try {
    const endtime = new Date().toISOString();
    const starttime = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // Last 7 days
    
    const response = await axios.get(USGS_EARTHQUAKE_URL, {
      params: {
        format: 'geojson',
        starttime,
        endtime,
        latitude: lat,
        longitude: lng,
        maxradiuskm: radiusKm,
        minmagnitude: 2.5,
        orderby: 'time-asc'
      }
    });
    
    const earthquakes = response.data.features.map((quake: any) => ({
      id: quake.id,
      magnitude: quake.properties.mag,
      location: quake.properties.place,
      coordinates: {
        lat: quake.geometry.coordinates[1],
        lng: quake.geometry.coordinates[0],
        depth: quake.geometry.coordinates[2]
      },
      time: new Date(quake.properties.time),
      significance: quake.properties.sig,
      alert: quake.properties.alert,
      url: quake.properties.url
    }));
    
    return {
      query: { lat, lng, radius: radiusKm },
      count: earthquakes.length,
      earthquakes,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('Earthquake API Error:', error);
    throw new Error('Failed to fetch earthquake data');
  }
};

// Health check endpoint
app.get('/api/status', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    services: {
      weather: !!OPENWEATHER_API_KEY,
      earthquake: true,
      disaster_alerts: true
    }
  });
});

// Real-time earthquake data
app.get('/api/disasters/earthquakes', async (req, res) => {
  try {
    const { lat, lon, radius = 100 } = req.query;
    
    // Fetch from USGS
    const response = await axios.get(USGS_EARTHQUAKE_URL);
    let earthquakes = response.data.features;
    
    // Filter by location if provided
    if (lat && lon) {
      earthquakes = earthquakes.filter((quake: any) => {
        const [quakeLon, quakeLat] = quake.geometry.coordinates;
        const distance = calculateDistance(
          parseFloat(lat as string), 
          parseFloat(lon as string), 
          quakeLat, 
          quakeLon
        );
        return distance <= parseFloat(radius as string);
      });
    }
    
    // Process and format data
    const processedEarthquakes = earthquakes.slice(0, 10).map((quake: any) => {
      const magnitude = quake.properties.mag;
      const location = quake.properties.place;
      const time = new Date(quake.properties.time);
      const [lon, lat] = quake.geometry.coordinates;
      
      let severity = 'Low';
      let recommendation = 'Stay alert and monitor updates.';
      
      if (magnitude >= 7.0) {
        severity = 'Extreme';
        recommendation = 'Immediate evacuation! Take cover and move to safe areas.';
      } else if (magnitude >= 6.0) {
        severity = 'High';
        recommendation = 'Prepare for evacuation. Stay away from buildings.';
      } else if (magnitude >= 4.0) {
        severity = 'Moderate';
        recommendation = 'Be cautious. Check for damages and stay informed.';
      }
      
      return {
        id: quake.id,
        magnitude,
        location,
        time: time.toISOString(),
        coordinates: { lat, lon },
        severity,
        recommendation,
        url: quake.properties.url
      };
    });
    
    res.json({
      success: true,
      data: processedEarthquakes,
      count: processedEarthquakes.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Earthquake API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch earthquake data',
      timestamp: new Date().toISOString()
    });
  }
});

// Real-time weather data
app.get('/api/disasters/weather', async (req, res) => {
  try {
    const { city, lat, lon } = req.query;
    
    let weatherUrl = '';
    if (lat && lon) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else if (city) {
      weatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Please provide either city name or coordinates (lat, lon)' 
      });
    }
    
    const response = await axios.get(weatherUrl);
    const data = response.data;
    
    // Assess disaster risk based on weather conditions
    const windSpeed = data.wind?.speed || 0;
    const temperature = data.main.temp;
    const humidity = data.main.humidity;
    const weather = data.weather[0];
    
    let disasterRisk = 'Low';
    let warnings: string[] = [];
    let recommendations: string[] = [];
    
    // Wind-based warnings
    if (windSpeed > 32) { // > 115 km/h
      disasterRisk = 'Extreme';
      warnings.push('Hurricane/Cyclone conditions');
      recommendations.push('Immediate shelter! Stay indoors and away from windows.');
    } else if (windSpeed > 17) { // > 60 km/h
      disasterRisk = 'High';
      warnings.push('High wind warning');
      recommendations.push('Avoid outdoor activities and secure loose objects.');
    }
    
    // Temperature-based warnings
    if (temperature > 40) {
      warnings.push('Extreme heat warning');
      recommendations.push('Stay hydrated and avoid outdoor exposure.');
    } else if (temperature < -10) {
      warnings.push('Extreme cold warning');
      recommendations.push('Dress warmly and limit outdoor exposure.');
    }
    
    // Weather condition warnings
    if (weather.main.includes('Thunderstorm')) {
      warnings.push('Thunderstorm alert');
      recommendations.push('Stay indoors and avoid electrical appliances.');
    }
    
    if (weather.main.includes('Rain') && humidity > 90) {
      warnings.push('Flood risk');
      recommendations.push('Avoid low-lying areas and monitor water levels.');
    }
    
    res.json({
      success: true,
      data: {
        location: {
          name: data.name,
          country: data.sys.country,
          coordinates: { lat: data.coord.lat, lon: data.coord.lon }
        },
        current: {
          temperature,
          humidity,
          windSpeed,
          description: weather.description,
          icon: weather.icon
        },
        disaster_assessment: {
          risk_level: disasterRisk,
          warnings,
          recommendations
        }
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch weather data',
      timestamp: new Date().toISOString()
    });
  }
});

// Disaster alerts endpoint
app.get('/api/disasters/alerts', async (req, res) => {
  try {
    const { location, type } = req.query;
    
    // Simulate real-time alerts (in production, this would fetch from emergency services APIs)
    const alerts = [
      {
        id: 'alert_001',
        type: 'flood',
        severity: 'moderate',
        location: 'Assam, India',
        description: 'Rising water levels in Brahmaputra river',
        issued_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Move to higher ground',
          'Avoid crossing flooded roads',
          'Keep emergency supplies ready'
        ]
      },
      {
        id: 'alert_002',
        type: 'earthquake',
        severity: 'low',
        location: 'Delhi, India',
        description: 'Minor seismic activity detected',
        issued_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        expires_at: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
        recommendations: [
          'Check for structural damages',
          'Be prepared for aftershocks',
          'Keep emergency kit accessible'
        ]
      }
    ];
    
    // Filter by location or type if provided
    let filteredAlerts = alerts;
    if (location) {
      filteredAlerts = alerts.filter(alert => 
        alert.location.toLowerCase().includes((location as string).toLowerCase())
      );
    }
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }
    
    res.json({
      success: true,
      data: filteredAlerts,
      count: filteredAlerts.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Alerts API error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch alerts',
      timestamp: new Date().toISOString()
    });
  }
});

// AI Chat endpoint for real-time disaster analysis
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { message, location } = req.body;
    
    // Parse message to determine intent
    const intent = determineIntent(message);
    let response = '';
    
    switch (intent.type) {
      case 'earthquake':
        // Default coordinates (Delhi, India) if no specific location provided
        const earthquakeData = await getEarthquakeData(28.6139, 77.2090);
        response = formatEarthquakeResponse(earthquakeData, intent.location || location);
        break;
        
      case 'weather':
        const weatherData = await getWeatherData(intent.location || location);
        response = formatWeatherResponse(weatherData, intent.location || location);
        break;
        
      case 'flood':
        const floodAlerts = await getFloodAlerts(intent.location || location);
        response = formatFloodResponse(floodAlerts, intent.location || location);
        break;
        
      default:
        response = generateGeneralDisasterResponse(message);
    }
    
    res.json({
      success: true,
      response,
      intent: intent.type,
      location: intent.location || location,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('AI Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to process AI request',
      timestamp: new Date().toISOString()
    });
  }
});

// Helper functions
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function determineIntent(message: string) {
  const lowerMessage = message.toLowerCase();
  
  // Extract location mentions
  const locationRegex = /(in|at|near)\s+([a-zA-Z\s]+)/i;
  const locationMatch = message.match(locationRegex);
  const location = locationMatch ? locationMatch[2].trim() : null;
  
  if (lowerMessage.includes('earthquake') || lowerMessage.includes('quake') || lowerMessage.includes('seismic')) {
    return { type: 'earthquake', location };
  }
  if (lowerMessage.includes('weather') || lowerMessage.includes('storm') || lowerMessage.includes('rain') || lowerMessage.includes('wind')) {
    return { type: 'weather', location };
  }
  if (lowerMessage.includes('flood') || lowerMessage.includes('water') || lowerMessage.includes('river')) {
    return { type: 'flood', location };
  }
  
  return { type: 'general', location };
}

async function getWeatherData(location: string) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/api/disasters/weather?city=${location}`);
    return response.data;
  } catch (error) {
    return { success: false, data: {} };
  }
}

async function getFloodAlerts(location: string) {
  try {
    const response = await axios.get(`http://localhost:${PORT}/api/disasters/alerts?type=flood&location=${location}`);
    return response.data;
  } catch (error) {
    return { success: false, data: [] };
  }
}

function formatEarthquakeResponse(data: any, location: string): string {
  if (!data.earthquakes || data.earthquakes.length === 0) {
    return `No significant earthquake activity detected in ${location || 'your area'} recently. Current seismic conditions appear stable. I recommend staying informed through official channels and having an emergency kit ready.`;
  }
  
  const earthquake = data.earthquakes[0]; // Most recent earthquake
  const severity = earthquake.magnitude >= 6.0 ? 'HIGH' : earthquake.magnitude >= 4.0 ? 'MODERATE' : 'LOW';
  
  return `🚨 EARTHQUAKE ALERT for ${location || 'your area'}:

📍 Location: ${earthquake.location}
📊 Magnitude: ${earthquake.magnitude}
⚠️ Severity: ${severity}
🕐 Time: ${earthquake.time.toLocaleString()}
🌍 Depth: ${earthquake.coordinates.depth} km

🔸 IMMEDIATE ACTION: ${earthquake.magnitude >= 5.0 
  ? 'DROP, COVER, AND HOLD ON! Stay alert for aftershocks.' 
  : 'Monitor for stronger aftershocks and stay prepared.'}

📊 Total earthquakes in area (last 7 days): ${data.count}
Stay safe and monitor official emergency channels for updates.`;
}

function formatWeatherResponse(data: any, location: string): string {
  if (!data.success) {
    return `Unable to fetch current weather data for ${location}. Please check the location name and try again.`;
  }
  
  const weather = data.data;
  let response = `🌤️ WEATHER ANALYSIS for ${weather.location.name}:

🌡️ Temperature: ${weather.current.temperature}°C
💨 Wind Speed: ${weather.current.windSpeed} m/s
💧 Humidity: ${weather.current.humidity}%
☁️ Conditions: ${weather.current.description}

⚠️ DISASTER RISK LEVEL: ${weather.disaster_assessment.risk_level}`;

  if (weather.disaster_assessment.warnings.length > 0) {
    response += `\n\n🚨 ACTIVE WARNINGS:`;
    weather.disaster_assessment.warnings.forEach((warning: string) => {
      response += `\n• ${warning}`;
    });
  }
  
  if (weather.disaster_assessment.recommendations.length > 0) {
    response += `\n\n💡 RECOMMENDATIONS:`;
    weather.disaster_assessment.recommendations.forEach((rec: string) => {
      response += `\n• ${rec}`;
    });
  }
  
  return response;
}

function formatFloodResponse(data: any, location: string): string {
  if (!data.success || data.data.length === 0) {
    return `No active flood alerts for ${location}. Current flood risk appears low. Continue monitoring weather conditions and water levels.`;
  }
  
  const alert = data.data[0];
  return `🌊 FLOOD ALERT for ${location}:

📍 Affected Area: ${alert.location}
⚠️ Severity: ${alert.severity.toUpperCase()}
📝 Details: ${alert.description}
🕐 Issued: ${new Date(alert.issued_at).toLocaleString()}

🔸 SAFETY MEASURES:
${alert.recommendations.map((rec: string) => `• ${rec}`).join('\n')}

Stay vigilant and follow local emergency instructions.`;
}

function generateGeneralDisasterResponse(message: string): string {
  return `Thank you for your question. I'm equipped to provide real-time disaster information including:

🌍 Earthquake monitoring and analysis
🌤️ Weather-based disaster risk assessment  
🌊 Flood alerts and water level monitoring
⚠️ Emergency response guidance

Please ask me specific questions like:
• "Is there any earthquake activity in Delhi?"
• "What's the current flood risk in Assam?"
• "Show me weather alerts for Mumbai"

I'll provide real-time data and safety recommendations based on current conditions.`;
}

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('join_location', (location) => {
    socket.join(`location_${location.lat}_${location.lng}`);
    console.log(`Client ${socket.id} joined location room`);
  });
  
  socket.on('emergency_report', (data) => {
    // Broadcast emergency report to nearby clients
    socket.broadcast.emit('emergency_alert', data);
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Disaster Management API Server running on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/api/status`);
  console.log(`🤖 AI Chat: http://localhost:${PORT}/api/ai/chat`);
  console.log(`📡 WebSocket server running`);
});

export default app;
