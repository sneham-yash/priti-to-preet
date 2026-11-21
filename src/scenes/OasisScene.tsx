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

/** Width of the soft leading edge of the reveal, as a fraction of the stage width. */
const FEATHER = 0.22

const animateOasis: SceneSetup = (env) => {
  const { scope, el } = env
  trackVisibility(scope)
  // FR-040: surfacing — the suspended specks give way to warm motes.
  atmosphereHandOver(el('.approach'), 'specks', 'motes')

  const reveal = el('.oasis__reveal')
  const feather = el('.oasis__feather')
  const stage = el('.stage')

  /**
   * FR-041: horizontal reveal, left → right. One proxy drives both the clip edge and a feathered
   * strip riding just inside it, so the edge reads as light spreading rather than a wipe.
   * The strip spans [e, e + FEATHER] (fractions of the width); the clip ends at e + FEATHER.
   * e runs from -FEATHER (nothing visible) to 1 (strip off-screen, image fully revealed).
   */
  const proxy = { p: 0 }
  let active = true
  const render = () => {
    if (!active) return
    const e = -FEATHER + proxy.p * (1 + FEATHER)
    const right = Math.min(100, Math.max(0, (1 - e - FEATHER) * 100))
    reveal.style.clipPath = `inset(0% ${right.toFixed(2)}% 0% 0%)`
    feather.style.transform = `translate3d(${(e * stage.clientWidth).toFixed(1)}px, 0, 0)`
    feather.style.opacity = proxy.p >= 1 ? '0' : '1'
  }

  const tl = sceneTimeline()
  tl.fromTo(proxy, { p: 0 }, { p: 1, duration: 0.9, ease: 'sine.inOut', onUpdate: render, onStart: render }, 0)
  // FR-042: warm light drifts across the sand.
  tl.fromTo(el('.oasis__sweep'), { xPercent: -60, opacity: 0 }, { xPercent: 10, opacity: 1, duration: 0.45, ease: 'sine.inOut' }, 0.2)
  tl.to(el('.oasis__sweep'), { xPercent: 60, opacity: 0, duration: 0.45, ease: 'sine.inOut' }, 0.65)
  // FR-043 / FR-063: the words once the oasis is found, one beat at a time.
  addBeats(env, tl, el('.oasis__text .beats'), 1.05)
  registerBeatStops(env, 'oasis', tl, pinTimeline(stage, tl))
  render()

  // Styles written by hand are not tracked by the GSAP context — restore the static final state.
  return () => {
    active = false
    reveal.style.removeProperty('clip-path')
    feather.style.removeProperty('transform')
    feather.style.removeProperty('opacity')
  }
}

export function OasisScene() {
  const ref = useRef<HTMLElement>(null)
  useSceneAnimation(ref, animateOasis, { defer: true })
  const empty = imageManifest.oasisEmpty

  return (
    <section id="oasis" ref={ref} className="scene oasis-scene" aria-labelledby="oasis-title">
      <div className="approach approach--to-desert" aria-hidden="true" />
      <div className="stage oasis__stage">
        <div className="oasis__base" aria-hidden="true">
          {empty && <SceneImage asset={empty} alt="" />}
        </div>
        <div className="oasis__reveal">
          <SceneImage asset={imageManifest.oasis} alt={copy.oasis.alt} className="fade-bottom" />
        </div>
        <div className={`oasis__feather${empty ? ' oasis__feather--paired' : ''}`} aria-hidden="true" />
        <div className="oasis__sweep" aria-hidden="true" />
        <div className="stage__text oasis__text">
          <Beats id="oasis-title" beats={copy.oasis.beats} className="font-serif text-beat font-normal italic text-ink" />
        </div>
      </div>
    </section>
  )
}
