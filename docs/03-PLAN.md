# An Unusual Collaboration: Technical Plan

| | |
|---|---|
| **Phase** | 4 of the HTD workflow (Plan) |
| **Status** | Approved. The owner gave blanket approval on 2026-11-21 ("approved all from my side"). |
| **Based on** | [01-FSD.md](01-FSD.md) v1.1 · [02-SCOPE.md](02-SCOPE.md) v1.1. Section H covers CR-02 (approved with defaults). |

---

## A. Architecture

A static single-page site. React only owns structure. GSAP owns motion, through refs. Colour transitions between scenes are **pure CSS** (gradients you scroll through), so they cost no JS and still work with reduced motion.

```
index.html ─ main.tsx ─ <ErrorBoundary fallback={<StaticStory/>}>
                          <App>
                            <ParticleField/>        fixed full-viewport canvas (rain → snow → specks → motes)
                            <main>
                              <OpeningScene/>       section 1  (not held)
                              <MountainScene/>      section 2  = approach zone + held stage
                              <PearlScene/>         section 3  = approach zone + held stage
                              <OasisScene/>         section 4  = approach zone + held stage
                              <FinalMessage/>       section 5  = fade-to-ivory zone + letter
                            </main>
                            <AudioControl/>         fixed, bottom-right
```

**Key design decisions**

| # | Decision | Why |
|---|---|---|
| AD-1 | **Approach zones:** each metaphor section starts with a ~100 svh tall `linear-gradient(previous colour → this colour)`. Scrolling through it *is* the colour transition. | No JS colour tweening, nothing to clean up, reversible by definition, works with reduced motion. Covers FR-020/030/040/050 and UX-004. |
| AD-2 | **One shared particle canvas** (fixed, `pointer-events:none`, `aria-hidden`), driven by a mutable `atmosphere` object `{rain, snow, specks, motes}` with weights from 0 to 1. Each approach zone's ScrollTrigger hands one weight over to the next in `onUpdate`. | Snow literally carries on into the ocean specks (FR-030). One rAF loop and one canvas. Pauses itself when all weights are 0 or the tab is hidden (NFR-006). |
| AD-3 | **One scrubbed, held timeline per metaphor scene** (`pin: stage`, `end: +=120%/150%`). | ≤ 3 held scenes (FR-003). Scrubbing makes everything reversible (FR-004). |
| AD-4 | **`useSceneAnimation(scopeRef, setup)` hook:** `useLayoutEffect` → `gsap.context()` + `gsap.matchMedia()`. Animations only exist under `(prefers-reduced-motion: no-preference)`. Cleanup calls `ctx.revert()`. | Correct under React 19 StrictMode double-mounting (R-15), and no leftover triggers (NFR-042). Reduced motion falls out of the static final-state CSS (FR-090). |
| AD-5 | **Static CSS = the final visual state.** GSAP sets the *from* states (`fromTo`) inside the layout effect, before paint. | If JS or animation fails, everything is visible (FR-062, FR-082, FR-083). |
| AD-6 | **All copy in `src/content/copy.ts`**, as arrays of manually broken lines. | One place to change wording (NFR-041, OI-01). Lines can be revealed individually without splitting words (FR-061). |
| AD-7 | **Generated image manifest:** a Node script (`scripts/build-images.mjs`, using sharp) turns `design/source-images/*` into AVIF and WebP, landscape and portrait (focal-point crops), and writes `src/content/images.generated.ts`. | Art direction (FR-091). Byte budgets (NFR-002). Swapping in the high-res oasis later is just "drop the file and rerun" (OI-02). |
| AD-8 | **Ambient CSS loops** (fog, bokeh, ray shimmer, cue) run only while their section has `.is-visible`, toggled by one ScrollTrigger per section. | Off-screen work stops (FR-034, NFR-006). |

## B. Dependency Evaluation

