/**
 * Everything Light Table derives from the shared content. No facts live here,
 * only selections and formatting of what is already in src/content.
 */
import { dayJob, flagship, featured, profile, projects, skyPhotos, streetPhotos, timeline, type Photo, type Project } from '../../content'

export const pad2 = (n: number) => String(n).padStart(2, '0')
export const bySlug = (slug: string) => projects.find((p) => p.slug === slug)

/* ---------------------------------------------------------------- proof */

export type ProofItem = { value: string; label: string; source: string; target: string }

const statOf = (slug: string, label: string) => bySlug(slug)?.stats.find((s) => s.label === label)

const proofSpec: [slug: string, label: string][] = [
  ['quibble', 'original games'],
  ['quibble', 'tests'],
  ['nitpick', 'investigations'],
  ['quibble', 'commits in 10 weeks'],
  ['satboard', 'pass window'],
]

const lead = dayJob.stats.find((s) => /lead/i.test(s.value))

export const proof: ProofItem[] = [
  ...proofSpec.flatMap(([slug, label]) => {
    const p = bySlug(slug)
    const s = statOf(slug, label)
    return p && s ? [{ value: s.value, label: s.label, source: p.name, target: `#lt-case-${slug}` }] : []
  }),
  ...(lead ? [{ value: lead.value, label: lead.label, source: dayJob.title, target: '#lt-dayjob' }] : []),
]

export type Countable = { prefix: string; n: number; dec: number; comma: boolean; suffix: string }

/** "3,700" → 3700 with commas; "14 d" → 14 + " d"; "$0.81" → "$" 0.81. Non-numbers return null. */
export const parseCount = (v: string): Countable | null => {
  const m = v.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/)
  if (!m) return null
  const raw = m[2]
  return { prefix: m[1], n: parseFloat(raw.replace(/,/g, '')), dec: (raw.split('.')[1] ?? '').length, comma: raw.includes(','), suffix: m[3] }
}

export const fmtCount = (c: Countable, v: number) => {
  const s = v.toFixed(c.dec)
  if (!c.comma) return s
  const [i, d] = s.split('.')
  return i.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (d ? `.${d}` : '')
}

/* ---------------------------------------------------------------- hero */

const latest = timeline[timeline.length - 1]
/** "Member of Technical Staff, Stealth-mode startup", straight from the timeline. */
export const currently = `${latest.title}, ${latest.org}`
export const previously = [...timeline].reverse().find((t) => t.place !== latest.place)

/** Key phrases in the headline that get the orange underline. Missing phrases are simply skipped. */
const phrases = ['have to work', 'satellite ground stations', 'AI tooling', 'realtime games']

export const headlineParts = (() => {
  const out: { text: string; u: boolean }[] = []
  let rest = profile.headline
  while (rest.length) {
    let best = -1
    let hit = ''
    for (const ph of phrases) {
      const i = rest.indexOf(ph)
      if (i !== -1 && (best === -1 || i < best)) {
        best = i
        hit = ph
      }
    }
    if (best === -1) {
      out.push({ text: rest, u: false })
      break
    }
    if (best > 0) out.push({ text: rest.slice(0, best), u: false })
    out.push({ text: hit, u: true })
    rest = rest.slice(best + hit.length)
  }
  return out
})()

/* ---------------------------------------------------------------- work */

export const cases: Project[] = [flagship, ...featured]
const years = projects.flatMap((p) => (p.year.match(/\d{4}/g) ?? []).map(Number))
export const yearSpan = `${Math.min(...years)}–${Math.max(...years)}`

/* ---------------------------------------------------------------- photos */

export type Frame = Photo & { night: boolean; id: string }

/** Two street frames, then one from the night sky, so every filter has rhythm. */
export const frames: Frame[] = (() => {
  const s = streetPhotos.map((p) => ({ ...p, night: false, id: p.src }))
  const k = skyPhotos.map((p) => ({ ...p, night: true, id: p.src }))
  const out: Frame[] = []
  let i = 0
  let j = 0
  while (i < s.length || j < k.length) {
    if (i < s.length) out.push(s[i++])
    if (i < s.length) out.push(s[i++])
    if (j < k.length) out.push(k[j++])
  }
  return out
})()

export type FilterId = 'all' | 'film' | 'digital' | 'night'
export const filters: { id: FilterId; label: string; test: (f: Frame) => boolean }[] = [
  { id: 'all', label: 'All', test: () => true },
  { id: 'film', label: 'Film', test: (f) => f.kind === 'film' },
  { id: 'digital', label: 'Digital', test: (f) => f.kind === 'digital' },
  { id: 'night', label: 'Night', test: (f) => f.night },
]

export const film = profile.cameras.find((c) => c.kind === 'Film')

/* ---------------------------------------------------------------- nav */

export const NAV = [
  { id: 'lt-index', no: '02', label: 'Index' },
  { id: 'lt-selected', no: '03', label: 'Selected' },
  { id: 'lt-photos', no: '04', label: 'Photography' },
  { id: 'lt-about', no: '05', label: 'About' },
  { id: 'lt-contact', no: '06', label: 'Contact' },
]
