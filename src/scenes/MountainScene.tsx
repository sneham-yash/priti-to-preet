import { useRef } from 'react'
import { Beats } from '../components/LineReveal'
import { SceneImage } from '../components/SceneImage'
import { copy } from '../content/copy'
import { imageManifest } from '../content/images.generated'
import { useSceneAnimation, type SceneSetup } from '../hooks/useSceneAnimation'
import {
  addBeats,
  atmosphereHandOver,
  pinTimeline,
  registerBeatStops,
  sceneTimeline,
  trackVisibility,
} from '../lib/sceneTweens'

const animateMountain: SceneSetup = (env) => {
  const { scope, el } = env
  trackVisibility(scope)
  // FR-020: rising out of the rain clouds — rain hands over to snow.
  atmosphereHandOver(el('.approach'), 'rain', 'snow')

  const tl = sceneTimeline()
  // FR-021: a gentle entry from the right; ≤ 6% travel, ≤ 1.06 scale, no gap at the edge.
  tl.fromTo(el('.mountain__image'), { xPercent: 2.8, scale: 1.06 }, { xPercent: 0, scale: 1, duration: 1.1 }, 0)
  // The mist parts…
  tl.fromTo(el('.mountain__mist'), { opacity: 1 }, { opacity: 0.12, duration: 0.9, ease: 'sine.inOut' }, 0)
  // FR-022: …and the sunlight rests on the summit, still warming through the first words.
  tl.fromTo(el('.mountain__sun'), { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'sine.inOut' }, 0.5)
  // FR-024 / FR-063: the words, one beat at a time.
  addBeats(env, tl, el('.mountain__text .beats'), 0.9)
  registerBeatStops(env, 'mountain', tl, pinTimeline(el('.stage'), tl))
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
          <Beats id="mountain-title" beats={copy.mountain.beats} className="font-serif text-beat font-normal italic text-rain-900" />
        </div>
      </div>
    </section>
  )
}
