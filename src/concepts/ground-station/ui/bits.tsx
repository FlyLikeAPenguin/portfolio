import type { ReactNode } from 'react'
import { STATIONS } from '../scene/orbit'

export const coord = (lat: number, lon: number) =>
  `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'} ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`

/** AOS / LOS status chip. Text and state are driven imperatively from scroll triggers. */
export function Chip() {
  return (
    <span className="gs-chip" data-state="wait">
      <span className="gs-bars" aria-hidden="true">
        <i />
        <i />
        <i />
        <i />
      </span>
      <span className="gs-chip__t">Awaiting signal</span>
    </span>
  )
}

export function PassHeader({ sec, pass, station, title }: { sec: string; pass: string; station: number; title?: string }) {
  const st = STATIONS[station]
  return (
    <div className="gs-passhead">
      <span className="gs-idx">
        {sec} <i>/</i> Pass {pass}
      </span>
      {title ? <span className="gs-passhead__title">{title}</span> : null}
      <span className="gs-passhead__rule" aria-hidden="true" />
      <span className="gs-passhead__stn">
        STN {st.id} · {st.name} · {coord(st.lat, st.lon)}
      </span>
      <Chip />
    </div>
  )
}

export function Label({ children, n }: { children: ReactNode; n?: string }) {
  return (
    <span className="gs-label">
      {n ? <b>{n}</b> : null}
      {children}
    </span>
  )
}

export function SecHead({ n, children, aside }: { n: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="gs-sechead">
      <span className="gs-idx">
        {n} <i>/</i> {children}
      </span>
      <span className="gs-sechead__rule" aria-hidden="true" />
      {aside ? <span className="gs-sechead__aside">{aside}</span> : null}
    </div>
  )
}

export function Arrow() {
  return (
    <svg className="gs-arrow" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M3 9 9 3M4 3h5v5" fill="none" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export function ExtLink({ href, children, className = '' }: { href: string; children: ReactNode; className?: string }) {
  const ext = /^https?:/.test(href)
  return (
    <a className={`gs-link ${className}`} href={href} {...(ext ? { target: '_blank', rel: 'noreferrer' } : {})}>
      <span>{children}</span>
      <Arrow />
    </a>
  )
}

/** Telemetry readout: big mono numeral, small label, channel id. */
export function Readout({ value, label, ch, mode }: { value: string; label: string; ch: string; mode?: 'scramble' }) {
  return (
    <div className="gs-readout">
      <span className="gs-readout__ch">{ch}</span>
      <span className="gs-readout__v" data-count data-mode={mode} data-value={value}>
        {value}
      </span>
      <span className="gs-readout__l">{label}</span>
    </div>
  )
}
