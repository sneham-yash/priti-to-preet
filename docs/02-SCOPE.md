# An Unusual Collaboration: Scope Definition

| | |
|---|---|
| **Phase** | 3 of the HTD workflow (Scope) |
| **Status** | Draft, waiting for owner approval |
| **Version** | 0.1 · 2026-11-21 |
| **Based on** | [01-FSD.md](01-FSD.md) v1.0 (approved) |

---

## 1. MVP Definition

> **The MVP is every approved FSD requirement (FR, UX and NFR) implemented and verified, with the owner's final copy, ready to deploy to Vercel as a clean production build.**

The MVP is not a reduced version of the experience. The FSD already describes the smallest complete version. Scope keeps it from growing.

**Two gates:**

| Gate | Meaning | Conditions |
|---|---|---|
| **MVP complete** | Built and tested | All in-scope work packages done. Every automated and tooling test case PASS. Code review done. The low-resolution oasis placeholder is acceptable at this gate. |
| **Release-ready** | OK to send the link | MVP complete **+** final copy approved (OI-01) **+** high-resolution oasis image in place (OI-02) **+** real-device checks run by the owner (OI-03) **+** a production deploy verified on Vercel. |

---

## 2. In Scope: MVP Work Packages

| WP | Work package | Covers (FSD IDs) | Complexity |
|---|---|---|---|
| WP-01 | **Foundation:** a fresh React + Vite + TypeScript (strict) + Tailwind setup in `priti_to_preet/`, git initialised, ESLint, self-hosted fonts, design tokens, one content file, neutral metadata, `noindex`, `robots.txt`, a neutral favicon replacing the Vite logo | NFR-021, NFR-030 to NFR-033, NFR-040, NFR-041, NFR-045, UX-001, UX-002 | Low |
| WP-02 | **Scroll and animation infrastructure:** a GSAP setup that cleans up after itself, reduced-motion handling, background-colour interpolation between scenes, the shared line-reveal component, one shared particle canvas (rain, snow, specks, motes), a device-tier check, and recalculation on resize | FR-002 to FR-005, FR-060 to FR-062, FR-090, NFR-005 to NFR-007, NFR-042, UX-004, UX-006 | **High** |
| WP-03 | **Opening scene:** rain, fog, bokeh, collaboration framing, story-line reveal, scroll cue | FR-010 to FR-014, UX-010 | Medium |
| WP-04 | **Mountain scene:** transition from mist, image entry, sunlight warming, snowfall, line reveal | FR-020 to FR-024 | Medium |
| WP-05 | **Pearl scene:** the descent, the deep-water backdrop, a **code-built pearl** with the discovery sequence, ray shimmer, line reveal | FR-030 to FR-035 | **High** |
| WP-06 | **Oasis scene:** surfacing, horizontal mask reveal (works with one image or the matched pair), light sweep, motes, line reveal | FR-040 to FR-043 | Medium |
| WP-07 | **Final message:** fade to ivory, a plain letter layout, a single fade, the name once | FR-050 to FR-054, UX-009 | Low |
| WP-08 | **Audio:** the play/pause control, lazy loading, volume fades, accessible state, error hiding, neutral file path | FR-070 to FR-076 | Low |
| WP-09 | **Asset pipeline:** responsive AVIF and WebP at 3 widths, focal points and portrait crops, a light colour grade that ties the scenes together, unused images moved out of `public/`, the audio renamed | FR-076, FR-091, NFR-002, NFR-044 | Medium |
| WP-10 | **Loading and failure handling:** progressive image loading, gradient fallbacks, the error-boundary static fallback, `<noscript>` | FR-080 to FR-084 | Low |
| WP-11 | **Responsive and accessibility pass:** separate mobile and desktop compositions, contrast scrims, focus states, screen-reader checks, 200% zoom | FR-092, NFR-010 to NFR-013, NFR-020 to NFR-024, UX-003, UX-005, UX-007, UX-008 | Medium |
| WP-12 | **Verification and release prep:** Playwright tests (Chromium and WebKit), Lighthouse, axe, performance traces, the code review report, the test report, `vercel.json` (headers), the deployment guide | All tests, NFR-001 to NFR-004, NFR-043 | Medium |

