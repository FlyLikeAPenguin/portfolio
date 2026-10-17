import { useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { asset, featured, flagship, type Project } from '../../content'
import FocusTitle from './FocusTitle'
import FlipClock from './FlipClock'
import SectionHead from './SectionHead'
import { useShutter, type Shot } from './Shutter'
import { pad, shortRole, titleFromFile } from './util'

gsap.registerPlugin(ScrollTrigger, useGSAP)

const all = [flagship, ...featured]
const WORDS = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

/** Known aspect ratios for gallery art, by filename prefix. Layout only. */
const ratioOf = (src: string) => {
  const f = src.split('/').pop() ?? ''
  if (f.startsWith('poster-')) return 1
  if (f.startsWith('hero-')) return 3
  if (f.includes('dashboard')) return 1038 / 882
  if (f.endsWith('.svg')) return 2
  return 16 / 9
}

const shotOf = (p: Project, src: string, i: number): Shot => ({
  src: asset(src),
  title: src.endsWith('.svg') ? p.name : titleFromFile(src),
  alt: `${p.name}: ${titleFromFile(src)}`,
  meta: [p.name, p.year, `Plate ${pad(i + 1)}`],
})

const Arrow = () => (
  <svg viewBox="0 0 10 10" aria-hidden="true">
    <path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
  </svg>
)

const Brackets = () => (
  <>
    <span className="vf-frame__br vf-frame__br--tl" />
    <span className="vf-frame__br vf-frame__br--tr" />
    <span className="vf-frame__br vf-frame__br--bl" />
    <span className="vf-frame__br vf-frame__br--br" />
  </>
)

function Exif({ p }: { p: Project }) {
  return (
    <p className="vf-exif">
      <span>
        <em className="vf-engr">Year</em>
        <b>{p.year}</b>
      </span>
      <span>
        <em className="vf-engr">Role</em>
        <b>{shortRole(p.role)}</b>
      </span>
      <span>
        <em className="vf-engr">Status</em>
        <b>{p.status}</b>
      </span>
      <span>
        <em className="vf-engr">Stack</em>
        <b>{p.stack.slice(0, 2).join(' · ')}</b>
      </span>
    </p>
  )
}

function Stats({ p }: { p: Project }) {
  return (
    <dl className="vf-stats">
      {p.stats.map((s) => (
        <div key={s.label}>
          <dt className="vf-engr">{s.label}</dt>
          <dd className="vf-mono">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Links({ p }: { p: Project }) {
  return (
    <div className="vf-proj__links">
      {p.links.map((l) => (
        <a key={l.href} className="vf-btn" href={l.href} target="_blank" rel="noreferrer">
          {l.label}
          <Arrow />
        </a>
      ))}
    </div>
  )
}

function Highlights({ p }: { p: Project }) {
  if (!p.highlights.length) return null
  return (
    <ol className={`vf-hl vf-hl--${p.highlights.length}`}>
      {p.highlights.map((h, i) => (
        <li key={h.title}>
          <span className="vf-hl__no vf-mono">{pad(i + 1)}</span>
          <h4 className="vf-hl__title">{h.title}</h4>
          <p className="vf-hl__detail">{h.detail}</p>
        </li>
      ))}
    </ol>
  )
}

function Head({ p, i }: { p: Project; i: number }) {
  return (
    <header className="vf-proj__head">
      <p className="vf-proj__kicker">
        <span className="vf-engr vf-proj__frame">
          Frame <b className="vf-mono">{pad(i + 1)}</b> / {pad(all.length)}
        </span>
        <span className="vf-proj__kline" />
        <span className="vf-engr">{p.kind}</span>
      </p>
      <FocusTitle as="h3" text={p.name} className="vf-proj__name" />
      <Exif p={p} />
    </header>
  )
}

function Flagship({ p }: { p: Project }) {
  const { open } = useShutter()
  const shots = p.gallery.map((g, i) => shotOf(p, g, i))
  // three justified rows: equal heights within a row via flex-grow = aspect ratio
  const rows = [[0, 5], [1, 2], [3, 4]].map((r) => r.filter((i) => i < p.gallery.length)).filter((r) => r.length)
  return (
    <article className="vf-proj vf-proj--flag" id={`vf-p-${p.slug}`} aria-labelledby={`vf-p-${p.slug}-t`}>
      <span id={`vf-p-${p.slug}-t`} className="vf-sr">
        {p.name}
      </span>
      <Head p={p} i={0} />
      <figure className="vf-proj__cover vf-frame vf-iris-in" style={{ aspectRatio: '1586 / 992' }}>
        <Brackets />
        <img src={asset(p.cover)} alt={`${p.name} key art`} loading="lazy" decoding="async" width={1586} height={992} />
        <span className="vf-proj__af" aria-hidden="true" />
        <figcaption className="vf-engr vf-proj__cap">
          <span>▸ 01A</span>
          <span>{p.oneLiner}</span>
        </figcaption>
      </figure>

      <div className="vf-proj__body">
        <div className="vf-proj__text">
          <p className="vf-body">{p.summary}</p>
          <p className="vf-proj__role">
            <span className="vf-engr">Role</span>
            <span>{p.role}</span>
          </p>
          <Links p={p} />
        </div>
        <Stats p={p} />
      </div>

      <Highlights p={p} />

      <div className="vf-gal">
        <p className="vf-gal__head">
          <span className="vf-engr">Contact sheet · {p.name}</span>
          <span className="vf-engr vf-gal__hint">Select a frame to fire the shutter</span>
        </p>
        {rows.map((r, ri) => (
          <div key={ri} className="vf-gal__row">
            {r.map((gi) => {
              const ar = ratioOf(p.gallery[gi])
              return (
                <button
                  key={gi}
                  type="button"
                  className="vf-shot"
                  style={{ flexGrow: ar, aspectRatio: String(ar) } as CSSProperties}
                  aria-label={`Open frame: ${shots[gi].title}`}
                  onClick={(e) => open(shots, gi, e.currentTarget)}
                >
                  <img src={shots[gi].src} alt="" loading="lazy" decoding="async" />
                  <span className="vf-shot__ui" aria-hidden="true">
                    <Brackets />
                    <span className="vf-shot__label vf-engr">
                      <b className="vf-mono">{pad(gi + 1)}</b> {shots[gi].title}
                    </span>
                    <span className="vf-shot__af" />
                  </span>
                </button>
              )
            })}
          </div>
        ))}
      </div>

      <p className="vf-proj__stack">
        <span className="vf-engr">Full stack</span>
        <span className="vf-mono">{p.stack.join('  /  ')}</span>
      </p>
    </article>
  )
}

function Featured({ p, i }: { p: Project; i: number }) {
  const { open } = useShutter()
  const isClock = p.slug === 'mission-countdown'
  const media = isClock ? [] : [p.cover, ...p.gallery].filter(Boolean)
  const shots = media.map((m, j) => shotOf(p, m, j))
  const flip = i % 2 === 1
  return (
    <article className={`vf-proj vf-proj--feat${flip ? ' is-flip' : ''}`} id={`vf-p-${p.slug}`}>
      <Head p={p} i={i} />
      <div className="vf-proj__grid">
        <div className="vf-proj__media">
          {isClock ? (
            <div className="vf-proj__cover vf-frame vf-proj__clock">
              <Brackets />
              <FlipClock />
            </div>
          ) : (
            <button
              type="button"
              className="vf-proj__cover vf-frame vf-iris-in vf-shot vf-shot--cover"
              style={{ aspectRatio: String(ratioOf(media[0]) === 2 ? 2 : 16 / 10) }}
              aria-label={`Open frame: ${p.name}`}
              onClick={(e) => open(shots, 0, e.currentTarget)}
            >
              <Brackets />
              <img src={shots[0].src} alt={`${p.name} screenshot`} loading="lazy" decoding="async" />
              <span className="vf-proj__af" aria-hidden="true" />
            </button>
          )}
          {shots.length > 1 && (
            <button
              type="button"
              className="vf-proj__inset vf-shot"
              style={{ aspectRatio: String(ratioOf(media[1])) }}
              aria-label={`Open frame: ${shots[1].title}`}
              onClick={(e) => open(shots, 1, e.currentTarget)}
            >
              <img src={shots[1].src} alt="" loading="lazy" decoding="async" />
              <span className="vf-engr vf-proj__insetlbl">▸ {pad(i + 1)}B</span>
            </button>
          )}
          {p.credit && <p className="vf-engr vf-proj__credit">{p.credit}</p>}
        </div>
        <div className="vf-proj__side">
          <p className="vf-lede">{p.oneLiner}</p>
          <p className="vf-body">{p.summary}</p>
          <Stats p={p} />
          <Links p={p} />
        </div>
      </div>
      <Highlights p={p} />
    </article>
  )
}

export default function Work() {
  const root = useRef<HTMLElement>(null)

  // iris-wipe reveal for cover frames: a nonagon that opens and turns, like the blades
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<HTMLElement>('.vf-iris-in').forEach((el) => {
          const poly = (t: number) => {
            const w = el.offsetWidth
            const h = el.offsetHeight
            const R = (Math.hypot(w, h) / 2 / Math.cos(Math.PI / 9)) * t
            const rot = (1 - t) * 0.7
            const pts = Array.from({ length: 9 }, (_, k) => {
              const a = rot + (k * 2 * Math.PI) / 9 - Math.PI / 2
              return `${(w / 2 + R * Math.cos(a)).toFixed(1)}px ${(h / 2 + R * Math.sin(a)).toFixed(1)}px`
            })
            return `polygon(${pts.join(',')})`
          }
          const o = { t: 0.04 }
          el.style.clipPath = poly(o.t)
          gsap.to(o, {
            t: 1,
            duration: 1.25,
            ease: 'power3.inOut',
            onUpdate: () => {
              el.style.clipPath = poly(o.t)
            },
            onComplete: () => {
              el.style.clipPath = ''
            },
            scrollTrigger: { trigger: el, start: 'top 82%', once: true },
          })
        })
      })
    },
    { scope: root },
  )

  return (
    <section ref={root} id="vf-work" className="vf-section vf-work" aria-labelledby="vf-work-title">
      <div className="vf-wrap">
        <SectionHead no="02" label="Projects" sectionIndex={1} title="Selected work" titleId="vf-work-title">
          {WORDS[all.length] ?? all.length} frames from the last few rolls. Each one had to work, not just look right.
        </SectionHead>
        <Flagship p={flagship} />
        {featured.map((p, i) => (
          <Featured key={p.slug} p={p} i={i + 1} />
        ))}
      </div>
    </section>
  )
}
