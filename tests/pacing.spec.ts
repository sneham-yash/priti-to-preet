import { expect, test, type Page } from '@playwright/test'
import { allOpacities, openStory, opacity, pins, scrollToY, settled, stopY, stops, wheelStep } from './helpers'

const ORDER = [
  'opening',
  'opening-story',
  'mountain-0',
  'mountain-1',
  'mountain-2',
  'pearl-0',
  'pearl-1',
  'pearl-2',
  'oasis-0',
  'oasis-1',
  'message',
]
const SCENES = { mountain: 3, pearl: 3, oasis: 2 } as const

const near = (a: number, b: number) => Math.abs(a - b) <= 2

/** The wheel can't be driven in mobile WebKit; stepping there is covered by keys and the device test (TC-175). */
const skipWheelOnMobileWebKit = (page: Page, browserName: string) =>
  test.skip(browserName === 'webkit' && (page.viewportSize()?.width ?? 0) < 768, 'Mobile WebKit has no wheel.')

test.describe('CR-02 stops and stepping', () => {
  test.beforeEach(async ({ page }) => openStory(page))

  test('TC-150 eleven stops in story order [FR-100]', async ({ page }) => {
    const list = await stops(page)
    expect(list.map((s) => s.id)).toEqual(ORDER)
    for (let i = 1; i < list.length; i++) expect(list[i]!.y).toBeGreaterThan(list[i - 1]!.y)
  })

  test('TC-151/152 one wheel gesture = one stop, all the way down and back [FR-002, FR-101]', async ({ page, browserName }) => {
    skipWheelOnMobileWebKit(page, browserName)
    test.setTimeout(120_000)
    const list = await stops(page)
    // FR-101: the step's own duration, measured in the page (first to last scroll event).
    await page.evaluate(() => {
      const w = window as Window & { __scrollTimes?: number[] }
      w.__scrollTimes = []
      window.addEventListener('scroll', () => w.__scrollTimes?.push(performance.now()), { passive: true })
    })
    for (let i = 1; i < list.length; i++) {
      await page.evaluate(() => ((window as Window & { __scrollTimes?: number[] }).__scrollTimes = []))
      const y = await wheelStep(page, 1)
      expect(near(y, list[i]!.y), `step ${i} → ${list[i]!.id} (at ${y}, want ${list[i]!.y})`).toBe(true)
      const ms = await page.evaluate(() => {
        const t = (window as Window & { __scrollTimes?: number[] }).__scrollTimes ?? []
        return t.length > 1 ? t[t.length - 1]! - t[0]! : 0
      })
      expect(ms, `step ${i} duration`).toBeLessThanOrEqual(2200 + 250) // ≤ 2.2 s, one frame-batch of slack
    }
    const back = await wheelStep(page, -1)
    expect(near(back, list[list.length - 2]!.y)).toBe(true)
  })

  test('TC-153 momentum: a burst of wheel events moves exactly one stop [FR-102]', async ({ page, browserName }) => {
    skipWheelOnMobileWebKit(page, browserName)
    // Fired in the page so the 16 ms spacing is real even when the test machine is busy.
    await page.evaluate(
      () =>
        new Promise<void>((done) => {
          let n = 0
          const fire = () => {
            document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 60, bubbles: true, cancelable: true }))
            if (++n < 10) window.setTimeout(fire, 16)
            else done()
          }
          fire()
        }),
    )
    const y = await settled(page)
    expect(near(y, await stopY(page, 'opening-story'))).toBe(true)
  })

  test('TC-154 keyboard steps, Home and End [FR-103]', async ({ page }) => {
    const list = await stops(page)
    const at = async (i: number) => expect(near(await settled(page), list[i]!.y), `at ${list[i]!.id}`).toBe(true)
    await page.keyboard.press('ArrowDown')
    await at(1)
    await page.keyboard.press('PageDown')
    await at(2)
    await page.keyboard.press('Space')
    await at(3)
    await page.keyboard.press('ArrowUp')
    await at(2)
    await page.keyboard.press('Shift+Space')
    await at(1)
    await page.keyboard.press('End')
    await at(list.length - 1)
    await page.keyboard.press('Home')
    await at(0)
  })

  test('TC-155 Space on the focused audio button plays music, not the page [FR-103]', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'WebKit does not Tab to buttons by default.')
    await page.keyboard.press('Tab')
    const btn = page.locator('.audio-control__button')
    await expect(btn).toBeFocused()
    await page.keyboard.press('Space')
    await expect(btn).toHaveAttribute('aria-pressed', 'true')
    expect(await settled(page)).toBe(0)
  })

  test('TC-156 native scrolling is never pulled back; the next gesture continues from there [FR-104]', async ({ page }) => {
    const a = await stopY(page, 'pearl-0')
    const b = await stopY(page, 'pearl-1')
    const mid = Math.round((a + b) / 2)
    await scrollToY(page, mid, 1200)
    expect(Math.round(await page.evaluate(() => window.scrollY))).toBe(mid)
    await page.keyboard.press('ArrowDown')
    expect(near(await settled(page), b)).toBe(true)
  })

  test('TC-157 nothing happens past either end [FR-105]', async ({ page }) => {
    await page.keyboard.press('ArrowUp')
    expect(await settled(page)).toBe(0)
    await page.keyboard.press('End')
    const end = await settled(page)
    await page.keyboard.press('ArrowDown')
    expect(near(await settled(page), end)).toBe(true)
  })

  test('TC-159 Ctrl+wheel (browser zoom) is not intercepted [FR-002]', async ({ page }) => {
    const prevented = await page.evaluate(() => {
      const e = new WheelEvent('wheel', { deltaY: 100, ctrlKey: true, bubbles: true, cancelable: true })
      document.body.dispatchEvent(e)
      return e.defaultPrevented
    })
    expect(prevented).toBe(false)
  })
})