Every FSD requirement maps to at least one work package. Nothing outside the FSD is included.

---

## 3. Optional Enhancements (not in the MVP)

These are only done if you approve them separately after the MVP is complete. Each one is self-contained and doesn't change the MVP design.

| ID | Enhancement | Value | Cost | Recommendation |
|---|---|---|---|---|
| OE-01 | **Neutral social-preview image** (an Open Graph still from the rainy opening, without names) | A nicer card if the link is pasted into WhatsApp or similar | ~1 h | Worth it, but low priority |
| OE-02 | **Seabed layer** in the pearl scene (`rraabG…` image), giving the pearl somewhere to rest | More depth | ~1–2 h, +~60 KB | Only if the pearl scene feels empty after the MVP |
| OE-03 | **Static film grain** (tiny tiled texture) over the image scenes, for a more cinematic, consistent feel | Makes the images look like one shoot | ~0.5 h, +~5 KB | Recommended. Decide after seeing the MVP |
| OE-04 | **Higher-quality audio file** (same song, better source) | Removes the tinny 32 kbps sound | Owner supplies the file | Your call (R-06 still applies) |
| OE-05 | **Custom domain** | A neater link | Domain cost plus DNS setup | Optional |
| OE-06 | **Matched oasis pair** (desert with and without the oasis) | The oasis "appears" in empty sand | Owner generates it. The code already supports it (FR-041) | Recommended if image generation cooperates |

---

## 4. Out of Scope

Carried over from FSD §H, and fixed for this project:

- Navigation, header, footer, progress indicators, back-to-top
- Forms, reply buttons, contact or social links, calls to action
- Analytics, cookies, storage, tracking, Vercel Analytics and Speed Insights
- Carpool or app UI, Hopper branding, times, routes or places other than "Kolkata"
- Three.js / WebGL, Lenis, slider, carousel or full-page libraries, icon libraries
- Horizontal page scrolling, scroll snap, scroll hijacking
- Video backgrounds, custom cursors, preloaders or splash screens
- Multiple tracks, playlists, volume sliders, track metadata
- Theme switching, a CMS, a backend or API, password protection, i18n

### Scope exclusions: things I will not do

