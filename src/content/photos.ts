/**
 * Photography. The sky photos are PLACEHOLDERS (Unsplash via picsum.photos) standing in for Joe's
 * own work: swap `src` for real shots in /public/space and replace the titles and settings.
 * The orbit photos are NASA and stay credited as such.
 */
export type Photo = {
  src: string
  w: number
  h: number
  title: string
  /** Film (OM-1) or digital. */
  kind: 'film' | 'digital'
  /** e.g. "Portra 400" or "ISO 3200" */
  stock: string
  /** EXIF-ish line. */
  settings: string
  credit: { author: string; url: string }
}

const digital = (stock: string, settings: string) => ({ kind: 'digital' as const, stock, settings })

/** Night sky and space. Mostly digital long exposures. */
export const skyPhotos: Photo[] = [
  { src: 'space/p825.webp', w: 1800, h: 1200, title: 'Around the pole', ...digital('ISO 400', '2h stacked'), credit: { author: 'Michael Hull', url: 'https://unsplash.com' } },
  { src: 'space/p903.webp', w: 1800, h: 1200, title: 'Galactic core', ...digital('ISO 3200', 'f/2 · 20s'), credit: { author: 'Greg Rakozy', url: 'https://unsplash.com' } },
  { src: 'space/p1042.webp', w: 1800, h: 2700, title: 'Spiral', ...digital('ISO 200', '90 min stacked'), credit: { author: 'Jeremy Thomas', url: 'https://unsplash.com' } },
  { src: 'space/p974.webp', w: 1800, h: 932, title: 'Under the arm', ...digital('ISO 6400', 'f/1.8 · 15s'), credit: { author: 'Greg Rakozy', url: 'https://unsplash.com' } },
  { src: 'space/p724.webp', w: 1800, h: 1200, title: 'Aurora', ...digital('ISO 1600', 'f/2.8 · 8s'), credit: { author: 'Nelly Volkovich', url: 'https://unsplash.com' } },
  { src: 'space/p683.webp', w: 1800, h: 928, title: 'Trails', ...digital('ISO 200', '45 min'), credit: { author: 'ahmadreza sajadi', url: 'https://unsplash.com' } },
  { src: 'space/p981.webp', w: 1800, h: 2143, title: 'Rock and sky', ...digital('ISO 400', '60 min'), credit: { author: 'Anna Anikina', url: 'https://unsplash.com' } },
  { src: 'space/p901.webp', w: 1800, h: 1800, title: 'Green', ...digital('ISO 3200', 'f/2.8 · 6s'), credit: { author: 'Marcelo Quinan', url: 'https://unsplash.com' } },
  { src: 'space/p537.webp', w: 1800, h: 2711, title: 'Meteor', ...digital('ISO 3200', 'f/2.8 · 25s'), credit: { author: 'Juskteez Vu', url: 'https://unsplash.com' } },
]

/** From orbit (NASA, public domain). Useful for the satellite-work story. */
export const orbitPhotos: Photo[] = [
  { src: 'space/p967.webp', w: 1800, h: 1198, title: 'From the ISS', ...digital('NASA', 'ISS crew photo'), credit: { author: 'NASA', url: 'https://unsplash.com/@nasa' } },
  { src: 'space/p1002.webp', w: 1800, h: 1197, title: 'Coastline from orbit', ...digital('NASA', 'Earth observation'), credit: { author: 'NASA', url: 'https://unsplash.com/@nasa' } },
  { src: 'space/p992.webp', w: 1800, h: 1197, title: 'Limb', ...digital('—', '—'), credit: { author: 'Elliott Engelmann', url: 'https://unsplash.com' } },
]

/** NASA textures for globes. */
export const earthTextures = {
  day: 'space/earth-day.jpg', // Blue Marble, 2048×1024
  night: 'space/earth-night.jpg', // Black Marble 2012, 3600×1800
}
