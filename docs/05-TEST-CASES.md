# An Unusual Collaboration: Test Cases

**Status:** Approved (blanket owner approval, 2026-11-21).

**Method key:**

| Key | Meaning |
|---|---|
| A | Automated (Playwright: Chromium and WebKit) |
| T | Tooling (Lighthouse, axe, build output, traces) |
| V | Visual review of screenshots |
| D | Real device, run by the owner. BLOCKED until then |

**Precondition for all cases:** a production build (`npm run build && npm run preview`), unless stated otherwise.

## Functional

| ID | Req | Scenario | Steps | Expected | Method | Priority |
|---|---|---|---|---|---|---|
| TC-001 | FR-001 | Section structure | Load `/`; query `main > section` | Exactly 5 sections, ids in order: opening, mountain, pearl, oasis, message. No `nav`, `header` or `footer` | A | P1 |
| TC-002 | FR-002 | Programmatic scroll honoured, no CSS snap | Scan CSS for `scroll-snap-type`. Run `window.scrollTo(0, 3000)` | No snap rules. The scroll position is honoured exactly | A | P1 |
| TC-003 | FR-003 | Pin budget | Read `ScrollTrigger.getAll()` | ≤ 3 pinned triggers, each with a distance ≤ 2.5 × viewport height | A | P1 |
| TC-004 | FR-004 | Reverse scrolling | Scroll to the bottom in steps, then back to the top in steps; screenshot the top | The top matches the initial screenshot. Opening text is visible | A | P1 |
| TC-005 | FR-005 | Resize | At 1440 × 900, scroll to the pearl; resize to 390 × 844 | Pearl section visible. No horizontal overflow. Pins still valid | A | P2 |
| TC-010 | FR-010 | Opening atmosphere | Load; screenshot | Rain canvas present, fog and bokeh elements present, no image request for the opening | A+V | P2 |
| TC-011 | FR-011 | Framing on first paint | Load at 320 × 568 | The h1 "Collaboration Proposal" and the humour line are inside the viewport | A | P1 |
| TC-012 | FR-012 | Personal intent on the first scroll | Scroll one viewport height | Story lines are visible (opacity > 0.9). The humour line opacity is < 0.1 | A | P1 |
| TC-013 | FR-013 | Scroll cue | Load (cue visible); scroll 20% | The cue's opacity is < 0.1 after scrolling | A | P3 |
| TC-014 | FR-014, NFR-033 | No brand, time or name leakage | Search the `dist/` text | No "Hopper". No time patterns like `\d{1,2}:\d{2}` in the copy | A | P1 |
| TC-020 | FR-020 | Rain clears at the mountain | Scroll to the mountain stage | `atmosphere.rain` < 0.05 | A | P2 |
| TC-021 | FR-021 | Image motion limits | Inspect tweens on the mountain image | translateX ≤ 6%, scale ≤ 1.06 | A (code) + V | P2 |
| TC-022 | FR-022 | Sunlight warms | Sample the sun overlay opacity at the start and end of the hold | The end value is greater than the start value | A | P2 |
| TC-023 | FR-023 | Snow caps | Read the particle counts at 390 px and 1440 px | Snow ≤ 60 and ≤ 120 | A | P2 |
| TC-024 | FR-024 | Mountain text | Scroll to the end of the hold | All mountain lines are visible | A | P1 |
| TC-030 | FR-030 | Snow becomes specks | Scroll to the pearl stage | snow < 0.05, specks > 0.95 | A | P2 |
| TC-032 | FR-032 | The pearl is code, not an image | Inspect `.pearl` | A div with gradients. No `<img>`. Size within 18–28 vmin and ≤ 180 px | A | P1 |
| TC-033 | FR-033 | Discovery sequence | Opacity at the hold start vs. at 70% | ≤ 0.15 at the start, ≥ 0.95 at 70% | A | P1 |
| TC-034 | FR-034 | The shimmer loop pauses off-screen | Check the section class at the top of the page | The pearl section has no `.is-visible` | A | P3 |
| TC-035 | FR-035 | Pearl text appears after the light | Text opacity at 40% vs. at the end | < 0.1 at 40%, visible at the end | A | P2 |
| TC-041 | FR-041 | Mask reveal | Clip-path at the hold start vs. the end | Fully hidden at the start, fully revealed at the end | A | P1 |
| TC-042 | FR-042 | Mote cap | Particle count at 390 px | Motes ≤ 30 | A | P3 |
| TC-043 | FR-043 | Oasis text | End of the hold | All lines visible | A | P1 |
| TC-050 | FR-050 | Effects stop | Scroll to the message | All atmosphere weights are 0. The canvas loop is idle | A | P1 |
| TC-051 | FR-051, UX-009 | Plain letter | Screenshot of the message; computed styles | Background #F6F3ED, text #252525, no images in the section | A+V | P1 |
| TC-052 | FR-052 | One fade at most | Count tweens targeting the message | ≤ 1, opacity only | A (code) | P2 |
| TC-053 | FR-053 | The name appears exactly once | Count "Priti" in the rendered body text **and** in all `dist/` text files (title, meta) | Exactly 1, inside `#message` | A | P1 |
| TC-054 | FR-054 | Nothing interactive after the message | Query focusable elements inside `#message` | 0 | A | P1 |
| TC-060 | FR-060 | Line reveal easing | Code review of the eases | Only from the approved set. No bounce, elastic or back | A (code) | P2 |
| TC-061 | FR-061 | Lines read as sentences | Accessibility tree of the headings | Each heading's accessible name is the full sentence | A | P1 |
| TC-062 | FR-062, FR-090 | Reduced motion: all text visible | Emulate `reduce`; scroll the whole page | Every copy line has opacity 1. No pins. No canvas | A | P1 |
| TC-070 | FR-070 | Control present and big enough | Measure the button | ≥ 44 × 44, `position: fixed`, inside the viewport at 320 px | A | P1 |
| TC-071 | FR-071 | No autoplay | Load and scroll the full page without clicking | 0 requests for `track.mp3`. `audio.paused === true` | A | P1 |
| TC-072 | FR-072 | Play and pause | Click; wait; click | Playing, then paused. Volume ramps up | A | P1 |
| TC-073 | FR-073 | Accessible state | Inspect before and after the click | `aria-pressed` false→true; label "Play music"→"Pause music" | A | P1 |
| TC-074 | FR-074 | Scrolling doesn't affect audio | Play, then scroll to the bottom | Still playing | A | P2 |
| TC-075 | FR-075 | Audio error | Route `track.mp3` to 404; click | The control hides. No uncaught error | A | P2 |
| TC-076 | FR-076 | Neutral audio path | Inspect `dist/` | Only `audio/track.mp3`. No song title in any path | A | P2 |
| TC-081 | FR-081 | Progressive images | Throttle; load | Gradient visible, then the image fades in. CLS ≤ 0.05 | A+T | P2 |
| TC-082 | FR-082 | Image failure | Block `/images/*`; scroll everything | All text is still visible. No broken-image icons | A | P1 |
| TC-083 | FR-083 | Runtime error fallback | Load `/?__fail=1` (test hook, inert in production) | The static story renders, including the final message | A | P1 |
| TC-084 | FR-084 | No JS | Disable JS; load | The noscript text includes the final message | A | P2 |
| TC-091 | FR-091, FR-092 | Crops | Screenshots at 320, 375, 390, 430, 768, 1024, 1440 | Subject visible in every scene. Compositions intentional | V | P1 |

