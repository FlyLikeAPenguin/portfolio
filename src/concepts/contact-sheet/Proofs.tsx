import { useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { asset, type Project } from '../../content'
import { pad2, type MarkKind } from './data'
import { FilmCell, LinkArrow, Tape, Tri } from './film'
import { CellMarks, GreaseCircle, GreaseNote } from './marks'
import { markTimeline } from './FilmAdvance'

type Annotation = { stat: number; kind: 'note' | 'circle'; text?: string; flip?: boolean }

/** Grease-pencil call-outs. Every note restates a stat from the content files, nothing more. */
const ANNOTATIONS: Record<string, Annotation[]> = {
  quibble: [
    { stat: 0, kind: 'note', text: '17 games!' },
    { stat: 1, kind: 'circle' },
  ],
  nitpick: [{ stat: 0, kind: 'circle' }],
  satboard: [{ stat: 1, kind: 'note', text: 'Svalbard', flip: true }],
  'mission-countdown': [{ stat: 0, kind: 'circle' }],
}

const REST: Record<string, number> = { quibble: -1.6, nitpick: 1.9, satboard: -2.3, 'mission-countdown': 1.5 }

type PrintProps = {
  src: string | null
  alt: string
  fit?: 'cover' | 'contain'
  bg?: string
  left: string
  right: string
  rest: number
  className?: string
}

function Print({ src, alt, fit = 'cover', bg, left, right, rest, className = '' }: PrintProps) {
  return (
    <figure className={`cs-print ${className}`} style={{ '--rest': `${rest}deg` } as CSSProperties}>
      <div className="cs-print__paper">
        <div className="cs-print__img" style={bg ? { background: bg } : undefined}>
          {src ? (
            <img src={src} alt={alt} loading="lazy" decoding="async" style={{ objectFit: fit }} />
          ) : (
            <span className="cs-win__blank" role="img" aria-label={alt} />
          )}
        </div>
        <figcaption className="cs-print__foot">
          <span>{left}</span>
          <span>{right}</span>
        </figcaption>
      </div>
      <Tape className="cs-tape--tl" />
      <Tape className="cs-tape--br" />
    </figure>
  )
}

function Stats({ p, big = false }: { p: Project; big?: boolean }) {
  const notes = ANNOTATIONS[p.slug] ?? []
  return (
    <dl className={`cs-stats ${big ? 'cs-stats--big' : ''}`} data-marks="">
      {p.stats.map((s, i) => {
        const a = notes.find((n) => n.stat === i)
        return (
          <div className="cs-stat" key={s.label}>
            <dt>{s.label}</dt>
            <dd>
              <span className="cs-stat__v">
                {s.value}
                {a?.kind === 'circle' && <GreaseCircle />}
              </span>
              {a?.kind === 'note' && a.text && <GreaseNote text={a.text} flip={a.flip} />}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}

function Highlights({ p }: { p: Project }) {
  if (!p.highlights.length) return null
  return (
    <ol className="cs-hl">
      {p.highlights.map((h, i) => (
        <li key={h.title}>
          <span className="cs-hl__n">{pad2(i + 1)}</span>
          <h4>{h.title}</h4>
          <p>{h.detail}</p>
        </li>
      ))}
    </ol>
  )
}

function Links({ p }: { p: Project }) {
  return (
    <p className="cs-links">
      {p.links.map((l) => (
        <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
          {l.label}
          <LinkArrow />
        </a>
      ))}
    </p>
  )
}

function Intro({ p, i }: { p: Project; i: number }) {
  return (
    <>
      <p className="cs-kicker">
        <span>Proof {pad2(i + 1)}</span>
        <Tri />
        <span>{p.year}</span>
      </p>
      <h3 className="cs-proof__name">{p.name}</h3>
      <p className="cs-proof__kind">{p.kind}</p>
      <p className="cs-proof__status">
        <span className="cs-status">{p.status}</span>
        <span className="cs-proof__role">{p.role}</span>
      </p>
      <p className="cs-proof__one">{p.oneLiner}</p>
      <p className="cs-proof__summary">{p.summary}</p>
    </>
  )
}

const GALLERY_MARKS: MarkKind[] = ['crop', 'loop', 'none', 'loop', 'star', 'tick']

function GalleryContact({ p }: { p: Project }) {
  return (
    <div className="cs-gsheet" data-marks="">
      <div className="cs-gsheet__paper">
        <p className="cs-sheet__label">
          <span>{p.name}</span>
          <span>Gallery · contact print</span>
          <span>{p.gallery.length} frames</span>
        </p>
        <div className="cs-sheet-grid cs-sheet-grid--3">
          {p.gallery.map((g, i) => (
            <div className="cs-sheet-cell" key={g}>
              <FilmCell n={i + 14} top={i % 3 === 0 ? 'text' : i % 3 === 1 ? 'dx' : 'none'}>
                <div className="cs-win" data-loupe="" data-fit="cover">
                  <img src={asset(g)} alt={`${p.name} gallery frame ${i + 1}`} loading="lazy" decoding="async" />
                </div>
                <CellMarks mark={GALLERY_MARKS[i] ?? 'none'} />
              </FilmCell>
            </div>
          ))}
        </div>
      </div>
      <Tape className="cs-tape--tl" />
      <Tape className="cs-tape--tr" />
      <span className="cs-gsheet__note">
        <GreaseNote text="print these two" />
      </span>
    </div>
  )
}

export default function Proofs({ projects, flipSrc }: { projects: Project[]; flipSrc: string | null }) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 769px)' }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        const groups = gsap.utils.toArray<HTMLElement>('[data-marks]')
        if (!motion) {
          groups.forEach((g) => markTimeline(g).progress(1))
          return
        }
        groups.forEach((g) => {
          const tl = markTimeline(g)
          ScrollTrigger.create({ trigger: g, start: 'top 78%', once: true, onEnter: () => tl.play() })
        })
        gsap.utils.toArray<HTMLElement>('.cs-proof .cs-print').forEach((print, i) => {
          const rest = parseFloat(getComputedStyle(print).getPropertyValue('--rest')) || 0
          if (desktop) {
            gsap.fromTo(
              print,
              { rotation: rest + (i % 2 ? -7 : 7), y: 90, transformOrigin: '50% 60%' },
              {
                rotation: rest,
                y: 0,
                ease: 'power2.out',
                scrollTrigger: { trigger: print, start: 'top 98%', end: 'center 52%', scrub: 0.9 },
              },
            )
            if (print.classList.contains('cs-print--xl')) {
              gsap.to(print.parentElement, {
                yPercent: -8,
                ease: 'none',
                scrollTrigger: { trigger: print, start: 'center 50%', end: 'bottom top', scrub: 0.9 },
              })
            }
          } else {
            gsap.from(print, {
              y: 40,
              opacity: 0,
              duration: 0.9,
              ease: 'power3.out',
              scrollTrigger: { trigger: print, start: 'top 88%', once: true },
            })
          }
        })
        gsap.utils.toArray<HTMLElement>('.cs-gsheet').forEach((sheet) => {
          gsap.fromTo(
            sheet,
            { rotation: desktop ? 2.4 : 0, y: 70 },
            {
              rotation: desktop ? -0.7 : 0,
              y: 0,
              ease: 'power2.out',
              scrollTrigger: { trigger: sheet, start: 'top 98%', end: 'top 40%', scrub: 0.9 },
            },
          )
        })
      })
    },
    { scope: root },
  )

  const [flag, ...rest] = projects
  return (
    <section className="cs-proofs" id="cs-proofs" ref={root} aria-labelledby="cs-proofs-title">
      <header className="cs-sechead">
        <p className="cs-kicker">
          <span>Proofs</span>
          <Tri />
          <span>8×10 on fibre</span>
          <Tri />
          <span>{projects.length} prints</span>
        </p>
        <h2 className="cs-h2" id="cs-proofs-title">
          Proofs, <em>on the light table</em>
        </h2>
        <p className="cs-sechead__dek">
          The four project frames from Roll 01, printed big enough to read. Grease pencil marks the bits worth
          looking at twice.
        </p>
      </header>

      {flag && (
        <article className="cs-proof cs-proof--flagship" id={`proof-${flag.slug}`} aria-labelledby={`pt-${flag.slug}`}>
          <div className="cs-proof__printcol">
            <Print
              src={asset(flag.cover)}
              alt={`${flag.name} key art`}
              left={`Proof 01 · ${flag.name}`}
              right={`${flag.year} · 8×10`}
              rest={REST[flag.slug] ?? -1.5}
              className="cs-print--xl"
            />
          </div>
          <div className="cs-proof__text" id={`pt-${flag.slug}`}>
            <Intro p={flag} i={0} />
            <Links p={flag} />
          </div>
          <div className="cs-proof__sheet">
            <GalleryContact p={flag} />
          </div>
          <div className="cs-proof__statsrow">
            <Stats p={flag} big />
          </div>
          <div className="cs-proof__hlrow">
            <Highlights p={flag} />
            <p className="cs-stack">
              <span className="cs-stack__k">Stack</span>
              {flag.stack.join(' / ')}
            </p>
          </div>
        </article>
      )}

      {rest.map((p, k) => {
        const i = k + 1
        const isMission = p.slug === 'mission-countdown'
        const isNitpick = p.slug === 'nitpick'
        const src = isMission ? flipSrc : asset(p.cover)
        return (
          <article
            className={`cs-proof cs-proof--${k % 2 ? 'left' : 'right'}`}
            id={`proof-${p.slug}`}
            key={p.slug}
            aria-labelledby={`pt-${p.slug}`}
          >
            <div className="cs-proof__printcol">
              <Print
                src={src}
                alt={isMission ? `${p.name}: flip clock at T plus zero, recreated` : `${p.name}: ${p.oneLiner}`}
                fit={isNitpick ? 'contain' : 'cover'}
                bg={isNitpick ? '#0d1117' : undefined}
                left={`Proof ${pad2(i + 1)} · ${p.name}`}
                right={p.year}
                rest={REST[p.slug] ?? 1.5}
              />
              {isNitpick && p.gallery[0] && (
                <Print
                  src={asset(p.gallery[0])}
                  alt={`${p.name} dashboard`}
                  fit="cover"
                  left="Work print"
                  right="dashboard"
                  rest={-4}
                  className="cs-print--small"
                />
              )}
            </div>
            <div className="cs-proof__text" id={`pt-${p.slug}`}>
              <Intro p={p} i={i} />
              <Stats p={p} />
              <Highlights p={p} />
              <p className="cs-stack">
                <span className="cs-stack__k">Stack</span>
                {p.stack.join(' / ')}
              </p>
              <Links p={p} />
              {p.credit && <p className="cs-credit">{p.credit}</p>}
            </div>
          </article>
        )
      })}
    </section>
  )
}

