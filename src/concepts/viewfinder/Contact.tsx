import { SECTIONS } from './sections'
import { useRef, useState } from 'react'
import { profile } from '../../content'
import { scrollTo } from '../../shared/useSmoothScroll'
import SectionHead from './SectionHead'
import { useShutter } from './Shutter'
import { useVf } from './store'
import { pad } from './util'

const LINKS = [
  { label: 'GitHub', href: profile.links.github },
  { label: 'LinkedIn', href: profile.links.linkedin },
  { label: 'Instagram', href: profile.links.instagram },
]

export default function Contact() {
  const { fire } = useShutter()
  const [pressed, setPressed] = useState(false)
  const timer = useRef<number>(0)
  const frame = useVf((s) => s.frame)
  const mailto = `mailto:${profile.email}`

  return (
    <section id="vf-contact" className="vf-section vf-contact" aria-labelledby="vf-contact-title">
      <div className="vf-wrap">
        <SectionHead no="07" label="Contact" sectionIndex={SECTIONS.findIndex((s) => s.id === 'vf-contact')} title="Say hello" titleId="vf-contact-title" />
        <div className="vf-contact__grid">
          <div className="vf-contact__release">
            <svg className="vf-release__ring-text" viewBox="-160 -160 320 320" aria-hidden="true">
              <defs>
                <path id="vf-rel-arc" d="M -136,0 A 136,136 0 1,1 136,0 A 136,136 0 1,1 -136,0" />
              </defs>
              <text>
                <textPath href="#vf-rel-arc" startOffset="0">
                  Press to release · Opens your mail app · Press to release · Opens your mail app ·
                </textPath>
              </text>
              {Array.from({ length: 60 }, (_, i) => (
                <line key={i} x1="0" y1={-150} x2="0" y2={i % 5 === 0 ? -158 : -154} transform={`rotate(${i * 6})`} />
              ))}
            </svg>
            <a
              className={`vf-release${pressed ? ' is-pressed' : ''}`}
              href={mailto}
              aria-label={`Say hello: email ${profile.email}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return
                e.preventDefault()
                setPressed(true)
                window.clearTimeout(timer.current)
                fire()
                timer.current = window.setTimeout(() => {
                  setPressed(false)
                  window.location.href = mailto
                }, 260)
              }}
            >
              <span className="vf-release__collar" aria-hidden="true" />
              <span className="vf-release__chrome" aria-hidden="true" />
              <span className="vf-release__btn" aria-hidden="true">
                <span className="vf-release__label">
                  Say
                  <br />
                  hello
                </span>
              </span>
            </a>
          </div>

          <div className="vf-contact__info">
            <p className="vf-engr">Write to</p>
            <a className="vf-contact__email" href={mailto}>
              {profile.email}
            </a>
            <p className="vf-body vf-contact__lede">
              {profile.bio[1]}
            </p>
            <ul className="vf-contact__links">
              {LINKS.map((l) => (
                <li key={l.href}>
                  <a className="vf-btn" href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                    <svg viewBox="0 0 10 10" aria-hidden="true">
                      <path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <footer className="vf-foot">
        <div className="vf-wrap vf-foot__in">
          <p className="vf-engr">Made in {profile.location} · No. 001 · OM-1</p>
          <p className="vf-engr">
            Frames exposed this visit <b className="vf-mono">▸ {pad(frame)}</b>
          </p>
          <p className="vf-engr">© 2026 {profile.name} · Photographs are placeholders</p>
          <button type="button" className="vf-engr vf-foot__top" onClick={() => scrollTo(0)}>
            Rewind ↑
          </button>
        </div>
      </footer>
    </section>
  )
}
