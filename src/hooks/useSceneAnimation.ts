import { useLayoutEffect, type RefObject } from 'react'
import { enqueue } from '../lib/deferredQueue'
import { gsap } from '../lib/gsap'

export interface SceneEnv {
  /** The section element; all queries are scoped to it. */
  scope: HTMLElement
  /** Scoped query that throws if the element is missing (catches markup drift early). */
  el: <T extends HTMLElement = HTMLElement>(selector: string) => T
  all: <T extends HTMLElement = HTMLElement>(selector: string) => T[]
}

/** May return a cleanup for anything the GSAP context cannot revert by itself. */
export type SceneSetup = (env: SceneEnv) => (() => void) | undefined

interface Options {
  /** Below-the-fold scenes: build in an idle task (or at the first scroll), not during start-up. */
  defer?: boolean
}

function build(scope: HTMLElement, setup: SceneSetup): gsap.MatchMedia {
  const mm = gsap.matchMedia(scope)
  mm.add('(prefers-reduced-motion: no-preference)', () => {
    const all = <T extends HTMLElement>(selector: string) => Array.from(scope.querySelectorAll<T>(selector))
    const el = <T extends HTMLElement>(selector: string) => {
      const found = scope.querySelector<T>(selector)
      if (!found) throw new Error(`Scene element not found: ${selector}`)
      return found
    }
    return setup({ scope, el, all })
  })
  return mm
}

/**
 * AD-4: every animation of a scene is created inside gsap.matchMedia (which is a gsap.context),
 * only when the visitor has not asked for reduced motion, and is fully reverted on unmount
 * — including ScrollTriggers, pins and inline styles (NFR-042, FR-090).
 *
 * `setup` must be a stable (module-level) function.
 */
export function useSceneAnimation(
  scopeRef: RefObject<HTMLElement | null>,
  setup: SceneSetup,
  { defer = false }: Options = {},
): void {
  useLayoutEffect(() => {
    const scope = scopeRef.current
    if (!scope) return
    let mm: gsap.MatchMedia | null = null
    if (!defer) {
      mm = build(scope, setup)
      return () => mm?.revert()
    }
    const cancel = enqueue(() => {
      mm = build(scope, setup)
    })
    return () => {
      cancel()
      mm?.revert()
    }
  }, [scopeRef, setup, defer])
}
