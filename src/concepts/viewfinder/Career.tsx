import { memo, useRef, useState, type ReactNode } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { dayJob, timeline } from '../../content'
import SectionHead from './SectionHead'
import { inOut, pad, stair } from './util'

/** move, overshoot the mark by a hair, settle back: a click-stop */
const detent = (t: number) => (t < 0.72 ? 1.06 * inOut(t / 0.72) : 1.06 - 0.06 * inOut((t - 0.72) / 0.28))

gsap.registerPlugin(ScrollTrigger, useGSAP)

const Y0 = 2016
const Y1 = 2027
const PX = 236 // px per year on the ring

// spread entries that share a year across it, so each has its own mark
const counts: Record<string, number> = {}
const seen: Record<string, number> = {}
timeline.forEach((t) => (counts[t.year] = (counts[t.year] ?? 0) + 1))
const ENTRIES = timeline.map((t) => {
  seen[t.year] = (seen[t.year] ?? 0) + 1
  const at = Number(t.year) + seen[t.year] / (counts[t.year] + 1)
  return { ...t, at, x: (at - Y0) * PX }
})

// the day job is the "depth of field" bracket: everything inside it is in focus
const m = dayJob.place.match(/(\d{4})\s*[–-]\s*(\d{2,4})/)
const R0 = m ? Number(m[1]) : 2023
const R1 = m ? Number(m[2].length === 2 ? m[1].slice(0, 2) + m[2] : m[2]) : 2025
const inRange = (at: number) => at >= R0 && at < R1 + 0.25
const W = (Y1 - Y0) * PX

const Ring = memo(function Ring() {
  const ticks: ReactNode[] = []
  for (let y = Y0; y <= Y1; y++) {
    for (let q = 0; q < 4; q++) {
      const yy = y + q / 4
      if (yy > Y1) break
      const x = (yy - Y0) * PX
      const major = q === 0
      const half = q === 2
      ticks.push(
        <line key={`${y}-${q}`} x1={x} x2={x} y1={major ? 58 : half ? 66 : 70} y2={78} className={major ? 'is-major' : ''} />,
      )
    }
    if (y < Y1)
      ticks.push(
        <text key={`t${y}`} x={(y - Y0) * PX} y={44} className="vf-fs__yr">
          {y}
        </text>,
      )
  }
  const rx0 = (R0 - Y0) * PX
  const rx1 = (R1 + 0.25 - Y0) * PX
  return (
    <svg className="vf-fs__svg" width={W} height={130} viewBox={`0 0 ${W} 130`}>
      <line x1={0} x2={W} y1={78} y2={78} className="vf-fs__base" />
      {ticks}
      <text x={(Y1 - Y0) * PX} y={46} className="vf-fs__yr vf-fs__inf">
        ∞
      </text>
      {/* depth-of-field bracket for the day job */}
      <path d={`M${rx0},98 v-8 M${rx0},98 H${rx1} M${rx1},98 v-8`} className="vf-fs__range" />
      <text x={(rx0 + rx1) / 2} y={116} className="vf-fs__rangelbl">
        {dayJob.title} · {dayJob.place}
      </text>
      {ENTRIES.map((e, i) => (
        <g key={i} className="vf-fs__mark" data-i={i}>
          <circle cx={e.x} cy={78} r={3.4} />
        </g>
      ))}
    </svg>
  )
})

function DayJob({ on }: { on: boolean }) {
  return (
    <aside className={`vf-fs__job${on ? ' is-on' : ''}`} aria-label="Day job">
      <p className="vf-engr vf-fs__jobk">
        <i />
        {on ? 'In focus' : 'Depth of field'} · {dayJob.place}
      </p>
      <h4 className="vf-fs__jobt">{dayJob.title}</h4>
      <p className="vf-body">{dayJob.summary}</p>
      <dl className="vf-fs__jobs">
        {dayJob.stats.map((s) => (
          <div key={s.label}>
            <dd className="vf-mono">{s.value}</dd>
            <dt className="vf-engr">{s.label}</dt>
          </div>
        ))}
      </dl>
    </aside>
  )
}

