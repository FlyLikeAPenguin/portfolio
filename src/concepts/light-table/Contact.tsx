import { useEffect, useRef, useState } from 'react'
import { profile } from '../../content'
import { ScrollTrigger, useGSAP } from './gsap'
import { SectionHead } from './SectionHead'
import { LondonTime } from './useLondonTime'

const [user, domain] = profile.email.split('@')

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.setAttribute('readonly', '')
      ta.style.position = 'fixed'
      ta.style.opacity = '0'
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand('copy')
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

export function Contact({ onGrid, grid }: { onGrid: () => void; grid: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const emailRef = useRef<HTMLButtonElement>(null)
  const [toast, setToast] = useState<string | null>(null)
  const timer = useRef(0)

  /* Fit the address to the measure: one line on desktop, user / @domain on narrow screens. */
  useGSAP(
    () => {
      const btn = emailRef.current!
      const fit = () => {
        const lines = Array.from(btn.querySelectorAll<HTMLElement>('.lt-email__l'))
        const avail = btn.parentElement!.clientWidth
        btn.style.fontSize = '100px'
        const stacked = getComputedStyle(lines[0]).display === 'block'
        const w = stacked ? Math.max(...lines.map((l) => l.offsetWidth)) : lines.reduce((a, l) => a + l.offsetWidth, 0)
        // + the trailing negative tracking (0.055em) so the last glyph's ink never clips
        btn.style.fontSize = `${Math.min(220, (99.5 * avail) / Math.max(1, w + 5.5)).toFixed(2)}px`
      }
      fit()
      document.fonts?.ready.then(() => {
        fit()
        ScrollTrigger.refresh()
      })
      ScrollTrigger.addEventListener('refreshInit', fit)
      return () => ScrollTrigger.removeEventListener('refreshInit', fit)
    },
    { scope: ref },
  )

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const onCopy = async () => {
    const ok = await copy(profile.email)
    setToast(ok ? 'Copied' : 'Press ⌘C to copy')
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setToast(null), 1800)
  }

  const links = [
    { label: 'GitHub', href: profile.links.github },
    { label: 'LinkedIn', href: profile.links.linkedin },
    { label: 'Instagram', href: profile.links.instagram },
  ]

  return (
    <section className="lt-sec lt-contact" id="lt-contact" ref={ref} aria-labelledby="lt-contact-h">
      <SectionHead no="06" id="lt-contact-h" title="Contact" aside="Email is best" />

      <div className="lt-email__wrap">
        <button type="button" ref={emailRef} className="lt-email" onClick={onCopy} aria-label={`Copy ${profile.email} to clipboard`}>
          <span className="lt-email__l">
            <span className="lt-email__f">{user}</span>
          </span>
          <span className="lt-email__l">
            <span className="lt-email__f">@{domain}</span>
          </span>
        </button>
      </div>

      <div className="lt-contact__row">
        <span className="lt-label">Click the address to copy it</span>
        <a className="lt-contact__mail" href={`mailto:${profile.email}`}>
          Open in your mail app <span aria-hidden="true">↗</span>
        </a>
        <ul className="lt-links lt-contact__links">
          {links.map((l) => (
            <li key={l.label}>
              <a href={l.href} target="_blank" rel="noreferrer">
                {l.label}
                <span aria-hidden="true"> ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </div>

      <footer className="lt-foot">
        <span className="lt-foot__c">
          <span className="lt-label">©</span> {new Date().getFullYear()} {profile.name}
        </span>
        <span className="lt-foot__c lt-foot__col">
          <span className="lt-label">Colophon</span> Set in Inter Tight and Geist Mono on a 12-column grid. Built with React, GSAP and Lenis.
        </span>
        <span className="lt-foot__c">
          <button type="button" className="lt-foot__g" onClick={onGrid} aria-pressed={grid}>
            <kbd>G</kbd> {grid ? 'Hide grid' : 'Press G for the grid'}
          </button>
        </span>
        <span className="lt-foot__c lt-foot__t">
          <span className="lt-label">London</span> <LondonTime />
        </span>
      </footer>

      <div className={`lt-toast${toast ? ' is-on' : ''}`} role="status" aria-live="polite">
        <span className="lt-toast__dot" aria-hidden="true" />
        {toast ?? ''}
      </div>
    </section>
  )
}
