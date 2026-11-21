import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { openStory, scrollToMessage, scrollToPin, scrollToY } from './helpers'

const WIDTHS = [320, 375, 390, 430, 768, 1024, 1440]

test.describe('Accessibility', () => {
  test('TC-110 axe: no serious or critical issues at the top and at the message [NFR-021, NFR-023]', async ({ page }) => {
    await openStory(page)
    const run = async () => {
      const result = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
      return result.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)
    }
    expect(await run()).toEqual([])
    await scrollToMessage(page)
    expect(await run()).toEqual([])
  })

  test('TC-112 keyboard reaches and operates the audio control with a visible focus ring [NFR-022]', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit does not Tab to buttons by default (macOS/iOS setting); covered by device testing.')
    await openStory(page)
    await page.keyboard.press('Tab')
    const btn = page.locator('.audio-control__button')
    await expect(btn).toBeFocused()
    const ring = await btn.evaluate((el) => getComputedStyle(el).outlineStyle + ' ' + getComputedStyle(el).outlineWidth)
    expect(ring).toBe('solid 2px')
    await page.keyboard.press('Enter')
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    await page.keyboard.press('Space')
    await expect(btn).toHaveAttribute('aria-pressed', 'false')
  })

  test('TC-113 text contrast on solid scenes [NFR-020]', async ({ page }) => {
    await openStory(page)
    // Text over solid backgrounds is measured exactly; text over imagery is checked visually (TC-091).
    const pairs = await page.evaluate(() => {
      const lum = (rgb: string) => {
        const [r, g, b] = (rgb.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number).map((v) => {
          const c = v / 255
          return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
        })
        return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0)
      }
      const ratio = (a: string, b: string) => {
        const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x)
        return ((l1 ?? 0) + 0.05) / ((l2 ?? 0) + 0.05)
      }
      const letter = getComputedStyle(document.querySelector('.letter')!)
      const message = getComputedStyle(document.querySelector('#message')!)
      const label = getComputedStyle(document.querySelector('#opening-title')!)
      return {
        letter: ratio(letter.color, message.backgroundColor),
        labelOnSlate: ratio(label.color, 'rgb(38, 55, 70)'),
      }
    })
    expect(pairs.letter).toBeGreaterThanOrEqual(4.5)
    expect(pairs.labelOnSlate).toBeGreaterThanOrEqual(4.5)
  })
})

test.describe('Layout', () => {
  test('TC-101 no horizontal overflow at any width or scroll position [NFR-011]', async ({ page }) => {
    await openStory(page)
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
      await page.waitForTimeout(700)
      const total = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
      for (const f of [0, 0.25, 0.5, 0.75, 1]) {
        await scrollToY(page, Math.round(total * f), 150)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `width ${width} at ${f}`).toBe(0)
      }
    }
  })

  test('TC-091 art-directed crops at every width (screenshots for visual review) [FR-091, FR-092]', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium-mobile', 'Screenshots are captured once, from one engine.')
    test.setTimeout(360_000)
    await openStory(page)
    for (const width of WIDTHS) {
      await page.setViewportSize({ width, height: width < 768 ? 844 : 900 })
      await page.waitForTimeout(600)
      for (const [i, label] of ['mountain', 'pearl', 'oasis'].entries()) {
        await scrollToPin(page, i, 1)
        await info.attach(`${label}-${width}`, { body: await page.screenshot(), contentType: 'image/png' })
      }
      await scrollToMessage(page)
      await info.attach(`message-${width}`, { body: await page.screenshot(), contentType: 'image/png' })
      await scrollToY(page, 0, 900)
      await info.attach(`opening-${width}`, { body: await page.screenshot(), contentType: 'image/png' })
    }
  })
})
