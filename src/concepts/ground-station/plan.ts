import { DEG, STATIONS, TAU, solvePass, wrapPi } from './scene/orbit'
import { makeShot, type Shot } from './store'

/**
 * The flight plan. Each pass puts the satellite directly over a ground station, on the descending
 * (southbound) branch so the ground flows up the screen with the page. Between passes the
 * satellite goes once around while the Earth turns east to bring the next station round.
 */
export const PASS_STATIONS = [2, 1, 0, 2, 1, 2] // LDN, TKY, SVB, LDN, TKY, LDN (career: the current station)

const sol = PASS_STATIONS.map((i) => solvePass(STATIONS[i], 'desc'))
export const U: number[] = []
export const TH: number[] = []
export const CU: number[] = []
sol.forEach((s, i) => {
  if (i === 0) {
    U.push(s.u)
    TH.push(s.theta)
    CU.push(s.u)
    return
  }
  let u = s.u
  while (u < U[i - 1] + 200 * DEG) u += TAU
  let th = s.theta
  while (th < TH[i - 1] + 10 * DEG) th += TAU
  U.push(u)
  TH.push(th)
  CU.push(CU[i - 1] + wrapPi(u - U[i - 1]))
})

/** Eastward rotation (deg) the Earth makes before pass i (i ≥ 1). */
export const deltaLon = (i: number) => ((TH[i] - TH[i - 1]) / DEG).toFixed(1)

type Framing = Omit<Shot, 'u' | 'th' | 'cu'>
const F = (s: Partial<Shot>) => s as Framing

// Desktop framings. Mobile tweaks follow below.
const HERO = F({ side: 1.0, back: -0.3, dist: 4.6, look: 0, fov: 24, sx: 0.34, sy: 0.5, chase: 0, sunX: -0.55, sunY: 0.5, sunZ: 0.75, dim: 0, veil: 0.45, idle: 1 })
// AOS: the pass header is entering from below; satellite and beam framed in the open space above.
const AOS = F({ side: 0.62, back: 0.5, dist: 2.8, look: 0.82, fov: 36, sx: 0.2, sy: -0.17, chase: 1, sunX: 0.8, sunY: 0.45, sunZ: 0.55, dim: 0, veil: 0, idle: 0 })
// During the pass content: the same pass, pulled back and dimmed behind the panels.
const PASSBG = F({ side: 0.95, back: 0.25, dist: 3.4, look: 0.55, fov: 34, sx: 0.22, sy: 0.04, chase: 0.75, sunX: 0.8, sunY: 0.4, sunZ: 0.6, dim: 0.72, veil: 0, idle: 0 })
const TRANSIT = F({ side: 3.2, back: 0, dist: 5.6, look: 0, fov: 28, sx: 0.16, sy: 0.02, chase: 0, sunX: 0.7, sunY: 0.4, sunZ: 0.7, dim: 0, veil: 0.15, idle: 0 })
const OPTICAL = F({ side: 1.7, back: -0.2, dist: 4.8, look: 0.15, fov: 30, sx: 0, sy: 0.3, chase: 0, sunX: 0.3, sunY: 0.8, sunZ: 0.4, dim: 0.74, veil: 0, idle: 0 })
const CONTACT = F({ side: 1.4, back: 0, dist: 6.4, look: 0, fov: 26, sx: 0, sy: 0.52, chase: 0, sunX: 0, sunY: 0.6, sunZ: 0.8, dim: 0, veil: 0, idle: 0 })

const MOBILE: Record<string, Partial<Shot>> = {
  HERO: { sx: 0.12, sy: 0.5, dist: 5.6, veil: 0, dim: 0 },
  AOS: { sx: 0, sy: -0.16, dist: 3.5, fov: 40, veil: 0, dim: 0 },
  PASSBG: { sx: 0, sy: 0.15, dist: 3.9, fov: 40, veil: 0, dim: 0.76 },
  TRANSIT: { sx: 0, sy: 0.05, dist: 8.6, veil: 0, dim: 0.1 },
  OPTICAL: { sx: 0, sy: 0.32, dist: 7, veil: 0, dim: 0.8 },
  CONTACT: { sx: 0, sy: 0.6, dist: 8.5, veil: 0, dim: 0.1 },
}

