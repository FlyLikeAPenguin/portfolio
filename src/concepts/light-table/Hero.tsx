import { useRef, useState, type RefObject } from 'react'
import { profile, projects } from '../../content'
import { prefersReducedMotion, scrollTo } from '../../shared/useSmoothScroll'
import { gsap, ScrollTrigger, SplitText, useGSAP } from './gsap'
import { LondonTime } from './useLondonTime'
import { NAV, cases, currently, headlineParts, previously, yearSpan } from './data'

const NAME = profile.name.toUpperCase()
/** Display tracking at full size, and where it lands once docked in the header. */
const LS_BIG = -0.045
const LS_DOCK = -0.02

/** Side bearings of the first and last glyph at 100px, so the name sits optically edge to edge. */
function measureBearings(text: string) {
  try {
    const ctx = document.createElement('canvas').getContext('2d')
    if (!ctx) return { lb: 0, rsb: 0 }
    ctx.font = '600 100px "Inter Tight Variable"'
    const first = ctx.measureText(text[0])
    const last = ctx.measureText(text[text.length - 1])
    return { lb: Math.max(0, -first.actualBoundingBoxLeft), rsb: Math.max(0, last.width - last.actualBoundingBoxRight) }
  } catch {
    return { lb: 0, rsb: 0 }
  }
}

function waitForFonts(timeout = 1400) {
  const load = Promise.all([
    document.fonts.load('600 100px "Inter Tight Variable"'),
    document.fonts.load('500 20px "Inter Tight Variable"'),
    document.fonts.load('400 11px "Geist Mono Variable"'),
  ]).catch(() => undefined)
  return Promise.race([load, new Promise((r) => window.setTimeout(r, timeout))])
}

/* ------------------------------------------------------------------ header */

export function Header({
  slotRef,
  theme,
  onTheme,
}: {
  slotRef: RefObject<HTMLAnchorElement | null>
  theme: 'light' | 'dark'
  onTheme: () => void
}) {
  const hdrRef = useRef<HTMLElement>(null)
  const [active, setActive] = useState('')

  useGSAP(
    () => {
      const bar = hdrRef.current!.querySelector('.lt-hdr__bar')
      const setBar = gsap.quickSetter(bar, 'scaleX')
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (self) => setBar(self.progress) })
      for (const n of NAV) {
        const el = document.getElementById(n.id)
        if (!el) continue
        ScrollTrigger.create({
          trigger: el,
          start: 'top 45%',
          end: 'bottom 45%',
          onToggle: (self) => setActive((cur) => (self.isActive ? n.id : cur === n.id ? '' : cur)),
        })
      }
    },
    { scope: hdrRef },
  )

  const go = (e: React.MouseEvent, target: string) => {
    e.preventDefault()
    scrollTo(target)
  }

  return (
    <header className="lt-hdr" ref={hdrRef}>
      <div className="lt-hdr__in">
        <a className="lt-hdr__name" ref={slotRef} href="#/light-table" onClick={(e) => go(e, '#lt-top')} aria-label={`${profile.name}, back to top`}>
          {NAME}
        </a>
        <nav className="lt-hdr__nav" aria-label="Sections">
          {NAV.filter((n) => n.id !== 'lt-contact').map((n) => (
            <a
              key={n.id}
              className="lt-hdr__link lt-hdr__item"
              href={`#${n.id}`}
              aria-current={active === n.id ? 'true' : undefined}
              onClick={(e) => go(e, `#${n.id}`)}
            >
              <span className="lt-hdr__no">{n.no}</span>
              {n.label}
            </a>
          ))}
        </nav>
        <div className="lt-hdr__tools lt-hdr__item">
          <a
            className="lt-hdr__cta"
            href="#lt-contact"
            aria-current={active === 'lt-contact' ? 'true' : undefined}
            onClick={(e) => go(e, '#lt-contact')}
          >
            Contact
          </a>
          <button
            type="button"
            className="lt-theme"
            onClick={onTheme}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
          >
            <span className="lt-theme__sw" aria-hidden="true">
              <span />
            </span>
            <span className="lt-theme__t">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </div>
      <span className="lt-hdr__bar" aria-hidden="true" />
    </header>
  )
}

/* ------------------------------------------------------------------ hero */

