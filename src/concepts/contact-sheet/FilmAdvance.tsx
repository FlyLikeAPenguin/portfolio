import { memo, useCallback, useRef, useState, type FocusEvent } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { asset } from '../../content'
import { scrollTo } from '../../shared/useSmoothScroll'
import { FLIPCLOCK, pad2, type RollFrame } from './data'
import { FilmCell, LinkArrow, Tri, Dx } from './film'
import { CellMarks } from './marks'
import { frameCounter, ROLL_ID } from './store'

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v))

/**
 * Grease-pencil timeline for whatever marks live inside `el`. Strokes inside one SVG are drawn in order
 * (a loop, then its note, then the tick); separate SVGs start a beat apart so a sheet of marks never drags.
 */
export function markTimeline(el: Element) {
  const tl = gsap.timeline({ paused: true })
  const svgs = new Set<SVGSVGElement>()
  el.querySelectorAll<SVGElement>('.cs-gp, .cs-gp-note').forEach((m) => m.ownerSVGElement && svgs.add(m.ownerSVGElement))
  Array.from(svgs).forEach((svg, k) => {
    const sub = gsap.timeline()
    svg.querySelectorAll<SVGElement>('.cs-gp, .cs-gp-note').forEach((m) => {
      if (m.classList.contains('cs-gp')) {
        const long = ((m as SVGPathElement).getTotalLength?.() ?? 0) > 600
        sub.fromTo(m, { drawSVG: '0%' }, { drawSVG: '100%', duration: long ? 0.8 : 0.3, ease: 'power1.inOut' }, '>-0.05')
      } else {
        sub.fromTo(
          m,
          { clipPath: 'inset(-40% 100% -40% -5%)' },
          { clipPath: 'inset(-40% -5% -40% -5%)', duration: 0.45, ease: 'none' },
          '>-0.1',
        )
      }
    })
    tl.add(sub, k * 0.22)
  })
  return tl
}

type StripProps = {
  frames: RollFrame[]
  flipSrc: string | null
  onFocusFrame: (i: number, e: FocusEvent<HTMLElement>) => void
}

/** The film itself. Memoised so caption updates never touch the frames (whose styles GSAP drives). */
const Strip = memo(function Strip({ frames, flipSrc, onFocusFrame }: StripProps) {
  return (
    <ol className="cs-roll__track" aria-label={`Roll 01, ${frames.length} frames`}>
      <li className="cs-roll__leader" aria-hidden="true">
        <div className="cs-film cs-film--leader">
          <span className="cs-edge cs-edge--bot cs-edge--leader">
            <Dx seed={4} />
            <span>
              <Tri />
              00
            </span>
          </span>
        </div>
        <span className="cs-roll__load">
          Load <Tri />
        </span>
      </li>
      {frames.map((fr, i) => {
        const src = fr.src === FLIPCLOCK ? flipSrc : asset(fr.src)
        const img = src ? (
          <img src={src} alt={fr.alt} decoding="async" loading="eager" draggable={false} style={{ objectFit: fr.fit }} />
        ) : (
          <span className="cs-win__blank" role="img" aria-label={fr.alt} />
        )
        // positive underneath; the C-41 negative on top is washed away by the developer (a masked wipe)
        const inner = (
          <>
            {img}
            <span className="cs-win__neg" aria-hidden="true">
              {src ? <img src={src} alt="" decoding="async" draggable={false} style={{ objectFit: fr.fit }} /> : null}
              <span className="cs-win__mask" />
            </span>
            <span className="cs-win__glow" />
          </>
        )
        return (
          <li className="cs-roll__frame" key={fr.id}>
            <FilmCell n={i + 1} top={i % 2 ? 'dx' : 'text'}>
              {fr.type === 'project' && fr.project ? (
                <button
                  className="cs-win cs-win--link"
                  data-loupe=""
                  data-fit={fr.fit}
                  data-bg={fr.bg}
                  style={fr.bg ? { background: fr.bg } : undefined}
                  onClick={() => scrollTo(`#proof-${fr.project!.slug}`)}
                  onFocus={(e) => onFocusFrame(i, e)}
                  aria-label={`Frame ${i + 1}: ${fr.title}. Jump to the proof.`}
                >
                  {inner}
                </button>
              ) : (
                <div className="cs-win" data-loupe="" data-fit={fr.fit}>
                  {inner}
                </div>
              )}
              <CellMarks mark={fr.mark} note={fr.note} />
            </FilmCell>
          </li>
        )
      })}
      <li className="cs-roll__tail" aria-hidden="true">
        <div className="cs-film cs-film--tail">
          <span className="cs-edge cs-edge--bot">
            <span className="cs-edge__n">
              <Tri />
              {frames.length + 1}
            </span>
          </span>
          <span className="cs-edge cs-edge--top">
            <span className="cs-edge__stock">KODAK PORTRA 400</span>
          </span>
        </div>
      </li>
    </ol>
  )
})

