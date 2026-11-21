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

const animatePearl: SceneSetup = (env) => {
  const { scope, el } = env
  trackVisibility(scope)
  // FR-030: the snowfall sinks and becomes suspended specks.
  atmosphereHandOver(el('.approach'), 'snow', 'specks')

  const tl = sceneTimeline()
  // FR-033 (1) the dark deepens
  tl.fromTo(el('.pearl__vignette'), { opacity: 0.35 }, { opacity: 1, duration: 0.4, ease: 'sine.inOut' }, 0)
  // (2) a shaft of light narrows toward it
  tl.fromTo(el('.pearl__shaft'), { opacity: 0, scaleX: 2.4 }, { opacity: 1, scaleX: 1, duration: 0.6, ease: 'power1.inOut' }, 0.2)
  // (3) the pearl is found
  tl.fromTo(el('.pearl'), { opacity: 0.08, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'power2.inOut' }, 0.3)
  tl.fromTo(el('.pearl__halo'), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'sine.out' }, 0.4)
  tl.fromTo(el('.pearl__floor'), { opacity: 0 }, { opacity: 1, duration: 0.5 }, 0.45)
  // (4) its lustre keeps turning in the light while the words come and go
  tl.fromTo(el('.pearl__lustre'), { rotation: -35 }, { rotation: 30, duration: 4, ease: 'sine.inOut' }, 0.25)
  // FR-035 / FR-063: words only after the light, one beat at a time.
  addBeats(env, tl, el('.pearl__text .beats'), 1)
  registerBeatStops(env, 'pearl', tl, pinTimeline(el('.stage'), tl))
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
          <Beats id="pearl-title" beats={copy.pearl.beats} className="font-serif text-beat font-normal italic text-pearl" />
        </div>
      </div>
    </section>
  )
}
