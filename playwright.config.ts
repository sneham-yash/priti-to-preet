import { defineConfig, devices } from '@playwright/test'

/**
 * Runs against the PRODUCTION build (`vite preview`), never the dev server.
 * Projects mirror NFR-010: Chromium (Chrome/Android engine), WebKit (Safari/iOS engine proxy),
 * desktop Chrome and desktop Edge.
 */
/**
 * Parallel headless browsers contend for the OS audio device (playback can stall at 0:00).
 * Chromium's fake audio sink keeps real playback timing and volume without a device.
 * Audible output is verified on real devices (TC-142/143).
 */
const FAKE_AUDIO = { args: ['--disable-audio-output'] }

export default defineConfig({
  testDir: './tests',
  // CPU benchmarks are meaningless while other browsers compete for the CPU: run them alone (npm run test:perf).
  grepInvert: /@perf/,
  timeout: 90_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: 3,
  retries: 0,
  reporter: [['list'], ['json', { outputFile: 'test-results/results.json' }]],
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 60_000,
  },
  projects: [
    { name: 'chromium-mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions: FAKE_AUDIO } },
    { name: 'webkit-mobile', use: { ...devices['iPhone 14'] } },
    {
      name: 'chrome-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, launchOptions: FAKE_AUDIO },
    },
    {
      name: 'edge-desktop',
      use: { ...devices['Desktop Edge'], channel: 'msedge', viewport: { width: 1440, height: 900 }, launchOptions: FAKE_AUDIO },
    },
  ],
})
