/**
 * DEF-08 (TBT): below-the-fold scenes build their ScrollTriggers in separate idle tasks
 * instead of one long start-up task. Jobs run strictly in registration order (= DOM order,
 * which pins rely on), and the whole queue is flushed at once the moment the reader starts
 * to scroll, so a scene can never be reached before its animation exists.
 */
type Job = () => void

const queue: { job: Job; cancelled: boolean }[] = []
let scheduled = false
let listening = false

const FLUSH_EVENTS = ['wheel', 'touchstart', 'keydown', 'scroll'] as const

const schedule = (fn: () => void) =>
  typeof window.requestIdleCallback === 'function'
    ? window.requestIdleCallback(fn, { timeout: 1200 })
    : window.setTimeout(fn, 60) // Safari < 18 has no requestIdleCallback

/** A failing job must not stall the scenes after it (their static final state still shows). */
function runSafely(entry: { job: Job; cancelled: boolean } | undefined): void {
  if (!entry || entry.cancelled) return
  try {
    entry.job()
  } catch (error) {
    if (import.meta.env.DEV) console.error(error)
  }
}

function runNext(): void {
  scheduled = false
  runSafely(queue.shift())
  if (queue.length > 0) {
    scheduled = true
    schedule(runNext)
  } else stopListening()
}

function flush(): void {
  while (queue.length > 0) runSafely(queue.shift())
  stopListening()
}

function stopListening(): void {
  if (!listening) return
  listening = false
  FLUSH_EVENTS.forEach((e) => window.removeEventListener(e, flush, true))
}

export function enqueue(job: Job): () => void {
  const entry = { job, cancelled: false }
  queue.push(entry)
  if (!listening) {
    listening = true
    FLUSH_EVENTS.forEach((e) => window.addEventListener(e, flush, { capture: true, passive: true, once: true }))
  }
  if (!scheduled) {
    scheduled = true
    schedule(runNext)
  }
  return () => {
    entry.cancelled = true
  }
}
