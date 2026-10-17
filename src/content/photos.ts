import manifest from './photos.json'

/**
 * Joe's photography. The list lives in photos.json, which `pnpm photos <folder>` keeps in sync with
 * the image files: edit titles, order and crop position (`pos`) there. Order is display order; the
 * first photo is the large tile.
 */
export type Photo = {
  id: string
  title: string
  kind: 'film' | 'digital'
  camera: string
  lens?: string
  /** "300mm · f/8 · 1/250 · ISO 200", from EXIF. */
  settings?: string
  /** "2026-08". Film scans have none: their EXIF date is the scan, not the shot. */
  date?: string
  /** Size of the full image. */
  w: number
  h: number
  /** CSS object-position for the cropped grid tile. */
  pos?: string
}

export const photos = manifest as Photo[]

export const photoSrc = (p: Photo, size: 'thumb' | 'full') => `photos/${size}/${p.id}.webp`

/** "2026-08" → "Aug 2026". */
export const photoDate = (p: Photo) => {
  if (!p.date) return undefined
  const [y, m] = p.date.split('-').map(Number)
  return `${new Date(Date.UTC(y, m - 1, 1)).toLocaleString('en-GB', { month: 'short', timeZone: 'UTC' })} ${y}`
}

/** NASA textures for the globe. */
export const earthTextures = {
  day: 'space/earth-day.jpg', // Blue Marble, 2048×1024
  night: 'space/earth-night.jpg', // Black Marble 2012, 3600×1800
}
