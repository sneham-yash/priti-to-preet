import { gsap, ScrollTrigger } from './gsap'
import { listStops, type Stop } from './stops'

/** FR-101: one eased scroll per step, scaled to the distance and clamped to 1.0–2.2 s. */
const BASE_S = 0.9
const PER_VIEWPORT_S = 0.35
const MIN_S = 1
const MAX_S = 2.2
/** FR-102: a gesture only counts if it starts after this much quiet (trackpad momentum guard). */
const GESTURE_GAP_MS = 160

type Direction = 1 | -1 | 'first' | 'last'

function pick(stops: Stop[], y: number, dir: Direction): Stop | undefined {
  if (dir === 'first') return stops[0]
  if (dir === 'last') return stops[stops.length - 1]
  // FR-104: stateless — always continue from wherever the page is now.
  return dir === 1 ? stops.find((s) => s.y > y + 2) : [...stops].reverse().find((s) => s.y < y - 2)
}

const INTERACTIVE = 'button, a[href], input, select, textarea, [contenteditable]'

/**
 * FR-002 / FR-100–FR-105 (AD-10): fullPage.js-style stepping. One wheel/trackpad gesture,
 * touch swipe or key press moves to the next or previous stop. Native scrolling (scrollbar,
 * find-in-page, assistive tech, `scrollTo`) is never intercepted or pulled back.
 * Install only when motion is allowed (FR-106). Returns the uninstall function.
 */
export function enableSectionScroll(): () => void {
  let stepping: gsap.core.Tween | null = null
  let lastInput = 0
  let gestureSpent = false

  const step = (dir: Direction) => {
    if (stepping) return
    const y = window.scrollY
    const target = pick(listStops(), y, dir)
    if (!target || Math.abs(target.y - y) < 1) return // FR-105: nothing past either end
    const viewports = Math.abs(target.y - y) / window.innerHeight
    const proxy = { y }
    stepping = gsap.to(proxy, {
      y: target.y,
      duration: Math.min(MAX_S, Math.max(MIN_S, BASE_S + PER_VIEWPORT_S * viewports)),
      ease: 'power2.inOut',
      onUpdate: () => window.scrollTo(0, proxy.y),
      onComplete: () => {
        stepping = null
      },
    })
  }

  /** FR-102: one gesture, one step. Input during a step consumes the whole gesture. */
  const onGesture = (dir: 1 | -1) => {
    const now = performance.now()
    if (now - lastInput > GESTURE_GAP_MS) gestureSpent = false
    lastInput = now
    if (gestureSpent) return
    gestureSpent = true
    step(dir)
  }

  const observer = ScrollTrigger.observe({
    target: window,
    type: 'wheel,touch',
    wheelSpeed: -1,
    tolerance: 10,
    preventDefault: true,
    // Browser zoom (Ctrl+wheel, trackpad pinch) and two-finger touch are left to the browser.
    ignoreCheck: (e: Event) => (e as WheelEvent).ctrlKey === true || ((e as TouchEvent).touches?.length ?? 0) > 1,
    onUp: () => onGesture(1),
    onDown: () => onGesture(-1),
  })

  // FR-103
  const onKey = (e: KeyboardEvent) => {
    if (e.defaultPrevented || e.ctrlKey || e.altKey || e.metaKey) return
    const onControl = e.target instanceof Element && e.target.closest(INTERACTIVE) !== null
    let dir: Direction
    switch (e.key) {
      case 'ArrowDown':
      case 'PageDown':
        dir = 1
        break
      case 'ArrowUp':
      case 'PageUp':
        dir = -1
        break
      case ' ':
        if (onControl) return // Space operates the focused button
        dir = e.shiftKey ? -1 : 1
        break
      case 'Home':
        dir = 'first'
        break
      case 'End':
        dir = 'last'
        break
      default:
        return
    }
    e.preventDefault()
    step(dir)
  }
  window.addEventListener('keydown', onKey)

  return () => {
    observer.kill()
    window.removeEventListener('keydown', onKey)
    stepping?.kill()
    stepping = null
  }
}
