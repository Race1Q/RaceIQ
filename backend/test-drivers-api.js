const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

async function testDriversAPI() {
  console.log('🧪 Testing Drivers API endpoints...\n');

  try {
    // Test 1: Get all drivers
    console.log('1. Testing GET /drivers');
    const allDrivers = await axios.get(`${BASE_URL}/drivers`);
    console.log(`✅ Success: Found ${allDrivers.data.total} drivers`);
    console.log(`   First driver: ${allDrivers.data.data[0]?.full_name || 'N/A'}\n`);

    // Test 2: Search drivers
    console.log('2. Testing GET /drivers/search?q=hamilton');
    const searchResults = await axios.get(`${BASE_URL}/drivers/search?q=hamilton`);
    console.log(`✅ Success: Found ${searchResults.data.total} drivers matching "hamilton"`);
    console.log(`   Results: ${searchResults.data.data.map(d => d.full_name).join(', ')}\n`);

    // Test 3: Get driver by ID (using first driver from the list)
    if (allDrivers.data.data.length > 0) {
      const firstDriverId = allDrivers.data.data[0].id;
      console.log(`3. Testing GET /drivers/${firstDriverId}`);
      const driverDetail = await axios.get(`${BASE_URL}/drivers/${firstDriverId}`);
      console.log(`✅ Success: Retrieved driver ${driverDetail.data.data.full_name}`);
      console.log(`   Team: ${driverDetail.data.data.team_name || 'N/A'}\n`);

      // Test 4: Get driver statistics
      console.log(`4. Testing GET /drivers/${firstDriverId}/stats`);
      const driverStats = await axios.get(`${BASE_URL}/drivers/${firstDriverId}/stats`);
      console.log(`✅ Success: Retrieved statistics for ${driverDetail.data.data.full_name}`);
      console.log(`   Total Points: ${driverStats.data.data.total_points}`);
      console.log(`   Total Wins: ${driverStats.data.data.total_wins}`);
      console.log(`   Total Podiums: ${driverStats.data.data.total_podiums}`);
      console.log(`   Total Races: ${driverStats.data.data.total_races}\n`);
    }

    // Test 5: Test non-existent driver
    console.log('5. Testing GET /drivers/99999 (non-existent driver)');
    try {
      await axios.get(`${BASE_URL}/drivers/99999`);
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('✅ Success: Correctly returned 404 for non-existent driver\n');
      } else {
        console.log(`❌ Unexpected error: ${error.response?.status}\n`);
      }
    }

    console.log('🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testDriversAPI();
