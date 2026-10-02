import http from 'http';
import app from './src/app.js';
import connectDB from './src/config/db.js';
import User from './src/models/User.js';

const TEST_PORT = 5099;

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, headers: res.headers, body: parsed });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runApiTests() {
  console.log('=== STARTING AUTH & API INTEGRATION TESTS ===\n');

  await connectDB();

  const server = app.listen(TEST_PORT, '127.0.0.1');

  try {
    // 1. Health check
    console.log('1. Testing GET /api/health...');
    const healthRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/health',
      method: 'GET'
    });
    console.log(`Response Status: ${healthRes.status}`);
    if (healthRes.status !== 200 || healthRes.body.status !== 'success') {
      throw new Error('Health check API failed');
    }
    console.log('✅ /api/health passed\n');

    // 2. User Registration
    console.log('2. Testing POST /api/auth/register...');
    const testEmail = `auth_test_${Date.now()}@example.com`;
    const regPayload = {
      name: 'Alpha Tester',
      email: testEmail,
      password: 'mypassword123'
    };
    const regRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, regPayload);
    console.log(`Response Status: ${regRes.status}`);
    if (regRes.status !== 201 || !regRes.body.data.token) {
      throw new Error(`Registration failed: ${JSON.stringify(regRes.body)}`);
    }
    const token = regRes.body.data.token;
    const userId = regRes.body.data._id;
    console.log('✅ User registered successfully. Received JWT Token.\n');

    // 3. Duplicate User Registration Rejection
    console.log('3. Testing duplicate email rejection on POST /api/auth/register...');
    const dupRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, regPayload);
    console.log(`Response Status: ${dupRes.status}`);
    if (dupRes.status !== 400) {
      throw new Error(`Expected 400 for duplicate email, got ${dupRes.status}`);
    }
    console.log('✅ Duplicate registration correctly rejected with 400.\n');

    // 4. User Login - Valid Credentials
    console.log('4. Testing POST /api/auth/login with valid credentials...');
    const loginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'mypassword123'
    });
    console.log(`Response Status: ${loginRes.status}`);
    if (loginRes.status !== 200 || !loginRes.body.data.token) {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.body)}`);
    }
    console.log('✅ Login succeeded with 200 OK.\n');

    // 5. User Login - Invalid Password
    console.log('5. Testing POST /api/auth/login with invalid password...');
    const invalidLoginRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: testEmail,
      password: 'wrong_password_xyz'
    });
    console.log(`Response Status: ${invalidLoginRes.status}`);
    if (invalidLoginRes.status !== 401) {
      throw new Error(`Expected 401 for invalid password, got ${invalidLoginRes.status}`);
    }
    console.log('✅ Invalid password rejected with 401 Unauthorized.\n');

    // 6. Protected Profile - Valid Token
    console.log('6. Testing GET /api/auth/profile with Bearer token...');
    const profileRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/profile',
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log(`Response Status: ${profileRes.status}`);
    if (profileRes.status !== 200 || profileRes.body.data.email !== testEmail) {
      throw new Error(`Profile check failed: ${JSON.stringify(profileRes.body)}`);
    }
    console.log(`✅ Profile retrieved for: ${profileRes.body.data.name} (${profileRes.body.data.email})\n`);

    // 7. Protected Profile - Missing Token
    console.log('7. Testing GET /api/auth/profile without token...');
    const noTokenRes = await makeRequest({
      hostname: '127.0.0.1',
      port: TEST_PORT,
      path: '/api/auth/profile',
      method: 'GET'
    });
    console.log(`Response Status: ${noTokenRes.status}`);
    if (noTokenRes.status !== 401) {
      throw new Error(`Expected 401 without token, got ${noTokenRes.status}`);
    }
    console.log('✅ Missing token correctly blocked with 401 Unauthorized.\n');

    // Clean up created test user
    await User.deleteOne({ _id: userId });
    console.log('🧹 Cleaned up test user from MongoDB');

    console.log('\n🎉 ALL 7 API ENDPOINT & AUTH MIDDLEWARE TESTS PASSED!');
  } finally {
    server.close();
    process.exit(0);
  }
}

runApiTests().catch((err) => {
  console.error('❌ API Test failed:', err);
  process.exit(1);
});
