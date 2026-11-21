import { handOver, type AtmosphereKind } from './atmosphere'
import { gsap, SCRUB, ScrollTrigger } from './gsap'

/**
 * FR-060: line-by-line rise from behind a mask. Opacity only (never visibility),
 * so lines stay in the accessibility tree while hidden (FR-061, NFR-024).
 */
const LINE_FROM = { yPercent: 105, opacity: 0 }
const LINE_TO = { yPercent: 0, opacity: 1, ease: 'power2.out' }

/** Adds a reveal to a scrubbed timeline whose total length is 1. */
export function addLineReveal(
  tl: gsap.core.Timeline,
  lines: HTMLElement[],
  start: number,
  end = 1,
): void {
  const span = end - start
  const stagger = Math.min(0.06, (span * 0.5) / Math.max(1, lines.length))
  const duration = span - stagger * (lines.length - 1)
  tl.fromTo(lines, LINE_FROM, { ...LINE_TO, duration, stagger }, start)
}

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

/** AD-3: one pinned, scrubbed timeline per metaphor scene (FR-003: ≤ 150% of the viewport). */
export function pinnedTimeline(stage: HTMLElement, distancePercent: number): gsap.core.Timeline {
  return gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: stage,
      start: 'top top',
      end: `+=${Math.min(distancePercent, 150)}%`,
      pin: true,
      scrub: SCRUB,
      anticipatePin: 1,
      invalidateOnRefresh: true,
    },
  })
}
