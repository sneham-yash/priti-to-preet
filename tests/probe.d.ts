// Minimal view of the in-page test probe (see src/lib/testHooks.ts).
export {}

interface ProbeTrigger {
  pin?: Element
  start: number
  end: number
  progress: number
}

declare global {
  interface Window {
    __probe?: {
      scrollTrigger: { getAll: () => ProbeTrigger[] }
      atmosphere: () => Record<string, number>
      particles: Record<string, number>
      particleLoopRunning: boolean
    }
  }
}
