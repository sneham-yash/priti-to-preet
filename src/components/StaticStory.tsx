import { copy } from '../content/copy'
import { MessageBody } from './MessageBody'

/** FR-083: the plain, effect-free version of the whole story. */
export function StaticStory() {
  // Every beat becomes its own stanza, in reading order (FR-066).
  const stanzas = [copy.opening.story, copy.mountain.beats, copy.pearl.beats, copy.oasis.beats].flat()
  return (
    <main className="static-story">
      <h1 className="static-story__label">{copy.opening.label}</h1>
      {stanzas.map((lines) => (
        <p key={lines[0]} className="static-story__stanza">
          {lines.join(' ')}
        </p>
      ))}
      <section id="message" aria-label={copy.message.heading} className="static-story__letter">
        <MessageBody />
      </section>
    </main>
  )
}
