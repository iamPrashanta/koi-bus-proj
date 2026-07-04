const axios = require('axios');
const { exec } = require('child_process');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('1. Fetching driver and trip...');
  const driverUser = await prisma.user.findUnique({ where: { phone: '+919876543211' } });
  const driver = await prisma.driver.findUnique({ where: { userId: driverUser.id } });
  const assignment = await prisma.tripAssignment.findFirst({ where: { driverId: driver.id, isActive: true } });
  
  if (!assignment) {
    console.error('No active assignment found! Run npm run seed:e2e first.');
    process.exit(1);
  }

  const tripId = assignment.tripId;
  console.log(`Found Trip ID: ${tripId}`);

  console.log('2. Logging in as driver...');
  const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
    phone: '+919876543211',
    password: 'password123'
  });
  const token = loginRes.data.accessToken;
  if (!token) throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);

  console.log('3. Starting Trip...');
  await axios.post(`http://localhost:4000/api/trips/${tripId}/start`, {}, {
    headers: { Authorization: `Bearer ${token}` }
  });
  console.log('Trip started successfully.');

  console.log('4. Starting Telemetry Emulator...');
  const child = exec(`npx ts-node tools/telemetry-device-emulator.ts --trip ${tripId} --device DEV-E2E-001 --route ../../data/routes/durgapur-karunamoyee.geojson --speed 5`, {
    env: { ...process.env, API_URL: 'http://localhost:4000/api' }
  });

  child.stdout?.on('data', (d: any) => process.stdout.write(d));
  child.stderr?.on('data', (d: any) => process.stderr.write(d));

  console.log('Demo is running! The emulator is now sending GPS data.');
  console.log('You can now log in as PASSENGER (+919876543212, password123) at http://localhost:4001/login to track the bus!');
}

main().catch(console.error);
