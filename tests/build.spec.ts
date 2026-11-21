import { expect, test } from '@playwright/test'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { gzipSync } from 'node:zlib'
import { openStory, walkPage } from './helpers'

const dist = path.resolve(import.meta.dirname, '..', 'dist')
const src = path.resolve(import.meta.dirname, '..', 'src')

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    return statSync(full).isDirectory() ? files(full) : [full]
  })
}
const textFiles = () => files(dist).filter((f) => /\.(html|js|css|txt|svg|json)$/.test(f))
const read = (f: string) => readFileSync(f, 'utf8')

test.describe('Build output (static checks)', () => {
  test.beforeEach(({ browserName }, info) => {
    void browserName
    test.skip(info.project.name !== 'chromium-mobile', 'Static checks run once.')
  })

  test('TC-014 no brand, app or time details anywhere [FR-014, NFR-033]', () => {
    for (const f of textFiles()) expect(read(f), f).not.toMatch(/hopper/i)
    const copy = read(path.join(src, 'content', 'copy.ts'))
    expect(copy).not.toMatch(/\b\d{1,2}[:.]\d{2}\s?(am|pm)?\b/i)
  })

  test('TC-053b the name never leaks into title, meta, filenames or paths [FR-053]', () => {
    const html = read(path.join(dist, 'index.html'))
    const head = html.slice(0, html.indexOf('</head>'))
    expect(head).not.toContain('Priti')
    for (const f of files(dist)) expect(path.relative(dist, f)).not.toMatch(/priti|preet/i)
    // The words exist exactly once in the app bundle and once in the no-JS fallback (which only renders without JS).
    const jsCount = files(dist).filter((f) => f.endsWith('.js')).reduce((n, f) => n + (read(f).match(/Priti/g) ?? []).length, 0)
    expect(jsCount).toBe(1)
    expect((html.match(/Priti/g) ?? []).length).toBe(1)
  })

  test('TC-076 the track is served under a neutral path [FR-076]', () => {
    const audio = files(dist).filter((f) => /\.(mp3|m4a|ogg|wav)$/i.test(f)).map((f) => path.relative(dist, f).replace(/\\/g, '/'))
    expect(audio).toEqual(['audio/track.mp3'])
  })

  test('TC-120 JavaScript ≤ 130 KB gzipped [NFR-001]', () => {
    const gz = files(dist).filter((f) => f.endsWith('.js')).reduce((n, f) => n + gzipSync(readFileSync(f)).length, 0)
    test.info().annotations.push({ type: 'js-gzip-bytes', description: String(gz) })
    expect(gz).toBeLessThanOrEqual(130 * 1024)
  })

  test('TC-121a every mobile (portrait, AVIF) variant ≤ 200 KB [NFR-002]', () => {
    const portrait = files(dist).filter((f) => /-p-\d+\.avif$/.test(f))
    expect(portrait.length).toBeGreaterThan(0)
    for (const f of portrait) expect(statSync(f).size, path.basename(f)).toBeLessThanOrEqual(200 * 1024)
  })

  test('TC-102/103 viewport units and safe areas are used [NFR-012, NFR-013]', () => {
    const css = files(dist).filter((f) => f.endsWith('.css')).map(read).join('\n')
    expect(css).toMatch(/\d+svh/)
    expect(css).toMatch(/\d+lvh/)
    expect(css).toContain('safe-area-inset-bottom')
  })

  test('TC-052/060 motion vocabulary: no bounce/elastic/back; one fade in the message [FR-052, FR-060, UX-006]', () => {
    const sources = files(src).filter((f) => /\.(ts|tsx)$/.test(f)).map(read).join('\n')
    expect(sources).not.toMatch(/(bounce|elastic|back)\.(in|out|inOut)/)
    const message = read(path.join(src, 'scenes', 'FinalMessage.tsx'))
    expect((message.match(/gsap\.(to|from|fromTo)\(/g) ?? []).length).toBe(1)
    expect(message).toMatch(/\{ opacity: 0 \}/)
  })

  test('TC-131b deployment headers include noindex [NFR-032]', () => {
    const vercel = JSON.parse(read(path.resolve(dist, '..', 'vercel.json'))) as { headers: { headers: { key: string; value: string }[] }[] }
    const all = vercel.headers.flatMap((h) => h.headers)
    expect(all.find((h) => h.key === 'X-Robots-Tag')?.value).toContain('noindex')
  })
})

test.describe('Network budgets (mobile)', () => {
  test.beforeEach(({ browserName }, info) => {
    void browserName
    test.skip(info.project.name !== 'chromium-mobile', 'Measured on the mobile profile.')
  })

  test('TC-122/121b initial transfer ≤ 350 KB; images over a full read ≤ 2 MB [NFR-002, NFR-003]', async ({ page }) => {
    let initial = 0
    let images = 0
    let phase: 'initial' | 'reading' = 'initial'
    page.on('requestfinished', async (req) => {
      const sizes = await req.sizes().catch(() => null)
      const bytes = sizes ? sizes.responseBodySize + sizes.responseHeadersSize : 0
      if (phase === 'initial' && !req.url().includes('/images/')) initial += bytes
      if (req.url().includes('/images/')) images += bytes
    })
    await openStory(page)
    await page.waitForTimeout(800)
    phase = 'reading'
    const initialKB = Math.round(initial / 1024)
    await walkPage(page, 350)
    await page.waitForTimeout(800)
    const imagesKB = Math.round(images / 1024)
    test.info().annotations.push({ type: 'initial-kb (non-image)', description: String(initialKB) })
    test.info().annotations.push({ type: 'images-kb (full read)', description: String(imagesKB) })
    expect(initialKB).toBeLessThanOrEqual(350)
    expect(imagesKB).toBeLessThanOrEqual(2048)
  })
})

test.describe('Scroll performance (mobile, 4× CPU throttle)', () => {
  test.beforeEach(({ browserName }, info) => {
    void browserName
    test.skip(info.project.name !== 'chromium-mobile', 'CPU throttling via CDP is Chromium-only.')
  })

  test('TC-124 no long tasks over 50 ms while scrolling [NFR-005, NFR-007] @perf', async ({ page }) => {
    await openStory(page)
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 })
    await page.evaluate(() => {
      const w = window as Window & { __long?: number[] }
      w.__long = []
      new PerformanceObserver((list) => list.getEntries().forEach((e) => w.__long?.push(Math.round(e.duration)))).observe({
        type: 'longtask',
      })
    })
    await walkPage(page, 400)
    const long = await page.evaluate(() => (window as Window & { __long?: number[] }).__long ?? [])
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 })
    test.info().annotations.push({ type: 'long-tasks-ms', description: JSON.stringify(long) })
    expect(long).toEqual([])
  })
})
