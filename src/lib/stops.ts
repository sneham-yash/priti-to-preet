/**
 * FR-100 / AD-10: named scroll positions the story rests on. Each stop is a function, so its
 * position is read fresh after any ScrollTrigger refresh (resize, fonts, pin changes).
 */
export interface Stop {
  id: string
  y: number
}

const registry = new Map<string, () => number>()

/** Returns an unregister function (call it from the scene's cleanup). */
export function registerStop(id: string, y: () => number): () => void {
  registry.set(id, y)
  return () => {
    if (registry.get(id) === y) registry.delete(id)
  }
}

/** All stops in page order, clamped to the scrollable range. */
export function listStops(): Stop[] {
  const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
  return Array.from(registry, ([id, y]) => ({ id, y: Math.round(Math.min(max, Math.max(0, y()))) })).sort(
    (a, b) => a.y - b.y,
  )
}
