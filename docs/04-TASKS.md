# An Unusual Collaboration: Task Breakdown

**Status:** Approved (blanket owner approval, 2026-11-21) · Based on [03-PLAN.md](03-PLAN.md)

| Task | Title | Requirements | Depends on | Output | Done when |
|---|---|---|---|---|---|
| TASK-01 | Replace the starter with React + Vite + TS (strict) + Tailwind 4; set up ESLint; initialise git | NFR-040, NFR-045 | — | Clean scaffold | `npm run build` and `npm run lint` pass with 0 warnings |
| TASK-02 | Move originals to `design/source-images/` (neutral names); rename the audio to `public/audio/track.mp3`; delete the starter files | NFR-044, FR-076 | 01 | Clean `public/` | `public/` holds only the files we use |
| TASK-03 | Image pipeline script plus the generated manifest | FR-091, NFR-002 | 02 | `public/images/*`, `images.generated.ts` | Mobile variants ≤ 200 KB each |
| TASK-04 | Design tokens, fonts, base styles, metadata, robots, favicon | UX-001, UX-002, UX-004, NFR-021, NFR-032, NFR-033 | 01 | `index.css`, `index.html`, `robots.txt`, `favicon.svg` | Only 2 font families load; noindex is present; the title is neutral |
| TASK-05 | Content file with the ★ placeholder copy | NFR-041, FR-053 | 01 | `copy.ts` | Every string lives in one file |
| TASK-06 | GSAP setup, `useSceneAnimation` hook, `atmosphere` and device-tier helpers | FR-002 to FR-005, FR-090, NFR-042 | 01 | `lib/*`, `hooks/*` | No leftover triggers after unmount |
| TASK-07 | `LineReveal`, `SceneImage` components | FR-060 to FR-062, FR-081, FR-082 | 04, 06 | Components | Lines are readable without JS animation; images fall back to the gradient |
| TASK-08 | `ParticleField` canvas (rain, snow, specks, motes) | FR-023, FR-030, FR-042, NFR-006 | 06 | Component | Particle caps respected; pauses when idle or hidden |
| TASK-09 | Opening scene | FR-010 to FR-014, UX-010 | 05, 07, 08 | Scene | TC-010 to TC-014 pass |
| TASK-10 | Mountain scene + approach zone | FR-020 to FR-024 | 03, 09 | Scene | TC-020 to TC-024 pass |
| TASK-11 | **Pearl prototype** (the riskiest visual), then the full scene | FR-030 to FR-035 | 10 | Scene | TC-030 to TC-035 pass; visual check |
| TASK-12 | Oasis scene with the mask reveal (single image or pair) | FR-040 to FR-043 | 11 | Scene | TC-040 to TC-043 pass |
| TASK-13 | Final message | FR-050 to FR-054, UX-009 | 12 | Scene | TC-050 to TC-054 pass |
| TASK-14 | Audio control | FR-070 to FR-076 | 04 | Component | TC-070 to TC-076 pass |
| TASK-15 | Error boundary + static fallback + `<noscript>` | FR-083, FR-084 | 05 | Components | TC-083 and TC-084 pass |
| TASK-16 | Responsive and accessibility pass (compositions, scrims, focus) | FR-092, NFR-010 to NFR-013, NFR-020 to NFR-024 | 09 to 15 | Polish | TC-1xx pass |
| TASK-17 | `vercel.json` (headers) | NFR-030 to NFR-032 | 01 | Config | Headers are valid |
| TASK-18 | Playwright suite + axe; run on Chromium and WebKit | All | 09 to 17 | `tests/*` | Report produced |
| TASK-19 | Lighthouse and performance traces; fix defects | NFR-001 to NFR-007 | 18 | Report | Budgets met or defects logged |
| TASK-20 | Code review, test report, deployment guide, final summary | All | 19 | `docs/06-*` to `docs/08-*` | Delivered |

**Execution order:** 01 → 02 → 03 → 04 → 05 → 06 → 07 → 08 → 09 → 10 → 11 → 12 → 13 → 14 → 15 → 16 → 17 → 18 → 19 → 20.

**Risky tasks:**
- 06/10 to 12: holding scenes in place on iOS.
- 11: the pearl has to look real.
- 19: mobile performance.

**Milestones:**

| Milestone | After | Meaning |
|---|---|---|
| M1 | 05 | Foundation complete |
| M2 | 13 | All scenes complete |
| M3 | 17 | Feature complete |
| M4 | 20 | MVP complete |

## CR-02 tasks (approved with defaults, 2026-11-21)

| Task | Title | Requirements | Depends on | Done when |
|---|---|---|---|---|
| TASK-21 | Update the docs (FSD v1.1, Scope, Plan, Tasks, Test Cases) | All CR-02 | — | Docs updated and marked approved |
| TASK-22 | Write the CR-02 test cases as Playwright tests; run them and see them fail | FR-002, FR-063 to FR-067, FR-077 to FR-079, FR-100 to FR-106 | 21 | New tests fail for the right reason |
| TASK-23 | Copy as beats; `Beats` component; static story | FR-063, FR-066, NFR-041 | 22 | Reduced-motion tests pass |
| TASK-24 | `addBeats`, derived pin length, `onCleanup`; rebuild the three held timelines with labels | FR-003, FR-024, FR-035, FR-043, FR-063, FR-064 | 23 | Beat tests pass |
| TASK-25 | Stop registry and section stepping | FR-002, FR-100 to FR-106 | 24 | Stepping tests pass |
| TASK-26 | Music hint, pulse and cue states | FR-013, FR-077 to FR-079 | 22 | Hint tests pass |
| TASK-27 | Full suite on all four browser projects; visual review at 390 and 1440 px | All | 23 to 26 | Suite green; screenshots reviewed |

**Order:** 21 → 22 → 23 → 24 → 25 → 26 → 27.
