import type { ElementType } from 'react'
import type { Beats as BeatList } from '../content/copy'

interface LineRevealProps {
  lines: readonly string[]
  as?: ElementType
  id?: string
  className?: string
}

/** One masked line (FR-060). The trailing space keeps whole sentences for screen readers (FR-061). */
function Line({ text }: { text: string }) {
  return (
    <span className="reveal-line">
      <span className="reveal-line__inner" data-reveal="">
        {text}
      </span>{' '}
    </span>
  )
}

/**
 * Renders authored lines inside masks so they can be revealed one by one (FR-060).
 * Static CSS shows the final, visible state (FR-062).
 */
export function LineReveal({ lines, as: Tag = 'p', id, className }: LineRevealProps) {
  return (
    <Tag id={id} className={className}>
      {lines.map((line) => (
        <Line key={line} text={line} />
      ))}
    </Tag>
  )
}

interface BeatsProps {
  beats: BeatList
  as?: ElementType
  id?: string
  className?: string
}

/**
 * FR-063/FR-066: a scene's text as beats (paragraphs). One heading, so a screen reader hears
 * every beat in order. Statically the beats stack as paragraphs; a scene's animation setup
 * may overlay them (`.is-sequenced`) and show one at a time.
 */
export function Beats({ beats, as: Tag = 'h2', id, className = '' }: BeatsProps) {
  return (
    <Tag id={id} className={`beats ${className}`}>
      {beats.map((lines, i) => (
        <span key={lines[0]} className="beat" data-beat={i}>
          {lines.map((line) => (
            <Line key={line} text={line} />
          ))}
        </span>
      ))}
    </Tag>
  )
}
