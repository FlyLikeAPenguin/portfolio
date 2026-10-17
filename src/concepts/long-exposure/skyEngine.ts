/**
 * Analytic star-trail renderer.
 *
 * Every star sits at a fixed radius around the celestial pole. A long exposure of duration `sweep`
 * (radians of sky rotation) records each star as an arc from its start angle to start − sweep
 * (counter-clockwise on screen, as the northern sky turns). Nothing accumulates between frames:
 * any sweep can be drawn from scratch, which is what lets scroll position *be* exposure time.
 *
 * Stars are bucketed by colour temperature and brightness so a full redraw is ~250 stroke calls
 * rather than thousands, and each arc is clipped analytically to the viewport so off-screen
 * stretches of the huge outer circles cost nothing.
 */

export const TAU = Math.PI * 2

/** Seeded PRNG (mulberry32): the same sky every visit. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Star colours by temperature, ~3,000 K (orange) → ~14,000 K (blue). Slightly saturated, as a sensor sees them. */
const PALETTE: [number, number, number][] = [
  [255, 164, 104],
  [255, 196, 140],
  [255, 226, 190],
  [255, 243, 230],
  [228, 236, 255],
  [196, 212, 255],
  [166, 190, 255],
]
const W_FAINT = [0.05, 0.1, 0.17, 0.27, 0.21, 0.14, 0.06]
const W_BRIGHT = [0.13, 0.16, 0.11, 0.14, 0.15, 0.17, 0.14]

/** Brightness bins. */
export const NBINS = 8
/** Segments per trail for the gentle tail-to-head brightness ramp. */
const SEG_MUL = [0.42, 0.62, 0.78, 0.9, 1]
const NSEG = SEG_MUL.length

type Bucket = {
  rgb: string
  width: number
  alpha: number
  bin: number
  glow: boolean
  r: Float32Array
  a: Float32Array
  /** Visible angular intervals per star (flat [s0,e0,s1,e1…]) or null when the whole circle is on screen. */
  vis: (Float64Array | null)[]
}

export type Glint = { r: number; a: number; size: number; rgb: [number, number, number]; base: number; w1: number; w2: number; p1: number; p2: number }

/** One star, flattened for the GPU renderer. */
export type StarRec = { r: number; a: number; width: number; alpha: number; rgb: [number, number, number]; bin: number }

export type Field = {
  W: number
  H: number
  cx: number
  cy: number
  buckets: Bucket[]
  stars: StarRec[]
  glints: Glint[]
  count: number
  /** Minimum radius of a star's head dot (bigger on DPR 1 phones). */
  minHead: number
}

function pick(weights: number[], u: number) {
  let acc = 0
  for (let i = 0; i < weights.length; i++) {
    acc += weights[i]
    if (u <= acc) return i
  }
  return weights.length - 1
}

/** Magnitude with a realistic count distribution: roughly ×2.6 more stars per magnitude fainter. */
function sampleMag(u: number, m0 = -1.2, m1 = 6.5, beta = 0.42) {
  const b0 = 10 ** (beta * m0)
  const b1 = 10 ** (beta * m1)
  return Math.log10(u * (b1 - b0) + b0) / beta
}

/** Angular intervals of a circle (centre cx,cy radius r) that lie inside the rect. */
function visibleIntervals(r: number, cx: number, cy: number, x0: number, y0: number, x1: number, y1: number): Float64Array | null {
  const crit: number[] = []
  const norm = (t: number) => ((t % TAU) + TAU) % TAU
  const addCos = (v: number) => {
    if (v > -1 && v < 1) {
      const t = Math.acos(v)
      crit.push(t, TAU - t)
    }
  }
  const addSin = (v: number) => {
    if (v > -1 && v < 1) {
      const t = Math.asin(v)
      crit.push(norm(t), norm(Math.PI - t))
    }
  }
  addCos((x0 - cx) / r)
  addCos((x1 - cx) / r)
  addSin((y0 - cy) / r)
  addSin((y1 - cy) / r)
  const inside = (t: number) => {
    const x = cx + r * Math.cos(t)
    const y = cy + r * Math.sin(t)
    return x >= x0 && x <= x1 && y >= y0 && y <= y1
  }
  if (!crit.length) return inside(0) ? null : new Float64Array(0)
  crit.sort((p, q) => p - q)
  const out: number[] = []
  for (let i = 0; i < crit.length; i++) {
    const s = crit[i]
    const e = i + 1 < crit.length ? crit[i + 1] : crit[0] + TAU
    if (e - s < 1e-9) continue
    if (inside((s + e) / 2)) {
      if (out.length && Math.abs(out[out.length - 1] - s) < 1e-9) out[out.length - 1] = e
      else out.push(s, e)
    }
  }
  return new Float64Array(out)
}