export default function Career() {
  const root = useRef<HTMLElement>(null)
  const track = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  useGSAP(
    () => {
      const el = root.current!
      const stage = el.querySelector<HTMLElement>('.vf-fs__stage')!
      const marks = el.querySelectorAll<SVGGElement>('.vf-fs__mark')
      const n = ENTRIES.length
      let last = -1
      const render = (p: number) => {
        const f = p * (n - 1)
        // click-stops on the focus ring: hold, move, settle past the mark and back
        const k = Math.min(n - 1 + 0.06, Math.max(0, stair(f, 0.4, detent)))
        const i = Math.max(0, Math.min(n - 2, Math.floor(k)))
        const x = ENTRIES[i].x + (ENTRIES[i + 1].x - ENTRIES[i].x) * (k - i)
        const cx = stage.clientWidth / 2
        if (track.current) track.current.style.transform = `translate3d(${(cx - x).toFixed(2)}px,0,0)`
        const a = Math.max(0, Math.min(n - 1, Math.round(k)))
        if (a !== last) {
          last = a
          setActive(a)
          marks.forEach((mk, j) => mk.classList.toggle('is-on', j === a))
        }
      }
      const mm = gsap.matchMedia()
      mm.add('(min-width: 769px) and (prefers-reduced-motion: no-preference)', () => {
        render(0)
        const st = ScrollTrigger.create({
          trigger: stage,
          start: 'top top',
          end: () => `+=${(n - 1) * window.innerHeight * 0.5}`,
          pin: true,
          onUpdate: (self) => render(self.progress),
          onRefresh: (self) => render(self.progress),
        })
        return () => st.kill()
      })
    },
    { scope: root },
  )

  const e = ENTRIES[active]

  return (
    <section ref={root} id="vf-career" className="vf-section vf-fs" aria-labelledby="vf-career-title">
      <div className="vf-wrap">
        <SectionHead no="04" label="Career" sectionIndex={3} title="Focus scale" titleId="vf-career-title">
          Turn the ring. Every mark is a year; the bracket is the depth of field.
        </SectionHead>
      </div>

      <div className="vf-fs__stage" aria-hidden="true">
        <div className="vf-wrap vf-fs__cap">
          <span className="vf-engr">
            <b className="vf-mono">04</b> Focus scale · {ENTRIES[0].year}–{ENTRIES[ENTRIES.length - 1].year}
          </span>
          <span className="vf-engr vf-fs__hint">
            <i />
            Scroll to turn the ring
          </span>
        </div>
        <div className="vf-fs__ring">
          <span className="vf-engr vf-fs__unit">Yrs</span>
          <div ref={track} className="vf-fs__track">
            <Ring />
          </div>
          <div className="vf-fs__index">
            <span />
          </div>
          <svg className="vf-fs__dof" viewBox="-160 0 320 40">
            {[16, 11, 8, 4].map((v, j) => {
              const x = 30 + (3 - j) * 34
              return (
                <g key={v}>
                  <line x1={-x} x2={-x} y1={0} y2={8} />
                  <line x1={x} x2={x} y1={0} y2={8} />
                  <text x={-x} y={22}>{v}</text>
                  <text x={x} y={22}>{v}</text>
                </g>
              )
            })}
            <line x1={0} x2={0} y1={0} y2={12} className="is-hot" />
          </svg>
        </div>

        <div className="vf-wrap vf-fs__detail">
          <div key={`a${active}`} className="vf-fs__when">
            <span className="vf-fs__year vf-mono">{e.year}</span>
            <span className="vf-engr">
              <b className="vf-mono">{pad(active + 1)}</b> / {pad(ENTRIES.length)} · {e.place}
            </span>
          </div>
          <div key={`b${active}`} className="vf-fs__what">
            <h3 className="vf-fs__title">{e.title}</h3>
            <p className="vf-body">{e.detail}</p>
          </div>
          <DayJob on={inRange(e.at)} />
        </div>
      </div>

      {/* list form: mobile, reduced motion, and screen readers on desktop */}
      <div className="vf-wrap vf-fs__listwrap">
        <ol className="vf-fs__list">
          {ENTRIES.map((t, i) => (
            <li key={i} className={inRange(t.at) ? 'is-range' : ''}>
              <span className="vf-fs__ly vf-mono">{t.year}</span>
              <div>
                <h3 className="vf-fs__lt">{t.title}</h3>
                <p className="vf-engr">{t.place}</p>
                <p className="vf-body">{t.detail}</p>
              </div>
            </li>
          ))}
        </ol>
        <DayJob on />
      </div>
    </section>
  )
}
