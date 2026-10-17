import { useMemo, useRef } from 'react'
import { useGSAP } from '@gsap/react'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { gsap, ScrollTrigger } from '../fx'
import { S } from '../store'

gsap.registerPlugin(DrawSVGPlugin)

type Node = { id: string; title: string; sub: string; s: number; t: number; hot?: boolean }

/**
 * Nitpick's flow, drawn as a signal chain: a fan of raw log lines collapses through the
 * fingerprinter into a handful of problems, which Claude investigates and turns into issues and PRs.
 * Laid out in "flow space" (s along, t across) so the same drawing works horizontally or vertically.
 */
function useLayout(vertical: boolean, nodes: Omit<Node, 's' | 't'>[]) {
  return useMemo(() => {
    const SL = vertical ? 820 : 1200
    const TL = vertical ? 360 : 330
    const bw = vertical ? 58 : 196 // box size along the flow
    const bh = vertical ? 196 : 66 // across
    const mid = TL / 2
    const pos: Node[] = [
      { ...nodes[0], s: SL * 0.15, t: mid },
      { ...nodes[1], s: SL * 0.43, t: mid },
      { ...nodes[2], s: SL * 0.69, t: mid },
      { ...nodes[3], s: SL * 0.92, t: mid - TL * (vertical ? 0.24 : 0.22) },
      { ...nodes[4], s: SL * 0.92, t: mid + TL * (vertical ? 0.24 : 0.22), hot: true },
    ]
    const xy = (s: number, t: number) => (vertical ? [t, s] : [s, t])
    const P = (s: number, t: number) => xy(s, t).map((n) => n.toFixed(1)).join(' ')
    const curve = (s0: number, t0: number, s1: number, t1: number, k = 0.5) => {
      const ds = (s1 - s0) * k
      return `M${P(s0, t0)} C${P(s0 + ds, t0)} ${P(s1 - ds, t1)} ${P(s1, t1)}`
    }
    const paths: { d: string; w: number; group: number }[] = []
    // Raw streams into Datadog.
    const nIn = vertical ? 11 : 15
    for (let i = 0; i < nIn; i++) {
      const t = (TL * (i + 0.5)) / nIn
      paths.push({ d: curve(0, t, pos[0].s - bw / 2, mid + (t - mid) * 0.12, 0.6), w: 0.8, group: 0 })
    }
    // ~40k raw entries bulge out and collapse into the fingerprinter.
    const nRaw = vertical ? 9 : 13
    for (let i = 0; i < nRaw; i++) {
      const f = i / (nRaw - 1) - 0.5
      const s0 = pos[0].s + bw / 2
      const s1 = pos[1].s - bw / 2
      const a = `M${P(s0, mid + f * bh * 0.5)}`
      const c = ` C${P(s0 + (s1 - s0) * 0.3, mid + f * TL * 0.95)} ${P(s0 + (s1 - s0) * 0.62, mid + f * TL * 0.7)} ${P(s1, mid + f * 6)}`
      paths.push({ d: a + c, w: 0.8, group: 1 })
    }
    // A few hundred problems → investigations.
    for (let i = 0; i < 3; i++) {
      const f = (i - 1) * 10
      paths.push({ d: curve(pos[1].s + bw / 2, mid + f, pos[2].s - bw / 2, mid + f * 1.4), w: 1.2, group: 2 })
    }
    paths.push({ d: curve(pos[2].s + bw / 2, mid - 8, pos[3].s - bw / 2, pos[3].t), w: 1.2, group: 3 })
    paths.push({ d: curve(pos[2].s + bw / 2, mid + 8, pos[4].s - bw / 2, pos[4].t), w: 1.2, group: 3 })
    const W = vertical ? TL : SL
    const H = vertical ? SL : TL
    const box = (n: Node) => {
      const [x, y] = xy(n.s, n.t)
      const w = vertical ? bh : bw
      const h = vertical ? bw : bh
      return { x: x - w / 2, y: y - h / 2, w, h, cx: x, cy: y }
    }
    return { W, H, pos, paths, box, vertical }
  }, [vertical, nodes])
}