| Exclusion | Who covers it instead |
|---|---|
| Generating the high-resolution oasis image (I can't produce photographic images) | Owner, using the prompt in FSD §F.6 |
| Improving or re-sourcing the audio (32 kbps can't be upscaled) | Owner (OE-04) |
| Testing on a real iPhone or Android phone | Owner, using a checklist I'll provide (Phase 6) |
| The actual Vercel deployment, unless your Vercel CLI is logged in on this machine and you ask me to | Owner, using the guide, or me with your explicit go-ahead |
| Writing the email | Excluded (Q-10) |
| Choosing the final words | Owner (OI-01). I only draft and advise |

---

## 5. Deliverables

| # | Deliverable | Location |
|---|---|---|
| D1 | Source code (git repository, local; neutral name if it is ever pushed) | `priti_to_preet/` |
| D2 | Optimised production assets (images, fonts, audio, favicon) | `priti_to_preet/public/`, `src/assets/` |
| D3 | Source images that won't ship, moved out of `public/`, nothing deleted | `priti_to_preet/design/source-images/` |
| D4 | Process documents: FSD, Scope, Plan, Tasks, Test Cases | `priti_to_preet/docs/` |
| D5 | Automated test suite (Playwright) | `priti_to_preet/tests/` |
| D6 | Test execution report (PASS / FAIL / BLOCKED plus evidence), Lighthouse and axe results | `docs/` |
| D7 | Code review report | `docs/` |
| D8 | `vercel.json` (security and `noindex` headers) and a Vercel deployment guide | repo root, `docs/` |
| D9 | Final summary: architecture, dependencies, traceability, known limitations | `docs/` |

---

## 6. Technical Boundaries

| Boundary | Limit |
|---|---|
| App type | A static single-page site. Client-only, one route (`/`). No server, API, database or SSR. |
| Runtime dependencies | **At most 3 JS libraries** (React, React DOM, GSAP including ScrollTrigger) **plus self-hosted font packages**. Anything more needs written justification in the Plan and your approval. |
| Build output | Static `dist/`, deployed to Vercel with the Vite preset. **No environment variables.** |
| Rendering | DOM + CSS + 2D canvas only. No WebGL. |
| Browsers | As in NFR-010: modern evergreen browsers plus Safari/iOS 16.4+. No IE or legacy polyfills. |
| Network | No third-party requests at runtime (NFR-031). |
| Page weight | JS ≤ 130 KB gz. Initial load ≤ 350 KB. All images ≤ 2 MB. Audio (1.56 MB) loads only when she presses play. |

---

## 7. Asset Requirements

| Asset | Source | Status | Spec / action |
|---|---|---|---|
| Mountain | `WvcN4Z….jpg` (2048×1365) | ✅ Ready | Focal point about 25% / 40%. AVIF and WebP at 640 / 1280 / 2048 |
| Mountain (alternative) | `5YLyvm….jpg` | Kept in `design/` | Only if the main image doesn't work in context |
| Ocean | `ZkKSkG….jpg` (3840×2160, 1.76 MB) | ✅ Ready | Compress to ≤ 200 KB on mobile. Focal point at the centre top |
| Oasis (final) | Owner-generated from the FSD §F.6 prompt | ⏳ **Pending (OI-02)** | ≥ 2400 px wide landscape **and** ≥ 1080×1920 portrait. Optional matched "without oasis" pair |
| Oasis (placeholder) | `ggRn7W….jpg` (600×336) | ✅ Placeholder only | Will look soft on phones. Not acceptable for release |
| Audio | `Aao_Naa_Kyun_ho_gaya_na.mp3` | ✅ Ready (R-06 accepted) | Served as `/audio/track.mp3` |
| Fonts | Cormorant Garamond, Manrope (SIL Open Font License) | To install | Self-hosted, Latin subset, only the weights used |
| Favicon | New, neutral (e.g. a single raindrop or pearl dot) | To create | SVG, no initials, no names |
| Not used | `gjf7BH…`, `HyfFV-…`, `SzyHQ2…`, `wvUaDi…`, `vCpVGq…`, `rraabG…` (OE-02) | — | Moved to `design/source-images/`, not deleted |
| Starter files | Vite logo, `hero.png`, `react.svg`, `icons.svg`, template CSS | — | Removed during WP-01 (approved in Q-08) |

---

## 8. Dependencies and Open Items

| ID | Item | Owner | Needed by | Blocks |
|---|---|---|---|---|
| **OI-01** | **Final copy picks** (FSD §J 1–3: copy for every block, the optional line, sign-off). Until they're chosen, the ★ recommendations are used as **placeholders only**. | You | Before release; ideally before WP-03 to WP-07 are reviewed | Release gate |
| **OI-02** | **High-resolution oasis image** (landscape + portrait; matched pair optional) | You | Before the WP-06 visual sign-off | Release gate |
| **OI-03** | **Real-device testing** on your phone (iOS Safari and/or Android Chrome) | You | Phase 7 final testing | Release gate |
| OI-04 | Vercel account (and CLI login, if you want me to deploy) | You | Deployment | Deploy only |
| OI-05 | Approval of each later phase (Plan, Tasks, Test Cases) | You | At each gate | All development |

---

## 9. Risk Register (updated)

| ID | Risk | Likelihood | Impact | Mitigation / status |
|---|---|---|---|---|
| R-01 | How she receives it | — | High | The design guarantees no pressure (FR-054, the copy guidelines). Owner is aware. |
| R-02 | It looks generic or templated | Medium | High | Shared light grade across scenes, art direction per scene, OE-03 grain, visual review at every scene. |
| R-03 | Mobile performance (particles + held scenes + images) | Medium | High | Particle caps, device-tier check, compositor-only animation, measured against NFR-007. |
| R-04 | iOS Safari: browser-bar resizes, jitter in held scenes | Medium | Medium | `svh`/`dvh`, ScrollTrigger's mobile settings, ≤ 3 held scenes, WebKit tests + OI-03. |
| R-05 | Real-device coverage depends on you | High | Medium | Playwright WebKit as a proxy. Device tests marked BLOCKED until OI-03. |
| R-06 | Audio: copyrighted, 32 kbps | — | Low–Medium | **Accepted by the owner.** |
| R-07 | Copy tone | Medium | High | Your picks (OI-01). The copy guidelines in FSD §F.7. A dedicated copy check in the review. |
| R-08 | Overbuilding | Low | Medium | No work outside the FSD. Every animation traces to an FR. |
| R-09 | The link is forwarded or indexed | Low | Medium | `noindex` meta, header and robots, neutral slug, name appears once (NFR-032/033, FR-053). |
| R-12 | Image licences unverified | — | Low | **Accepted by the owner.** |
| R-13 | Oasis asset delayed or off-style | Medium | High | The placeholder lets development continue. The release gate blocks sending without it. |
| R-14 | The code-built pearl looks fake | Medium | High | Prototype the pearl early in WP-05 and get your visual sign-off before polishing the rest of the scene. |
| R-15 | React 19 StrictMode double-mounting duplicates GSAP triggers | Medium | Medium | All animations created inside a context and reverted on unmount (NFR-042), with a test for leftover triggers. |
| R-16 | Version compatibility (Vite 8, Tailwind 4, React 19, GSAP 3) | Low | Medium | Versions pinned and checked in the Plan before installing. |

---

## 10. Complexity and Effort Estimate

Effort is focused engineering time, excluding your review time between gates.

| WP | Complexity | Estimate |
|---|---|---|
| WP-01 Foundation | Low | 2–3 h |
| WP-02 Scroll and animation infrastructure | High | 5–7 h |
| WP-03 Opening | Medium | 3–4 h |
| WP-04 Mountain | Medium | 3–4 h |
| WP-05 Pearl | High | 4–6 h |
| WP-06 Oasis | Medium | 3–4 h |
| WP-07 Final message | Low | 1–2 h |
| WP-08 Audio | Low | 1–2 h |
| WP-09 Asset pipeline | Medium | 2–3 h |
| WP-10 Loading and failure handling | Low | 1–2 h |
| WP-11 Responsive and accessibility pass | Medium | 3–4 h |
| WP-12 Verification and release prep | Medium | 5–7 h |
| **Total** | **Medium overall** | **≈ 33–48 h** (about 4–6 focused days) |

**Overall:** a small product with a few hard parts. The engineering risk sits in WP-02 (getting held scenes right on iOS) and WP-05 (pearl realism). The quality risk sits in assets and copy, which you control.

**Effort reduced on purpose:** one shared particle system for all scenes, one text-reveal component, one content file, no 3D, no smooth-scroll library, and one route.

---

## 11. Scope Approval Checklist

- [ ] The MVP definition and the two gates (MVP complete / Release-ready) are accepted
- [ ] Work packages WP-01 to WP-12 are accepted
- [ ] Optional enhancements OE-01 to OE-06 stay out of the MVP
- [ ] The out-of-scope list and the exclusions of my role are accepted
- [ ] Open items OI-01 to OI-03 are acknowledged as release blockers you own
- [ ] Approval to start **Phase 4: Technical Plan**
