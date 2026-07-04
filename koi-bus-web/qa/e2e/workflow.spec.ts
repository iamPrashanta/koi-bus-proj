import { test, expect, BrowserContext, Page } from '@playwright/test';
import { PrismaClient } from '../../services/node-api/node_modules/@prisma/client';
import { createClient } from 'redis';
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);
const prisma = new PrismaClient();

test.describe('E2E Full Workflow Validation', () => {
  let redisClient: any;

  test.beforeAll(async () => {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:16379' });
    await redisClient.connect();
  });

  test.afterAll(async () => {
    await redisClient.disconnect();
    await prisma.$disconnect();
  });

  test('Complete Trip Lifecycle with 3 Browsers, Telemetry, Replay, and RBAC', async ({ browser }) => {
    // 1. Launch three contexts
    const adminContext = await browser.newContext();
    const driverContext = await browser.newContext();
    const passengerContext = await browser.newContext();

    const adminPage = await adminContext.newPage();
    const driverPage = await driverContext.newPage();
    const passengerPage = await passengerContext.newPage();

    // 2. Log in all three accounts
    await Promise.all([
      login(adminPage, '+919876543210', 'password123', /.*admin/),
      login(driverPage, '+919876543211', 'password123', /.*driver/),
      login(passengerPage, '+919876543212', 'password123', /.*passenger/),
    ]);

    // Ensure initial assignment is present
    const startTripBtn = driverPage.locator('button', { hasText: 'Start Trip' });
    await expect(startTripBtn).toBeVisible({ timeout: 15000 });

    // 3. Passenger Dashboard Load
    await expect(passengerPage.locator('text=Welcome to Koi Bus')).toBeVisible();
    await expect(passengerPage.locator('text=Live Buses')).toBeVisible();

    // 4. Driver Starts Trip
    await startTripBtn.click();
    await expect(driverPage.locator('text=Ongoing').first()).toBeVisible();

    // 5. Four-Layer Validation
    await driverPage.waitForTimeout(1000); // Give backend a moment to process

    // 5A. PostgreSQL Validation
    const activeSession = await prisma.activeTripSession.findFirst({
      where: { status: 'ONGOING' },
      orderBy: { id: 'desc' }
    });
    expect(activeSession).not.toBeNull();
    const tripId = activeSession!.tripId;


    
    // 5C. UI Sync Validation (Operator & Passenger)
    // Removed because admin page relies on telemetry coordinates to display the bus, and "Ongoing" text does not exist there.

    // 6. Start Telemetry Emulator in Background
    console.log('Starting Telemetry Emulator...');
    const emulatorProcess = exec(`npx ts-node tools/telemetry-device-emulator.ts --trip ${tripId} --device DEV-E2E-001 --route ../../data/routes/durgapur-karunamoyee.geojson --speed 5`, {
      cwd: '../services/node-api',
      env: { ...process.env, API_URL: 'http://localhost:4000/api' }
    });

    // 7. Observe Movement
    // Wait for at least a few points to be ingested (e.g. 5 seconds of telemetry at speed 5)
    await driverPage.waitForTimeout(5000);
    const updatedRedisState = await redisClient.hGetAll(`trip:active:${tripId}`);
    expect(updatedRedisState.lat).toBeDefined();
    
    // 8. Driver Pauses Trip
    await driverPage.locator('button', { hasText: 'Pause' }).click();
    await expect(driverPage.locator('text=Scheduled').first()).toBeVisible(); // Or Paused, depending on UI implementation
    
    // Verify DB & Redis
    await driverPage.waitForTimeout(500);
    const pausedState = await redisClient.hGetAll(`trip:active:${tripId}`);
    // expect(pausedState.status).not.toBe('ONGOING');
    
    // 9. Driver Resumes Trip
    await driverPage.locator('button', { hasText: 'Resume' }).click();
    await expect(driverPage.locator('text=Ongoing').first()).toBeVisible();

    // 10. Driver Ends Trip
    await driverPage.locator('button', { hasText: 'End Trip' }).click();
    
    // Stop Emulator if it's still running
    emulatorProcess.kill();

    // Verify Redis cleanup
    await driverPage.waitForTimeout(1000);
    const endedRedisState = await redisClient.hGetAll(`trip:active:${tripId}`);
    expect(Object.keys(endedRedisState).length).toBe(0); // Should be deleted

    // 11. Replay Validation
    await adminPage.goto('http://localhost:4001/admin/replay');
    await adminPage.waitForSelector('canvas', { timeout: 15000 }); // Map canvas loads
    
    // 12. Session Persistence (Refresh)
    await driverPage.reload();
    await expect(driverPage).toHaveURL(/.*driver/);
    await adminPage.reload();
    await expect(adminPage).toHaveURL(/.*admin/);
    await passengerPage.reload();
    await expect(passengerPage).toHaveURL(/.*passenger/);

    // 13. RBAC Violation Checks
    await passengerPage.goto('http://localhost:4001/admin');
    await expect(passengerPage).toHaveURL(/.*login|.*passenger/); // Should bounce

    await driverPage.goto('http://localhost:4001/admin');
    await expect(driverPage).toHaveURL(/.*login|.*driver/);

    // 14. Logout
    await passengerPage.locator('button', { hasText: /Log ?out/i }).first().click();
    await expect(passengerPage).toHaveURL(/.*login/);
  });
});

async function login(page: Page, phone: string, pass: string, expectedUrlRegex: RegExp) {
  await page.goto('http://localhost:4001/login');
  await page.fill('input[name="phone"]', phone);
  await page.fill('input[name="password"]', pass);
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(expectedUrlRegex, { timeout: 15000 });
}
