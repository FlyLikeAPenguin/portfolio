import { flagship, featured, streetPhotos, skyPhotos, type Photo, type Project } from '../../content'

/** Grease-pencil marks a frame can carry. */
export type MarkKind = 'loop' | 'star' | 'tick' | 'arrow' | 'crop' | 'query' | 'none'

export type RollFrame = {
  id: string
  type: 'project' | 'photo'
  /** Public path (wrapped with asset() at render) or FLIPCLOCK for the generated mission clock. */
  src: string
  fit: 'cover' | 'contain'
  bg?: string
  alt: string
  title: string
  meta: string
  year: string
  mark: MarkKind
  note?: string
  project?: Project
  photo?: Photo
}

export const FLIPCLOCK = '__flipclock__'

/** Landscape-only pools for the 35mm strip (frames are 3:2). */
const landscape = (list: Photo[]) => list.filter((p) => p.w >= p.h * 1.3)
const street = landscape(streetPhotos)
const sky = landscape(skyPhotos)
const pick = (list: Photo[], i: number) => list[Math.min(i, list.length - 1)]

const projectFrame = (p: Project, mark: MarkKind, note?: string): RollFrame => {
  const isMission = p.slug === 'mission-countdown'
  const isNitpick = p.slug === 'nitpick'
  return {
    id: p.slug,
    type: 'project',
    src: isMission ? FLIPCLOCK : p.cover,
    fit: isNitpick ? 'contain' : 'cover',
    bg: isNitpick ? '#0d1117' : undefined,
    alt: isMission ? `${p.name}: a flip clock reading T plus zero` : `${p.name}: ${p.oneLiner}`,
    title: p.name,
    meta: p.kind,
    year: p.year,
    mark,
    note,
    project: p,
  }
}

const photoFrame = (p: Photo, mark: MarkKind, note?: string): RollFrame => ({
  id: `photo-${p.src}`,
  type: 'photo',
  src: p.src,
  fit: 'cover',
  alt: `${p.title}. ${p.kind === 'film' ? 'Film' : 'Digital'}, ${p.stock}, ${p.settings}.`,
  title: p.title,
  meta: `${p.kind === 'film' ? 'Film' : 'Digital'} · ${p.stock}`,
  year: p.settings,
  mark,
  note,
  photo: p,
})

const [nitpick, satboard, mission] = [
  featured.find((p) => p.slug === 'nitpick') ?? featured[0],
  featured.find((p) => p.slug === 'satboard') ?? featured[1],
  featured.find((p) => p.slug === 'mission-countdown') ?? featured[2],
]

/** Roll 01: the four main projects interleaved with photographs. */
export const rollFrames: RollFrame[] = [
  projectFrame(flagship, 'loop', 'the one'),
  photoFrame(pick(street, 0), 'star'),
  projectFrame(nitpick, 'tick'),
  photoFrame(pick(sky, 1), 'arrow'),
  projectFrame(satboard, 'star'),
  photoFrame(pick(street, 3), 'crop'),
  photoFrame(pick(sky, 0), 'query'),
  projectFrame(mission, 'tick'),
  photoFrame(pick(street, 4), 'none'),
  photoFrame(pick(sky, 3), 'star'),
]

/** Main projects in proof order. */
export const proofProjects: Project[] = [flagship, nitpick, satboard, mission]

/** Split a list into strips of n. */
export const strips = <T,>(list: T[], n: number): T[][] => {
  const out: T[][] = []
  for (let i = 0; i < list.length; i += n) out.push(list.slice(i, i + n))
  return out
}

export const pad2 = (n: number) => String(n).padStart(2, '0')
