import { expect, test } from '@playwright/test'
import {
  allOpacities,
  atmosphere,
  openStory,
  opacity,
  pins,
  scrollToMessage,
  scrollToPin,
  scrollToY,
  walkPage,
} from './helpers'

const visible = (values: number[]) => values.every((v) => v > 0.95)

test.describe('Scroll storytelling', () => {
  test.beforeEach(async ({ page }) => openStory(page))

  test('TC-012 the joke steps aside; the story appears on first scroll [FR-012]', async ({ page }) => {
    const vh = await page.evaluate(() => innerHeight)
    await scrollToY(page, vh, 2200)
    expect(await opacity(page, '.opening__framing')).toBeLessThan(0.1)
    expect(visible(await allOpacities(page, '.opening__story [data-reveal]'))).toBe(true)
  })

  test('TC-013 scroll cue leaves and stays gone [FR-013]', async ({ page }) => {
    expect(await opacity(page, '.scroll-cue')).toBeGreaterThan(0.5)
    const vh = await page.evaluate(() => innerHeight)
    await scrollToY(page, Math.round(vh * 0.2), 1200)
    expect(await opacity(page, '.scroll-cue')).toBeLessThan(0.1)
    await scrollToY(page, 0, 1200)
    expect(await opacity(page, '.scroll-cue')).toBeLessThan(0.1)
  })

  test('TC-020/022/024 mountain: rain cleared, sun warms, words arrive [FR-020, FR-022, FR-024]', async ({ page }) => {
    await scrollToPin(page, 0, 0)
    expect((await atmosphere(page)).rain).toBeLessThan(0.05)
    const sunStart = await opacity(page, '.mountain__sun')
    await scrollToPin(page, 0, 1)
    expect(await opacity(page, '.mountain__sun')).toBeGreaterThan(sunStart + 0.5)
    expect(visible(await allOpacities(page, '.mountain__text [data-reveal]'))).toBe(true)
  })

  test('TC-021 mountain image motion stays within limits [FR-021]', async ({ page }) => {
    await scrollToPin(page, 0, 0)
    const m = await page.locator('.mountain__image').evaluate((el) => new DOMMatrix(getComputedStyle(el).transform))
    const width = await page.locator('.mountain__image').evaluate((el) => (el as HTMLElement).offsetWidth)
    expect(m.a).toBeLessThanOrEqual(1.0601)
    expect(Math.abs(m.e) / width).toBeLessThanOrEqual(0.06)
  })

  test('TC-030 snow becomes suspended specks [FR-030]', async ({ page }) => {
    await scrollToPin(page, 1, 0)
    const a = await atmosphere(page)
    expect(a.snow).toBeLessThan(0.05)
    expect(a.specks).toBeGreaterThan(0.95)
  })

  test('TC-032 the pearl is built from light, not an image [FR-032]', async ({ page }) => {
    const pearl = page.locator('.pearl')
    await expect(pearl.locator('img')).toHaveCount(0)
    const { size, vmin } = await pearl.evaluate((el) => ({
      size: el.getBoundingClientRect().width,
      vmin: Math.min(innerWidth, innerHeight) / 100,
    }))
    expect(size).toBeLessThanOrEqual(180.5)
    expect(size).toBeGreaterThanOrEqual(Math.min(18 * vmin, 180) - 1)
    expect(size).toBeLessThanOrEqual(28 * vmin + 1)
  })

  test('TC-033/035 the pearl is discovered, then the words [FR-033, FR-035]', async ({ page }) => {
    await scrollToPin(page, 1, 0)
    expect(await opacity(page, '.pearl')).toBeLessThanOrEqual(0.15)
    await scrollToPin(page, 1, 0.4)
    expect(Math.max(...(await allOpacities(page, '.pearl__text [data-reveal]')))).toBeLessThan(0.1)
    await scrollToPin(page, 1, 0.7)
    expect(await opacity(page, '.pearl')).toBeGreaterThanOrEqual(0.95)
    await scrollToPin(page, 1, 1)
    expect(visible(await allOpacities(page, '.pearl__text [data-reveal]'))).toBe(true)
  })

  test('TC-034 ambient loops pause off-screen [FR-034]', async ({ page }) => {
    await expect(page.locator('#pearl')).not.toHaveClass(/is-visible/)
    await expect(page.locator('#opening')).toHaveClass(/is-visible/)
  })

  test('TC-041/043 oasis revealed left to right, then the words [FR-041, FR-043]', async ({ page }) => {
    const right = () =>
      page.locator('.oasis__reveal').evaluate((el) => {
        const m = /inset\(\S+ (\S+?)%/.exec(getComputedStyle(el).clipPath)
        return m ? Number(m[1]) : 0
      })
    await scrollToPin(page, 2, 0)
    expect(await right()).toBeGreaterThanOrEqual(99.9)
    await scrollToPin(page, 2, 0.35)
    const mid = await right()
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(100)
    await scrollToPin(page, 2, 1)
    expect(await right()).toBe(0)
    expect(visible(await allOpacities(page, '.oasis__text [data-reveal]'))).toBe(true)
  })

  test('TC-050/125 effects stop before the message; the loop goes idle [FR-050, NFR-006]', async ({ page }) => {
    await scrollToMessage(page)
    const a = await atmosphere(page)
    expect(Object.values(a).every((v) => v === 0)).toBe(true)
    await page.waitForTimeout(300)
    expect(await page.evaluate(() => window.__probe?.particleLoopRunning)).toBe(false)
  })

  test('TC-051 a plain letter on ivory [FR-051, UX-009]', async ({ page }) => {
    await scrollToMessage(page)
    const style = await page.locator('#message').evaluate((el) => {
      const cs = getComputedStyle(el)
      return { bg: cs.backgroundColor, color: cs.color }
    })
    expect(style.bg).toBe('rgb(246, 243, 237)')
    expect(style.color).toBe('rgb(37, 37, 37)')
    await expect(page.locator('#message img, #message canvas, #message picture')).toHaveCount(0)
    expect(await opacity(page, '.letter')).toBeGreaterThan(0.95)
    expect(await page.locator('.letter').evaluate((el) => getComputedStyle(el).fontStyle)).toBe('normal')
  })

  test('TC-004 scrolling back to the top restores the opening [FR-004]', async ({ page }) => {
    await walkPage(page)
    await scrollToY(page, 0, 2200)
    expect(await opacity(page, '.opening__framing')).toBeGreaterThan(0.95)
    expect(Math.max(...(await allOpacities(page, '.opening__story [data-reveal]')))).toBeLessThan(0.05)
    expect((await atmosphere(page)).rain).toBe(1)
    const progress = await page.evaluate(() =>
      window.__probe?.scrollTrigger.getAll().filter((t) => t.pin).map((t) => t.progress),
    )
    expect(progress).toEqual([0, 0, 0])
  })

  test('TC-023/042 particle caps [FR-023, FR-042]', async ({ page }) => {
    const counts = await page.evaluate(() => window.__probe?.particles ?? {})
    const desktop = await page.evaluate(() => innerWidth >= 768)
    expect(counts.snow).toBeGreaterThan(0)
    expect(counts.snow).toBeLessThanOrEqual(desktop ? 120 : 60)
    expect(counts.motes).toBeLessThanOrEqual(desktop ? 40 : 30)
  })

  test('TC-005 resizing mid-scene keeps the story intact [FR-005]', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 })
    await page.waitForTimeout(600)
    await scrollToPin(page, 1, 0.5)
    await page.setViewportSize({ width: 390, height: 844 })
    await page.waitForTimeout(1500)
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBe(0)
    const list = await pins(page)
    expect(list.length).toBe(3)
    for (let i = 1; i < list.length; i++) expect(list[i]!.start).toBeGreaterThan(list[i - 1]!.end)
    await expect(page.locator('#pearl')).toBeInViewport()
  })
})
