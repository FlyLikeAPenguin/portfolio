import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { profile } from '../../content'
import { scrollTo } from '../../shared/useSmoothScroll'
import { LinkArrow, Tri } from './film'

/** Rubber stamp, inked with a little noise so it never looks vector-perfect. */
function Stamp() {
  const ring = 'PROCESSED BY HAND · LONDON · C-41 · 36 EXP · '
  return (
    <svg className="cs-stamp" viewBox="0 0 220 220" aria-hidden="true" focusable="false">
      <defs>
        <path id="cs-stamp-ring" d="M110 110m-82 0a82 82 0 1 1 164 0a82 82 0 1 1-164 0" />
      </defs>
      <g filter="url(#cs-stamp-ink)">
        <circle cx="110" cy="110" r="104" fill="none" stroke="currentColor" strokeWidth="5" />
        <circle cx="110" cy="110" r="94" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <circle cx="110" cy="110" r="64" fill="none" stroke="currentColor" strokeWidth="1.6" />
        <text className="cs-stamp__ring">
          <textPath href="#cs-stamp-ring">{ring}</textPath>
        </text>
        <text x="110" y="104" textAnchor="middle" className="cs-stamp__big">
          OK
        </text>
        <text x="110" y="134" textAnchor="middle" className="cs-stamp__small">
          TO PRINT
        </text>
        <path d="M58 150h104" stroke="currentColor" strokeWidth="1.6" />
        <text x="110" y="166" textAnchor="middle" className="cs-stamp__tiny">
          J. THORNTON
        </text>
      </g>
    </svg>
  )
}

const handle = (url: string) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')

export default function Contact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.cs-contact__mail', start: 'top 80%', once: true } })
        tl.from('.cs-contact__big .cs-wd', { yPercent: 40, opacity: 0, filter: 'blur(8px)', duration: 0.9, stagger: 0.08, ease: 'power3.out' })
          .from('.cs-contact__mail', { opacity: 0, y: 20, duration: 0.8, ease: 'power3.out' }, 0.25)
          .fromTo(
            '.cs-stamp',
            { scale: 1.9, opacity: 0, rotation: -4 },
            { scale: 1, opacity: 0.92, rotation: -14, duration: 0.32, ease: 'power4.in' },
            0.7,
          )
          .to('.cs-contact__inner', { x: 2, y: 1, duration: 0.05, yoyo: true, repeat: 3, ease: 'none' }, '>-0.02')
      })
    },
    { scope: root },
  )

  const links = [
    { label: 'GitHub', href: profile.links.github },
    { label: 'LinkedIn', href: profile.links.linkedin },
    { label: 'Instagram', href: profile.links.instagram },
  ]

  return (
    <section className="cs-contact" id="cs-contact" ref={root} aria-labelledby="cs-contact-title">
      <div className="cs-contact__inner">
        <p className="cs-kicker">
          <span>Last frame</span>
          <Tri />
          <span>36</span>
        </p>
        <h2 className="cs-contact__big" id="cs-contact-title">
          <span className="cs-wd">Send</span> <span className="cs-wd">me</span> <span className="cs-wd">a</span>{' '}
          <em className="cs-wd">note.</em>
        </h2>
        <a className="cs-contact__mail" href={`mailto:${profile.email}`}>
          {profile.email}
        </a>
        <ul className="cs-contact__links">
          {links.map((l) => (
            <li key={l.href}>
              <a href={l.href} target="_blank" rel="noreferrer">
                <span className="cs-contact__lk">{l.label}</span>
                <span className="cs-contact__lh">{handle(l.href)}</span>
                <LinkArrow />
              </a>
            </li>
          ))}
        </ul>
        <Stamp />
      </div>

      <footer className="cs-colophon">
        <p>
          <span className="cs-colophon__k">Colophon</span>
          Set in Instrument Serif, DM Mono and Caveat. Developed with React, GSAP and Lenis. Every photograph on
          this sheet is a placeholder until the real negatives are scanned.
        </p>
        <p>
          <span className="cs-colophon__k">Joe Thornton</span>© {new Date().getFullYear()} · {profile.location}
        </p>
        <button className="cs-colophon__top" onClick={() => scrollTo(0)}>
          Rewind to frame S <LinkArrow dir="up" />
        </button>
      </footer>
    </section>
  )
}
