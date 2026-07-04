import { execSync } from 'child_process';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import net from 'net';

const API_URL = 'http://localhost:4000/api';
const FRONTEND_URL = 'http://localhost:4001';

async function checkPort(port: number, host: string = 'localhost'): Promise<boolean> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);
    socket.on('connect', () => { socket.destroy(); resolve(true); });
    socket.on('timeout', () => { socket.destroy(); resolve(false); });
    socket.on('error', () => { socket.destroy(); resolve(false); });
    socket.connect(port, host);
  });
}

async function runPhase0() {
  console.log('\n=========================================');
  console.log(' Phase 0: Environment Validation');
  console.log('=========================================\n');
  
  // 1. Podman check
  try {
    execSync('podman --version');
    console.log('✅ Podman is installed.');
  } catch (e) {
    console.error('❌ Podman not found.');
    process.exit(1);
  }

  // 2. Postgres Port
  const psqlUp = await checkPort(15432);
  if (!psqlUp) {
    console.error('❌ PostgreSQL is not reachable on port 15432. Start containers first.');
    process.exit(1);
  }
  console.log('✅ PostgreSQL is reachable.');

  // 3. Redis Port
  const redisUp = await checkPort(16379);
  if (!redisUp) {
    console.error('❌ Redis is not reachable on port 16379. Start containers first.');
    process.exit(1);
  }
  console.log('✅ Redis is reachable.');

  // 4. Prisma check
  const prismaSchema = path.join(process.cwd(), 'prisma', 'schema.prisma');
  if (!fs.existsSync(prismaSchema)) {
    console.error('❌ Prisma schema not found!');
    process.exit(1);
  }
  console.log('✅ Prisma Schema found.');
}

async function runPhase1() {
  console.log('\n=========================================');
  console.log(' Phase 1: E2E Database Seeding');
  console.log('=========================================\n');
  try {
    execSync('npm run seed:e2e', { cwd: process.cwd(), stdio: 'inherit' });
    console.log('✅ E2E Database Seeded Successfully.');
  } catch (e) {
    console.error('❌ E2E Seeding Failed.');
    process.exit(1);
  }
}

async function runPhase2() {
  console.log('\n=========================================');
  console.log(' Phase 2: Operator Workflow Validation');
  console.log('=========================================\n');

  try {
    console.log('⏳ Attempting to login as Operator (+919876543210)...');
    const loginRes = await axios.post(`${API_URL}/auth/login`, { phone: '+919876543210', password: 'password123' });
    const token = loginRes.data.accessToken;
    console.log('✅ Operator Login Successful.');

    const headers = { Authorization: `Bearer ${token}` };

    // Check Fleet API
    const fleetRes = await axios.get(`${API_URL}/buses`, { headers });
    if (fleetRes.data.data.length > 0) {
      console.log(`✅ Fleet loaded (${fleetRes.data.data.length} buses).`);
    } else {
      console.error('❌ No buses found for Operator.');
    }

  } catch (e: any) {
    console.error(`❌ Phase 2 failed: ${e.response?.data?.error || e.message}`);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting Koi Bus Phase 5.8 Acceptance Runner\n');

  await runPhase0();
  await runPhase1();
  
  const apiUp = await checkPort(4000);
  if (!apiUp) {
    console.log('⚠️ Backend API not running on port 4000. Start the backend with npm run dev in a separate terminal before proceeding to Phase 2+.');
    console.log('Tests paused. Once backend is running, re-run this script.');
    process.exit(0);
  }

  await runPhase2();

  console.log('\n=========================================');
  console.log(' Phase 3: Telemetry & Manual Validation');
  console.log('=========================================\n');
  console.log(`To continue the test:`);
  console.log(`1. Ensure frontend is running (npm run dev in apps/web)`);
  console.log(`2. Open the Driver Portal and login with +919876543211 / password123`);
  console.log(`3. Click 'Start Trip' in the Driver Portal`);
  console.log(`4. In a new terminal, run the telemetry emulator:`);
  console.log(`   cd services/node-api`);
  console.log(`   npx ts-node tools/telemetry-device-emulator.ts --trip 1 --device DEV-E2E-001 --route ../../data/routes/durgapur-karunamoyee.geojson --speed 5`);
  console.log(`5. Open Operator Dashboard and Passenger Portal to visually verify movement.`);
  console.log(`6. End trip in Driver Portal when done.`);
  
}

main().catch(console.error);
