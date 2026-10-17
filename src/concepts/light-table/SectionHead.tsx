import type { ReactNode } from 'react'

/** The one section header used everywhere: index, title, aside, on a hairline. */
export function SectionHead({ no, id, title, aside }: { no: string; id: string; title: string; aside?: ReactNode }) {
  return (
    <div className="lt-sh" data-sh>
      <span className="lt-sh__rule" aria-hidden="true" />
      <span className="lt-label lt-sh__no">({no})</span>
      <h2 className="lt-sh__title" id={id}>
        <span className="lt-sh__mask">
          <span className="lt-sh__t">{title}</span>
        </span>
      </h2>
      {aside && <span className="lt-label lt-sh__aside">{aside}</span>}
    </div>
  )
}
