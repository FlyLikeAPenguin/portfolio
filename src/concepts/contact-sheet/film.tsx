import type { CSSProperties, ReactNode } from 'react'

/*
 * 35mm geometry in "film units" (1u ≈ 1mm). A frame cell is 38u × 35u: a 36 × 24 image window,
 * 2u of rebate between frames, and 8 Kodak-standard perforations top and bottom per frame.
 * Masks are drawn as SVG so the sprocket holes are genuinely see-through and stay crisp at any size.
 */
const PERF = { w: 2.8, h: 1.98, top: 1.92, r: 0.44, pitch: 4.75, first: 0.975 }
const f = (n: number) => Number(n.toFixed(3))

const rr = (x: number, y: number, w: number, h: number, r: number) =>
  `M${f(x + r)} ${f(y)}H${f(x + w - r)}A${r} ${r} 0 0 1 ${f(x + w)} ${f(y + r)}V${f(y + h - r)}A${r} ${r} 0 0 1 ${f(x + w - r)} ${f(y + h)}H${f(x + r)}A${r} ${r} 0 0 1 ${f(x)} ${f(y + h - r)}V${f(y + r)}A${r} ${r} 0 0 1 ${f(x + r)} ${f(y)}Z`

const holes = (xs: number[], where: 'both' | 'bottom') =>
  xs
    .map((x) => {
      const bottom = rr(x, 35 - PERF.top - PERF.h, PERF.w, PERF.h, PERF.r)
      return where === 'both' ? rr(x, PERF.top, PERF.w, PERF.h, PERF.r) + bottom : bottom
    })
    .join('')

const toUrl = (w: number, d: string) =>
  `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${w} 35' preserveAspectRatio='none'><path fill-rule='evenodd' d='${d}'/></svg>`,
  )}")`

const frameHoles = Array.from({ length: 8 }, (_, k) => PERF.first + k * PERF.pitch)

/** One frame of film: 38 × 35. */
const FRAME_MASK = toUrl(38, 'M0 0H38V35H0Z' + holes(frameHoles, 'both'))

/** Film leader with the classic tongue cut: 50 × 35. Perforations line up with the first frame. */
const leaderXs = Array.from({ length: 11 }, (_, k) => 50 - (k + 1) * PERF.pitch + PERF.first).filter((x) => x > 0.6)
const LEADER_MASK = toUrl(
  50,
  'M50 0H31.2C27.4 0 26.6 2.6 25.4 5.6C24 9.4 22 11.8 17.4 11.8H3.6C1.5 11.8 0 13.4 0 15.6V35H50Z' +
    holes(leaderXs.filter((x) => x > 31.6), 'both') +
    holes(leaderXs.filter((x) => x <= 31.6), 'bottom'),
)

/** Scissor-cut tail: 24 × 35. */
const tailXs = Array.from({ length: 4 }, (_, k) => PERF.first + k * PERF.pitch)
const TAIL_MASK = toUrl(24, 'M0 0H23.4L21.2 35H0Z' + holes(tailXs, 'both'))

/** CSS custom properties consumed by the stylesheet. */
export const filmVars = {
  '--perf-frame': FRAME_MASK,
  '--perf-leader': LEADER_MASK,
  '--perf-tail': TAIL_MASK,
} as CSSProperties

/** Kodak-style solid triangle used in edge print (drawn, so it never falls back to another font). */
export const Tri = () => <i className="cs-tri" aria-hidden="true" />

const DX = '1101011001110100101101'
/** DX-code-like bars. */
export const Dx = ({ seed = 0 }: { seed?: number }) => {
  const bits = (DX.slice(seed % DX.length) + DX).slice(0, 18)
  return (
    <span className="cs-dx" aria-hidden="true">
      {bits.split('').map((b, i) => (
        <i key={i} className={b === '1' ? 'on' : ''} />
      ))}
    </span>
  )
}

type EdgeProps = {
  n: number | string
  top?: 'text' | 'dx' | 'none'
  stock?: string
}

/** Latent edge print: stock name or DX bars on top, frame numbers on the bottom rebate. */
export function EdgePrint({ n, top = 'text', stock = 'KODAK PORTRA 400' }: EdgeProps) {
  return (
    <>
      <span className="cs-edge cs-edge--top">
        {top === 'text' && <span className="cs-edge__stock">{stock}</span>}
        {top === 'dx' && <Dx seed={typeof n === 'number' ? n * 3 : 0} />}
      </span>
      <span className="cs-edge cs-edge--bot">
        <span className="cs-edge__n">
          <Tri />
          {n}
        </span>
        <span className="cs-edge__a">
          <Tri />
          {n}A
        </span>
      </span>
    </>
  )
}

type CellProps = {
  n: number | string
  top?: 'text' | 'dx' | 'none'
  stock?: string
  className?: string
  children?: ReactNode
}

/** A single frame of film. The image window and marks are passed as children (siblings of the masked base). */
export function FilmCell({ n, top, stock, className = '', children }: CellProps) {
  return (
    <div className={`cs-cell ${className}`}>
      <div className="cs-film" aria-hidden="true">
        <EdgePrint n={n} top={top} stock={stock} />
      </div>
      {children}
    </div>
  )
}

/** Tape strip. */
export const Tape = ({ className = '' }: { className?: string }) => <span className={`cs-tape ${className}`} aria-hidden="true" />

/** Small drawn arrow for links (fonts here don't carry ↗). */
export const LinkArrow = ({ dir = 'ne' }: { dir?: 'ne' | 'down' | 'up' | 'right' | 'left' }) => {
  const rot = { ne: 0, right: 45, down: 135, left: 225, up: -45 }[dir]
  return (
    <svg className="cs-larrow" viewBox="0 0 12 12" aria-hidden="true" style={{ transform: `rotate(${rot}deg)` }}>
      <path d="M3 9 9 3M4.2 3H9v4.8" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