export type Key = { A: Shot; B: Shot; ease?: string }

const at = (fr: Framing, name: string, mobile: boolean, u: number, th: number, cu: number) =>
  makeShot({ ...fr, ...(mobile ? MOBILE[name] : {}), u, th, cu })

/** Shots keyed by the `data-shot` attribute of each scroll block. */
export function buildKeys(mobile: boolean): Record<string, Key> {
  const k: Record<string, Key> = {}
  const hero = at(HERO, 'HERO', mobile, U[0] - 22 * DEG, TH[0] - 26 * DEG, U[0] + 26 * DEG)
  k.hero = { A: hero, B: hero }
  // Approach: the satellite drops toward London while the camera starts to close in.
  k.t0 = {
    A: at(TRANSIT, 'TRANSIT', mobile, U[0] - 34 * DEG, TH[0] - 12 * DEG, U[0] + 8 * DEG),
    B: at(TRANSIT, 'TRANSIT', mobile, U[0] - 22 * DEG, TH[0] - 6 * DEG, U[0] + 2 * DEG),
  }
  for (let i = 0; i < 6; i++) {
    const n = i + 1
    k[`p${n}a`] = {
      A: at(AOS, 'AOS', mobile, U[i] - 7 * DEG, TH[i] - 0.6 * DEG, CU[i] - 4 * DEG),
      B: at(AOS, 'AOS', mobile, U[i] + 0.5 * DEG, TH[i] + 0.1 * DEG, CU[i] - 0.5 * DEG),
    }
    k[`p${n}b`] = {
      A: at(PASSBG, 'PASSBG', mobile, U[i] + 2 * DEG, TH[i] + 0.25 * DEG, CU[i] + 1 * DEG),
      B: at(PASSBG, 'PASSBG', mobile, U[i] + 11 * DEG, TH[i] + 1 * DEG, CU[i] + 4 * DEG),
    }
    if (i < 5) {
      const u0 = U[i] + 11 * DEG
      const u1 = U[i + 1] - 7 * DEG
      const t0 = TH[i] + 1 * DEG
      const t1 = TH[i + 1] - 0.6 * DEG
      const c0 = CU[i] + 4 * DEG
      const c1 = CU[i + 1] - 4 * DEG
      const L = (a: number, b: number, f: number) => a + (b - a) * f
      k[`t${n}`] = {
        A: at(TRANSIT, 'TRANSIT', mobile, L(u0, u1, 0.36), L(t0, t1, 0.34), L(c0, c1, 0.42)),
        B: at(TRANSIT, 'TRANSIT', mobile, L(u0, u1, 0.66), L(t0, t1, 0.66), L(c0, c1, 0.58)),
      }
    }
  }
  const u6 = U[5]
  const t6 = TH[5]
  const c6 = CU[5]
  k.opt = {
    A: at(OPTICAL, 'OPTICAL', mobile, u6 + 28 * DEG, t6 + 6 * DEG, c6 + 16 * DEG),
    B: at(OPTICAL, 'OPTICAL', mobile, u6 + 64 * DEG, t6 + 12 * DEG, c6 + 30 * DEG),
  }
  k.end = {
    A: at(CONTACT, 'CONTACT', mobile, u6 + 84 * DEG, t6 + 16 * DEG, c6 + 40 * DEG),
    B: at(CONTACT, 'CONTACT', mobile, u6 + 92 * DEG, t6 + 19 * DEG, c6 + 44 * DEG),
  }
  return k
}

/** Scroll range (px) over which a block holds its A → B shot. */
export function blockRange(id: string, top: number, h: number, vh: number): [number, number] {
  if (id === 'hero') return [0, 0]
  if (id.startsWith('t')) {
    const c = top + h / 2 - vh / 2
    return [c - 0.3 * vh, c + 0.05 * vh]
  }
  // Pass header rising from 62% to 34% of the viewport: acquisition of signal.
  if (/^p\da$/.test(id)) return [top - 0.62 * vh, top - 0.34 * vh]
  // Pass content on screen.
  if (/^p\db$/.test(id)) return [top - 0.25 * vh, top + h - 0.75 * vh]
  if (id === 'opt') return [top - 0.35 * vh, top + h - 0.65 * vh]
  return [top - 0.55 * vh, top + h - vh]
}
