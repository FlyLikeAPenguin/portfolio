import { memo, useMemo } from 'react'
import { rng, TAU } from './skyEngine'

/** Procedural ridgelines: far mountains, mid hills, a near slope with conifers and one photographer. */
const VW = 2400
const VH = 300
const X0 = -260
const X1 = VW + 260

function ridgePath(seed: number, base: number, amp: number, freq: number, octaves: number, ridged: boolean, step = 6) {
  const R = rng(seed)
  const phases = Array.from({ length: octaves }, () => R() * TAU)
  /** Height of the ridgeline at x (also used to plant trees on it). */
  const at = (x: number) => {
    let y = 0
    let a = 1
    let f = freq
    let norm = 0
    for (let o = 0; o < octaves; o++) {
      const s = Math.sin(x * f + phases[o]) * 0.6 + Math.sin(x * f * 1.73 + phases[o] * 1.9) * 0.4
      y += a * (ridged ? (1 - Math.abs(s)) ** 2 : s * 0.5 + 0.5)
      norm += a
      a *= 0.48
      f *= 2.15
    }
    return base - amp * (y / norm)
  }
  const pts: string[] = []
  for (let x = X0; x <= X1; x += step) pts.push(`${x},${at(x).toFixed(1)}`)
  return { d: `M${X0},${VH + 40} L${pts.join(' L')} L${X1},${VH + 40} Z`, at }
}

function spruce(x: number, y: number, h: number) {
  const w = h * 0.36
  const p = (dx: number, dy: number) => `${(x + dx * w).toFixed(1)},${(y - dy * h).toFixed(1)}`
  return `M${p(-0.5, -0.02)} L${p(-0.16, 0.3)} L${p(-0.4, 0.28)} L${p(-0.11, 0.56)} L${p(-0.3, 0.54)} L${p(-0.06, 0.8)} L${p(-0.16, 0.79)} L${p(0, 1)} L${p(0.16, 0.79)} L${p(0.06, 0.8)} L${p(0.3, 0.54)} L${p(0.11, 0.56)} L${p(0.4, 0.28)} L${p(0.16, 0.3)} L${p(0.5, -0.02)} Z`
}

export const PHOTOGRAPHER_X = 1395

function Horizon() {
  const { far, mid, near, trees, figure } = useMemo(() => {
    const far = ridgePath(11, 214, 150, 0.0029, 5, true, 5)
    const mid = ridgePath(23, 262, 62, 0.0016, 4, false)
    const nearR = ridgePath(37, 292, 34, 0.0011, 3, false, 8)
    const R = rng(99)
    const trees: string[] = []
    // Two loose stands of spruce; leave clear sky around the photographer.
    const stands = [
      [X0, 640, 0.9],
      [820, 1150, 0.35],
      [1700, X1, 0.85],
    ] as const
    for (const [a, b, density] of stands) {
      for (let x = a; x < b; x += 9 + R() * 26) {
        if (R() > density) continue
        const h = 26 + R() * 46 + (R() > 0.9 ? 30 : 0)
        trees.push(spruce(x, nearR.at(x) + 3, h))
      }
    }
    const gx = PHOTOGRAPHER_X
    const gy = nearR.at(gx) + 1
    return { far: far.d, mid: mid.d, near: nearR.d, trees: trees.join(' '), figure: { x: gx, y: gy } }
  }, [])

  return (
    <svg className="le-horizon" viewBox={`0 0 ${VW} ${VH}`} preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">
      <g className="le-ridge le-ridge--far">
        <path d={far} />
      </g>
      <g className="le-ridge le-ridge--mid">
        <path d={mid} />
      </g>
      <g className="le-ridge le-ridge--near">
        <path d={near} />
        <path d={trees} />
        {/* A photographer and tripod, camera tilted up at the pole. */}
        <g transform={`translate(${figure.x} ${figure.y}) scale(1.05)`}>
          <circle cx="0" cy="-44" r="4.6" />
          <path d="M-5.2 -38.5 Q0 -40.5 5.2 -38.5 L6 -21 L3.6 -21 L3.2 0 L0.6 0 L0 -18 L-0.6 0 L-3.2 0 L-3.6 -21 L-6 -21 Z" />
          <path d="M4.6 -35 L14 -29.5 L13.2 -27.6 L4.2 -31.6 Z" />
          <path d="M18.6 -26 L12.8 0 M18.6 -26 L24.6 0 M18.6 -26 L19.4 0" strokeWidth="1.3" fill="none" className="le-ridge-stroke" />
          <g transform="translate(18.6 -28.6) rotate(-34)">
            <rect x="-5.5" y="-4" width="11" height="7.6" rx="1.2" />
            <rect x="5" y="-2.8" width="7" height="5.4" rx="0.8" />
            <rect x="-2.2" y="-6.3" width="4.4" height="3" />
          </g>
        </g>
      </g>
    </svg>
  )
}

export default memo(Horizon)
