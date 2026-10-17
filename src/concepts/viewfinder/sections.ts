import { experiments } from '../../content'

/** OM-1 shutter speed dial, in order. */
export const SPEEDS = ['B', '1', '2', '4', '8', '15', '30', '60', '125', '250', '500', '1000'] as const

export type Section = { id: string; label: string; /** detent index on the dial */ pos: number }

/** Each section owns a shutter speed. The dial ticks through the speeds in between as you scroll. */
export const SECTIONS: Section[] = [
  { id: 'vf-open', label: 'Open', pos: 0 },
  { id: 'vf-work', label: 'Selected work', pos: 2 },
  { id: 'vf-specs', label: 'Specifications', pos: 4 },
  { id: 'vf-career', label: 'Focus scale', pos: 6 },
  { id: 'vf-prints', label: 'Contact prints', pos: 8 },
  ...(experiments.length ? [{ id: 'vf-lab', label: 'Experiments', pos: 10 }] : []),
  { id: 'vf-contact', label: 'Say hello', pos: 11 },
]

/** "B" → "BULB", "1" → "1s", "125" → "1/125" */
export const speedLabel = (s: string) => (s === 'B' ? 'BULB' : s === '1' ? '1s' : `1/${s}`)
export const sectionSpeed = (i: number) => SPEEDS[SECTIONS[i]?.pos ?? 0]
