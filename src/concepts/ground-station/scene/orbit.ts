import { Vector3 } from 'three'

/**
 * Orbital bookkeeping for the scene. Units: Earth radius = 1. Three.js frame: +Y is north,
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

/** Earth-fixed unit vector for a geodetic lat/lon in degrees. */
export function geoToLocal(lat: number, lon: number, out = new Vector3()) {
  const p = lat * DEG
  const l = lon * DEG
  return out.set(Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l))
}

const ci = Math.cos(INC)
const si = Math.sin(INC)
const cO = Math.cos(RAAN)
const sO = Math.sin(RAAN)

/** Inertial position at argument of latitude u (rad), radius r. */
export function orbitPos(u: number, r: number, out: Vector3) {
  const cu = Math.cos(u)
  const su = Math.sin(u)
  const X = cO * cu - sO * su * ci
  const Y = sO * cu + cO * su * ci
  const Z = su * si
  return out.set(X * r, Z * r, -Y * r)
}

/** Unit along-track direction at u. */
export function orbitVel(u: number, out: Vector3) {
  const cu = Math.cos(u)
  const su = Math.sin(u)
  const dX = -cO * su - sO * cu * ci
  const dY = -sO * su + cO * cu * ci
  const dZ = cu * si
  return out.set(dX, dZ, -dY)
}

const tmp = new Vector3()

/** Argument of latitude and Earth rotation that put the satellite directly over a station. */
export function solvePass(st: Station, branch: 'asc' | 'desc') {
  const s = Math.max(-1, Math.min(1, Math.sin(st.lat * DEG) / si))
  let u = Math.asin(s)
  if (branch === 'desc') u = Math.PI - u
  orbitPos(u, 1, tmp)
  const alpha = Math.atan2(-tmp.z, tmp.x)
  return { u, theta: alpha - st.lon * DEG }
}

/** Sub-satellite point (radians) for an inertial position and Earth rotation. */
export function subPoint(p: Vector3, theta: number) {
  const r = p.length()
  const lat = Math.asin(p.y / r)
  const lon = wrapPi(Math.atan2(-p.z, p.x) - theta)
  return { lat, lon }
}

/** Great-circle angle between two lat/lon pairs (radians). */
export function angDist(lat1: number, lon1: number, lat2: number, lon2: number) {
  const d =
    Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos(lon1 - lon2)
  return Math.acos(Math.max(-1, Math.min(1, d)))
}
