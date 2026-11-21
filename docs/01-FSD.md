# An Unusual Collaboration: Functional Specification (FSD)

| | |
|---|---|
| **Phase** | 2 of the HTD workflow (FSD) |
| **Status** | **Approved** by the owner, 2026-11-21. The copy picks (§J 1–3) are still open; see Scope OI-01. The fonts (§J 4) were approved as part of UX-001. |
| **Version** | 1.0 · 2026-11-21 |
| **Inputs** | Project brief; Discovery decisions D-01 to D-06; resolved questions Q-04 to Q-15 |

How to read this:
- Every requirement has an ID (`FR-`, `UX-`, `NFR-`) and its acceptance criterion sits in the same row. Section G explains how the criteria get verified.
- §F.7 lists the copy options. Nothing in it is approved copy until you choose.
- Items marked **[DECISION]** need your answer before this FSD can be approved. They are collected in §J.

---

## A. Product Overview

**What it is.** A single-page, scroll-driven visual poem for one reader, written as a personal note rather than a website. It has five moments: a rainy morning in Kolkata, a snow-lit mountain, a pearl in deep water, an oasis in the desert, and then a plain, honest message.

**Why it exists.** To say something sincere without a conventional confession. The landscapes carry the feeling, and the words stay few. At the end the imagery stops and the message is said plainly: *the elaborate imagery gives way to the truth.*

**The experience it should deliver.** Curiosity (a playful "collaboration proposal") → atmosphere → wonder, three times, in three different places → stillness → a short, direct, respectful message that leaves her completely free to reply or not.

**Who it's for.** One reader (Priti), most likely on a phone, arriving from an email link. Desktop is supported but secondary.

---

## B. User Journey

| Step | What she sees or does | Duration (approx.) |
|---|---|---|
| 0. Email | She receives a playfully formal "collaboration proposal" with a link. (The email is out of scope.) | — |
| 1. Arrival | The page opens straight into the rainy atmosphere. "Collaboration Proposal" and a dry humorous line are visible immediately. No loader, no splash screen. | 0–5 s |
| 2. First scroll | The joke fades out. The story line appears ("Kolkata. A rainy morning…"). By now it is clear this is personal, not commercial. | 5–20 s |
| 3. Mountain | The rain clears into white mist. Snowy peaks emerge, sunlight warms the summit, snow falls gently, and one line of text appears. | ~20–30 s |
| 4. Pearl | The light sinks into deep water. Out of the darkness a pearl slowly catches the light, and one line appears. | ~20–30 s |
| 5. Oasis | The scene surfaces into warm sand. The desert is revealed horizontally until the oasis is found, and one line appears. | ~20–30 s |
| 6. Final message | The landscape fades to warm ivory and every effect stops. A few plain sentences, using her name once. | as long as she likes |
| 7. Exit | Nothing more: no buttons, links or calls to action. She closes the tab and, if she wants, replies to the email. | — |

At any point she can play or pause the music with one control. She can scroll back up, and everything reverses smoothly. She is never locked into a sequence.

---

## C. Functional Requirements

### C.1 Structure and scrolling

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-001 | One page at `/` with exactly five sections in this fixed order: Opening, Mountain, Pearl, Oasis, Message. | The DOM contains exactly 5 `<section>` elements inside `<main>`, in that order. No other content sections, nav, header or footer exist. |
| FR-002 | Scrolling is native vertical scrolling. No scroll snap, no scroll hijacking, no wheel or touch interception. | Mouse wheel, trackpad, touch fling, keyboard (Space, PgDn, arrows) and scrollbar dragging all move the page at native speed. A code search finds no `preventDefault` on wheel/touch/scroll events and no `scroll-snap-type`. |
| FR-003 | Each metaphor scene (Mountain, Pearl, Oasis) holds in place **at most once**, for no more than about 1.5 viewport heights of scrolling. Opening and Message are never held. | ScrollTrigger config has ≤ 3 pinned triggers, each with a pin distance ≤ 150% of viewport height. |
| FR-004 | Every scroll-linked animation reverses when she scrolls up. No animation "locks" after playing once. | Scrolling from the bottom back to the top returns each scene to its initial visual state, with no missing or stuck elements. |
| FR-005 | On resize or orientation change, scene layout and triggers recalculate without breaking. | Rotating a phone (portrait ↔ landscape) mid-scene and resizing a desktop window from 1440 to 375 px both leave every scene correctly positioned, with no gaps, overlaps or stuck pins. |