export function buildField(W: number, H: number, count: number, mobile: boolean): Field {
  const R = rng(0x1e3a7)
  const cx = W * (mobile ? 0.7 : 0.72)
  const cy = H * (mobile ? 0.16 : 0.18)
  const corners = [
    [0, 0],
    [W, 0],
    [0, H],
    [W, H],
  ]
  const Rmax = Math.max(...corners.map(([x, y]) => Math.hypot(x - cx, y - cy))) * 1.02
  const pad = 14

  type S = { r: number; a: number; t: number; c: number }
  const stars: S[] = []

  // Polaris: a bright star a whisker from the pole draws a tiny, perfect circle.
  stars.push({ r: Math.min(W, H) * 0.012, a: 2.2, t: 0.78, c: 3 })

  let guard = 0
  while (stars.length < count && guard++ < count * 20) {
    const r = Rmax * Math.sqrt(R())
    const a = R() * TAU
    const x = cx + r * Math.cos(a)
    const y = cy + r * Math.sin(a)
    const inView = x > -pad && x < W + pad && y > -pad && y < H + pad
    // Oversample what's on screen at the open of the exposure, keep enough off-screen stars to sweep in.
    if (!inView && R() > 0.45) continue
    const m = sampleMag(R())
    const t = Math.min(1, Math.max(0, (6.5 - m) / 7.7))
    const c = pick(t > 0.55 ? W_BRIGHT : W_FAINT, R())
    stars.push({ r, a, t, c })
  }

  const groups = new Map<string, S[]>()
  for (const s of stars) {
    const bin = Math.min(NBINS - 1, Math.floor(s.t * NBINS))
    const key = `${bin}:${s.c}`
    const g = groups.get(key)
    if (g) g.push(s)
    else groups.set(key, [s])
  }

  // Phones render at DPR 1, where sub-pixel trails all but vanish: draw them a little bolder.
  const scale = mobile ? 1.22 : 1
  const boost = mobile ? 1.3 : 1
  const buckets: Bucket[] = []
  const recs: StarRec[] = []
  for (const [key, list] of groups) {
    const [bin, c] = key.split(':').map(Number)
    const tb = (bin + 0.5) / NBINS
    const [r0, g0, b0] = PALETTE[c]
    const width = (0.42 + 1.9 * tb ** 2) * scale
    const alpha = Math.min(1, ((mobile ? 0.22 : 0.13) + 0.8 * tb ** 1.05) * boost)
    for (const st of list) recs.push({ r: st.r, a: st.a, width, alpha, rgb: [r0 / 255, g0 / 255, b0 / 255], bin })
    buckets.push({
      rgb: `${r0},${g0},${b0}`,
      width,
      alpha,
      bin,
      glow: bin >= NBINS - 2,
      r: Float32Array.from(list.map((s) => s.r)),
      a: Float32Array.from(list.map((s) => s.a)),
      vis: list.map((s) => visibleIntervals(s.r, cx, cy, -pad, -pad, W + pad, H + pad)),
    })
  }
  buckets.sort((p, q) => p.bin - q.bin)

  const glints: Glint[] = stars
    .filter((s) => s.t > 0.5)
    .sort((p, q) => q.t - p.t)
    .slice(0, mobile ? 28 : 60)
    .map((s) => ({
      r: s.r,
      a: s.a,
      size: (6 + 22 * (s.t - 0.5) ** 1.4) * (mobile ? 0.9 : 1),
      rgb: PALETTE[s.c],
      base: 0.18 + 0.7 * (s.t - 0.5) ** 1.2,
      w1: 1.2 + R() * 2.6,
      w2: 3.5 + R() * 5,
      p1: R() * TAU,
      p2: R() * TAU,
    }))

  return { W, H, cx, cy, buckets, stars: recs, glints, count: stars.length, minHead: mobile ? 0.72 : 0.55 }
}

const SHIFTS = [0, -TAU, -2 * TAU]

