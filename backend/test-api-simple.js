// Simple test script for the public API
const http = require('http');

const BASE_URL = 'localhost';
const PORT = 3000;

function makeRequest(path, callback) {
  const options = {
    hostname: BASE_URL,
    port: PORT,
    path: `/api${path}`,
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  };

  const req = http.request(options, (res) => {
    let data = '';
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const jsonData = JSON.parse(data);
        callback(null, {
          status: res.statusCode,
          data: jsonData,
          length: Array.isArray(jsonData) ? jsonData.length : 'N/A'
        });
      } catch (e) {
        callback(null, {
          status: res.statusCode,
          data: data,
          length: 'N/A (not JSON)'
        });
      }
    });
  });

  req.on('error', (error) => {
    callback(error);
  });

  req.setTimeout(5000, () => {
    req.destroy();
    callback(new Error('Request timeout'));
  });

  req.end();
}

async function testEndpoints() {
  console.log('🧪 Testing RaceIQ Public API Endpoints\n');

  const endpoints = [
    { name: 'Get All Driver Standings', path: '/driver-standings' },
    { name: 'Get Driver Standings with Pagination', path: '/driver-standings?limit=5&offset=0' },
    { name: 'Test Connection', path: '/driver-standings/test-connection' },
    { name: 'Get Current Driver Standings', path: '/driver-standings/current' },
    { name: 'Search Driver Standings', path: '/driver-standings/search?q=2023&limit=3' },
    { name: 'Get Driver Standings by Season (2023)', path: '/driver-standings/season/2023' },
    { name: 'Get Driver Standings by Race (1)', path: '/driver-standings/race/1' },
    { name: 'Get Driver Standings by Driver (1)', path: '/driver-standings/driver/1' }
  ];

  for (const endpoint of endpoints) {
    console.log(`📡 Testing: ${endpoint.name}`);
    console.log(`   URL: http://${BASE_URL}:${PORT}${endpoint.path}`);
    
    const startTime = Date.now();
    
    makeRequest(endpoint.path, (error, result) => {
      const endTime = Date.now();
      
      if (error) {
        console.log(`   ❌ Error: ${error.message}`);
      } else {
        console.log(`   ✅ Status: ${result.status}`);
        console.log(`   ⏱️  Response Time: ${endTime - startTime}ms`);
        console.log(`   📊 Data Length: ${result.length}`);
        
        if (result.data && typeof result.data === 'object') {
          const sample = Array.isArray(result.data) ? result.data[0] : result.data;
          if (sample) {
            console.log(`   📝 Sample Data: ${JSON.stringify(sample).substring(0, 100)}...`);
          }
        }
      }
      console.log('');
    });
    
    // Wait a bit between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('🎉 Public API Testing Complete!');
  console.log('\n📖 Full documentation: API_DOCUMENTATION.md');
}

// Check if server is running first
makeRequest('/driver-standings/test-connection', (error, result) => {
  if (error) {
    console.log('❌ Server is not running. Please start the server first with:');
    console.log('   npm run start:dev');
    console.log('\nOr if you have PowerShell execution policy issues, try:');
    console.log('   node dist/src/main.js');
  } else {
    console.log('✅ Server is running! Starting tests...\n');
    testEndpoints();
  }
});
