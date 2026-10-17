import { Vector3 } from 'three'
import { DEG, orbitDirXYZ, orbitXYZ, wrapPi } from './orbit'

/**
 * three.js vector helpers for the scene. Three.js frame: +Y is north, the equatorial plane is XZ,
 * and longitude 0 sits on +X with 90°E on −Z (matches SphereGeometry UVs).
 */

/** Earth-fixed unit vector for a geodetic lat/lon in degrees. */
export function geoToLocal(lat: number, lon: number, out = new Vector3()) {
  const p = lat * DEG
  const l = lon * DEG
  return out.set(Math.cos(p) * Math.cos(l), Math.sin(p), -Math.cos(p) * Math.sin(l))
}

/** Inertial position at argument of latitude u (rad), radius r. */
export function orbitPos(u: number, r: number, out: Vector3) {
  const [X, Y, Z] = orbitXYZ(u)
  return out.set(X * r, Z * r, -Y * r)
}

/** Unit along-track direction at u. */
export function orbitVel(u: number, out: Vector3) {
  const [dX, dY, dZ] = orbitDirXYZ(u)
  return out.set(dX, dZ, -dY)
}

/** Sub-satellite point (radians) for an inertial position and Earth rotation. */
export function subPoint(p: Vector3, theta: number) {
  const r = p.length()
  const lat = Math.asin(p.y / r)
  const lon = wrapPi(Math.atan2(-p.z, p.x) - theta)
  return { lat, lon }
}