## Mobile, accessibility, performance and browser

| ID | Req | Scenario | Expected | Method | Priority |
|---|---|---|---|---|---|
| TC-101 | NFR-011 | No horizontal overflow at all 7 widths, at 5 scroll positions | `scrollWidth === clientWidth` | A | P1 |
| TC-102 | NFR-012 | Viewport units | Sections use `svh`/`dvh` | A (code) | P2 |
| TC-103 | NFR-013 | Safe area | The audio control uses `env(safe-area-inset-*)` | A (code) | P3 |
| TC-110 | NFR-021, NFR-023 | axe scan at the top and at the message | 0 serious or critical issues | T | P1 |
| TC-111 | NFR-021 | Headings | One h1, and each section has a heading | A | P1 |
| TC-112 | NFR-022 | Keyboard | Tab reaches the audio button, it shows a focus ring, and Enter/Space toggle it | A | P1 |
| TC-113 | NFR-020 | Contrast | Text vs. sampled background ≥ the thresholds | T+V | P1 |
| TC-114 | NFR-024 | 200% zoom | Text readable, no clipping | V | P3 |
| TC-120 | NFR-001 | JS budget | ≤ 130 KB gz | T | P1 |
| TC-121 | NFR-002 | Image budget | Mobile variants ≤ 200 KB; all images ≤ 2 MB | T | P1 |
| TC-122 | NFR-003 | Initial transfer | ≤ 350 KB before scrolling | A | P1 |
| TC-123 | NFR-004 | Lighthouse mobile | Perf ≥ 85, A11y ≥ 95, BP ≥ 95, LCP ≤ 2.5 s, CLS ≤ 0.05, TBT ≤ 200 ms | T | P1 |
| TC-124 | NFR-005, NFR-007 | Performance trace during scrolling, 4× CPU throttle | No long tasks over 50 ms during scrolling | T | P2 |
| TC-125 | NFR-006 | Canvas idle | No rAF draw while all weights are 0 | A | P2 |
| TC-130 | NFR-030, NFR-031 | Privacy | No third-party requests, no cookies, no storage | A | P1 |
| TC-131 | NFR-032 | noindex | Meta present, `robots.txt` disallows, the header is configured | A | P1 |
| TC-132 | NFR-043 | Console clean | 0 errors or warnings during a full scroll | A | P1 |
| TC-133 | NFR-042 | Cleanup | After unmount, `ScrollTrigger.getAll().length === 0` | A | P2 |
| TC-134 | NFR-040 | Lint and type check | 0 errors and 0 warnings | T | P1 |
| TC-140 | NFR-010 | Chromium (Chrome and Edge engine) | The full suite passes | A | P1 |
| TC-141 | NFR-010 | WebKit (Safari engine proxy) | The full suite passes | A | P1 |
| TC-142 | NFR-010 | Real iPhone, Safari | Smooth full scroll; audio plays; no jumps from the address bar | D | P1 |
| TC-143 | NFR-010 | Real Android phone, Chrome | Same as TC-142 | D | P1 |
| TC-144 | NFR-010 | Desktop Safari | Same | D | P2 |

