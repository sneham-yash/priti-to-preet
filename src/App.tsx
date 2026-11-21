import { useEffect } from 'react'
import { AudioControl } from './components/AudioControl'
import { ParticleField } from './components/ParticleField'
import { gsap, ScrollTrigger } from './lib/gsap'
import { enableSectionScroll } from './lib/sectionScroll'
import { shouldForceFailure } from './lib/testHooks'
import { FinalMessage } from './scenes/FinalMessage'
import { MountainScene } from './scenes/MountainScene'
import { OasisScene } from './scenes/OasisScene'
import { OpeningScene } from './scenes/OpeningScene'
import { PearlScene } from './scenes/PearlScene'

let loadTime = Number.POSITIVE_INFINITY
if (document.readyState === 'complete') loadTime = 0
else window.addEventListener('load', () => (loadTime = performance.now()), { once: true })

/** TC-083 only: lets automation prove the static fallback works. Inert for visitors. */
function FailureProbe() {
  if (shouldForceFailure()) throw new Error('Test-triggered render failure')
  return null
}

export function App() {
  useEffect(() => {
    // ScrollTrigger already re-measures on window load (which waits for fonts requested by then).
    // Only if a web font arrives after load can line heights shift — re-measure in that case alone.
    let cancelled = false
    void document.fonts.ready.then(() => {
      if (!cancelled && document.readyState === 'complete' && performance.now() > loadTime) ScrollTrigger.refresh()
    })
    return () => {
      cancelled = true
    }
  }, [])

  // FR-002 / FR-106: step through the stops only when motion is welcome.
  useEffect(() => {
    const mm = gsap.matchMedia()
    mm.add('(prefers-reduced-motion: no-preference)', () => enableSectionScroll())
    return () => mm.revert()
  }, [])

  return (
    <>
      <FailureProbe />
      <ParticleField />
      <main>
        <OpeningScene />
        <MountainScene />
        <PearlScene />
        <OasisScene />
        <FinalMessage />
      </main>
      <AudioControl />
    </>
  )
}