| Candidate | Verdict | Reasoning |
|---|---|---|
| **GSAP + ScrollTrigger** | ✅ Use | The industry standard for scrubbed, held scroll storytelling. Handles iOS address-bar resizing (`ignoreMobileResize`), refreshes on resize, `matchMedia` for reduced motion, and cleans up with `context`. Free licence, including commercial use. ~45 KB gz together. |
| Motion (Framer Motion) | ❌ | Overlaps with GSAP. Weaker at holding scenes in place and orchestrating scrubbed timelines. Would add ~35 KB for no gain. |
| Native CSS scroll-driven animations (`animation-timeline`) | ❌ for now | Not in Safari 16/17, and iOS is the primary target. |
| CSS scroll snap / FullPage.js | ❌ | CSS snap can't step through pinned, scrubbed scenes; fullPage.js needs a licence, adds ~40 KB and fights ScrollTrigger. Stepping uses GSAP Observer (already inside ScrollTrigger), AD-10. |
| Lenis | ❌ | Native scrolling plus scrubbing (`scrub: 1`) already smooths visuals. Lenis would intercept touch scrolling on iOS (an a11y and hijacking concern) and adds a library. |
| Three.js / WebGL | ❌ | A CSS-gradient pearl gives the look we want for ~0 KB. Three would add ~150 KB, GPU cost on phones and a WebGL fallback path. |
| Particle library (tsParticles etc.) | ❌ | ~60+ KB for what fits in ~150 lines of canvas code. |
| Slider/carousel library | ❌ | No slider pattern in the FSD. |
| Lucide icons | ❌ | Only one icon is needed (play/pause), so it's inline SVG. |
| `@gsap/react` (`useGSAP`) | ❌ | It's an 11-line pattern. Our own hook avoids a 4th runtime dependency (Scope §6). |
| Tailwind CSS v4 | ✅ (build-time) | Layout, spacing and type utilities plus `@theme` tokens. Zero runtime. Effect-specific CSS lives in small per-scene CSS files. |
| `@fontsource/*` | ✅ | Self-hosted OFL fonts with no Google requests (NFR-031). Latin subset and only the weights used. |
| sharp (dev) | ✅ | Generates AVIF and WebP and the crops. Never shipped. |
| Playwright + @axe-core/playwright (dev) | ✅ | Automated functional, layout, reduced-motion and accessibility tests in Chromium and WebKit. |
| Lighthouse (dev, via npx) | ✅ | Performance verification (NFR-004). |

## C. Final Stack

| Package | Version | Role |
|---|---|---|
| react, react-dom | 19.x | UI |
| gsap | 3.15.x | Animation + ScrollTrigger |
| @fontsource/cormorant-garamond, @fontsource/manrope | 5.x | Fonts |
| *dev:* vite 8, @vitejs/plugin-react 6, typescript **6.0.x** (7.x is not supported by typescript-eslint yet), tailwindcss 4 + @tailwindcss/vite, eslint 10 + typescript-eslint, sharp, @playwright/test, @axe-core/playwright | | Build, lint, assets, tests |

## D. Project Structure

```
priti_to_preet/
├─ design/source-images/        originals (not shipped)
├─ docs/                        FSD, scope, plan, tasks, tests, reports
├─ public/
│  ├─ audio/track.mp3
│  ├─ images/                   generated: {scene}-{l|p}-{w}.{avif,webp}
│  ├─ favicon.svg  robots.txt
├─ scripts/build-images.mjs
├─ src/
│  ├─ main.tsx  App.tsx
│  ├─ content/copy.ts  images.generated.ts
│  ├─ lib/gsap.ts  atmosphere.ts  device.ts
│  ├─ hooks/useSceneAnimation.ts
│  ├─ components/  LineReveal  SceneImage  ParticleField  AudioControl  ErrorBoundary  StaticStory
│  ├─ scenes/      OpeningScene  MountainScene  PearlScene  OasisScene  FinalMessage
│  └─ styles/      index.css (tokens, base)  scenes.css (effects)
├─ tests/                       Playwright specs
├─ vercel.json  playwright.config.ts  vite.config.ts  tsconfig*.json  eslint.config.js
```

## E. Animation Architecture

