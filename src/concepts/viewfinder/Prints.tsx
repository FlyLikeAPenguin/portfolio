import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { asset, skyPhotos, streetPhotos, type Photo } from '../../content'
import { prefersReducedMotion } from '../../shared/useSmoothScroll'
import SectionHead from './SectionHead'
import { useShutter, type Shot } from './Shutter'
import { pad } from './util'

gsap.registerPlugin(Flip, ScrollTrigger)

type Filter = 'all' | 'film' | 'digital' | 'sky'
type Print = Photo & { sky: boolean; no: number }

const PRINTS: Print[] = [...streetPhotos.map((p) => ({ ...p, sky: false })), ...skyPhotos.map((p) => ({ ...p, sky: true }))].map(
  (p, i) => ({ ...p, no: i + 1 }),
)

const FILTERS: { id: Filter; label: string; test: (p: Print) => boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'film', label: 'Film', test: (p) => p.kind === 'film' },
  { id: 'digital', label: 'Digital', test: (p) => p.kind === 'digital' },
  { id: 'sky', label: 'Sky', test: (p) => p.sky },
]

const toShot = (p: Print): Shot => ({
  src: asset(p.src),
  title: p.title,
  alt: `${p.title}. Placeholder photograph by ${p.credit.author}.`,
  meta: [p.kind === 'film' ? 'Film' : 'Digital', p.stock, p.settings],
  credit: p.credit,
  w: p.w,
  h: p.h,
})

export default function Prints() {
  const grid = useRef<HTMLUListElement>(null)
  const [filter, setFilter] = useState<Filter>('all')
  const { open } = useShutter()
  const test = FILTERS.find((f) => f.id === filter)!.test
  const visible = PRINTS.filter(test)

  const choose = (f: Filter) => {
    if (f === filter) return
    const items = grid.current?.querySelectorAll<HTMLElement>('.vf-print')
    if (!items || prefersReducedMotion()) {
      setFilter(f)
      return
    }
    const state = Flip.getState(items)
    flushSync(() => setFilter(f))
    Flip.from(state, {
      duration: 0.75,
      ease: 'power3.inOut',
      absolute: true,
      scale: true,
      stagger: 0.012,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, scale: 0.86 }, { opacity: 1, scale: 1, duration: 0.55, ease: 'power3.out', delay: 0.2 }),
      onLeave: (els) => gsap.to(els, { opacity: 0, scale: 0.86, duration: 0.35, ease: 'power2.in' }),
      onComplete: () => ScrollTrigger.refresh(),
    })
  }

  return (
    <section id="vf-prints" className="vf-section vf-prints" aria-labelledby="vf-prints-title">
      <div className="vf-wrap">
        <SectionHead no="05" label="Photography" sectionIndex={4} title="Contact prints" titleId="vf-prints-title">
          Mostly digital: streets, travel and the night sky. Every so often, a roll through the OM-1.
        </SectionHead>

        <div className="vf-prints__bar">
          <div className="vf-prints__filters" role="group" aria-label="Filter photographs">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                className="vf-toggle"
                aria-pressed={filter === f.id}
                onClick={() => choose(f.id)}
              >
                <span className="vf-toggle__lamp" aria-hidden="true" />
                {f.label}
                <span className="vf-toggle__n vf-mono">{pad(PRINTS.filter(f.test).length)}</span>
              </button>
            ))}
          </div>
          <p className="vf-engr vf-prints__note">
            <span className="vf-mono">{pad(visible.length)}</span> frames · Placeholder images, credited in each frame
          </p>
        </div>

        <ul ref={grid} className="vf-prints__grid">
          {PRINTS.map((p) => {
            const show = test(p)
            const idx = visible.indexOf(p)
            return (
              <li key={p.src} className="vf-print" data-flip-id={p.src} hidden={!show}>
                <button
                  type="button"
                  className="vf-print__btn"
                  aria-label={`Open frame ${pad(p.no)}: ${p.title}`}
                  onClick={(e) => open(visible.map(toShot), idx, e.currentTarget)}
                >
                  <img src={asset(p.src)} alt="" loading="lazy" decoding="async" />
                  <span className="vf-print__edge vf-mono" aria-hidden="true">
                    <b>▸ {pad(p.no)}</b>
                    <span>{p.kind === 'film' ? p.stock : 'DIGITAL'}</span>
                  </span>
                  <span className="vf-print__cap" aria-hidden="true">
                    <span className="vf-print__t">{p.title}</span>
                    <span className="vf-engr">{p.settings}</span>
                  </span>
                  <span className="vf-print__corners" aria-hidden="true" />
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
