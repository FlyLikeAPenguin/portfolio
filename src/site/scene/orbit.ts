/**
 * Orbital bookkeeping, free of three.js so the page can use it before the 3D scene loads
 * (vector helpers live in orbit3.ts). Units: Earth radius = 1. Three.js frame: +Y is north,
 * the equatorial plane is XZ, and longitude 0 sits on +X with 90°E on −Z (matches SphereGeometry UVs).
 */
export const DEG = Math.PI / 180
export const TAU = Math.PI * 2

/** Displayed altitude. The drawn orbit is slightly exaggerated so the beam reads at a glance. */
export const ALT_KM = 512
export const R_ORBIT = 1.15
/** Sun-synchronous-ish polar orbit. */
export const INC = 97.4 * DEG
export const RAAN = 0
/** Earth central angle visible above a 5° elevation mask from 512 km: the station's contact circle. */
export const MASK = 17.8 * DEG

export type Station = { id: 'SVB' | 'TKY' | 'LDN'; name: string; lat: number; lon: number }

export const STATIONS: Station[] = [
  { id: 'SVB', name: 'Svalbard', lat: 78.23, lon: 15.41 },
  { id: 'TKY', name: 'Tokyo', lat: 35.68, lon: 139.69 },
  { id: 'LDN', name: 'London', lat: 51.51, lon: -0.13 },
]

export const wrapPi = (a: number) => {
  let x = (a + Math.PI) % TAU
  if (x < 0) x += TAU
  return x - Math.PI
}

const ci = Math.cos(INC)
const si = Math.sin(INC)
const cO = Math.cos(RAAN)
const sO = Math.sin(RAAN)

/** Inertial position at argument of latitude u (rad) on the unit orbit, in orbital X/Y/Z (Z = north). */
export function orbitXYZ(u: number): [number, number, number] {
  const cu = Math.cos(u)
  const su = Math.sin(u)
  return [cO * cu - sO * su * ci, sO * cu + cO * su * ci, su * si]
}

/** Unit along-track direction at u, in the same orbital X/Y/Z. */
export function orbitDirXYZ(u: number): [number, number, number] {
  const cu = Math.cos(u)
  const su = Math.sin(u)
  return [-cO * su - sO * cu * ci, -sO * su + cO * cu * ci, cu * si]
}

/** Argument of latitude and Earth rotation that put the satellite directly over a station. */
export function solvePass(st: Station, branch: 'asc' | 'desc') {
  const s = Math.max(-1, Math.min(1, Math.sin(st.lat * DEG) / si))
  let u = Math.asin(s)
  if (branch === 'desc') u = Math.PI - u
  const [X, Y] = orbitXYZ(u)
  return { u, theta: Math.atan2(Y, X) - st.lon * DEG }
}

/** Great-circle angle between two lat/lon pairs (radians). */
export function angDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const d =
    Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  return Math.acos(Math.max(-1, Math.min(1, d)))
}
