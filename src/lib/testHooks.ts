import { snapshot } from './atmosphere'
import { isAutomated } from './device'
import { ScrollTrigger } from './gsap'
import { listStops } from './stops'

export interface TestProbe {
  scrollTrigger: typeof ScrollTrigger
  atmosphere: typeof snapshot
  particles: Record<string, number>
  particleLoopRunning: boolean
  stops: typeof listStops
}

declare global {
  interface Window {
    __probe?: TestProbe
  }
}

/** Exposes read-only internals to Playwright. Never active for a real visitor. */
export function installTestProbe(): void {
  if (!isAutomated()) return
  window.__probe = {
    scrollTrigger: ScrollTrigger,
    atmosphere: snapshot,
    particles: {},
    particleLoopRunning: false,
    stops: listStops,
  }
}

export function reportToProbe(patch: Partial<Pick<TestProbe, 'particles' | 'particleLoopRunning'>>): void {
  if (window.__probe) Object.assign(window.__probe, patch)
}

/** TC-083: `?__fail=1` forces a render error — only under automation. */
export function shouldForceFailure(): boolean {
  return isAutomated() && new URLSearchParams(window.location.search).has('__fail')
}