## CR-02: pacing, stepping and the music hint

| ID | Req | Scenario | Steps | Expected | Method | Priority |
|---|---|---|---|---|---|---|
| TC-150 | FR-100 | Stop list | Read the probe's stops | 11 stops in order: opening, opening-story, mountain-0..2, pearl-0..2, oasis-0..1, message; increasing positions | A | P1 |
| TC-151 | FR-002, FR-101 | Wheel steps forward through the whole story | From the top, one wheel gesture at a time | Each gesture lands on the next stop (±2 px), in order, ending at the message; each step settles within 2.6 s | A | P1 |
| TC-152 | FR-002 | Wheel steps back | From the message, one gesture up | Lands on the previous stop | A | P1 |
| TC-153 | FR-102 | Momentum guard | 10 wheel events 16 ms apart | Exactly one stop moved | A | P1 |
| TC-154 | FR-103 | Keyboard | ArrowDown, PageDown, Space, ArrowUp, Shift+Space, End, Home | One stop each; End → message; Home → top | A | P1 |
| TC-155 | FR-103 | Space on the audio button | Tab to the button, press Space | Music toggles; the page doesn't move | A | P1 |
| TC-156 | FR-104 | Native scroll respected | `scrollTo` between two stops; wait; one forward gesture | Not snapped while idle; lands on the first stop below | A | P1 |
| TC-157 | FR-105 | Ends | Gesture up at the top; gesture down at the message | Position unchanged | A | P2 |
| TC-158 | FR-106 | Reduced motion | Emulate reduce; one wheel notch | Native scroll (moves by the wheel delta, not to a stop) | A | P1 |
| TC-159 | FR-002 | Browser zoom | Ctrl+wheel | Not intercepted (event not prevented) | A | P2 |
| TC-160 | FR-063, FR-064 | One beat at a time | Visit each beat stop | That beat's lines ≥ 0.95; other beats' lines ≤ 0.05 | A | P1 |
| TC-161 | FR-066 | Reduced motion: beats stacked | Emulate reduce | All lines opacity 1; beats in one scene don't overlap | A | P1 |
| TC-162 | FR-067 | Beat size and overflow | Every beat stop at 320 and 1440 px | No horizontal overflow; screenshots for review | A+V | P2 |
| TC-163 | FR-035, FR-043 | Text after the visuals | Pearl and oasis just before their first beat | Pearl opacity ≥ 0.95 / oasis fully revealed before any text shows | A | P1 |
| TC-170 | FR-077 | Music hint at load | Load | "Psst… press play first" visible; the control has `data-hint="on"` and a pulse animation | A | P1 |
| TC-171 | FR-078 | After play | Click play | Hint hidden; "Lovely. Now, scroll slowly." visible; pulse stopped | A | P1 |
| TC-172 | FR-079 | Hint leaves with the first step | One step down, then back to the top | Cue opacity < 0.1 both times; `data-hint="off"` | A | P1 |
| TC-173 | FR-079 | Reduced motion | Emulate reduce | The pulse has no animation | A | P2 |
| TC-174 | FR-077 | Hint layout | 320, 390, 1440 px at the top | The hint doesn't overlap the control or the framing text | A | P1 |
| TC-175 | FR-002 | Touch swipe on a real phone | Swipe up and down through the story | One stop per swipe, smooth, no double steps | D | P1 |
