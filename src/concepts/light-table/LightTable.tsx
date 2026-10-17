import '@fontsource-variable/inter-tight'
import '@fontsource-variable/geist-mono'
import './lt.css'
import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion, scrollTo, useSmoothScroll } from '../../shared/useSmoothScroll'
import { gsap, ScrollTrigger, useGSAP } from './gsap'
import { Header, Hero } from './Hero'
import { Proof } from './Proof'
import { WorkIndex } from './WorkIndex'
import { CaseStack } from './CaseStack'
import { PhotoStrip } from './PhotoStrip'
import { About } from './About'
import { Contact } from './Contact'

type Theme = 'light' | 'dark'
const THEME_KEY = 'light-table:theme'
const BG: Record<Theme, string> = { light: '#f3f2ee', dark: '#0f0f0e' }

const readTheme = (): Theme => {
  try {
    return localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

/** Press G: the 12-column grid everything hangs from. */
function GridOverlay({ on }: { on: boolean }) {
  return (
    <div className={`lt-gridov${on ? ' is-on' : ''}`} aria-hidden="true">
      <div className="lt-gridov__cols">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} style={{ '--i': i } as React.CSSProperties}>
            <em>{String(i + 1).padStart(2, '0')}</em>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function LightTable() {
  useSmoothScroll()
  const rootRef = useRef<HTMLDivElement>(null)
  const slotRef = useRef<HTMLAnchorElement>(null)
  const [theme, setTheme] = useState<Theme>(readTheme)
  const [grid, setGrid] = useState(false)
  const [reduced] = useState(prefersReducedMotion)

  useEffect(() => {
    const prev = document.body.style.background
    return () => {
      document.body.style.background = prev
    }
  }, [])

  useEffect(() => {
    document.body.style.background = BG[theme]
  }, [theme])

  const toggleTheme = () =>
    setTheme((t) => {
      const next: Theme = t === 'dark' ? 'light' : 'dark'
      try {
        localStorage.setItem(THEME_KEY, next)
      } catch {
        /* storage unavailable: the choice just won't persist */
      }
      return next
    })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'g' && e.key !== 'G') return
      if (e.metaKey || e.ctrlKey || e.altKey) return
      const t = e.target as HTMLElement | null
      if (t?.closest('input, textarea, select, [contenteditable="true"]')) return
      setGrid((g) => !g)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  /* Shared reveal language: hairlines draw, titles rise out of a mask, blocks lift. */
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('[data-sh]').forEach((sh) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: sh, start: 'top 88%', once: true } })
          tl.from(sh.querySelector('.lt-sh__rule'), { scaleX: 0, duration: 1.2, ease: 'ltInOut' }, 0)
            .from(sh.querySelector('.lt-sh__t'), { yPercent: 105, duration: 1, ease: 'ltOut' }, 0.15)
            .from(sh.querySelectorAll('.lt-sh__no, .lt-sh__aside'), { autoAlpha: 0, y: 8, duration: 0.7, ease: 'ltOut', stagger: 0.08 }, 0.25)
        })
        gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((el) => {
          gsap.from(el, { y: 32, autoAlpha: 0, duration: 1, ease: 'ltOut', scrollTrigger: { trigger: el, start: 'top 90%', once: true } })
        })
        ScrollTrigger.batch('[data-tr]', {
          start: 'top 92%',
          once: true,
          onEnter: (els) => gsap.from(els, { '--tr': 0, autoAlpha: 0, y: 14, duration: 0.9, ease: 'ltOut', stagger: 0.07 }),
        })
      })
      const imgs = Array.from(rootRef.current!.querySelectorAll('img')).filter((img) => img.loading !== 'lazy')
      let pending = 0
      const done = () => {
        if (--pending === 0) ScrollTrigger.refresh()
      }
      imgs.forEach((img) => {
        if (!img.complete) {
          pending++
          img.addEventListener('load', done, { once: true })
          img.addEventListener('error', done, { once: true })
        }
      })
      return () => mm.revert()
    },
    { scope: rootRef },
  )

  return (
    <div ref={rootRef} className="lt" data-theme={theme} data-motion={reduced ? 'reduce' : 'full'}>
      <a
        className="lt-skip"
        href="#lt-index"
        onClick={(e) => {
          e.preventDefault()
          scrollTo('#lt-index')
          document.querySelector<HTMLElement>('#lt-index .lt-row__btn')?.focus({ preventScroll: true })
        }}
      >
        Skip to the work index
      </a>
      <Header slotRef={slotRef} theme={theme} onTheme={toggleTheme} />
      <main>
        <Hero slotRef={slotRef} />
        <Proof />
        <WorkIndex />
        <CaseStack />
        <PhotoStrip />
        <About />
        <Contact onGrid={() => setGrid((g) => !g)} grid={grid} />
      </main>
      <GridOverlay on={grid} />
    </div>
  )
}
