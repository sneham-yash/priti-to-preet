import { copy } from '../content/copy'

/** The final words — shared by the scene and the static fallback so they can never drift apart. */
export function MessageBody() {
  return (
    <>
      {copy.message.paragraphs.map((lines) => (
        <p key={lines[0]} className="letter__paragraph">
          {lines.map((line, i) => (
            <span key={line}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </p>
      ))}
      {copy.message.signOff && <p className="letter__sign-off">{copy.message.signOff}</p>}
    </>
  )
}
