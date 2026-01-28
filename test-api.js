// Test API connection
const API_BASE_URL = 'http://10.252.109.96:3000/api';

async function testAPI() {
  console.log('🔍 Testing API connection...');
  
  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic connection...');
    const response = await fetch('http://10.252.109.96:3000');
    const data = await response.json();
    console.log('✅ Backend response:', data);
    
    // Test 2: Login endpoint
    console.log('2️⃣ Testing login endpoint...');
    const loginResponse = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        no_telpon: '08123456789',
        password: 'admin123'
      }),
    });
    
    if (loginResponse.ok) {
      const loginData = await loginResponse.json();
      console.log('✅ Login successful:', loginData);
    } else {
      const errorData = await loginResponse.json();
      console.log('❌ Login failed:', errorData);
    }
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();