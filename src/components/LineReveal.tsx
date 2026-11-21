import type { ElementType } from 'react'

interface LineRevealProps {
  lines: readonly string[]
  as?: ElementType
  id?: string
  className?: string
}

/**
 * Renders authored lines inside masks so they can be revealed one by one (FR-060).
 * Lines are whole phrases with a separating space, so assistive tech reads one
 * natural sentence (FR-061). Static CSS shows the final, visible state (FR-062).
 */
export function LineReveal({ lines, as: Tag = 'p', id, className }: LineRevealProps) {
  return (
    <Tag id={id} className={className}>
      {lines.map((line) => (
        <span key={line} className="reveal-line">
          <span className="reveal-line__inner" data-reveal="">
            {line}
          </span>{' '}
        </span>
      ))}
    </Tag>
  )
}
