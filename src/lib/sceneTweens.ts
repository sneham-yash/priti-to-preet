import { handOver, type AtmosphereKind } from './atmosphere'
import type { SceneEnv } from '../hooks/useSceneAnimation'
import { gsap, SCRUB, ScrollTrigger } from './gsap'
import { registerStop } from './stops'

/**
 * FR-060: line-by-line rise from behind a mask. Opacity only (never visibility),
 * so lines stay in the accessibility tree while hidden (FR-061, NFR-024).
 */
const LINE_FROM = { yPercent: 105, opacity: 0 }
const LINE_TO = { yPercent: 0, opacity: 1, ease: 'power2.out' }

/** Time-based reveal that plays on entry and reverses on the way back up (FR-004). */
export function playLineReveal(lines: HTMLElement[], trigger: HTMLElement, start = 'top 75%'): void {
  gsap.fromTo(lines, LINE_FROM, {
    ...LINE_TO,
    duration: 1.2,
    stagger: 0.16,
    scrollTrigger: { trigger, start, toggleActions: 'play none none reverse' },
  })
}

/** AD-8: ambient CSS loops only run while the section is near the viewport. */
export function trackVisibility(section: HTMLElement): void {
  ScrollTrigger.create({
    trigger: section,
    start: 'top bottom',
    end: 'bottom top',
    toggleClass: { targets: section, className: 'is-visible' },
  })
}

/** AD-1/AD-2: the approach zone hands the particle weather over to the next scene. */
export function atmosphereHandOver(
  zone: HTMLElement,
  from: AtmosphereKind | null,
  to: AtmosphereKind | null,
  end = 'bottom top',
): void {
  ScrollTrigger.create({
    trigger: zone,
    start: 'top bottom',
    end,
    onUpdate: (self) => handOver(from, to, self.progress),
    onLeave: () => handOver(from, to, 1),
    onLeaveBack: () => handOver(from, to, 0),
  })
}

/** AD-11 / D-12: each timeline unit of a held scene is this many viewport heights of scrolling. */
const VIEWPORTS_PER_UNIT = 0.4

/** A paused scene timeline; pin it with `pinTimeline` once every tween is in place. */
export function sceneTimeline(): gsap.core.Timeline {
  return gsap.timeline({ defaults: { ease: 'none' }, paused: true })
}

/**
 * AD-3: one held, scrubbed stage per metaphor scene (FR-003). The hold is as long as the
 * timeline (AD-11), so adding a beat in copy.ts re-paces the scene with no code change.
 */
export function pinTimeline(stage: HTMLElement, tl: gsap.core.Timeline): ScrollTrigger {
  return ScrollTrigger.create({
    trigger: stage,
    start: 'top top',
    end: () => `+=${Math.round(tl.duration() * VIEWPORTS_PER_UNIT * window.innerHeight)}`,
    pin: true,
    scrub: SCRUB,
    anticipatePin: 1,
    invalidateOnRefresh: true,
    animation: tl,
  })
}

/** FR-063 timings, in timeline units. */
const BEAT_IN = 0.6
const BEAT_HOLD = 0.6
const BEAT_OUT = 0.4
/** The next beat starts rising once the previous one is this far through leaving. */
const BEAT_OVERLAP = 0.6
const LINE_STAGGER = 0.1
const LINE_OUT = { yPercent: -45, opacity: 0, ease: 'power1.in' }

/**
 * FR-063/FR-064 (AD-9): one beat at a time. Each beat's lines rise in, hold around a
 * `beat-i` label, then lift away as the next one rises; the last beat stays.
 * Statically the beats stay stacked (FR-066): only this setup overlays them.
 */
export function addBeats(env: SceneEnv, tl: gsap.core.Timeline, block: HTMLElement, start: number): void {
  block.classList.add('is-sequenced')
  env.onCleanup(() => block.classList.remove('is-sequenced'))
  const beats = Array.from(block.querySelectorAll<HTMLElement>('[data-beat]'))
  let t = start
  beats.forEach((beat, i) => {
    const lines = Array.from(beat.querySelectorAll<HTMLElement>('[data-reveal]'))
    const stagger = Math.min(LINE_STAGGER, (BEAT_IN * 0.5) / Math.max(1, lines.length))
    tl.fromTo(lines, LINE_FROM, { ...LINE_TO, duration: BEAT_IN - stagger * (lines.length - 1), stagger }, t)
    tl.addLabel(`beat-${i}`, t + BEAT_IN + BEAT_HOLD / 2)
    t += BEAT_IN + BEAT_HOLD
    if (i === beats.length - 1) return
    const outStagger = Math.min(0.04, (BEAT_OUT * 0.4) / Math.max(1, lines.length))
    tl.fromTo(
      lines,
      { yPercent: 0, opacity: 1 },
      { ...LINE_OUT, duration: BEAT_OUT - outStagger * (lines.length - 1), stagger: outStagger, immediateRender: false },
      t,
    )
    t += BEAT_OUT * BEAT_OVERLAP
  })
  // The last beat holds to the end of the timeline (and so of the pin).
  tl.set({}, {}, t)
}

/** FR-100: one stop per beat label, at the matching scroll position inside the hold. */
export function registerBeatStops(env: SceneEnv, id: string, tl: gsap.core.Timeline, st: ScrollTrigger): void {
  for (const [name, time] of Object.entries(tl.labels)) {
    if (!name.startsWith('beat-')) continue
    const y = () => st.start + (st.end - st.start) * (time / tl.duration())
    env.onCleanup(registerStop(`${id}-${name.slice(5)}`, y))
  }
}
