import { useRef } from 'react'
import { Beats, LineReveal } from '../components/LineReveal'
import { copy } from '../content/copy'
import { useSceneAnimation, type SceneSetup } from '../hooks/useSceneAnimation'
import { gsap } from '../lib/gsap'
import { playLineReveal, trackVisibility } from '../lib/sceneTweens'
import { registerStop } from '../lib/stops'

/** Soft out-of-focus lights, as if through a wet windshield. Positions are art-directed, not random. */
const BOKEH = [
  { x: '12%', y: '22%', size: 'lg', tone: 'warm' },
  { x: '78%', y: '14%', size: 'md', tone: 'cool' },
  { x: '64%', y: '58%', size: 'lg', tone: 'warm' },
  { x: '28%', y: '70%', size: 'sm', tone: 'warm' },
  { x: '88%', y: '78%', size: 'md', tone: 'cool' },
  { x: '46%', y: '36%', size: 'sm', tone: 'cool' },
  { x: '6%', y: '88%', size: 'md', tone: 'warm' },
] as const

const animateOpening: SceneSetup = ({ scope, el, all, onCleanup }) => {
  trackVisibility(scope)
  const intro = el('.opening__intro')

  // FR-012: the joke steps aside within the first scroll…
  gsap.fromTo(
    all('.opening__framing'),
    { opacity: 1, y: 0 },
    {
      opacity: 0,
      y: -24,
      ease: 'none',
      scrollTrigger: { trigger: intro, start: 'top top', end: '55% top', scrub: true },
    },
  )

  // FR-013: the cue leaves on the first scroll and does not come back.
  gsap.to(el('.scroll-cue'), {
    opacity: 0,
    duration: 0.6,
    ease: 'power1.out',
    scrollTrigger: { trigger: intro, start: 'top top-=40', once: true },
  })

  // …and the story takes its place.
  const story = el('.opening__story')
  playLineReveal(all('.opening__story [data-reveal]'), story, 'top 80%')

  // FR-100: the first two stops — the framing, then the story centred in the viewport.
  onCleanup(registerStop('opening', () => 0))
  onCleanup(
    registerStop('opening-story', () => {
      const box = story.getBoundingClientRect()
      return box.top + window.scrollY + box.height / 2 - window.innerHeight / 2
    }),
  )
}

export function OpeningScene() {
  const ref = useRef<HTMLElement>(null)
  useSceneAnimation(ref, animateOpening)

  return (
    <section id="opening" ref={ref} className="scene opening" aria-labelledby="opening-title">
      <div className="opening__backdrop" aria-hidden="true">
        <div className="opening__rain-still" />
        {BOKEH.map((b) => (
          <span
            key={`${b.x}-${b.y}`}
            className={`bokeh bokeh--${b.size} bokeh--${b.tone}`}
            style={{ left: b.x, top: b.y }}
          />
        ))}
        <span className="fog fog--1" />
        <span className="fog fog--2" />
        <span className="fog fog--3" />
      </div>

      <div className="opening__intro">
        <div className="opening__framing">
          <h1 id="opening-title" className="font-sans text-label font-semibold uppercase text-rain-200">
            {copy.opening.label}
          </h1>
          <LineReveal
            lines={copy.opening.humour}
            className="mt-5 max-w-[22ch] font-serif text-humour italic text-rain-50"
          />
        </div>
        {/* FR-013, FR-077–FR-078: which line shows depends on <html data-audio> (set by AudioControl). */}
        <p className="scroll-cue">
          <span className="scroll-cue__texts">
            <span className="scroll-cue__text scroll-cue__text--hint">{copy.opening.cue.hint}</span>
            <span className="scroll-cue__text scroll-cue__text--after">{copy.opening.cue.afterPlay}</span>
            <span className="scroll-cue__text scroll-cue__text--plain">{copy.opening.cue.plain}</span>
          </span>
          <span className="scroll-cue__line" aria-hidden="true" />
        </p>
      </div>

      <div className="opening__story">
        <Beats beats={copy.opening.story} className="font-serif text-display font-normal text-rain-50" />
      </div>
    </section>
  )
}
