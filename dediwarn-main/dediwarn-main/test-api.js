// Simple test file to verify API integration
// Run this with: node test-api.js

const USGS_API_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

async function testUSGSAPI() {
  try {
    console.log('🔍 Testing USGS Earthquake API...');
    
    const today = new Date();
    const startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const starttime = startDate.toISOString().split('T')[0];
    
    const url = `${USGS_API_URL}?format=geojson&starttime=${starttime}&minmagnitude=4.5&limit=5`;
    console.log('📡 URL:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ USGS API Response Success!');
    console.log(`📊 Found ${data.features.length} earthquakes (magnitude 4.5+)`);
    
    data.features.forEach((feature, index) => {
      const { properties, geometry } = feature;
      const [lng, lat, depth] = geometry.coordinates;
      console.log(`🌋 ${index + 1}. M${properties.mag} - ${properties.place}`);
      console.log(`   📍 Location: ${lat.toFixed(2)}, ${lng.toFixed(2)} (depth: ${depth}km)`);
      console.log(`   🕒 Time: ${new Date(properties.time).toLocaleString()}`);
    });
    
  } catch (error) {
    console.error('❌ USGS API Error:', error.message);
  }
}

async function testOpenWeatherAPI() {
  console.log('\n🌤️ Testing OpenWeatherMap API...');
  console.log('⚠️ Note: This requires an API key to work fully');
  
  const API_KEY = 'YOUR_API_KEY'; // Replace with actual key
  const city = 'Delhi';
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
  
  if (API_KEY === 'YOUR_API_KEY') {
    console.log('🔑 API key not configured - skipping weather test');
    console.log('   To test: Get API key from https://openweathermap.org/api');
    console.log('   Then replace YOUR_API_KEY in test file');
    return;
  }
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('✅ OpenWeatherMap API Success!');
    console.log(`🌡️ Temperature in ${city}: ${data.main.temp}°C`);
    console.log(`💨 Wind: ${data.wind.speed} m/s`);
    console.log(`🌤️ Conditions: ${data.weather[0].description}`);
    
  } catch (error) {
    console.error('❌ OpenWeatherMap API Error:', error.message);
  }
}

// Run tests
async function runTests() {
  console.log('🧪 API Integration Test\n');
  console.log('=' * 50);
  
  await testUSGSAPI();
  await testOpenWeatherAPI();
  
  console.log('\n' + '=' * 50);
  console.log('📋 Test Summary:');
  console.log('✅ USGS API: Free, no key required');
  console.log('🔑 OpenWeatherMap: Requires free API key');
  console.log('\n📖 Setup Instructions:');
  console.log('1. Get OpenWeatherMap API key: https://openweathermap.org/api');
  console.log('2. Add to .env file: VITE_OPENWEATHER_API_KEY=your_key');
  console.log('3. Restart development server');
}

// Check if running in Node.js environment
if (typeof window === 'undefined') {
  runTests();
} else {
  console.log('This test should be run in Node.js, not in browser');
}