export default function FilmAdvance({ frames, flipSrc }: { frames: RollFrame[]; flipSrc: string | null }) {
  const root = useRef<HTMLElement>(null)
  const [active, setActive] = useState(0)
  const keyProgress = useRef<number[]>([])

  useGSAP(
    () => {
      const section = root.current
      const track = section?.querySelector<HTMLElement>('.cs-roll__track')
      if (!section || !track) return
      const items = gsap.utils.toArray<HTMLElement>('.cs-roll__frame', track)
      const wins = items.map((it) => it.querySelector<HTMLElement>('.cs-win')!)
      const negs = items.map((it) => it.querySelector<HTMLElement>('.cs-win__neg'))
      const mm = gsap.matchMedia()

      mm.add({ motion: '(prefers-reduced-motion: no-preference)', mobile: '(max-width: 768px)' }, (ctx) => {
        const { motion, mobile } = ctx.conditions as { motion: boolean; mobile: boolean }
        const tls = items.map((it) => markTimeline(it))

        if (!motion) {
          tls.forEach((t) => t.progress(1))
          wins.forEach((w) => w.style.setProperty('--dev', '1'))
          return
        }

        let vw = 0
        let fw = 1
        let centers: number[] = []
        let keys: number[] = [0, 0]
        let cum: number[] = [0, 1]
        let dist = 0

        const measure = () => {
          vw = section.clientWidth
          centers = items.map((it) => it.offsetLeft + it.offsetWidth / 2)
          fw = items[0].offsetWidth || 1
          const x0 = vw * (mobile ? 0.94 : 0.77) - centers[0]
          keys = [x0, ...centers.map((c) => vw / 2 - c)]
          const lens = keys.slice(1).map((k, i) => Math.abs(k - keys[i]))
          dist = lens.reduce((a, b) => a + b, 0)
          cum = [0]
          lens.forEach((l) => cum.push(cum[cum.length - 1] + l / (dist || 1)))
          keyProgress.current = cum.slice(1)
        }

        // Each frame "dwells" at the gate: the advance is quick between frames and slow on them.
        const DWELL = 0.7
        const xAt = (p: number) => {
          let j = 0
          while (j < keys.length - 2 && p > cum[j + 1]) j++
          const span = cum[j + 1] - cum[j] || 1
          const t = clamp((p - cum[j]) / span)
          const s = t - (DWELL * Math.sin(2 * Math.PI * t)) / (2 * Math.PI)
          return keys[j] + (keys[j + 1] - keys[j]) * s
        }

        const setX = gsap.quickSetter(track, 'x', 'px') as (v: number) => void
        const state = { p: 0 }
        const devs = items.map(() => -1)
        const drawn = items.map(() => false)
        let current = -1

        const render = () => {
          const x = xAt(state.p)
          setX(x)
          let best = 0
          let bestD = Infinity
          for (let i = 0; i < items.length; i++) {
            const d = (x + centers[i] - vw / 2) / fw
            const dev = clamp((0.62 - d) / 0.56)
            if (Math.abs(dev - devs[i]) > 0.002 || ((dev === 0 || dev === 1) && devs[i] !== dev)) {
              devs[i] = dev
              const glow = dev > 0 && dev < 1 ? Math.sin(dev * Math.PI) : 0
              wins[i].style.setProperty('--dev', dev.toFixed(3))
              wins[i].style.setProperty('--glow', glow.toFixed(3))
              const neg = negs[i]
              if (neg) neg.style.visibility = dev >= 1 ? 'hidden' : ''
            }
            if (dev >= 0.97 && !drawn[i]) {
              drawn[i] = true
              tls[i].timeScale(1).play()
            } else if (dev < 0.25 && drawn[i]) {
              drawn[i] = false
              tls[i].timeScale(2).reverse()
            }
            const ad = Math.abs(d)
            if (ad < bestD) {
              bestD = ad
              best = i
            }
          }
          if (best !== current) {
            current = best
            setActive(best)
            frameCounter.setStripFrame(best + 1, items.length)
          }
        }

        measure()
        gsap.to(state, {
          p: 1,
          ease: 'none',
          onUpdate: render,
          scrollTrigger: {
            id: ROLL_ID,
            trigger: section,
            start: 'top top',
            end: () => {
              measure()
              return `+=${Math.round(dist * (mobile ? 0.9 : 1.05))}`
            },
            pin: true,
            scrub: mobile ? 0.35 : 0.65,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            onRefresh: render,
          },
        })
        render()

        return () => {
          gsap.set(track, { clearProps: 'transform' })
          wins.forEach((w) => {
            w.style.removeProperty('--dev')
            w.style.removeProperty('--glow')
          })
          negs.forEach((n) => n?.style.removeProperty('visibility'))
        }
      })
    },
    { scope: root },
  )

  /** Keyboard focus on an off-screen frame scrolls the page so that frame sits at the gate. */
  const onFocusFrame = useCallback((i: number, e: FocusEvent<HTMLElement>) => {
    if (!e.currentTarget.matches(':focus-visible')) return
    const st = ScrollTrigger.getById(ROLL_ID)
    const p = keyProgress.current[i]
    if (!st || p === undefined) return
    scrollTo(Math.round(st.start + p * (st.end - st.start)))
  }, [])

  const fr = frames[active]
  return (
    <section className="cs-roll" id="cs-work" ref={root} aria-labelledby="cs-roll-title">
      <div className="cs-roll__head">
        <h2 className="cs-roll__title" id="cs-roll-title">
          Selected <em>work</em>
        </h2>
        <p className="cs-kicker">
          <span>Roll 01</span>
          <Tri />
          <span>{frames.length} exp.</span>
          <Tri />
          <span>Portra 400</span>
        </p>
        <p className="cs-roll__hint">Scroll to advance. Frames develop at the gate.</p>
      </div>

      <div className="cs-roll__table">
        <div className="cs-roll__ruler" aria-hidden="true" />
        <div className="cs-roll__gate" aria-hidden="true">
          <span className="cs-roll__gate-label">Dev</span>
        </div>
        <Strip frames={frames} flipSrc={flipSrc} onFocusFrame={onFocusFrame} />
      </div>

      <div className="cs-roll__caption">
        <div className="cs-roll__cap" key={active}>
          <span className="cs-roll__capno">
            FR {pad2(active + 1)}
            <span className="cs-roll__capof">/{pad2(frames.length)}</span>
          </span>
          <span className="cs-roll__captitle">{fr.title}</span>
          <span className="cs-roll__capmeta">{fr.meta}</span>
          <span className="cs-roll__capyear">{fr.year}</span>
          {fr.project ? (
            <button className="cs-roll__capgo" onClick={() => scrollTo(`#proof-${fr.project!.slug}`)}>
              See the proof <LinkArrow dir="down" />
            </button>
          ) : (
            <span className="cs-roll__capgo cs-roll__capgo--muted">Photograph</span>
          )}
        </div>
        <ol className="cs-roll__ticks" aria-hidden="true">
          {frames.map((f, i) => (
            <li key={f.id} className={`${i === active ? 'is-on' : ''} ${f.type === 'project' ? 'is-project' : ''}`} />
          ))}
        </ol>
      </div>
    </section>
  )
}