test.describe('CR-02 beats', () => {
  test.beforeEach(async ({ page }) => openStory(page))

  test('TC-160 one beat at a time, each fully shown at its stop [FR-063, FR-064]', async ({ page }) => {
    test.setTimeout(120_000)
    for (const [scene, count] of Object.entries(SCENES)) {
      for (let i = 0; i < count; i++) {
        await scrollToY(page, Math.round(await stopY(page, `${scene}-${i}`)))
        for (let j = 0; j < count; j++) {
          const values = await allOpacities(page, `#${scene} [data-beat="${j}"] [data-reveal]`)
          expect(values.length).toBeGreaterThan(0)
          if (j === i) expect(Math.min(...values), `${scene} beat ${j} at stop ${i}`).toBeGreaterThanOrEqual(0.95)
          else expect(Math.max(...values), `${scene} beat ${j} at stop ${i}`).toBeLessThanOrEqual(0.05)
        }
      }
    }
    // FR-064: the last beat is still there at the very end of the hold.
    const list = await pins(page)
    await scrollToY(page, Math.round(list[2]!.end))
    expect(Math.min(...(await allOpacities(page, '#oasis [data-beat="1"] [data-reveal]')))).toBeGreaterThanOrEqual(0.95)
  })

  test('TC-163 the words wait for the light: pearl lit and oasis revealed first [FR-035, FR-043]', async ({ page }) => {
    const [, pearl, oasis] = await pins(page)
    // Just before the first beat starts rising (the stop sits 0.9 units after it starts).
    const before = async (pin: { start: number }, id: string) => {
      const y = await stopY(page, id)
      return Math.round(pin.start + (y - pin.start) * 0.5)
    }
    await scrollToY(page, await before(pearl!, 'pearl-0'))
    expect(await opacity(page, '.pearl')).toBeGreaterThanOrEqual(0.95)
    expect(Math.max(...(await allOpacities(page, '#pearl [data-reveal]')))).toBeLessThan(0.05)
    await scrollToY(page, await before(oasis!, 'oasis-0'))
    const right = await page.locator('.oasis__reveal').evaluate((el) => {
      const m = /inset\(\S+ (\S+?)%/.exec(getComputedStyle(el).clipPath)
      return m ? Number(m[1]) : 0
    })
    expect(right).toBe(0)
    expect(Math.max(...(await allOpacities(page, '#oasis [data-reveal]')))).toBeLessThan(0.05)
  })

  test('TC-162 beats never overflow at 320 or 1440 px [FR-067]', async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium-mobile', 'Layout is engine-independent; checked once.')
    test.setTimeout(240_000)
    for (const width of [320, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 640 : 900 })
      await page.waitForTimeout(700)
      for (const s of await stops(page)) {
        await scrollToY(page, Math.round(s.y), 1300)
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
        expect(overflow, `${s.id} at ${width}`).toBe(0)
        await info.attach(`${s.id}-${width}`, { body: await page.screenshot(), contentType: 'image/png' })
      }
    }
  })
})

