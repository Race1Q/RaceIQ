// Test script for public API endpoints
const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testPublicEndpoints() {
  console.log('🧪 Testing RaceIQ Public API Endpoints\n');

  const endpoints = [
    {
      name: 'Get All Driver Standings',
      url: `${BASE_URL}/driver-standings`,
      method: 'GET'
    },
    {
      name: 'Get Driver Standings with Pagination',
      url: `${BASE_URL}/driver-standings?limit=5&offset=0`,
      method: 'GET'
    },
    {
      name: 'Test Connection',
      url: `${BASE_URL}/driver-standings/test-connection`,
      method: 'GET'
    },
    {
      name: 'Get Current Driver Standings',
      url: `${BASE_URL}/driver-standings/current`,
      method: 'GET'
    },
    {
      name: 'Search Driver Standings',
      url: `${BASE_URL}/driver-standings/search?q=2023&limit=3`,
      method: 'GET'
    }
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`📡 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      const startTime = Date.now();
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 10000
      });
      const endTime = Date.now();
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ⏱️  Response Time: ${endTime - startTime}ms`);
      console.log(`   📊 Data Length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
      
      if (response.data && typeof response.data === 'object') {
        const sample = Array.isArray(response.data) ? response.data[0] : response.data;
        if (sample) {
          console.log(`   📝 Sample Data: ${JSON.stringify(sample).substring(0, 100)}...`);
        }
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📝 Response: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      }
      console.log('');
    }
  }

  // Test parameterized endpoints
  const parameterizedEndpoints = [
    {
      name: 'Get Driver Standings by Season (2023)',
      url: `${BASE_URL}/driver-standings/season/2023`,
      method: 'GET'
    },
    {
      name: 'Get Driver Standings by Race (1)',
      url: `${BASE_URL}/driver-standings/race/1`,
      method: 'GET'
    },
    {
      name: 'Get Driver Standings by Driver (1)',
      url: `${BASE_URL}/driver-standings/driver/1`,
      method: 'GET'
    }
  ];

  console.log('🔍 Testing Parameterized Endpoints:\n');

  for (const endpoint of parameterizedEndpoints) {
    try {
      console.log(`📡 Testing: ${endpoint.name}`);
      console.log(`   URL: ${endpoint.url}`);
      
      const startTime = Date.now();
      const response = await axios({
        method: endpoint.method,
        url: endpoint.url,
        timeout: 10000
      });
      const endTime = Date.now();
      
      console.log(`   ✅ Status: ${response.status}`);
      console.log(`   ⏱️  Response Time: ${endTime - startTime}ms`);
      console.log(`   📊 Data Length: ${Array.isArray(response.data) ? response.data.length : 'N/A'}`);
      
      if (response.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log(`   📝 Sample Data: ${JSON.stringify(response.data[0]).substring(0, 150)}...`);
      }
      
      console.log('');
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      if (error.response) {
        console.log(`   📊 Status: ${error.response.status}`);
        console.log(`   📝 Response: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
      }
      console.log('');
    }
  }

  console.log('🎉 Public API Testing Complete!');
  console.log('\n📚 API Documentation available at: http://localhost:3000/api/docs');
  console.log('📖 Full documentation: API_DOCUMENTATION.md');
}

// Run the tests
testPublicEndpoints().catch(console.error);
