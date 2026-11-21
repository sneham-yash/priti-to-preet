/**
 * Every word on the site lives here (NFR-041).
 *
 * STATUS: placeholder copy = the ★ recommendations from FSD §F.7.
 * The owner has final authorship (OI-01) — edit freely; line breaks are deliberate:
 * each array entry is one revealed line.
 */

export const copy = {
  opening: {
    label: 'Collaboration Proposal',
    /** T1 */
    humour: ['Zero products.', 'Zero budget.', 'One unexpectedly memorable morning.'],
    /** H2 */
    story: ['Kolkata. A rainy morning.', 'Nothing extraordinary', 'was supposed to happen.'],
    cue: 'Scroll slowly',
  },
  mountain: {
    /** M3 */
    lines: ['For a moment,', 'everything else went quiet.', 'Only the light on the snow.'],
    alt: 'Snow-covered peaks catching the first sunlight above the clouds.',
  },
  pearl: {
    /** P2 */
    lines: ['Not everything rare', 'announces itself.', 'Sometimes,', 'you simply notice.'],
    alt: 'Sunlight falling in soft rays through deep, dark water.',
  },
  oasis: {
    /** O3 */
    lines: ['I wasn’t looking for anything.', 'That’s probably what made', 'the moment feel different.'],
    alt: 'A small oasis of still water and palms in a vast golden desert.',
  },
  message: {
    /** Visually hidden section heading for screen readers. */
    heading: 'A note',
    /** F3 — each inner array is one paragraph; entries are lines within it. */
    paragraphs: [
      ['Priti,'],
      ['No metaphors this time.'],
      ['I thought you were beautiful.'],
      ['And I’d like to get to know you,', 'if you’d like that too.'],
    ],
    /** Sign-off: none by default (FSD §F.7). Set a string to show one. */
    signOff: null as string | null,
  },
  audio: {
    play: 'Play music',
    pause: 'Pause music',
    unavailable: 'Music unavailable',
  },
} as const
