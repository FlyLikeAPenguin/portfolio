import { useRef, type CSSProperties } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { asset, experiments } from '../../content'
import { LinkArrow, Tri } from './film'

const STEPS = ['2s', '4s', '8s', '16s', '32s']

/** A darkroom test strip: the same image at five stepped exposures. */
function TestStrip({ glyph, src }: { glyph: string; src?: string }) {
  return (
    <div className="cs-strip" aria-hidden="true">
      <div className="cs-strip__img">
        {src ? <img src={asset(src)} alt="" loading="lazy" decoding="async" /> : <span className="cs-strip__glyph">{glyph}</span>}
      </div>
      <div className="cs-strip__bands">
        {STEPS.map((s, i) => (
          <span key={s} style={{ '--i': i } as CSSProperties}>
            <i>{s}</i>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function Experiments() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 769px)' }, (ctx) => {
        const { motion, desktop } = ctx.conditions as { motion: boolean; desktop: boolean }
        if (!motion) return
        gsap.fromTo(
          '.cs-exp',
          { y: 80, rotation: (i: number) => (desktop ? [-6, 4, -3][i % 3] : 0), opacity: 0 },
          {
            y: 0,
            rotation: 0,
            opacity: 1,
            duration: 1,
            ease: 'expo.out',
            stagger: 0.12,
            scrollTrigger: { trigger: '.cs-exps', start: 'top 80%', once: true },
          },
        )
      })
    },
    { scope: root },
  )

  return (
    <section className="cs-exps-wrap" id="cs-experiments" ref={root} aria-labelledby="cs-exp-title">
      <header className="cs-sechead">
        <p className="cs-kicker">
          <span>Test strips</span>
          <Tri />
          <span>{experiments.length} small things</span>
        </p>
        <h2 className="cs-h2" id="cs-exp-title">
          Experiments, <em>stepped exposures</em>
        </h2>
        <p className="cs-sechead__dek">Smaller pieces: worth a test strip, not yet a full print.</p>
      </header>
      <ul className="cs-exps">
        {experiments.map((p, i) => (
          <li className="cs-exp" key={p.slug} style={{ '--tilt': `${[-1.4, 1.1, -0.6][i % 3]}deg` } as CSSProperties}>
            <div className="cs-exp__card">
            <TestStrip glyph={p.name.charAt(0)} src={p.cover || undefined} />
            <div className="cs-exp__body">
              <p className="cs-exp__meta">
                <span>{p.year}</span>
                <span>{p.status}</span>
              </p>
              <h3 className="cs-exp__name">{p.name}</h3>
              <p className="cs-exp__kind">{p.kind}</p>
              <p className="cs-exp__one">{p.oneLiner}</p>
              <p className="cs-exp__stack">{p.stack.join(' / ')}</p>
              <p className="cs-links">
                {p.links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer">
                    {l.label}
                    <LinkArrow />
                  </a>
                ))}
              </p>
            </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
