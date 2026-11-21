import { expect, type Page } from '@playwright/test'

/** Scrub smoothing is 1s; give timelines time to settle after a jump. */
export const SETTLE_MS = 1700

export async function openStory(page: Page, path = '/'): Promise<void> {
  await page.addInitScript(() => {
    ;(window as Window & { __PROBE_ENABLED__?: boolean }).__PROBE_ENABLED__ = true
  })
  await page.goto(path, { waitUntil: 'networkidle' })
  await page.waitForFunction(() => document.fonts.status === 'loaded')
  // Below-the-fold scenes are built in idle tasks (DEF-08); wait until all three pins exist.
  await page.waitForFunction(
    () =>
      window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
      document.querySelector('.static-story') !== null ||
      (window.__probe?.scrollTrigger.getAll().filter((t) => t.pin).length ?? 0) === 3,
    undefined,
    { timeout: 10_000 },
  )
  await page.waitForTimeout(400)
}

export async function scrollToY(page: Page, y: number, settle = SETTLE_MS): Promise<void> {
  await page.evaluate((top) => window.scrollTo(0, top), y)
  await page.waitForTimeout(settle)
}

interface PinInfo {
  start: number
  end: number
}

/** Pinned scenes in document order: 0 = mountain, 1 = pearl, 2 = oasis. */
export async function pins(page: Page): Promise<PinInfo[]> {
  return page.evaluate(() => {
    const st = window.__probe?.scrollTrigger
    if (!st) return []
    return st
      .getAll()
      .filter((t) => Boolean(t.pin))
      .map((t) => ({ start: t.start, end: t.end }))
      .sort((a, b) => a.start - b.start)
  })
}

/** Scroll to a given progress (0..1) through a pinned scene's hold. */
export async function scrollToPin(page: Page, index: number, progress: number): Promise<void> {
  const list = await pins(page)
  const pin = list[index]
  expect(pin, `pin #${index} exists`).toBeTruthy()
  if (!pin) return
  await scrollToY(page, Math.round(pin.start + (pin.end - pin.start) * progress))
}

export async function opacity(page: Page, selector: string): Promise<number> {
  return page.locator(selector).first().evaluate((el) => Number(getComputedStyle(el).opacity))
}

export async function allOpacities(page: Page, selector: string): Promise<number[]> {
  return page.locator(selector).evaluateAll((els) => els.map((el) => Number(getComputedStyle(el).opacity)))
}

export async function atmosphere(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => window.__probe?.atmosphere() ?? {})
}

export async function scrollToMessage(page: Page): Promise<void> {
  const y = await page.locator('.letter').evaluate((el) => el.getBoundingClientRect().top + window.scrollY)
  await scrollToY(page, Math.round(y))
}

export async function scrollToBottom(page: Page): Promise<void> {
  await scrollToY(page, await page.evaluate(() => document.documentElement.scrollHeight))
}

/** Walks the whole page in viewport-sized steps, like a reader would. */
export async function walkPage(page: Page, settle = 250): Promise<void> {
  const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
  const step = await page.evaluate(() => innerHeight * 0.8)
  for (let y = 0; y <= total + step; y += step) await scrollToY(page, Math.min(y, total), settle)
}

export interface Stop {
  id: string
  y: number
}

/** CR-02 stops, as registered by the scenes (FR-100). */
export async function stops(page: Page): Promise<Stop[]> {
  return page.evaluate(() => window.__probe?.stops?.() ?? [])
}

export async function stopY(page: Page, id: string): Promise<number> {
  const stop = (await stops(page)).find((s) => s.id === id)
  expect(stop, `stop ${id} exists`).toBeTruthy()
  return stop?.y ?? 0
}

/** Waits until the page has stopped moving (a step has finished). */
export async function settled(page: Page, quietMs = 350, timeout = 6000): Promise<number> {
  const start = Date.now()
  let last = await page.evaluate(() => window.scrollY)
  let quietSince = Date.now()
  while (Date.now() - start < timeout) {
    await page.waitForTimeout(50)
    const y = await page.evaluate(() => window.scrollY)
    if (Math.abs(y - last) > 0.5) {
      last = y
      quietSince = Date.now()
    } else if (Date.now() - quietSince >= quietMs) return y
  }
  return last
}

/** One wheel gesture (a single notch), then wait for the step to finish. */
export async function wheelStep(page: Page, direction: 1 | -1): Promise<number> {
  const vp = page.viewportSize()
  await page.mouse.move((vp?.width ?? 400) / 2, (vp?.height ?? 800) / 2)
  await page.mouse.wheel(0, 120 * direction)
  await page.waitForTimeout(120)
  return settled(page)
}
