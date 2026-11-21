import { useRef } from 'react'
import { LineReveal } from '../components/LineReveal'
import { SceneImage } from '../components/SceneImage'
import { copy } from '../content/copy'
import { imageManifest } from '../content/images.generated'
import { useSceneAnimation, type SceneSetup } from '../hooks/useSceneAnimation'
import { addLineReveal, atmosphereHandOver, pinnedTimeline, trackVisibility } from '../lib/sceneTweens'

const animatePearl: SceneSetup = ({ scope, el, all }) => {
  trackVisibility(scope)
  // FR-030: the snowfall sinks and becomes suspended specks.
  atmosphereHandOver(el('.approach'), 'snow', 'specks')

  const tl = pinnedTimeline(el('.stage'), 85)
  // FR-033 (1) the dark deepens
  tl.fromTo(el('.pearl__vignette'), { opacity: 0.35 }, { opacity: 1, duration: 0.3, ease: 'sine.inOut' }, 0)
  // (2) a shaft of light narrows toward it
  tl.fromTo(el('.pearl__shaft'), { opacity: 0, scaleX: 2.4 }, { opacity: 1, scaleX: 1, duration: 0.45, ease: 'power1.inOut' }, 0.15)
  // (3) the pearl is found
  tl.fromTo(el('.pearl'), { opacity: 0.08, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.43, ease: 'power2.inOut' }, 0.25)
  tl.fromTo(el('.pearl__halo'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'sine.out' }, 0.3)
  tl.fromTo(el('.pearl__floor'), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.32)
  // (4) its lustre turns in the light
  tl.fromTo(el('.pearl__lustre'), { rotation: -35 }, { rotation: 30, duration: 0.8, ease: 'sine.inOut' }, 0.2)
  // FR-035: words only after the light
  addLineReveal(tl, all('.pearl__text [data-reveal]'), 0.72, 1)
}

export function PearlScene() {
  const ref = useRef<HTMLElement>(null)
  useSceneAnimation(ref, animatePearl, { defer: true })

  return (
    <section id="pearl" ref={ref} className="scene pearl-scene" aria-labelledby="pearl-title">
      <div className="approach approach--to-ocean" aria-hidden="true" />
      <div className="stage pearl__stage">
        <SceneImage asset={imageManifest.ocean} alt={copy.pearl.alt} className="fade-edges" />
        <div className="ocean__rays" aria-hidden="true" />
        <div className="pearl__vignette" aria-hidden="true" />
        <div className="pearl__shaft" aria-hidden="true" />
        <div className="pearl__anchor" aria-hidden="true">
          <div className="pearl__halo" />
          <div className="pearl__floor" />
          <div className="pearl">
            <div className="pearl__lustre" />
          </div>
        </div>
        <div className="stage__text pearl__text">
          <LineReveal
            as="h2"
            id="pearl-title"
            lines={copy.pearl.lines}
            className="font-serif text-display font-normal italic text-pearl"
          />
        </div>
      </div>
    </section>
  )
}