- **Registration:** `lib/gsap.ts` registers ScrollTrigger once and sets `ScrollTrigger.config({ ignoreMobileResize: true })`. It also sets `gsap.defaults({ ease: 'power2.out' })`.
- **Lifecycle:** every scene calls `useSceneAnimation(ref, (ctx) => {...})`. That runs `gsap.context` scoped to the section and `gsap.matchMedia` for `no-preference` and the desktop/mobile split. The cleanup reverts everything (tweens, triggers, pins, inline styles).
- **Order:** scenes mount in DOM order, so their triggers are created top to bottom, which pins depend on. `App` calls `ScrollTrigger.refresh()` once fonts are ready (`document.fonts.ready`).
- **Scroll listeners:** none hand-written. ScrollTrigger runs one shared, throttled listener.
- **Re-renders:** scenes have no state. The only React state is in `AudioControl`. The particle field reads a mutable module object, not React state.
- **Resize:** ScrollTrigger refreshes automatically. The canvas resizes on a debounced `resize` and caps devicePixelRatio at 1.5.
- **Reduced motion:** no timelines, no pins, no canvas (the canvas isn't mounted). Static CSS shows final states. Rain is a still CSS texture.
- **Timing tokens:** `--dur-slow: 1.6s`, `--dur-med: 1.0s`, `--dur-fast: 0.6s`. Eases: `power2.out` for reveals, `sine.inOut` for ambient effects, `none` for scrub-linear parts. Scrub smoothing is `1`.

## F. Asset Strategy

| Scene | Source → output | Focal point (x, y) |
|---|---|---|
| mountain | `WvcN4Z…` → `mountain-l-{640,1280,2048}`, `mountain-p-{480,768}` | 0.27, 0.45 |
| ocean | `ZkKSkG…` → `ocean-l-{640,1280,2048}`, `ocean-p-{480,768,1080}` | 0.50, 0.30 |
| oasis | `oasis.jpg` (placeholder `ggRn7W…`; replace with your high-res file) → `oasis-l-*`, `oasis-p-*`. Optional `oasis-empty.jpg` → base layer | 0.50, 0.55 |

- A `<picture>` element uses `media="(orientation: portrait)"` → the portrait crop. Otherwise the landscape `srcset` with `sizes="100vw"`.
- Images are decoded asynchronously and lazy-loaded, apart from the mountain, which is fetched eagerly at low priority. Each scene's gradient shows until the image fades in on `load`.
- The audio is renamed to `public/audio/track.mp3`. Originals move to `design/source-images/` with neutral names.
- There are no photographs of any person (the diver image is excluded).

## G. Deployment Architecture (Vercel)

| Item | Value |
|---|---|
| Framework preset | Vite |
| Build command | `npm run build` (`tsc -b && vite build`). Images are pre-generated and committed, so sharp is never needed on Vercel |
| Output directory | `dist` |
| Node | 22.x or 24.x |
| Env vars | **None** |
| Routing | A single `/`. No rewrites needed. 404s go to Vercel's default page |
| Headers (`vercel.json`) | `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `X-Content-Type-Options: nosniff`, `Permissions-Policy` (camera, mic and geolocation off), CSP `default-src 'self'` (+ `style-src 'self' 'unsafe-inline'`, `img-src 'self' data:`), and long cache headers for `/images/*`, `/audio/*` and `/assets/*` |
| Project name | **`an-unusual-collaboration`** (D-04) |

**Final verification checklist:** the build passes, `dist/` contains only the files we use, "Priti" appears exactly once, there are no third-party requests, the response headers are present, and nothing appears in the console. Then a full scroll on the deployed URL, on a phone.

## H. CR-02: Story pacing, section stepping and the music hint

| # | Decision | Why |
|---|---|---|
| AD-9 | **Beats.** `copy.ts` holds each scene's text as `beats: string[][]` (paragraphs of lines). A `Beats` component renders one heading with a block per beat. Static CSS stacks the beats as paragraphs (the final, readable state). Inside the animation setup the block gets `.is-sequenced`, which overlays the beats in one grid cell, and `addBeats()` adds to the scene timeline, per beat: lines rise in (0.6 units, staggered), a label `beat-i` in the middle of a 0.6-unit hold, then the lines lift out (0.4 units) as the next beat rises. | One beat at a time (FR-063); reverts to stacked paragraphs under reduced motion or failure (FR-066). |
| AD-10 | **Stops and stepping.** `lib/stops.ts` is a registry of named stops, each a function returning a scroll Y, so positions are always read fresh after a refresh. Scenes register their stops in their setup (opening: top and story; held scenes: one per beat label, `y = start + (end − start) · label / duration`; message: the letter). `lib/sectionScroll.ts` uses `ScrollTrigger.observe` (wheel and touch, `preventDefault`, ignoring Ctrl+wheel and multi-touch) plus a keydown handler. A step tweens a proxy and calls `window.scrollTo` (`power2.inOut`, 0.9 s + 0.35 s per viewport, clamped to 1.0–2.2 s). Input during a step is ignored, and a gesture only counts if it starts after ≥ 160 ms without input (momentum guard). `App` installs it inside `gsap.matchMedia('(prefers-reduced-motion: no-preference)')`. | fullPage.js-style stepping with no new dependency; scrubbed timelines still drive every scene. Stateless (it reads the scroll position), so native scrolling never confuses it (FR-104). |
| AD-11 | **Pin length from the timeline.** `pinnedTimeline()` builds the timeline first, then attaches the pin with `end: duration × 0.4 × innerHeight`. | Adding a beat in `copy.ts` re-paces the scene (D-12). |
| AD-12 | **Music hint.** `AudioControl` mirrors its state onto `<html data-audio>` and keeps `data-hint="on"` until the first scroll past 10% of the viewport. The opening cue holds three texts (hint / after play / unavailable); CSS shows the right one from `data-audio`. The pulse is a CSS ring (transform + opacity) on the button while the hint is on and nothing has played. | No shared React state between distant components; the visual state is pure CSS and static under reduced motion. |

**Files touched:** `content/copy.ts`, `components/LineReveal.tsx` (adds `Beats`), `components/StaticStory.tsx`, `components/AudioControl.tsx`, `hooks/useSceneAnimation.ts` (adds `onCleanup`), `lib/sceneTweens.ts`, new `lib/stops.ts` and `lib/sectionScroll.ts`, `lib/testHooks.ts` (exposes the stops), every scene, `App.tsx`, `styles/*.css`, the tests.
