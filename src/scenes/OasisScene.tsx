import { useRef } from 'react'
import { LineReveal } from '../components/LineReveal'
import { SceneImage } from '../components/SceneImage'
import { copy } from '../content/copy'
import { imageManifest } from '../content/images.generated'
import { useSceneAnimation, type SceneSetup } from '../hooks/useSceneAnimation'
import { addLineReveal, atmosphereHandOver, pinnedTimeline, trackVisibility } from '../lib/sceneTweens'

/** Width of the soft leading edge of the reveal, as a fraction of the stage width. */
const FEATHER = 0.22

const animateOasis: SceneSetup = ({ scope, el, all }) => {
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

  const tl = pinnedTimeline(stage, 90)
  tl.fromTo(proxy, { p: 0 }, { p: 1, duration: 0.62, ease: 'sine.inOut', onUpdate: render, onStart: render }, 0)
  // FR-042: warm light drifts across the sand.
  tl.fromTo(el('.oasis__sweep'), { xPercent: -60, opacity: 0 }, { xPercent: 10, opacity: 1, duration: 0.35, ease: 'sine.inOut' }, 0.15)
  tl.to(el('.oasis__sweep'), { xPercent: 60, opacity: 0, duration: 0.35, ease: 'sine.inOut' }, 0.5)
  // FR-043
  addLineReveal(tl, all('.oasis__text [data-reveal]'), 0.62, 1)
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
          <LineReveal
            as="h2"
            id="oasis-title"
            lines={copy.oasis.lines}
            className="font-serif text-display font-normal italic text-ink"
          />
        </div>
      </div>
    </section>
  )
}
