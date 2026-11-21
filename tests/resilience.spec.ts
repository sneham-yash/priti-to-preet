import { expect, test } from '@playwright/test'
import { allOpacities, openStory, scrollToMessage, walkPage } from './helpers'

test.describe('Reduced motion, failure and privacy', () => {
  test('TC-062 reduced motion: no pins, no particles, every word visible [FR-062, FR-090]', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page)
    expect(await page.evaluate(() => window.__probe?.scrollTrigger.getAll().length)).toBe(0)
    await expect(page.locator('canvas')).toHaveCount(0)
    await walkPage(page, 100)
    expect((await allOpacities(page, '[data-reveal]')).every((o) => o === 1)).toBe(true)
    expect(Number(await page.locator('.letter').evaluate((el) => getComputedStyle(el).opacity))).toBe(1)
    expect(await page.locator('.oasis__reveal').evaluate((el) => getComputedStyle(el).clipPath)).toBe('none')
  })

  test('TC-133 switching to reduced motion at runtime reverts every animation [NFR-042]', async ({ page }) => {
    await openStory(page)
    expect(await page.evaluate(() => window.__probe?.scrollTrigger.getAll().length)).toBeGreaterThan(0)
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await page.waitForTimeout(500)
    expect(await page.evaluate(() => window.__probe?.scrollTrigger.getAll().length)).toBe(0)
    await expect(page.locator('.pin-spacer')).toHaveCount(0)
    expect(await page.locator('.oasis__reveal').evaluate((el) => getComputedStyle(el).clipPath)).toBe('none')
    expect((await allOpacities(page, '[data-reveal]')).every((o) => o === 1)).toBe(true)
  })

  test('TC-082 every image blocked: the story still reads [FR-082]', async ({ page }) => {
    await page.route('**/images/**', (route) => route.abort())
    await openStory(page)
    await walkPage(page, 400)
    const states = await page.locator('.scene-image').evaluateAll((els) => els.map((e) => e.getAttribute('data-state')))
    expect(states.every((s) => s !== 'loaded')).toBe(true)
    await scrollToMessage(page)
    await expect(page.getByText('I thought you were beautiful.')).toBeVisible()
  })

  test('TC-083 a render failure falls back to the plain story [FR-083]', async ({ page }) => {
    await openStory(page, '/?__fail=1')
    await expect(page.locator('.static-story')).toBeVisible()
    await expect(page.locator('.static-story')).toContainText('if you’d like that too.')
    await expect(page.locator('.static-story')).toContainText('into an ordinary morning.')
  })

  test('TC-130 no third-party requests, cookies or storage [NFR-030, NFR-031]', async ({ page, context, baseURL }) => {
    const foreign: string[] = []
    page.on('request', (r) => {
      if (!r.url().startsWith(baseURL ?? 'http://localhost:4173') && !r.url().startsWith('data:')) foreign.push(r.url())
    })
    await openStory(page)
    await walkPage(page, 150)
    expect(foreign).toEqual([])
    expect(await context.cookies()).toEqual([])
    expect(await page.evaluate(() => localStorage.length + sessionStorage.length)).toBe(0)
  })

  test('TC-132 a full read produces no console errors or warnings [NFR-043]', async ({ page }) => {
    const messages: string[] = []
    page.on('console', (m) => {
      if (m.type() === 'error' || m.type() === 'warning') messages.push(`${m.type()}: ${m.text()}`)
    })
    page.on('pageerror', (e) => messages.push(`pageerror: ${e.message}`))
    await openStory(page)
    await walkPage(page, 300)
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(800)
    expect(messages).toEqual([])
  })
})

test.describe('No JavaScript', () => {
  test.use({ javaScriptEnabled: false })
  test('TC-084 the message is still delivered [FR-084]', async ({ page }) => {
    await page.goto('/')
    const letter = page.locator('.noscript-letter')
    await expect(letter).toBeVisible()
    await expect(letter).toContainText('Priti,')
    await expect(letter).toContainText('I thought you were beautiful.')
  })
})