const NODES = [
  { id: 'dd', title: 'Datadog', sub: 'production errors' },
  { id: 'fp', title: 'Fingerprint', sub: 'distinct problems' },
  { id: 'rca', title: 'Claude RCA', sub: '1,378 investigations' },
  { id: 'iss', title: 'GitHub issue', sub: '1,030 filed' },
  { id: 'pr', title: 'Fix PR', sub: 'small, human-reviewed' },
]

function Diagram({ vertical }: { vertical: boolean }) {
  const L = useLayout(vertical, NODES)
  return (
    <svg className={`gs-pipe__svg ${vertical ? 'gs-pipe__svg--v' : 'gs-pipe__svg--h'}`} viewBox={`0 0 ${L.W} ${L.H}`} aria-hidden="true">
      <g className="gs-pipe__base">
        {L.paths.map((p, i) => (
          <path key={`b${i}`} d={p.d} strokeWidth={p.w} data-g={p.group} />
        ))}
      </g>
      <g className="gs-pipe__flow">
        {L.paths.map((p, i) => (
          <path key={`f${i}`} d={p.d} strokeWidth={p.w + 0.6} data-g={p.group} style={{ animationDelay: `${-(i * 0.37) % 2}s` }} />
        ))}
      </g>
      {L.pos.map((n) => {
        const b = L.box(n)
        const k = 9
        const br = `M${b.x} ${b.y + k}V${b.y}H${b.x + k} M${b.x + b.w - k} ${b.y}H${b.x + b.w}V${b.y + k} M${b.x + b.w} ${b.y + b.h - k}V${b.y + b.h}H${b.x + b.w - k} M${b.x + k} ${b.y + b.h}H${b.x}V${b.y + b.h - k}`
        return (
          <g key={n.id} className={`gs-pipe__node ${n.hot ? 'is-hot' : ''}`}>
            <rect x={b.x} y={b.y} width={b.w} height={b.h} />
            <path d={br} className="gs-pipe__br" />
            <text x={b.cx} y={b.cy - 4} textAnchor="middle" className="gs-pipe__t">
              {n.title.toUpperCase()}
            </text>
            <text x={b.cx} y={b.cy + 14} textAnchor="middle" className="gs-pipe__s">
              {n.sub}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export default function Pipeline() {
  const ref = useRef<HTMLDivElement>(null)
  useGSAP(
    () => {
      const el = ref.current
      if (!el) return
      if (S.reduced) {
        el.dataset.on = '1'
        return
      }
      const base = el.querySelectorAll('.gs-pipe__base path')
      const nodes = el.querySelectorAll('.gs-pipe__node')
      gsap.set(base, { drawSVG: '0%' })
      gsap.set(nodes, { opacity: 0 })
      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 78%',
        once: true,
        onEnter: () => {
          const tl = gsap.timeline({ onComplete: () => void (el.dataset.on = '1') })
          ;[0, 1, 2, 3].forEach((g) => {
            const ps = el.querySelectorAll(`.gs-pipe__base path[data-g="${g}"]`)
            tl.to(ps, { drawSVG: '100%', duration: 0.5, ease: 'power2.inOut', stagger: 0.012 }, g * 0.22)
          })
          tl.to(nodes, { opacity: 1, duration: 0.3, stagger: 0.12 }, 0.1)
        },
      })
      return () => st.kill()
    },
    { scope: ref },
  )
  return (
    <div className="gs-pipe" ref={ref} data-on="0">
      <Diagram vertical={false} />
      <Diagram vertical />
      <p className="gs-sr">
        Pipeline: Datadog production errors are fingerprinted into distinct problems. Claude investigates each one read-only (1,378
        investigations), filing GitHub issues (1,030) and opening small fix PRs for human review.
      </p>
    </div>
  )
}
