import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import path from 'path';

// Read from default ".env" file if present.
dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './',
  testMatch: '**/*.spec.ts',
  timeout: 60000,
  expect: {
    timeout: 10000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: 'artifacts/playwright-report' }],
    ['list']
  ],
  use: {
    actionTimeout: 0,
    trace: 'on',
    video: 'on',
    screenshot: 'on',
    baseURL: process.env.FRONTEND_URL || 'http://localhost:4001',
    recordHar: {
      path: 'artifacts/har/network.har',
      mode: 'full'
    }
  },
  outputDir: 'artifacts/test-results/',
  projects: [
    {
      name: 'msedge',
      use: { 
        ...devices['Desktop Edge'],
        channel: 'msedge'
      },
    }
  ],
});
