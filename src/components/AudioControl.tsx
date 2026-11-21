import { useEffect, useRef, useState } from 'react'
import { copy } from '../content/copy'

type AudioState = 'idle' | 'playing' | 'paused' | 'error' | 'gone'

const TRACK_SRC = '/audio/track.mp3' // FR-076: neutral path
const TARGET_VOLUME = 0.7
const FADE_IN_MS = 2000
const FADE_OUT_MS = 600
const ERROR_VISIBLE_MS = 2500
const FADE_STEP_MS = 40

/** iOS ignores `volume` (always 1), so fades are skipped there rather than faked. */
function supportsVolume(audio: HTMLAudioElement): boolean {
  const previous = audio.volume
  audio.volume = 0.5
  const ok = audio.volume === 0.5
  audio.volume = previous
  return ok
}

/**
 * FR-070–FR-075: one round play/pause control. Nothing is fetched until the first tap
 * (preload="none"), nothing autoplays, scrolling never touches playback.
 */
export function AudioControl() {
  const audioRef = useRef<HTMLAudioElement>(null)
  const fadeRef = useRef(0)
  const [state, setState] = useState<AudioState>('idle')

  const playing = state === 'playing'

  useEffect(() => {
    if (state !== 'error') return
    const timer = window.setTimeout(() => setState('gone'), ERROR_VISIBLE_MS)
    return () => window.clearTimeout(timer)
  }, [state])

  useEffect(() => () => window.clearInterval(fadeRef.current), [])

  /**
   * DEF-10: timer-driven, not rAF-driven — rAF pauses in hidden/occluded pages, which would leave
   * the music playing at volume 0 if she switched apps right after tapping play.
   */
  const fadeTo = (audio: HTMLAudioElement, target: number, ms: number, done?: () => void) => {
    window.clearInterval(fadeRef.current)
    if (!supportsVolume(audio)) {
      done?.()
      return
    }
    const from = audio.volume
    const start = performance.now()
    const tick = () => {
      // DEF-05: progress and volume are clamped to their valid ranges.
      const t = Math.min(1, Math.max(0, (performance.now() - start) / ms))
      audio.volume = Math.min(1, Math.max(0, from + (target - from) * t))
      if (t >= 1) {
        window.clearInterval(fadeRef.current)
        done?.()
      }
    }
    fadeRef.current = window.setInterval(tick, FADE_STEP_MS)
    tick()
  }

  const toggle = async () => {
    const audio = audioRef.current
    if (!audio || state === 'error') return
    if (playing) {
      fadeTo(audio, 0, FADE_OUT_MS, () => audio.pause())
      setState('paused')
      return
    }
    if (supportsVolume(audio)) audio.volume = 0
    try {
      await audio.play()
      setState('playing')
      // Fade from whichever comes first: this, or the 'playing' event (it resumes from the current volume).
      fadeTo(audio, TARGET_VOLUME, FADE_IN_MS)
    } catch (err) {
      // A blocked gesture is not a broken file — stay quietly available.
      if (err instanceof DOMException && err.name === 'NotAllowedError') setState('paused')
      else setState('error')
    }
  }

  if (state === 'gone') return null

  const label = state === 'error' ? copy.audio.unavailable : playing ? copy.audio.pause : copy.audio.play

  return (
    <div className="audio-control" data-state={state}>
      <audio
        ref={audioRef}
        src={TRACK_SRC}
        preload="none"
        loop
        onError={() => setState('error')}
        onPause={() => setState((s) => (s === 'playing' ? 'paused' : s))}
        onPlay={() => setState((s) => (s === 'paused' || s === 'idle' ? 'playing' : s))}
        onPlaying={(e) => fadeTo(e.currentTarget, TARGET_VOLUME, FADE_IN_MS)}
      />
      <button
        type="button"
        className="audio-control__button"
        aria-pressed={playing}
        aria-label={label}
        title={label}
        disabled={state === 'error'}
        onClick={() => void toggle()}
      >
        <span className="audio-bars" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
      </button>
    </div>
  )
}