export function Hero({ slotRef }: { slotRef: RefObject<HTMLAnchorElement | null> }) {
  const secRef = useRef<HTMLElement>(null)
  const nameRef = useRef<HTMLHeadingElement>(null)
  const spacerRef = useRef<HTMLDivElement>(null)
  const metaRef = useRef<HTMLDivElement>(null)
  const headRef = useRef<HTMLParagraphElement>(null)

  useGSAP(
    (_ctx, contextSafe) => {
      const sec = secRef.current!
      const name = nameRef.current!
      const spacer = spacerRef.current!
      const meta = metaRef.current!
      const head = headRef.current!
      const root = sec.closest<HTMLElement>('.lt')!
      const reduce = prefersReducedMotion()
      let alive = true
      let split: SplitText | null = null
      let bearings = { lb: 0, rsb: 0 }

      /** Fit-text: measure a hidden clone at 100px, scale so the ink spans the content box exactly. */
      const fit = () => {
        const m = name.cloneNode(true) as HTMLElement
        m.removeAttribute('id')
        m.style.cssText = `position:absolute;left:0;top:0;visibility:hidden;transform:none;font-size:100px;letter-spacing:${LS_BIG}em;`
        root.appendChild(m)
        const w = m.getBoundingClientRect().width
        m.remove()
        const ink = w - LS_BIG * 100 - bearings.rsb - bearings.lb
        const F = (100 * spacer.getBoundingClientRect().width) / Math.max(1, ink)
        root.style.setProperty('--name-fs', `${F.toFixed(2)}px`)
        root.style.setProperty('--name-lb', `${(bearings.lb / 100).toFixed(4)}em`)
      }

      const revertSplit = () => {
        if (split) {
          split.revert()
          split = null
        }
      }

      const start = contextSafe!(() => {
        if (!alive) return
        bearings = measureBearings(NAME)
        fit()
        ScrollTrigger.addEventListener('refreshInit', fit)
        root.classList.add('is-ready')

        if (reduce) {
          head.classList.add('is-ul')
          ScrollTrigger.refresh()
          return
        }

        /* --- the dock: big name scales + tracks into the header slot, scrubbed --- */
        const slot = slotRef.current!
        const hdr = slot.closest('header')!
        let dx = 0
        let dy = 0
        let s = 1
        const calc = () => {
          const F = parseFloat(getComputedStyle(name).fontSize)
          const f = parseFloat(getComputedStyle(slot).fontSize)
          const lbEm = bearings.lb / 100
          const left = spacer.getBoundingClientRect().left - lbEm * F
          const top = parseFloat(getComputedStyle(name).top)
          const r = slot.getBoundingClientRect()
          dx = r.left - left
          dy = r.top - top
          s = f / F
        }
        gsap
          .timeline({
            scrollTrigger: {
              start: 0,
              end: () => Math.max(120, meta.getBoundingClientRect().top + window.scrollY - hdr.offsetHeight),
              scrub: true,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                root.classList.toggle('is-docked', self.progress > 0.995)
                root.classList.toggle('is-scrolled', self.progress > 0.02)
              },
            },
          })
          .fromTo(
            name,
            { x: 0, y: 0, scale: 1, '--ls': `${LS_BIG}em` },
            {
              x: () => {
                calc()
                return dx
              },
              y: () => dy,
              scale: () => s,
              '--ls': `${LS_DOCK}em`,
              ease: 'none',
            },
          )

        /* --- intro: masked letter rise, rules draw, lines lift --- */
        const hdrItems = hdr.querySelectorAll('.lt-hdr__item')
        const chars = name.querySelectorAll('.lt-ch__i')
        const metaItems = meta.querySelectorAll('.lt-meta')
        split = SplitText.create(head, { type: 'lines', mask: 'lines', linesClass: 'lt-hl-line' })
        const tl = gsap.timeline({ defaults: { ease: 'ltOut' } })
        tl.from(chars, { yPercent: 112, duration: 0.85, stagger: 0.028 }, 0)
          .from(hdrItems, { y: -12, autoAlpha: 0, duration: 0.7, stagger: 0.05 }, 0.25)
          .from(meta.querySelector('.lt-hero__rule'), { scaleX: 0, duration: 1.1, ease: 'ltInOut' }, 0.2)
          .from(metaItems, { yPercent: 30, autoAlpha: 0, duration: 0.8, stagger: 0.07 }, 0.45)
          .from(split.lines, { yPercent: 108, duration: 0.95, stagger: 0.075 }, 0.4)
          .from(sec.querySelectorAll('.lt-hero__foot > *'), { autoAlpha: 0, y: 10, duration: 0.6, stagger: 0.05 }, 0.9)
          .call(() => head.classList.add('is-ul'), [], 1.0)
        gsap.delayedCall(3.2, revertSplit)
        window.addEventListener('resize', revertSplit)
        ScrollTrigger.refresh()
      })

      waitForFonts().then(start)

      return () => {
        alive = false
        ScrollTrigger.removeEventListener('refreshInit', fit)
        window.removeEventListener('resize', revertSplit)
        revertSplit()
        root.classList.remove('is-ready', 'is-docked', 'is-scrolled')
      }
    },
    { scope: secRef },
  )

  return (
    <section className="lt-hero" id="lt-top" ref={secRef} aria-labelledby="lt-hero-title">
      <h1 className="lt-hero__name" id="lt-hero-title" ref={nameRef} aria-label={profile.name}>
        {[...NAME].map((c, i) => (
          <span className="lt-ch" key={i} aria-hidden="true">
            <span className="lt-ch__i">{c === ' ' ? ' ' : c}</span>
          </span>
        ))}
      </h1>
      <div className="lt-hero__spacer" ref={spacerRef} aria-hidden="true" />

      <div className="lt-hero__meta" ref={metaRef}>
        <span className="lt-hero__rule" aria-hidden="true" />
        <div className="lt-meta">
          <span className="lt-label">Role · Location</span>
          <p>
            {profile.role}, {profile.location}
            {previously && <span className="lt-meta__sub">Previously {previously.place}</span>}
          </p>
        </div>
        <div className="lt-meta">
          <span className="lt-label">Local time · London</span>
          <p className="lt-meta__time">
            <LondonTime />
          </p>
        </div>
        <div className="lt-meta">
          <span className="lt-label">
            <i className="lt-live" aria-hidden="true" />
            Currently
          </span>
          <p>{currently}</p>
        </div>
      </div>

      <p className="lt-hero__headline" ref={headRef}>
        <span className="lt-hero__kicker" aria-hidden="true">
          <span className="lt-label">(Profile)</span>
        </span>
        {headlineParts.map((part, i) =>
          part.u ? (
            <span key={i} className="lt-u" style={{ '--d': `${i * 0.09}s` } as React.CSSProperties}>
              {part.text}
            </span>
          ) : (
            <span key={i}>{part.text}</span>
          ),
        )}
      </p>

      <div className="lt-hero__foot">
        <span className="lt-label">
          {projects.length} projects · {cases.length} case studies · {yearSpan}
        </span>
        <button type="button" className="lt-label lt-hero__cue" onClick={() => scrollTo('#lt-proof')}>
          Scroll <span aria-hidden="true">↓</span>
        </button>
      </div>
    </section>
  )
}
