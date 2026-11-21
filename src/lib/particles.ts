import { ATMOSPHERE_KINDS, getWeight, isCalm, onAtmosphereChange, type AtmosphereKind } from './atmosphere'
import { isLowTier } from './device'

/** Positions are normalised to the viewport (0..1); speeds are in viewport-heights per second. */
interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  phase: number
}

interface KindSpec {
  /** FR-023 / FR-042 caps: [mobile, desktop]. */
  counts: [number, number]
  color: string
  spawn: (p: Particle, initial: boolean) => void
  step: (p: Particle, dt: number, t: number) => void
  draw: (ctx: CanvasRenderingContext2D, p: Particle, w: number, h: number) => void
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)
const TAU = Math.PI * 2

const SPECS: Record<AtmosphereKind, KindSpec> = {
  rain: {
    counts: [70, 140],
    color: 'rgba(214, 226, 236, 0.32)',
    spawn: (p, initial) => {
      p.x = rand(-0.1, 1.05)
      p.y = initial ? rand(-0.1, 1) : rand(-0.2, -0.05)
      p.vy = rand(1.1, 1.6)
      p.vx = p.vy * 0.09
      p.size = rand(0.035, 0.065) // streak length, in viewport heights
    },
    step: (p, dt) => {
      p.x += p.vx * dt
      p.y += p.vy * dt
      if (p.y > 1.08) SPECS.rain.spawn(p, false)
    },
    draw: (ctx, p, w, h) => {
      // The streak points exactly along its on-screen velocity.
      const dx = p.vx * w
      const dy = p.vy * h
      const k = (p.size * h) / Math.hypot(dx, dy)
      const x = p.x * w
      const y = p.y * h
      ctx.moveTo(x, y)
      ctx.lineTo(x - dx * k, y - dy * k)
    },
  },
  snow: {
    counts: [60, 120],
    color: 'rgba(255, 255, 255, 0.78)',
    spawn: (p, initial) => {
      p.x = rand(0, 1)
      p.y = initial ? rand(-0.05, 1) : rand(-0.12, -0.02)
      p.vy = rand(0.035, 0.085)
      p.vx = rand(-0.01, 0.012)
      p.size = rand(0.7, 2.4)
      p.phase = rand(0, TAU)
    },
    step: (p, dt, t) => {
      p.y += p.vy * dt
      p.x += (p.vx + Math.sin(t * 0.6 + p.phase) * 0.008) * dt
      if (p.y > 1.04) SPECS.snow.spawn(p, false)
    },
    draw: (ctx, p, w, h) => {
      ctx.moveTo(p.x * w + p.size, p.y * h)
      ctx.arc(p.x * w, p.y * h, p.size, 0, TAU)
    },
  },
  specks: {
    counts: [50, 90],
    color: 'rgba(205, 232, 240, 0.6)',
    spawn: (p, initial) => {
      p.x = rand(0, 1)
      p.y = initial ? rand(0, 1.05) : rand(1.02, 1.1)
      p.vy = -rand(0.008, 0.024)
      p.vx = rand(-0.004, 0.004)
      p.size = rand(0.5, 1.4)
      p.phase = rand(0, TAU)
    },
    step: (p, dt, t) => {
      p.y += p.vy * dt
      p.x += (p.vx + Math.sin(t * 0.35 + p.phase) * 0.004) * dt
      if (p.y < -0.04) SPECS.specks.spawn(p, false)
    },
    draw: (ctx, p, w, h) => {
      ctx.moveTo(p.x * w + p.size, p.y * h)
      ctx.arc(p.x * w, p.y * h, p.size, 0, TAU)
    },
  },
  motes: {
    counts: [24, 40],
    color: 'rgba(255, 234, 196, 0.55)',
    spawn: (p, initial) => {
      p.x = initial ? rand(0, 1) : rand(-0.08, -0.02)
      p.y = rand(0.15, 0.95)
      p.vx = rand(0.006, 0.016)
      p.vy = 0
      p.size = rand(0.6, 1.6)
      p.phase = rand(0, TAU)
    },
    step: (p, dt, t) => {
      p.x += p.vx * dt
      p.y += Math.sin(t * 0.4 + p.phase) * 0.003 * dt
      if (p.x > 1.05) SPECS.motes.spawn(p, false)
    },
    draw: (ctx, p, w, h) => {
      ctx.moveTo(p.x * w + p.size, p.y * h)
      ctx.arc(p.x * w, p.y * h, p.size, 0, TAU)
    },
  },
}

