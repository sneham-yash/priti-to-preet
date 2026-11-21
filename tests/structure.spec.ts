import { expect, test } from '@playwright/test'
import { openStory, pins, scrollToY } from './helpers'

test.describe('Structure & semantics', () => {
  test.beforeEach(async ({ page }) => openStory(page))

  test('TC-001 five sections in order, no nav/header/footer [FR-001]', async ({ page }) => {
    const ids = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id))
    expect(ids).toEqual(['opening', 'mountain', 'pearl', 'oasis', 'message'])
    await expect(page.locator('nav, header, footer')).toHaveCount(0)
  })

  test('TC-002 programmatic scrolling honoured, no CSS scroll-snap [FR-002]', async ({ page }) => {
    const snap = await page.evaluate(() =>
      Array.from(document.styleSheets).some((sheet) =>
        Array.from(sheet.cssRules).some((r) => r.cssText.includes('scroll-snap-type')),
      ),
    )
    expect(snap).toBe(false)
    await scrollToY(page, 3000, 300)
    expect(await page.evaluate(() => Math.round(window.scrollY))).toBe(3000)
  })

  test('TC-003 at most 3 pins, each ≤ 2.5 viewports [FR-003]', async ({ page }) => {
    const list = await pins(page)
    const vh = await page.evaluate(() => innerHeight)
    expect(list.length).toBeLessThanOrEqual(3)
    expect(list.length).toBe(3)
    for (const p of list) expect(p.end - p.start).toBeLessThanOrEqual(vh * 2.5 + 1)
  })

  test('TC-011 framing visible on first paint [FR-011]', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1, name: 'Collaboration Proposal' })).toBeInViewport()
    await expect(page.getByText('One unexpectedly memorable morning.')).toBeInViewport()
  })

  test('TC-053 "Priti" appears exactly once, inside the message [FR-053]', async ({ page }) => {
    const total = await page.evaluate(() => (document.body.innerText.match(/Priti/g) ?? []).length)
    const inMessage = await page.locator('#message').evaluate((el) => (el.textContent?.match(/Priti/g) ?? []).length)
    expect(total).toBe(1)
    expect(inMessage).toBe(1)
    expect(await page.title()).not.toContain('Priti')
    const metas = await page.locator('meta').evaluateAll((els) => els.map((e) => e.getAttribute('content') ?? '').join(' '))
    expect(metas).not.toContain('Priti')
  })

  test('TC-054 nothing interactive after the message [FR-054]', async ({ page }) => {
    const focusable = page.locator('#message').locator('a, button, input, select, textarea, [tabindex]')
    await expect(focusable).toHaveCount(0)
  })

  test('TC-061 revealed lines read as whole sentences [FR-061]', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Somewhere between the road ahead and the reflection behind me, I caught my first glimpse of you. The world carried on. Yet, for a moment, everything else went quiet. Like sunlight finding a distant snowy peak, something bright had found its way into an ordinary morning.' })).toHaveCount(1)
    await expect(page.getByRole('heading', { name: /^Not everything beautiful seeks attention\. Some things lie quietly beneath the surface, waiting to be noticed\./ })).toHaveCount(1)
    await expect(page.getByRole('heading', { name: /^The road went on\. The day went on\. But some encounters are like finding an oasis/ })).toHaveCount(1)
  })

  test('TC-111 one h1, every section labelled by a heading [NFR-021]', async ({ page }) => {
    await expect(page.locator('h1')).toHaveCount(1)
    const labelled = await page.locator('main > section').evaluateAll((els) =>
      els.map((s) => {
        const id = s.getAttribute('aria-labelledby')
        const target = id ? document.getElementById(id) : null
        return Boolean(target && /^H[1-6]$/.test(target.tagName) && target.textContent?.trim())
      }),
    )
    expect(labelled).toEqual([true, true, true, true, true])
    expect(await page.locator('html').getAttribute('lang')).toBe('en')
  })

  test('TC-131 noindex meta and robots.txt [NFR-032]', async ({ page, request }) => {
    expect(await page.locator('meta[name="robots"]').getAttribute('content')).toContain('noindex')
    const robots = await request.get('/robots.txt')
    expect(await robots.text()).toContain('Disallow: /')
  })
})
