/**
 * Every word on the site lives here (NFR-041).
 *
 * Story copy approved by the owner (FSD §K). Line breaks are deliberate:
 * each inner array is one beat (a paragraph shown on its own, FR-063);
 * each string is one revealed line. Adding a beat adds a stop — no code changes.
 */

/** A scene's text: beats (paragraphs) of lines. */
export type Beats = readonly (readonly string[])[]

export const copy = {
  opening: {
    label: 'Collaboration Proposal',
    /** T1 */
    humour: ['Zero products.', 'Zero budget.', 'One unexpectedly memorable morning.'],
    story: [
      ['Kolkata. A rainy morning.'],
      ['The city was in no hurry.', 'Neither was I.'],
      ['It was an ordinary journey.', 'Or so I thought.'],
    ] as Beats,
    /** FR-077–FR-078: the cue doubles as a playful invitation to start the music. */
    cue: {
      hint: 'Psst… press play first',
      afterPlay: 'Lovely. Now, scroll slowly.',
      plain: 'Scroll slowly.',
    },
  },
  mountain: {
    beats: [
      ['Somewhere between the road ahead', 'and the reflection behind me,', 'I caught my first glimpse of you.'],
      ['The world carried on.', 'Yet, for a moment,', 'everything else went quiet.'],
      ['Like sunlight finding a distant snowy peak,', 'something bright had found its way', 'into an ordinary morning.'],
    ] as Beats,
    alt: 'Snow-covered peaks catching the first sunlight above the clouds.',
  },
  pearl: {
    beats: [
      ['Not everything beautiful seeks attention.'],
      ['Some things lie quietly beneath the surface,', 'waiting to be noticed.'],
      ['Like a pearl in the depths of the sea,', 'you can discover something rare', 'without ever looking for it.'],
    ] as Beats,
    alt: 'Sunlight falling in soft rays through deep, dark water.',
  },
  oasis: {
    beats: [
      ['The road went on.', 'The day went on.'],
      [
        'But some encounters are like finding an oasis',
        'in a long stretch of desert—',
        'brief, unexpected,',
        'and remembered long after',
        'you have walked away.',
      ],
    ] as Beats,
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