const MAX_DPR = 1.5
const DESKTOP_MIN_WIDTH = 768

export interface ParticleEngine {
  destroy: () => void
}

export interface EngineReport {
  counts: Record<AtmosphereKind, number>
  running: boolean
}

/**
 * One canvas, one rAF loop for all weather (AD-2). The loop stops by itself when every
 * weight is ~0 or the tab is hidden, and wakes when the atmosphere changes (NFR-006).
 */
export function createParticleEngine(
  canvas: HTMLCanvasElement,
  report: (r: EngineReport) => void,
): ParticleEngine {
  const ctx = canvas.getContext('2d')
  if (!ctx) return { destroy: () => undefined }

  const lowTier = isLowTier()
  let pools = {} as Record<AtmosphereKind, Particle[]>
  let isDesktop = false
  let cssW = 0
  let cssH = 0
  let raf = 0
  let running = false
  let last = 0

  const buildPools = () => {
    isDesktop = window.innerWidth >= DESKTOP_MIN_WIDTH
    pools = {} as Record<AtmosphereKind, Particle[]>
    for (const kind of ATMOSPHERE_KINDS) {
      const base = SPECS[kind].counts[isDesktop ? 1 : 0]
      const n = lowTier ? Math.round(base / 2) : base
      pools[kind] = Array.from({ length: n }, () => {
        const p: Particle = { x: 0, y: 0, vx: 0, vy: 0, size: 1, phase: 0 }
        SPECS[kind].spawn(p, true)
        return p
      })
    }
  }

  const counts = () =>
    Object.fromEntries(ATMOSPHERE_KINDS.map((k) => [k, pools[k].length])) as Record<AtmosphereKind, number>

  const sync = () => report({ counts: counts(), running })

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR)
    const w = canvas.clientWidth
    const h = canvas.clientHeight
    // Ignore iOS address-bar height jitter: only rebuild for width changes or growth.
    if (w === cssW && h <= cssH) return
    cssW = w
    cssH = h
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if ((window.innerWidth >= DESKTOP_MIN_WIDTH) !== isDesktop) buildPools()
    sync()
  }

  const frame = (now: number) => {
    const dt = Math.min(0.05, (now - last) / 1000)
    last = now
    const t = now / 1000
    ctx.clearRect(0, 0, cssW, cssH)
    let active = false
    for (const kind of ATMOSPHERE_KINDS) {
      const weight = getWeight(kind)
      if (weight < 0.005) continue
      active = true
      const spec = SPECS[kind]
      ctx.globalAlpha = weight
      ctx.beginPath()
      for (const p of pools[kind]) {
        spec.step(p, dt, t)
        spec.draw(ctx, p, cssW, cssH)
      }
      if (kind === 'rain') {
        ctx.strokeStyle = spec.color
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.fillStyle = spec.color
        ctx.fill()
      }
    }
    ctx.globalAlpha = 1
    if (!active) {
      running = false
      sync()
      return
    }
    raf = requestAnimationFrame(frame)
  }

  const wake = () => {
    if (running || document.hidden) return
    if (isCalm()) {
      ctx.clearRect(0, 0, cssW, cssH)
      return
    }
    running = true
    last = performance.now()
    raf = requestAnimationFrame(frame)
    sync()
  }

  const sleep = () => {
    cancelAnimationFrame(raf)
    running = false
    sync()
  }

  const onVisibility = () => (document.hidden ? sleep() : wake())

  let resizeTimer = 0
  const onResize = () => {
    window.clearTimeout(resizeTimer)
    resizeTimer = window.setTimeout(resize, 150)
  }

  buildPools()
  resize()
  const unsubscribe = onAtmosphereChange(wake)
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('resize', onResize)
  wake()

  return {
    destroy: () => {
      sleep()
      unsubscribe()
      window.clearTimeout(resizeTimer)
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('resize', onResize)
    },
  }
}
