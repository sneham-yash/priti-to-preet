import { useRef } from 'react'
import { MessageBody } from '../components/MessageBody'
import { copy } from '../content/copy'
import { useSceneAnimation, type SceneSetup } from '../hooks/useSceneAnimation'
import { gsap } from '../lib/gsap'
import { atmosphereHandOver } from '../lib/sceneTweens'
import { registerStop } from '../lib/stops'

const animateMessage: SceneSetup = ({ el, onCleanup }) => {
  // FR-050: the last of the weather settles before the words appear.
  atmosphereHandOver(el('.message__fade'), 'motes', null, 'bottom 40%')

  // FR-100: the last stop.
  onCleanup(registerStop('message', () => el('.letter').getBoundingClientRect().top + window.scrollY))

  // FR-052: the only motion here — one quiet opacity fade of the whole letter.
  const letter = el('.letter')
  gsap.fromTo(
    letter,
    { opacity: 0 },
    {
      opacity: 1,
      duration: 1.6,
      ease: 'sine.out',
      scrollTrigger: { trigger: letter, start: 'top 75%', toggleActions: 'play none none none' },
    },
  )
}

/** FR-050–FR-054: no imagery, no effects, no calls to action. Just the words. */
export function FinalMessage() {
  const ref = useRef<HTMLElement>(null)
  useSceneAnimation(ref, animateMessage, { defer: true })

  return (
    <section id="message" ref={ref} className="scene message" aria-labelledby="message-title">
      <div className="message__fade" aria-hidden="true" />
      <div className="letter">
        <h2 id="message-title" className="sr-only">
          {copy.message.heading}
        </h2>
        <MessageBody />
      </div>
    </section>
  )
}
