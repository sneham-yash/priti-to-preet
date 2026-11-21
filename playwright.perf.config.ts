import { defineConfig } from '@playwright/test'
import base from './playwright.config'

/** Performance benchmarks (@perf) run alone, on one worker, on the mobile profile. */
export default defineConfig({
  ...base,
  grep: /@perf/,
  grepInvert: undefined,
  workers: 1,
  fullyParallel: false,
  projects: base.projects?.filter((p) => p.name === 'chromium-mobile'),
})
