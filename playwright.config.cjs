const { defineConfig } = require('@playwright/test');

const serverEnv = {
  ...process.env,
  NODE_ENV: 'development',
  DATABASE_URL: 'file:./prisma/test-e2e.db',
};

module.exports = defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'list',
  use: { trace: 'on-first-retry' },
  webServer: [
    {
      command:
        'sh -c "rm -f prisma/test-e2e.db prisma/test-e2e.db-journal && pnpm exec prisma migrate deploy && pnpm exec prisma db seed && node server.js"',
      cwd: './server',
      url: 'http://127.0.0.1:5001/api/health',
      reuseExistingServer: !process.env.CI,
      env: serverEnv,
    },
    {
      command: 'pnpm exec vite --port 5173 --host 127.0.0.1',
      cwd: './client',
      url: 'http://127.0.0.1:5173',
      reuseExistingServer: !process.env.CI,
    },
  ],
});
