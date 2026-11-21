/**
 * Shared, non-React state for the particle field (AD-2).
 * Weights are 0..1; scroll triggers hand one weight over to the next.
 */
export type AtmosphereKind = 'rain' | 'snow' | 'specks' | 'motes'

export const ATMOSPHERE_KINDS: readonly AtmosphereKind[] = ['rain', 'snow', 'specks', 'motes']

const weights: Record<AtmosphereKind, number> = { rain: 1, snow: 0, specks: 0, motes: 0 }
const listeners = new Set<() => void>()

export function getWeight(kind: AtmosphereKind): number {
  return weights[kind]
}

export function isCalm(): boolean {
  return ATMOSPHERE_KINDS.every((k) => weights[k] < 0.005)
}

export function onAtmosphereChange(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))

/** Cross-fade `from` → `to` by scroll progress p (either side may be null). */
export function handOver(from: AtmosphereKind | null, to: AtmosphereKind | null, p: number): void {
  const t = clamp01(p)
  if (from) weights[from] = 1 - t
  if (to) weights[to] = t
  listeners.forEach((l) => l())
}

export function snapshot(): Record<AtmosphereKind, number> {
  return { ...weights }
}