/** Append the visible pieces of every star's arc between fractions u0..u1 of the trail (0 = where the shutter opened, 1 = now). */
function pathArcs(ctx: CanvasRenderingContext2D, b: Bucket, cx: number, cy: number, sweep: number, u0: number, u1: number) {
  const n = b.r.length
  for (let i = 0; i < n; i++) {
    const r = b.r[i]
    const a = b.a[i]
    const lo = a - sweep * u1
    const hi = a - sweep * u0
    const vis = b.vis[i]
    if (vis === null) {
      ctx.moveTo(cx + r * Math.cos(lo), cy + r * Math.sin(lo))
      ctx.arc(cx, cy, r, lo, hi)
      continue
    }
    for (let k = 0; k < vis.length; k += 2) {
      for (let j = 0; j < 3; j++) {
        const sh = SHIFTS[j]
        const s = Math.max(lo, vis[k] + sh)
        const e = Math.min(hi, vis[k + 1] + sh)
        if (e > s) {
          ctx.moveTo(cx + r * Math.cos(s), cy + r * Math.sin(s))
          ctx.arc(cx, cy, r, s, e)
        }
      }
    }
  }
}

/**
 * Full analytic redraw of the exposure.
 * @param sweep radians of sky rotation recorded so far
 * @param fadeFor per-brightness-bin opacity (dawn washes out the faint stars first)
 */
export function drawTrails(ctx: CanvasRenderingContext2D, f: Field, dpr: number, sweep: number, fadeFor: (bin: number) => number) {
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.globalCompositeOperation = 'source-over'
  ctx.clearRect(0, 0, f.W, f.H)
  ctx.globalCompositeOperation = 'lighter'
  ctx.lineCap = 'butt'
  const { cx, cy, W, H } = f
  const hasTrail = sweep > 0.0006

  for (const b of f.buckets) {
    const fade = fadeFor(b.bin)
    if (fade < 0.004) continue

    if (hasTrail) {
      // Soft halo along the brightest trails: one wide, very faint stroke.
      if (b.glow) {
        ctx.beginPath()
        pathArcs(ctx, b, cx, cy, sweep, 0, 1)
        ctx.lineWidth = b.width * 3.4
        ctx.strokeStyle = `rgba(${b.rgb},${(b.alpha * 0.07 * fade).toFixed(4)})`
        ctx.stroke()
      }
      // Core trail in a few segments: a whisper dimmer towards the tail, like a stack fading in.
      for (let j = 0; j < NSEG; j++) {
        ctx.beginPath()
        pathArcs(ctx, b, cx, cy, sweep, j / NSEG, (j + 1) / NSEG)
        ctx.lineWidth = b.width
        ctx.strokeStyle = `rgba(${b.rgb},${(b.alpha * SEG_MUL[j] * fade).toFixed(4)})`
        ctx.stroke()
      }
    }

    // The star itself, where it is now.
    ctx.beginPath()
    const hr = Math.max(f.minHead, b.width * 0.62)
    const n = b.r.length
    for (let i = 0; i < n; i++) {
      const h = b.a[i] - sweep
      const x = cx + b.r[i] * Math.cos(h)
      const y = cy + b.r[i] * Math.sin(h)
      if (x < -4 || x > W + 4 || y < -4 || y > H + 4) continue
      ctx.moveTo(x + hr, y)
      ctx.arc(x, y, hr, 0, TAU)
    }
    ctx.fillStyle = `rgba(${b.rgb},${Math.min(1, b.alpha * 1.15 * fade).toFixed(4)})`
    ctx.fill()
  }
  ctx.globalCompositeOperation = 'source-over'
}

/** Pre-rendered soft glow sprite for star heads and moving lights. */
export function makeSprite(rgb: [number, number, number], size = 64) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  const [r, gg, b] = rgb
  grd.addColorStop(0, `rgba(255,255,255,1)`)
  grd.addColorStop(0.06, `rgba(${r},${gg},${b},0.9)`)
  grd.addColorStop(0.18, `rgba(${r},${gg},${b},0.32)`)
  grd.addColorStop(0.45, `rgba(${r},${gg},${b},0.07)`)
  grd.addColorStop(1, `rgba(${r},${gg},${b},0)`)
  g.fillStyle = grd
  g.fillRect(0, 0, size, size)
  return c
}

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function mixHex(a: string, b: string, t: number) {
  const pa = parseInt(a.slice(1), 16)
  const pb = parseInt(b.slice(1), 16)
  const ch = (p: number, s: number) => (p >> s) & 255
  const r = Math.round(lerp(ch(pa, 16), ch(pb, 16), t))
  const g = Math.round(lerp(ch(pa, 8), ch(pb, 8), t))
  const bl = Math.round(lerp(ch(pa, 0), ch(pb, 0), t))
  return `rgb(${r},${g},${bl})`
}
