interface NavigatorHints {
  deviceMemory?: number
  connection?: { saveData?: boolean }
}

const hints = (): Navigator & NavigatorHints => navigator as Navigator & NavigatorHints

/** NFR-006: ≤4 cores or ≤4 GB memory → lighter effects. */
export function isLowTier(): boolean {
  const cores = navigator.hardwareConcurrency || 8
  const memory = hints().deviceMemory ?? 8
  return cores <= 4 || memory <= 4
}

/** NFR-006: honour Data Saver — no particles. */
export function prefersSaveData(): boolean {
  return hints().connection?.saveData === true
}

declare global {
  interface Window {
    /** Set by the Playwright suite via an init script before the app boots. */
    __PROBE_ENABLED__?: boolean
  }
}

/** Hooks for automated tests only — inert for real visitors. */
export function isAutomated(): boolean {
  return navigator.webdriver === true || window.__PROBE_ENABLED__ === true
}