### C.2 Opening (rainy morning and collaboration framing)

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-010 | A full-viewport opening with a rainy, misty atmosphere built in code: fine rain streaks, slowly drifting fog and a few soft, out-of-focus warm lights (like streetlights through a wet windshield). No photo is needed. | The first viewport shows visible rain, fog and soft lights on a slate palette, with no image request made for the opening. |
| FR-011 | The collaboration framing is visible on first paint: the heading "Collaboration Proposal" plus one dry humorous line (copy §F.7). | Both are visible without scrolling at 320 × 568 and above, and readable within 1 s on a fast connection. |
| FR-012 | The personal intent becomes clear on the first scroll. Within one viewport of scrolling, the humorous line fades out and the story line appears, line by line. | After scrolling ≤ 100% of viewport height, the story line is fully visible and the humorous line is hidden. |
| FR-013 | A minimal scroll cue (a hairline and/or a two-word text hint) invites her to scroll and fades out after her first scroll. | The cue is visible at load and hidden once the scroll position exceeds 10% of viewport height. It does not come back on scrolling up. |
| FR-014 | No brand imitation: no Hopper logo, app UI, notification mock-up, times, route or workplace details. | Visual and code review finds none of these elements. |

### C.3 Mountain

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-020 | **Transition from the opening:** the rain thins and stops, and the fog lightens to mist white, so it feels like rising out of the rain clouds into clear air above. | Over the scroll between the opening and the mountain, rain opacity reaches 0 and the background goes from slate to the mist palette with no hard cut. |
| FR-021 | The mountain image enters gently from the right (≤ 6% horizontal travel), revealed through mist. Scale stays ≤ 1.06 at the start and settles to 1.0. | Measured transform values never exceed translateX 6% or scale 1.06. |
| FR-022 | Sunlight changes subtly: a warm-gold light (#E8C98A) on the summit grows as she scrolls through the scene. | The warm overlay opacity goes from about 0 to its target over the held part of the scene and reverses on scrolling up. |
| FR-023 | Gentle snowfall: sparse, slow, soft particles. | ≤ 60 particles on mobile and ≤ 120 on desktop. Fall speed reads as slow and drifting, never storm-like. |
| FR-024 | The scene's line (copy §F.7) is revealed line by line over the sky area of the image. | The text is fully visible by the end of the hold, sits over sky rather than over busy rock, and meets the contrast rule (NFR-020). |

### C.4 Pearl

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-030 | **Transition from the mountain:** the light descends. The background darkens from mist through muted cyan (#3A718B) to midnight (#071522), as if sinking below the surface. The snowfall carries over into the water and becomes slowly drifting, suspended particles. | No hard cut between the scenes. The particle colour and direction change continuously instead of the particles disappearing. |
| FR-031 | The deep-water image (light rays plus suspended particles) is the backdrop, with a slight vignette. | The image is visible and correctly cropped at every viewport width listed in NFR-012. |
| FR-032 | **The pearl is built in code** (no image): pearl-white body (#E8EEF1), a soft specular highlight, a very subtle iridescent edge and a soft halo. It is realistic and restrained, never cartoonish. | It renders as a single luminous sphere with no outline stroke, no purple tint, no drop-shadow "sticker" look and no shell. Its diameter is 18–28 vmin, capped at 180 px. |
| FR-033 | **Discovery sequence**, driven by scrolling: (1) the darkness deepens, (2) a light shaft narrows toward the pearl, (3) the pearl goes from nearly invisible to luminous and its halo grows, (4) the lustre highlight shifts slightly as she scrolls, as if it is turning in the light. | At the start of the hold the pearl's opacity is ≤ 0.15. By about 70% through the hold it is at full opacity with its halo visible. The sequence reverses on scrolling up. |
| FR-034 | The light rays move subtly: a slow, looping shimmer that is not tied to scrolling. | The loop period is ≥ 8 s with a low-amplitude opacity change. It pauses when the scene is off-screen. |
| FR-035 | The scene's line (copy §F.7) appears after the pearl is lit, in pearl white. | The text only becomes visible once the pearl is past 70% of its sequence. |

### C.5 Oasis

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-040 | **Transition from the pearl:** the scene surfaces. Midnight lightens through teal into warm sand (#D8BD91), as if rising into sunlight. | Continuous colour interpolation with no hard cut. |
| FR-041 | **Horizontal mask reveal:** the desert and oasis are revealed left to right as she scrolls, like eyes scanning a horizon. *If you supply the matched pair (desert with and without the oasis), the empty desert is the base and the oasis version is revealed over it, so the oasis "appears" in the empty sand.* | Clip-path or mask moves from fully hidden to fully revealed across the hold and reverses on scrolling up. It works with one image or with the matched pair. |
| FR-042 | Warm light sweeps subtly across the sand while the reveal runs, and a very small number of warm motes drift. | Motes ≤ 30 on mobile. The light sweep only changes opacity or position, never adds blur. |
| FR-043 | The scene's line (copy §F.7) appears once the oasis is visible. | The text only becomes visible once the reveal is past 60%. |

### C.6 Final message

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-050 | **Transition:** after the oasis, the landscape fades to warm ivory (#F6F3ED) over about 0.6 viewport heights of scrolling. All particles, light effects and images end before the message appears. | When the message is visible, no canvas is drawing, no image is in view and no scroll-linked animation is active in this section. |
| FR-051 | **Plain presentation:** ivory background, charcoal text (#252525), a narrow, letter-like column, no decoration, no images, no effects. | Visual review: only text on a flat background. No borders, cards, icons or gradients. |
| FR-052 | Motion is limited to **at most one gentle opacity fade of the whole message block** as it enters. No per-line or per-word animation, no movement. | Code review: one opacity-only tween at most for this section. With reduced motion, there is none. |
| FR-053 | Her first name, **"Priti"**, appears **exactly once** on the whole site, in the message's opening line. | A text search of the built `dist/` output finds "Priti" exactly once, inside the message section, and never in `<title>`, meta tags, filenames or URLs. |
| FR-054 | The page ends after the message with comfortable whitespace. No buttons, links, contact prompts or "reply" calls to action. | No interactive element exists below the message, apart from the persistent audio control. |

### C.7 Text reveals

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-060 | Metaphor and story lines are revealed **line by line**: each line rises from behind an invisible mask (≤ 100% of its own height) while fading in. They are staggered and slow, with no bounce. | Easing is from the approved set in UX-006. Stagger is 0.12–0.2 s per line. |
| FR-061 | Splitting text for animation must not break screen-reader reading. | VoiceOver and NVDA read each line as one natural sentence, not word fragments. |
| FR-062 | Before scripts run, or if animation is disabled, all text is in its final, visible state. | With JS animations disabled or reduced motion on, every line is visible. No text has a starting state of `opacity: 0` in static CSS. |

### C.8 Audio (one track, hosted on the site, accepted risk R-06)

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-070 | One small, round audio control, fixed bottom-right (respecting the safe area), visible throughout. It is the only interactive control on the site. | Present in every section. Hit area ≥ 44 × 44 px. Never overlaps text at any tested viewport. |
| FR-071 | **No autoplay.** Audio loads and plays only after she taps or clicks the control. | Network panel: no audio request before the first click. The `<audio>` element uses `preload="none"`. |
| FR-072 | Play fades the volume in over about 2 s. Pause fades it out over about 0.6 s. The track loops. | Observed fade-in and fade-out with no audible click, and the track restarts at the end. |
| FR-073 | The audio state is clear: a still icon when paused, a softly moving icon when playing (static under reduced motion). `aria-pressed` and `aria-label` reflect the state ("Play music" / "Pause music"). | Inspection shows the correct attributes in both states. A screen reader announces the state change. |
| FR-074 | Audio never blocks reading or scrolling, and no section starts or stops it automatically. | Scrolling through all sections while it plays doesn't interrupt it. Nothing other than the control changes playback. |
| FR-075 | **Error handling:** if the file fails to load or play, the control shows that briefly and then hides itself. No error dialogs. | Simulated 404 on the track → no console error is surfaced to her and the control disappears gracefully. |
| FR-076 | The file is served under a neutral path, e.g. `/audio/track.mp3`. | The built output contains no song title in any path. |

### C.9 Loading, failure and fallback

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-080 | No preloader or splash screen. The opening renders immediately from CSS and code. | First paint shows the opening scene. No full-screen loading screen exists. |
| FR-081 | Images load progressively: the mountain image is fetched as soon as the opening is idle, and later images when the visitor is about 1 viewport away. Each scene shows its palette gradient until its image has decoded. | On slow 3G throttling, scrolling to a scene before its image arrives shows the gradient with readable text, then the image fades in. Nothing jumps or reflows. |
| FR-082 | **Image failure:** if any image fails, its scene still works on the palette gradient plus code effects, and the text stays legible. | Blocking all image requests still leaves a complete, readable experience. |
| FR-083 | **Script failure:** a top-level error boundary renders a static, plain version of every line of copy (no effects), so the message always reaches her. | Forcing a runtime error in a scene component shows the static fallback, which includes the final message. |
| FR-084 | **No JavaScript:** a `<noscript>` block shows the final message in plain text. | With JS disabled, the final message is readable. |

### C.10 Reduced motion and responsive art direction

| ID | Requirement | Acceptance criterion |
|---|---|---|
| FR-090 | With `prefers-reduced-motion: reduce`: no pins, no scroll-scrubbed transforms, no particles, no looping shimmer. Each scene is a static full-bleed composition in its *final* state (mountain lit, pearl luminous, oasis revealed), with all text visible. Rain becomes a still texture. Only short opacity crossfades are allowed. | With the OS setting on: ScrollTrigger creates no pins, no canvas is animating, and every scene is complete and readable in a normal scroll. |
| FR-091 | Each image has a defined focal point for portrait crops (e.g. the lit summit stays in frame on a 390 px phone). The oasis uses a dedicated portrait crop when you supply one. | At 320, 375, 390 and 430 px the subject of each scene (summit, light shaft, oasis) is visible and not cut off. |
| FR-092 | Mobile and desktop compositions are designed separately where needed (text position, size and alignment), not just scaled down. | Side-by-side review at 390 px and 1440 px shows a composition chosen for each. |

---

## D. Non-Functional Requirements

### D.1 Performance

| ID | Requirement | Acceptance criterion |
|---|---|---|
| NFR-001 | JS budget: ≤ 130 KB gzipped in total. | Build output report. |
| NFR-002 | Images: AVIF with a WebP fallback, at 3 responsive widths (about 640 / 1280 / 2560 px). Each scene's mobile image is ≤ 200 KB. All images together, excluding audio, are ≤ 2 MB. | File sizes in `dist/`. Network panel at 390 px. |
| NFR-003 | Before any scrolling, transfer is ≤ 350 KB (HTML, CSS, JS, fonts). Audio and the later scenes' images are excluded. | Network panel on a fresh load with cache disabled. |
| NFR-004 | Lighthouse mobile (simulated): Performance ≥ 85, Accessibility ≥ 95, Best Practices ≥ 95. LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms. | Lighthouse report from the production build, attached to the test report. |
| NFR-005 | Animations only change transform, opacity, clip-path or canvas draws. No animated `filter: blur`, width/height or top/left. | Code review plus a DevTools Performance trace showing no layout or paint storms during scrolling. |
| NFR-006 | Particle canvases pause when off-screen or when the tab is hidden. Particle counts drop on low-end devices (≤ 4 cores or `deviceMemory` ≤ 4) and particles turn off when Save-Data is enabled. | Performance trace: no canvas frames while the canvas is off-screen. Counts verified with emulated device conditions. |
| NFR-007 | Scrolling stays smooth: no long tasks over 50 ms while scrolling on a mid-range profile (Chrome, 4× CPU throttle). | DevTools Performance trace. |

### D.2 Compatibility and responsiveness

| ID | Requirement | Acceptance criterion |
|---|---|---|
| NFR-010 | Supported browsers: the latest 2 versions of Chrome, Edge and Android Chrome. Safari and iOS Safari 16.4+. Firefox (latest) should work but is not a priority. | Test matrix in Phase 6. Real-device tests are run by you and marked BLOCKED until then. |
| NFR-011 | No horizontal overflow at any width from 320 px to 2560 px. | `document.documentElement.scrollWidth === clientWidth` at every tested width. |
| NFR-012 | Tested widths: 320, 375, 390, 430, 768, 1024, 1440. Viewport height uses `svh`/`dvh` so iOS browser-bar changes don't cause jumps. | Screenshots at each width. No jump when the iOS address bar collapses. |
| NFR-013 | Touch targets ≥ 44 px. Fixed UI respects `env(safe-area-inset-*)`. | Inspection on iPhone-notch emulation. |

### D.3 Accessibility (WCAG 2.2 AA where applicable)

| ID | Requirement | Acceptance criterion |
|---|---|---|
| NFR-020 | Contrast: text below 24 px ≥ 4.5:1, text 24 px and above ≥ 3:1, against the actual pixels behind it. Use gradient scrims where an image needs one (no boxes). The audio icon is ≥ 3:1 against every scene. | Contrast checks against screenshots of each scene. |
| NFR-021 | Semantics: `lang="en"`, `<main>`, one `<h1>` ("Collaboration Proposal"), each section labelled by its own heading (visually hidden where needed), and real `<button>`s. | axe DevTools: 0 serious or critical issues. |
| NFR-022 | Keyboard: the page scrolls with the keyboard. The audio button is reachable by Tab, works with Enter and Space, and has a visible focus ring (≥ 2 px, ≥ 3:1). | Manual keyboard pass. |
| NFR-023 | Images that carry meaning have concise alt text (e.g. "Snow-covered peaks catching the first sunlight above the clouds."). Decorative canvases and overlays have `aria-hidden`. | Inspection plus a screen-reader pass. |
| NFR-024 | All content is reachable and readable at 200% zoom and with animations off. | Manual check. |

### D.4 Privacy and SEO

| ID | Requirement | Acceptance criterion |
|---|---|---|
| NFR-030 | No analytics, pixels, cookies, local or session storage, fingerprinting or forms. Vercel Analytics and Speed Insights are off. | Network panel and Application panel show none. A code search finds none. *(Note: Vercel itself keeps standard server request logs. This is platform behaviour, not tracking added by the site.)* |
| NFR-031 | No third-party requests at all. Fonts and assets are self-hosted. | The network panel shows only same-origin requests. |
| NFR-032 | Not indexed: `<meta name="robots" content="noindex, nofollow">`, a `robots.txt` that disallows everything, and an `X-Robots-Tag` header via Vercel config. | Inspection of headers and files in the deployed build. |
| NFR-033 | Neutral metadata: title "An Unusual Collaboration", a neutral description, and no names in the title, meta, Open Graph, filenames, URLs, the Vercel project or a public repo name. | Search of `dist/` plus a review of the Vercel project settings. |

### D.5 Maintainability and quality

| ID | Requirement | Acceptance criterion |
|---|---|---|
| NFR-040 | TypeScript strict mode. ESLint passes with 0 errors and 0 warnings. `tsc` passes. | CI-style local run of `npm run lint && npm run build`. |
| NFR-041 | All copy lives in **one content file**, so wording can change without touching components. | Code review. |
| NFR-042 | Each scene is its own component with its own animation setup. Animations are created inside a GSAP context and fully reverted on unmount. | Code review, plus mounting and unmounting in dev with no leftover triggers (`ScrollTrigger.getAll().length === 0` after unmount). |
| NFR-043 | Zero console errors or warnings in development and production. | Console review during a full scroll in both builds. |
| NFR-044 | Asset hygiene: only assets the site uses ship in `public/`, with neutral filenames. Unused images are moved out of `public/`. | `dist/` listing review. |
| NFR-045 | Minimal dependencies. Each runtime dependency is justified in the Plan (Phase 4). | `package.json` review against the Plan. |

---

## E. UI/UX Requirements

| ID | Requirement | Acceptance criterion |
|---|---|---|
| UX-001 | **Two type families:** *Cormorant Garamond* (serif) for the story, metaphor and final lines, and *Manrope* (sans) only for the small label, cue and accessible labels. Both self-hosted and subset. | Only these two families load. |
| UX-002 | **Fluid editorial scale.** Metaphor lines are about 32 px at 320 px wide, growing to about 72 px on desktop. The final message is 22–34 px, upright (not italic) and at a reading size. The metaphor lines may use the italic. | Measured sizes at 320 and 1440 px. No overflow or broken words at 320 px. |
| UX-003 | **Line length:** metaphor lines ≤ about 22 characters per line on mobile and ≤ about 28 on desktop. The final message column ≤ about 34 characters per line. Lines break by meaning, not by accident (set manually in the content file). | Visual review at all tested widths. |
| UX-004 | **Palette:** each scene uses only its own palette from the brief. Background colours blend between scenes over ≥ 50% of a viewport height of scrolling. No neon, no purple or blue "AI" gradients, no glow beyond the pearl's halo. | Visual review. Sampled colours stay within the scene palettes. |
| UX-005 | **Minimal UI:** the only controls are the audio button and the scroll cue at load. No cards, boxes, borders, carousels, arrows or dots. | Visual review. |
| UX-006 | **Motion language:** slow and natural. Easing only from `power1`–`power3` (in, out or inOut), `sine` and `expo.out`, plus GSAP scroll smoothing for scrubbed timelines. **Never** `bounce`, `elastic` or `back`. No zoom beyond 1.06. Blur is static only, never animated. Timed tweens last 0.8–2.0 s. | Code review of all tween definitions. |
| UX-007 | **Text lives in the landscape:** it sits directly on the image or scene, anchored to calm areas (sky, deep water, open sand), with only soft gradient scrims behind it. | Visual review. No containers behind text. |
| UX-008 | **Whitespace and pacing:** generous margins (side gutter about 6 vw, at least 20 px). One idea per screen. The total page is about 9–10 viewport heights. | Measured page height. Visual review. |
| UX-009 | **The ending is visibly different:** the final section uses no imagery, effects, italics or decoration. The contrast with what came before is the point. | Visual review. |
| UX-010 | **The scroll cue is quiet:** a short text hint (copy §F.7) and/or a 1 px line, about 60% opacity, slowly breathing (static under reduced motion). | Visual review. |

---

## F. Scene Specifications

### F.1 Palette by scene

| Scene | Background (from → to) | Text | Accent |
|---|---|---|---|
| Opening | #263746 → #647585 | #E9EEF2 | #B7C5D1 (rain), warm bokeh about #E8C98A at 30% |
| Mountain | #E9EEF2 → #F5F8FC | #263746 | #E8C98A (sunlight), #A8C4DA (shadows) |
| Pearl | #3A718B → #0D2B40 → #071522 | #E8EEF1 | Pearl #E8EEF1, rays #3A718B |
| Oasis | #0D2B40 → #D8BD91 → #E9D9BA | #252525 or #263746 over a sky scrim | #8FB9B1 (water), #536E5B (palms) |
| Message | #F6F3ED (flat) | #252525 | #77736E (secondary text, if any) |

### F.2 Scroll map (approximate, in viewport heights)

```
0 ─────── 1 ─────── 2 ─────── 3.5 ────── 5 ─────── 6.5 ────── 8 ─────── 9.5
| Opening  | → mist  | MOUNTAIN | → depth  |  PEARL   | → surface|  OASIS   | → ivory | MESSAGE
|          |         | (held)   |          |  (held)  |          |  (held)  |         | (natural)
```

### F.3 Scene 1: Opening (rainy morning)

- **Intent:** an ordinary morning that became memorable. Intriguing, playful, understated.
- **Layers (back to front):** slate gradient → 6–10 soft warm bokeh lights (CSS, slow drift) → fog bands (CSS, slow horizontal drift) → rain streaks (canvas, thin, diagonal, about 0.35 opacity) → text.
- **Text:** small sans label `COLLABORATION PROPOSAL` (h1, tracked uppercase) → humorous line (small serif) → *[on scroll]* story line in large serif, line by line → scroll cue at the bottom.
- **Mobile:** text anchored to the lower third (thumb zone, cinematic). **Desktop:** text left-aligned in a column about 40% wide.
- **Exit:** the rain thins to nothing and the fog brightens to mist white, handing over to the mountain.

### F.4 Scene 2: Mountain

- **Intent:** the inexplicable beauty of a moment. Awe, silence, wonder.
- **Image:** `WvcN4Z…` (pink-lit summit above fog). Focal point about 25% / 40% so the lit peak stays in portrait crops. Alternative: `5YLyvm…`.
- **Sequence (held, about 1.2 viewport heights):** mist parts → image settles from the right (≤ 6%) → warm-gold light on the summit grows → snow drifts → the line reveals over the sky.
- **Text position:** the sky band (top third on mobile, top left on desktop), dark slate on pale sky.

### F.5 Scene 3: Pearl

- **Intent:** finding something rare without searching for it. Intimate, mysterious, delicate.
- **Image:** `ZkKSkG…` (deep water, light rays). Focal point at the centre top, where the rays originate. `rraabG…` (seabed) is kept as an optional lower layer and is not part of the MVP.
- **Pearl:** code-built, positioned at about 60% of the height under the main light shaft.
- **Sequence (held, about 1.2 viewport heights):** vignette deepens → light shaft narrows toward the pearl → pearl goes from about 0.1 to 1 opacity, halo blooms, lustre turns slightly → the line appears above, in pearl white.
- **Ambient:** snow particles continue as suspended specks drifting slowly upward. Ray shimmer loops (≥ 8 s).

### F.6 Scene 4: Oasis

- **Intent:** unexpected comfort in an unfamiliar place. Warm, reflective, quietly hopeful.
- **Image:** **pending your high-resolution asset** (prompt below). Placeholder: `ggRn7W…`.
- **Sequence (held, about 1.5 viewport heights):** warm sand ground → horizontal mask reveal left to right → warm light sweep and sparse motes → the line appears in the sky band.
- **Exit:** the image fades to ivory over about 0.6 viewport heights and all motion ends.

**Image prompt for your oasis asset (Q-13).** Generate version A first, then derive B from it with an image edit.

> **A, with the oasis (landscape, 16:9, ≥ 2400 px wide):**
> *Cinematic photorealistic landscape photograph of a vast, quiet desert at late golden hour. Soft rippled sand dunes stretch to a hazy horizon, low warm sun from the left casting long gentle shadows. Near the horizon, slightly right of centre, a small distant oasis: a still teal-turquoise pool fringed by a loose cluster of date palms, with faint reflections of the palms in the water. The upper third is pale, warm, cloudless sky, left empty for text. Muted, cohesive colour grade: sand #D8BD91, warm beige #E9D9BA, soft amber light, muted olive palms #536E5B, teal water #8FB9B1. Calm, minimal, editorial landscape photography, 35mm, high detail. No people, animals, buildings, tents, vehicles, footprints or text.*
>
> **A, portrait (9:16, ≥ 1080 × 1920):** *the same scene recomposed vertically: the oasis in the lower-middle third, an empty sky band in the upper third.*
>
> **B, without the oasis (both orientations):** edit image A with: *"Remove the oasis, water and palms completely and replace them with continuous sand dunes that match the surroundings. Change nothing else: same framing, light, shadows and colour."*

### F.7 Copy options (none of these is approved)

Principles: sparse, nearly fragments, no clichés, no destiny or forever language, nothing that makes her responsible for your feelings. The line breaks shown (`/`) are deliberate. Your own drafts are labelled **(yours)**. The ★ marks my recommendation.

**Opening: humorous line (under "Collaboration Proposal")**

| # | Copy |
|---|---|
| T1 ★ | Zero products. / Zero budget. / One unexpectedly memorable morning. |
| T2 | An unusually small project / with absolutely no commercial objective. |
| T3 | Scope: one rainy morning. / Budget: none. / Deliverables: a few honest sentences. |

**Opening: story line (after the first scroll)**

| # | Copy |
|---|---|
| H1 (yours) | Some mornings are just mornings. / And then, occasionally, / one stays with you. |
| H2 ★ (yours, tightened) | Kolkata. A rainy morning. / Nothing extraordinary / was supposed to happen. |
| H3 (yours) | A routine commute. / A rainy morning. / An entirely unexpected plot twist. |

*Note: T1 + H2 split the jobs cleanly: T1 carries the humour, H2 the atmosphere. H3 doubles the humour, which risks making the opening feel like a bit.*

**Mountain**

| # | Copy |
|---|---|
| M1 (yours) | Like sunlight finding its way / to the quietest peak / in the world. |
| M2 (yours) | I have seen beautiful things before. / I just wasn't prepared / for that moment. |
| M3 ★ (new) | For a moment, / everything else went quiet. / Only the light on the snow. |
| M4 (yours) | Some things are beautiful enough / to leave you without / a single intelligent thought. |

*Note: M4 is charming, but it's a joke. It breaks the silence this scene is meant to hold, and it would fit the opening better.*

**Pearl**

| # | Copy |
|---|---|
| P1 (yours) | The ocean hides a thousand beautiful things. / Some you never expect to find. |
| P2 ★ (yours) | Not everything rare announces itself. / Sometimes, / you simply notice. |
| P3 (yours) | A little light, / somewhere beneath / all that blue. |

*Note: P2 quietly reflects what struck you about her (simplicity, individuality) without saying it outright.*

**Oasis**

| # | Copy |
|---|---|
| O1 (yours) | And somewhere in the middle of an ordinary life, / something feels / unexpectedly beautiful. |
| O2 (yours) | Perhaps the most beautiful places / are the ones / you never planned to find. |
| O3 ★ (yours) | I wasn't looking for anything. / That's probably what made the moment / feel different. |
| O4 (new) | An ordinary day. / And somewhere in it, / an unexpected calm. |

*Note: O3 is the first line in the first person since the opening, and it turns the voice toward the honest ending. "Ordinary life" in O1 could read as calling your life dull.*

**Final message** (one gentle opacity fade, then still)

| # | Copy |
|---|---|
| F1 (yours, Option 1) | Priti, / I could have written a hundred metaphors. / But the truth is much simpler. / I thought you were beautiful. / And I'd genuinely like to get to know you, / if you'd like that too. |
| F2 (yours, Option 3) | Priti, / No metaphor this time. / I thought you were beautiful. / Would you mind if we got to know each other? |
| F3 ★ (combined) | Priti, / No metaphors this time. / I thought you were beautiful. / And I'd like to get to know you, / if you'd like that too. |

*Note: F2 ends on a direct question, which quietly asks for an answer. "If you'd like that too" (F1/F3) leaves the choice entirely with her. F3 keeps F2's brevity and callback, plus F1's freedom.*

*Optional line (can be added to any option, after the "beautiful" line):* "I've thought about that morning more than once since." It is honest and mild, but it adds weight. My default is to leave it out.

**Sign-off [DECISION]:** (a) none (she knows it's from you via the email) ★, or (b) a quiet line with your first name, right-aligned, in the secondary grey.

**Scroll cue:** "Scroll slowly" ★ / "Scroll gently" / no text, just the hairline.

---

## G. Acceptance Criteria: how they will be verified

Every requirement above has its criterion inline. In Phase 6 each one becomes ≥ 1 test case (TC-xxx), verified by one of these methods:

| Method | Used for |
|---|---|
| **Automated** (Playwright: Chromium and WebKit) | DOM structure, overflow, text presence and counts, attributes, network requests, reduced-motion emulation, screenshots at each width |
| **Tooling** (Lighthouse, axe, build report, DevTools traces) | NFR-001 to NFR-007, NFR-020 to NFR-021, NFR-030 to NFR-033 |
| **Visual review** (screenshots plus video) | UX-xxx, motion quality, composition |
| **Manual on real devices, by you** | iOS Safari, Android Chrome, audio on a phone. Marked BLOCKED until you run them |

---

## H. Out of Scope

- Navigation, header, footer, menu, progress bar, section dots, "back to top"
- Forms, contact links, social links, reply buttons, calls to action of any kind
- Analytics, cookies, storage, tracking, notifications, Vercel Analytics
- Carpool or app notification visuals, Hopper branding, times, routes, places beyond "Kolkata"
- Three.js / WebGL, Lenis or other smooth-scroll libraries, carousel or slider libraries, icon libraries
- Horizontal page scrolling, scroll snap, full-page libraries
- Video backgrounds, custom cursors, preloader or splash screens
- Multiple tracks, playlists, a volume slider, track info
- Light/dark theme switching (the site has its own fixed palettes)
- A CMS, a backend, password protection, internationalisation
- The email draft (Q-10)
- Open Graph preview image *(optional enhancement for Scope to consider)*
- Seabed layer in the pearl scene *(optional enhancement)*

---

## I. Requirements Traceability

The Task and Test columns are filled in during Phases 5 and 6.

| Requirement | Scene / Area | Source | Task | Test |
|---|---|---|---|---|
| FR-001 to FR-005 | Structure and scroll | Brief §7, §14, §16; Q-05 | — | — |
| FR-010 to FR-014 | Opening | Brief §8, §20; D-05; Q-06 | — | — |
| FR-020 to FR-024 | Mountain | Brief §9; D-01 | — | — |
| FR-030 to FR-035 | Pearl | Brief §10; Q-14 | — | — |
| FR-040 to FR-043 | Oasis | Brief §11; Q-13 | — | — |
| FR-050 to FR-054 | Message | Brief §12; D-03; D-06; Q-15 | — | — |
| FR-060 to FR-062 | Text reveals | Brief §18, §22 | — | — |
| FR-070 to FR-076 | Audio | Brief §13; Q-04; R-06 | — | — |
| FR-080 to FR-084 | Loading and failure | Brief §17, §18 | — | — |
| FR-090 to FR-092 | Reduced motion and art direction | Brief §16, §18; D-01 | — | — |
| NFR-001 to NFR-007 | Performance | Brief §17 | — | — |
| NFR-010 to NFR-013 | Compatibility | Brief §16 | — | — |
| NFR-020 to NFR-024 | Accessibility | Brief §18 | — | — |
| NFR-030 to NFR-033 | Privacy and SEO | Brief §19; D-03; D-04 | — | — |
| NFR-040 to NFR-045 | Maintainability | Brief §22 | — | — |
| UX-001 to UX-010 | Visual system | Brief §4–6, §21 | — | — |

---

## J. Decisions needed for FSD approval

1. **Copy picks** for each block in §F.7 (choose, combine or rewrite): humorous line, story line, mountain, pearl, oasis, final message, scroll cue.
2. **The optional final line** ("I've thought about that morning more than once since."): include it or not.
3. **Sign-off:** none, or your first name.
4. **Fonts:** confirm Cormorant Garamond + Manrope (UX-001).

## Accepted risks carried forward

| ID | Risk | Status |
|---|---|---|
| R-06 | The hosted audio is a copyrighted film song at 32 kbps | Accepted by the owner (Q-04 → D) |
| R-12 | The image licences in `public/` are unverified | Accepted by the owner (Q-12) |
| R-13 | The high-resolution oasis asset is pending, so a low-resolution placeholder is used until it arrives | Open: a dependency for Scope |
