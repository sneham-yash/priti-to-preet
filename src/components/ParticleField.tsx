import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion'
import { prefersSaveData } from '../lib/device'
import { createParticleEngine } from '../lib/particles'
import { reportToProbe } from '../lib/testHooks'

function ParticleCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const engine = createParticleEngine(canvas, ({ counts, running }) =>
      reportToProbe({ particles: counts, particleLoopRunning: running }),
    )
    return engine.destroy
  }, [])

  return <canvas ref={ref} className="particle-field" aria-hidden="true" />
}

/** Rain → snow → suspended specks → warm motes. Absent under reduced motion or Data Saver (FR-090, NFR-006). */
export function ParticleField() {
  const reducedMotion = usePrefersReducedMotion()
  if (reducedMotion || prefersSaveData()) return null
  return <ParticleCanvas />
}
