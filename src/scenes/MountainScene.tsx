import { useRef } from 'react'
import { LineReveal } from '../components/LineReveal'
import { SceneImage } from '../components/SceneImage'
import { copy } from '../content/copy'
import { imageManifest } from '../content/images.generated'
import { useSceneAnimation, type SceneSetup } from '../hooks/useSceneAnimation'
import { addLineReveal, atmosphereHandOver, pinnedTimeline, trackVisibility } from '../lib/sceneTweens'

const animateMountain: SceneSetup = ({ scope, el, all }) => {
  trackVisibility(scope)
  // FR-020: rising out of the rain clouds — rain hands over to snow.
  atmosphereHandOver(el('.approach'), 'rain', 'snow')

  const tl = pinnedTimeline(el('.stage'), 70)
  // FR-021: a gentle entry from the right; ≤ 6% travel, ≤ 1.06 scale, no gap at the edge.
  tl.fromTo(el('.mountain__image'), { xPercent: 2.8, scale: 1.06 }, { xPercent: 0, scale: 1, duration: 0.55 }, 0)
  // The mist parts…
  tl.fromTo(el('.mountain__mist'), { opacity: 1 }, { opacity: 0.12, duration: 0.45, ease: 'sine.inOut' }, 0)
  // FR-022: …and the sunlight rests on the summit.
  tl.fromTo(el('.mountain__sun'), { opacity: 0 }, { opacity: 1, duration: 0.6, ease: 'sine.inOut' }, 0.25)
  // FR-024
  addLineReveal(tl, all('.mountain__text [data-reveal]'), 0.5, 1)
}

export function MountainScene() {
  const ref = useRef<HTMLElement>(null)
  useSceneAnimation(ref, animateMountain, { defer: true })

  return (
    <section id="mountain" ref={ref} className="scene mountain" aria-labelledby="mountain-title">
      <div className="approach approach--to-mountain" aria-hidden="true">
        <span className="approach__cloud approach__cloud--1" />
        <span className="approach__cloud approach__cloud--2" />
      </div>
      <div className="stage mountain__stage">
        <div className="mountain__image">
          <SceneImage asset={imageManifest.mountain} alt={copy.mountain.alt} eager className="fade-edges" />
        </div>
        <div className="mountain__sun" aria-hidden="true" />
        <div className="mountain__mist" aria-hidden="true" />
        <div className="stage__text mountain__text">
          <LineReveal
            as="h2"
            id="mountain-title"
            lines={copy.mountain.lines}
            className="font-serif text-display font-normal italic text-rain-900"
          />
        </div>
      </div>
    </section>
  )
}
