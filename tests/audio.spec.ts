import { expect, test } from '@playwright/test'
import { openStory, scrollToBottom, walkPage } from './helpers'

const button = (page: import('@playwright/test').Page) => page.locator('.audio-control__button')
const audioState = (page: import('@playwright/test').Page) =>
  page.locator('.audio-control audio').evaluate((a: HTMLAudioElement) => ({ paused: a.paused, volume: a.volume }))

test.describe('Audio', () => {
  test('TC-070 one fixed control, large enough, on screen [FR-070, NFR-013]', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await openStory(page)
    const btn = button(page)
    await expect(btn).toBeInViewport({ ratio: 1 })
    const box = await btn.boundingBox()
    expect(box?.width).toBeGreaterThanOrEqual(44)
    expect(box?.height).toBeGreaterThanOrEqual(44)
    expect(await page.locator('.audio-control').evaluate((el) => getComputedStyle(el).position)).toBe('fixed')
  })

  test('TC-071 nothing autoplays or downloads before a tap [FR-071]', async ({ page }) => {
    const audioRequests: string[] = []
    page.on('request', (r) => {
      if (r.url().includes('/audio/')) audioRequests.push(r.url())
    })
    await openStory(page)
    await walkPage(page, 120)
    expect(audioRequests).toEqual([])
    expect((await audioState(page)).paused).toBe(true)
    expect(await page.locator('.audio-control audio').getAttribute('preload')).toBe('none')
  })

  test('TC-072/073/074 play, fade in, pause; state is announced; scrolling never interrupts [FR-072–FR-074]', async ({ page, browserName }) => {
    await openStory(page)
    const btn = button(page)
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await expect(btn).toHaveAttribute('aria-label', 'Play music')
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await expect(btn).toHaveAttribute('aria-label', 'Pause music')
    expect((await audioState(page)).paused).toBe(false)
    // Sound has genuinely started (not merely been requested).
    await expect
      .poll(() => page.locator('.audio-control audio').evaluate((el: HTMLAudioElement) => el.currentTime), {
        message: 'playback actually started',
        timeout: 10_000,
      })
      .toBeGreaterThan(0)
    if (browserName !== 'webkit') {
      // The ramp has begun but has not yet reached its target: a fade, not a jump.
      await expect.poll(async () => (await audioState(page)).volume, { timeout: 5000 }).toBeGreaterThan(0)
      expect((await audioState(page)).volume).toBeLessThan(0.7)
      await expect.poll(async () => (await audioState(page)).volume, { timeout: 5000 }).toBeCloseTo(0.7, 1)
    }
    await scrollToBottom(page)
    expect((await audioState(page)).paused).toBe(false)
    await btn.click()
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
    await page.waitForTimeout(1000)
    expect((await audioState(page)).paused).toBe(true)
  })

  test('TC-075 a missing track fails quietly [FR-075]', async ({ page, browserName }) => {
    test.skip(
      browserName === 'webkit',
      'BLOCKED: Playwright request interception does not apply to WebKit media loads on Windows (the real file still loads), so a 404 cannot be simulated here.',
    )
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.route('**/audio/track.mp3', (route) => route.fulfill({ status: 404, body: '' }))
    await openStory(page)
    await button(page).click()
    await expect(page.locator('.audio-control')).toHaveCount(0, { timeout: 6000 })
    expect(errors).toEqual([])
  })
})