test.describe('CR-02 music hint', () => {
  test('TC-170/171 playful hint first; a thank-you after play [FR-077, FR-078]', async ({ page }) => {
    await openStory(page)
    const hint = page.getByText('Psst… press play first')
    await expect(hint).toBeVisible()
    const control = page.locator('.audio-control')
    await expect(control).toHaveAttribute('data-hint', 'on')
    const pulse = () =>
      page.locator('.audio-control__button').evaluate((el) => getComputedStyle(el, '::before').animationName)
    expect(await pulse()).toBe('audio-pulse')
    await page.locator('.audio-control__button').click()
    await expect(page.getByText('Lovely. Now, scroll slowly.')).toBeVisible()
    await expect(hint).toBeHidden()
    await expect.poll(pulse).toBe('none')
    await expect.poll(() => opacity(page, '.scroll-cue__line')).toBeLessThan(0.05)
  })

  test('TC-172 the hint leaves with the first step and stays gone [FR-079]', async ({ page }) => {
    await openStory(page)
    await page.keyboard.press('ArrowDown')
    await settled(page)
    await page.waitForTimeout(700)
    expect(await opacity(page, '.scroll-cue')).toBeLessThan(0.1)
    await expect(page.locator('.audio-control')).toHaveAttribute('data-hint', 'off')
    await page.keyboard.press('Home')
    await settled(page)
    await page.waitForTimeout(700)
    expect(await opacity(page, '.scroll-cue')).toBeLessThan(0.1)
    await expect(page.locator('.audio-control')).toHaveAttribute('data-hint', 'off')
  })

  test('TC-173 no pulse under reduced motion [FR-079]', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' })
    await openStory(page)
    const name = await page
      .locator('.audio-control__button')
      .evaluate((el) => getComputedStyle(el, '::before').animationName)
    expect(name).toBe('none')
  })

  test('TC-174 the hint never collides with the control or the framing [FR-077]', async ({ page }) => {
    await openStory(page)
    for (const width of [320, 390, 1440]) {
      await page.setViewportSize({ width, height: width < 768 ? 568 : 900 })
      await page.waitForTimeout(500)
      const boxes = await page.evaluate(() => {
        const r = (s: string) => document.querySelector(s)!.getBoundingClientRect()
        return { hint: r('.scroll-cue'), btn: r('.audio-control__button'), framing: r('.opening__framing') }
      })
      const overlap = (a: DOMRect, b: DOMRect) =>
        a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
      expect(overlap(boxes.hint, boxes.btn), `hint vs button at ${width}`).toBe(false)
      expect(overlap(boxes.hint, boxes.framing), `hint vs framing at ${width}`).toBe(false)
      expect(boxes.hint.right).toBeLessThanOrEqual(width)
    }
  })
})

test.describe('CR-02 reduced motion', () => {
  test.use({ reducedMotion: 'reduce' })

  test('TC-158 no stepping: the wheel scrolls natively [FR-106]', async ({ page, browserName }) => {
    skipWheelOnMobileWebKit(page, browserName)
    await openStory(page)
    await wheelStep(page, 1)
    const y = await page.evaluate(() => window.scrollY)
    expect(y).toBeGreaterThan(0)
    expect(y).toBeLessThan(400)
  })

  test('TC-161 beats stack as paragraphs, every line visible, none overlapping [FR-066]', async ({ page }) => {
    await openStory(page)
    expect((await allOpacities(page, '[data-reveal]')).every((o) => o === 1)).toBe(true)
    for (const scene of Object.keys(SCENES)) {
      const rects = await page
        .locator(`#${scene} [data-beat]`)
        .evaluateAll((els) => els.map((e) => ({ top: e.getBoundingClientRect().top, bottom: e.getBoundingClientRect().bottom })))
      for (let i = 1; i < rects.length; i++) expect(rects[i]!.top).toBeGreaterThanOrEqual(rects[i - 1]!.bottom - 1)
    }
  })
})
