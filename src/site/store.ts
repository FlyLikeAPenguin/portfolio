/**
 * Mutable state shared between the scroll timeline (writer), the WebGL director (reader, smoother)
 * and the HUD (DOM written from the render loop). Deliberately not React state: it changes every frame.
 */
export const SHOT_KEYS = [
  'u', // satellite argument of latitude (rad, unwrapped)
  'th', // Earth rotation (rad, unwrapped)
  'cu', // camera anchor along the orbit (rad)
  'side', // camera offset toward the orbit normal
  'back', // camera offset behind the satellite (along-track)
  'dist', // camera distance from Earth centre (Earth radii)
  'look', // 0 = look at Earth centre, 1 = look at the satellite
  'fov',
  'sx', // lens shift, fraction of viewport (+ = subject right)
  'sy', // lens shift (+ = subject down)
  'chase', // 0 = north-up wide framing, 1 = satellite-relative framing
  'sunX', // camera-relative sun direction
  'sunY',
  'sunZ',
  'dim', // full-screen scrim for dense content
  'veil', // left-hand gradient behind text columns
  'idle', // allows slow idle drift (hero only)
] as const

export type ShotKey = (typeof SHOT_KEYS)[number]
export type Shot = Record<ShotKey, number>

export const makeShot = (s: Partial<Shot> = {}): Shot => {
  const base = {} as Shot
  for (const k of SHOT_KEYS) base[k] = 0
  return Object.assign(base, s)
}

type HudKey = 'lat' | 'lon' | 'alt' | 'vel' | 'stn' | 'link' | 'linkText' | 'bars'

export const S = {
  /** Values the scroll timeline wants. */
  target: makeShot(),
  /** Smoothed values the scene renders. */
  cur: makeShot(),
  /** Scene fade-in after boot, 0 → 1. */
  reveal: { v: 0 },
  ready: false,
  reduced: false,
  mobile: false,
  /** Geometric link strength 0..1 and which station (−1 none). Written by the scene. */
  link: 0,
  linkStation: -1,
  hud: {} as Partial<Record<HudKey, HTMLElement | null>>,
  /** Projected overlay elements, written by the scene each frame. */
  reticle: null as HTMLElement | null,
  stationTags: [] as (HTMLElement | null)[],
  scrimDim: null as HTMLElement | null,
  scrimVeil: null as HTMLElement | null,
}
