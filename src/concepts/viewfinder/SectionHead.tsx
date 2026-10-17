import type { ReactNode } from 'react'
import FocusTitle from './FocusTitle'
import { SECTIONS, SPEEDS, speedLabel } from './sections'

type Props = {
  no: string
  label: string
  sectionIndex: number
  title: string
  titleId: string
  children?: ReactNode
}

export default function SectionHead({ no, label, sectionIndex, title, titleId, children }: Props) {
  const sp = SPEEDS[SECTIONS[sectionIndex].pos]
  return (
    <header className="vf-sh">
      <p className="vf-sh__meta">
        <span className="vf-engr vf-sh__no">{no}</span>
        <span className="vf-engr">{label}</span>
        <span className="vf-sh__rule" />
        <span className="vf-engr vf-sh__speed">
          Shutter <b className="vf-mono">{speedLabel(sp)}</b>
        </span>
      </p>
      <FocusTitle text={title} id={titleId} className="vf-sh__title" />
      {children && <p className="vf-sh__intro vf-lede">{children}</p>}
    </header>
  )
}
