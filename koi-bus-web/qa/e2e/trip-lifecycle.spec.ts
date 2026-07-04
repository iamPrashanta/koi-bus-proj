import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { createClient } from 'redis';

const prisma = new PrismaClient();

test.describe('Trip Lifecycle (4-Layer Validation)', () => {
  let redisClient: any;

  test.beforeAll(async () => {
    redisClient = createClient({ url: process.env.REDIS_URL || 'redis://localhost:16379' });
    await redisClient.connect();
  });

  test.afterAll(async () => {
    await redisClient.disconnect();
    await prisma.$disconnect();
  });

  test('Driver can start an assigned trip with full stack synchronization', async ({ browser }) => {
    // 1. Setup Contexts
    const driverContext = await browser.newContext();
    const operatorContext = await browser.newContext();
    const passengerContext = await browser.newContext();

    const driverPage = await driverContext.newPage();
    const operatorPage = await operatorContext.newPage();
    const passengerPage = await passengerContext.newPage();

    // 2. Login Flow (simplified for structural proof)
    await driverPage.goto('/login');
    await driverPage.fill('input[name="phone"]', '+919876543211');
    await driverPage.fill('input[name="password"]', 'password123');
    await driverPage.click('button[type="submit"]');
    await expect(driverPage).toHaveURL(/.*driver/);

    await operatorPage.goto('/login');
    await operatorPage.fill('input[name="phone"]', '+919876543210');
    await operatorPage.fill('input[name="password"]', 'password123');
    await operatorPage.click('button[type="submit"]');
    await expect(operatorPage).toHaveURL(/.*admin/);

    // 3. Driver Action: Start Trip
    // Ensure button exists and assignment is loaded
    const startBtn = driverPage.locator('button', { hasText: 'Start Trip' });
    await expect(startBtn).toBeVisible({ timeout: 10000 });
    await startBtn.click();

    // 4. Layer 1: UI Validation
    await expect(driverPage.locator('text=Ongoing')).toBeVisible();

    // 5. Layer 2: API & DB Validation (Prisma)
    // Wait briefly for backend processing
    await driverPage.waitForTimeout(1000);
    const activeSession = await prisma.activeTripSession.findFirst({
      where: { status: 'ONGOING' },
      orderBy: { id: 'desc' }
    });
    expect(activeSession).not.toBeNull();
    expect(activeSession?.tripId).toBeGreaterThan(0);

    // 6. Layer 3: Redis Validation
    if (activeSession) {
      const redisState = await redisClient.hGetAll(`trip:active:${activeSession.tripId}`);
      expect(redisState).toBeDefined();
      expect(redisState.status).toBe('ONGOING');
    }

    // 7. Layer 4: Cross-User Sync Validation (Operator)
    // Assuming the operator dashboard has an element that shows active trips
    await expect(operatorPage.locator('text=ONGOING')).toBeVisible({ timeout: 5000 });
  });
});
