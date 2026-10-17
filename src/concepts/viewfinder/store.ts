import { useSyncExternalStore } from 'react'

/** Tiny shared state for the instrument: what the viewfinder readouts show. */
export type VfState = {
  /** Frame counter, advanced by every shutter fire. */
  frame: number
  /** Index into SECTIONS of the section under the finder. */
  section: number
  /** Current aperture readout (f-number). */
  aperture: number
}

const initial: VfState = { frame: 1, section: 0, aperture: 16 }
let state: VfState = initial
const listeners = new Set<() => void>()

export const vf = {
  get: () => state,
  set(patch: Partial<VfState>) {
    const next = { ...state, ...patch }
    if ((Object.keys(patch) as (keyof VfState)[]).every((k) => next[k] === state[k])) return
    state = next
    listeners.forEach((l) => l())
  },
  reset() {
    state = initial
    listeners.forEach((l) => l())
  },
  subscribe(l: () => void) {
    listeners.add(l)
    return () => {
      listeners.delete(l)
    }
  },
}

export const useVf = <T,>(select: (s: VfState) => T): T =>
  useSyncExternalStore(vf.subscribe, () => select(vf.get()), () => select(initial))

/** High-frequency channel (no React): continuous dial position, written by scroll. */
type Fn = (v: number) => void
const make = () => {
  let value = 0
  const subs = new Set<Fn>()
  return {
    get: () => value,
    set(v: number) {
      if (v === value) return
      value = v
      subs.forEach((s) => s(v))
    },
    subscribe(s: Fn) {
      subs.add(s)
      s(value)
      return () => {
        subs.delete(s)
      }
    },
  }
}
export const dialPos = make()
/** Light-meter reading in EV (−2…+2), written by the overlay's needle spring. */
export const meter = make()
