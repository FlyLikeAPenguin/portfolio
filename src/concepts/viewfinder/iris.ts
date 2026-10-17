/**
 * Iris geometry, in lens units where the clear aperture (housing lip) has radius 100.
 *
 * Each of the 9 blades is a curved band: the region between two concentric arcs around a
 * centre K, with K, the blade's pivot P (under the housing, r = RP) and the optical axis C
 * forming an equilateral triangle when the iris is shut. The inner arc (radius RHO = RP)
 * is the cutting edge. Rotating the blade about its pivot by α swings K toward C, so the
 * cutting edge clears a disc of radius d = RP − |KC| = RP − 2·RP·sin((60° − α)/2).
 * Nine of these, rotated 40° apart, leave a rounded nonagon open in the middle.
 */
export const BLADES = 9
export const RP = 112
const RHO = RP
const W = 98
const A0 = 46
const A1 = 240
export const K0 = { x: RP / 2, y: (-RP * Math.sqrt(3)) / 2 }
export const BLADE_R = RHO + W
export const EDGE_R = RHO

const pt = (r: number, deg: number) => {
  const a = (deg * Math.PI) / 180
  return [K0.x + r * Math.cos(a), K0.y + r * Math.sin(a)].map((v) => +v.toFixed(3)) as [number, number]
}

const r2 = RHO + W
const [x0, y0] = pt(RHO, A0)
const [x1, y1] = pt(RHO, A1)
const [x2, y2] = pt(r2, A1)
const [x3, y3] = pt(r2, A0)

/** Blade body (band with rounded ends) */
export const BLADE_PATH = `M${x0},${y0} A${RHO},${RHO} 0 1 1 ${x1},${y1} A${W / 2},${W / 2} 0 0 1 ${x2},${y2} A${r2},${r2} 0 1 0 ${x3},${y3} A${W / 2},${W / 2} 0 0 1 ${x0},${y0}Z`

/** Rotation about the pivot (degrees) that leaves an opening of inradius d. */
export const alphaFor = (d: number) => {
  const dd = Math.min(RP, Math.max(0, d))
  return 60 - (2 * Math.asin((RP - dd) / (2 * RP)) * 180) / Math.PI
}

/** Full stops the readout clicks through, closed → open. */
export const STOPS = [16, 11, 8, 5.6, 4, 2.8, 2, 1.8]
/** Opening radius for an f-number: area ∝ 1/N², and f/1.8 just clears the lip. */
export const dForN = (n: number) => (100 * 1.8) / n

/** Continuous stop index k ∈ [0, STOPS.length−1] → f-number, interpolated in log space. */
export const nForK = (k: number) => {
  const i = Math.max(0, Math.min(STOPS.length - 2, Math.floor(k)))
  const f = Math.max(0, Math.min(1, k - i))
  return Math.exp(Math.log(STOPS[i]) + (Math.log(STOPS[i + 1]) - Math.log(STOPS[i])) * f)
}

/* ── Edge visibility ─────────────────────────────────────────────────────────
 * Real blades overlap cyclically (each one over its neighbour), which painter's order
 * can't express. So the blade bodies are drawn flat (order-independent), and the visible
 * part of each cutting edge is computed: sample blade 0's edge, drop samples that fall
 * under the next blade(s), and reuse that arc for all nine by symmetry.
 */
const D2R = Math.PI / 180
const R2 = RHO + W

const toWorld = (j: number, a: number, x: number, y: number): [number, number] => {
  let c = Math.cos(-a * D2R)
  let s = Math.sin(-a * D2R)
  const px = x - RP
  const x1 = RP + px * c - y * s
  const y1 = px * s + y * c
  c = Math.cos(j * 40 * D2R)
  s = Math.sin(j * 40 * D2R)
  return [x1 * c - y1 * s, x1 * s + y1 * c]
}

const inBlade = (j: number, a: number, x: number, y: number) => {
  let c = Math.cos(-j * 40 * D2R)
  let s = Math.sin(-j * 40 * D2R)
  const x1 = x * c - y * s
  const y1 = x * s + y * c
  c = Math.cos(a * D2R)
  s = Math.sin(a * D2R)
  const px = x1 - RP
  const lx = RP + px * c - y1 * s
  const ly = px * s + y1 * c
  const dx = lx - K0.x
  const dy = ly - K0.y
  const r = Math.hypot(dx, dy)
  if (r < RHO || r > R2) return false
  let ang = Math.atan2(dy, dx) / D2R
  if (ang < 0) ang += 360
  return ang >= A0 && ang <= A1
}

const SAMPLES = 140
/** Angular segments (degrees about K) of blade 0's cutting edge that are visible. */
export const edgeSegments = (alpha: number, above: number[] = [1], limit = 105): [number, number][] => {
  const segs: [number, number][] = []
  let cur: [number, number] | null = null
  for (let k = 0; k <= SAMPLES; k++) {
    const t = A0 + ((A1 - A0) * k) / SAMPLES
    const lx = K0.x + RHO * Math.cos(t * D2R)
    const ly = K0.y + RHO * Math.sin(t * D2R)
    const [wx, wy] = toWorld(0, alpha, lx, ly)
    const vis = Math.hypot(wx, wy) < limit && !above.some((j) => inBlade(j, alpha, wx, wy))
    if (vis) {
      if (!cur) {
        cur = [t, t]
        segs.push(cur)
      } else cur[1] = t
    } else cur = null
  }
  return segs.filter(([s, e]) => e > s)
}

/** Arc path around K at radius r through the given angular segments. */
export const arcPath = (segs: [number, number][], r: number) =>
  segs
    .map(([s, e]) => {
      const ax = (K0.x + r * Math.cos(s * D2R)).toFixed(2)
      const ay = (K0.y + r * Math.sin(s * D2R)).toFixed(2)
      const bx = (K0.x + r * Math.cos(e * D2R)).toFixed(2)
      const by = (K0.y + r * Math.sin(e * D2R)).toFixed(2)
      return `M${ax},${ay} A${r},${r} 0 ${e - s > 180 ? 1 : 0} 1 ${bx},${by}`
    })
    .join(' ') || 'M0,0'
