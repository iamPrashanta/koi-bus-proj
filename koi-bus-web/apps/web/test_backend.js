const axios = require('axios');
const fs = require('fs');

const API_URL = 'http://localhost:3000/api/auth';
const client = axios.create({ baseURL: API_URL, withCredentials: true, validateStatus: () => true });

async function run() {
  const log = [];
  try {
    // 1. Signup
    const signupData = {
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      firstName: 'Test',
      lastName: 'User',
      phone: '1234567890',
      role: 'DRIVER'
    };
    const signupRes = await client.post('/signup', signupData);
    log.push({ endpoint: 'POST /api/auth/signup', status: signupRes.status, request: signupData, response: signupRes.data });
    
    // Cookie header extract for subsequent requests
    const cookieHeader = signupRes.headers['set-cookie'];
    if (cookieHeader) client.defaults.headers.Cookie = cookieHeader;
    
    const accessToken = signupRes.data.accessToken;
    client.defaults.headers.Authorization = `Bearer ${accessToken}`;

    // 2. ME
    const meRes = await client.get('/me');
    log.push({ endpoint: 'GET /api/auth/me', status: meRes.status, request: null, response: meRes.data });

    // 3. Refresh
    const refreshRes = await client.post('/refresh', {});
    log.push({ endpoint: 'POST /api/auth/refresh', status: refreshRes.status, request: {}, response: refreshRes.data });
    
    const newCookieHeader = refreshRes.headers['set-cookie'];
    if (newCookieHeader) client.defaults.headers.Cookie = newCookieHeader;
    client.defaults.headers.Authorization = `Bearer ${refreshRes.data.accessToken}`;

    // 4. Logout
    const logoutRes = await client.post('/logout', {});
    log.push({ endpoint: 'POST /api/auth/logout', status: logoutRes.status, request: {}, response: logoutRes.data });

    // 5. Login
    const loginData = { phone: signupData.phone, password: 'password123' };
    const loginRes = await client.post('/login', loginData);
    log.push({ endpoint: 'POST /api/auth/login', status: loginRes.status, request: loginData, response: loginRes.data });

  } catch (error) {
    console.error(error);
  }
  fs.writeFileSync('backend_test_results.json', JSON.stringify(log, null, 2));
}

run();
