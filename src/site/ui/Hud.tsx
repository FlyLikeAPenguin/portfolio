import { useEffect, useRef } from 'react'
import { profile } from '../../content'
import { scrollTo } from '../../lib/useSmoothScroll'

/** Minimal monochrome glyphs, drawn on a 16px grid to sit with the HUD hairlines. */
const SOCIAL = [
  {
    k: 'GitHub',
    href: profile.links.github,
    icon: (
      <path
        fill="currentColor"
        d="M8 .8a7.2 7.2 0 0 0-2.28 14.03c.36.07.5-.16.5-.35v-1.23c-2 .44-2.43-.97-2.43-.97-.33-.83-.8-1.05-.8-1.05-.66-.45.05-.44.05-.44.72.05 1.1.74 1.1.74.65 1.1 1.7.79 2.1.6.07-.47.26-.79.47-.97-1.6-.18-3.28-.8-3.28-3.56 0-.79.28-1.43.74-1.94-.07-.18-.32-.92.07-1.91 0 0 .6-.19 1.98.74a6.8 6.8 0 0 1 3.6 0c1.37-.93 1.97-.74 1.97-.74.4 1 .15 1.73.08 1.91.46.5.74 1.15.74 1.94 0 2.77-1.69 3.38-3.29 3.56.26.22.49.66.49 1.33v1.97c0 .19.13.42.5.35A7.2 7.2 0 0 0 8 .8Z"
      />
    ),
  },
  {
    k: 'LinkedIn',
    href: profile.links.linkedin,
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1.6" y="1.6" width="12.8" height="12.8" rx="1.6" />
        <path d="M5 7v4.6M5 4.7v.1M7.6 11.6V7m0 1.9c0-1.1.8-1.9 1.8-1.9s1.6.7 1.6 1.8v2.8" strokeLinecap="round" />
      </g>
    ),
  },
  {
    k: 'Instagram',
    href: profile.links.instagram,
    icon: (
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="1.6" y="1.6" width="12.8" height="12.8" rx="3.6" />
        <circle cx="8" cy="8" r="3" />
        <circle cx="11.7" cy="4.3" r=".5" fill="currentColor" stroke="none" />
      </g>
    ),
  },
]
import { S } from '../store'
import { fmtMET, fmtUTC } from '../fx'

/** Fixed console chrome: clocks along the top, live telemetry down the right edge. */
export default function Hud() {
  const utc = useRef<HTMLSpanElement>(null)
  const met = useRef<HTMLSpanElement>(null)
  const lat = useRef<HTMLElement>(null)
  const lon = useRef<HTMLElement>(null)
  const alt = useRef<HTMLElement>(null)
  const vel = useRef<HTMLElement>(null)
  const link = useRef<HTMLDivElement>(null)
  const linkText = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    S.hud.lat = lat.current
    S.hud.lon = lon.current
    S.hud.alt = alt.current
    S.hud.vel = vel.current
    S.hud.link = link.current
    S.hud.linkText = linkText.current
    let id = 0
    const tick = () => {
      const now = Date.now()
      const d = new Date(now)
      if (utc.current) utc.current.textContent = fmtUTC(d)
      if (met.current) met.current.textContent = fmtMET(now)
      document.querySelectorAll<HTMLElement>('.gs [data-utc-time]').forEach((el) => {
        el.textContent = fmtUTC(d).slice(11)
      })
      id = window.setTimeout(tick, 1000 - (now % 1000) + 5)
    }
    tick()
    return () => {
      window.clearTimeout(id)
      S.hud = {}
    }
  }, [])

  return (
    <div className="gs-hud">
      <div className="gs-hud__top">
        <div className="gs-hud__brand">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <ellipse cx="12" cy="12" rx="10.5" ry="4" fill="none" stroke="currentColor" strokeWidth="1" transform="rotate(-28 12 12)" />
            <circle cx="20.6" cy="7.6" r="1.5" fill="var(--mint)" />
          </svg>
          <span className="gs-hud__name">Joe Thornton</span>
          <span className="gs-hud__sub">Ground segment · GS-01</span>
        </div>
        <div className="gs-hud__clocks" aria-hidden="true">
          <span className="gs-hud__k">UTC</span>
          <span className="gs-hud__v" ref={utc}>
            0000-00-00 00:00:00
          </span>
          <span className="gs-hud__k">MET</span>
          <span className="gs-hud__v gs-hud__v--mint" ref={met}>
            T+ 0d 00:00:00
          </span>
        </div>
        <div className="gs-hud__right">
          <div className="gs-hud__link" ref={link} data-state="wait" aria-hidden="true">
            <span className="gs-bars">
              <i />
              <i />
              <i />
              <i />
            </span>
            <span ref={linkText}>NO LINK</span>
          </div>
          <nav className="gs-hud__social" aria-label="Elsewhere">
            {SOCIAL.map((x) => (
              <a key={x.k} href={x.href} target="_blank" rel="noreferrer" aria-label={`${x.k} (opens in a new tab)`} title={x.k}>
                <svg viewBox="0 0 16 16" aria-hidden="true">
                  {x.icon}
                </svg>
              </a>
            ))}
          </nav>
          <button type="button" className="gs-hud__cta" onClick={() => scrollTo('#gs-contact')}>
            Open channel <span aria-hidden="true">↘</span>
          </button>
        </div>
      </div>

      <aside className="gs-hud__side" aria-hidden="true">
        <div className="gs-hud__row">
          <span>SAT</span>
          <b>JT-1</b>
        </div>
        <div className="gs-hud__row">
          <span>LAT</span>
          <b ref={lat}>00.00°N</b>
        </div>
        <div className="gs-hud__row">
          <span>LON</span>
          <b ref={lon}>000.00°E</b>
        </div>
        <div className="gs-hud__row">
          <span>ALT</span>
          <b>
            <em ref={alt}>512.0</em> km
          </b>
        </div>
        <div className="gs-hud__row">
          <span>VEL</span>
          <b>
            <em ref={vel}>7.612</em> km/s
          </b>
        </div>
        <div className="gs-hud__row gs-hud__row--pass">
          <span>PASS</span>
          <b data-hud-pass>
            --<i>/06</i>
          </b>
        </div>
        <div className="gs-hud__row">
          <span>STN</span>
          <b data-hud-stn>---</b>
        </div>
        <div className="gs-hud__ruler">
          <i className="gs-hud__ruler-mark" />
        </div>
      </aside>

      <div className="gs-hud__sec" aria-hidden="true">
        <span data-hud-sec>01 · Acquisition</span>
      </div>
    </div>
  )
}
