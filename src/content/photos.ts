/**
 * Photography. EVERY image here is a PLACEHOLDER (Unsplash via picsum.photos, NASA)
 * standing in for Joe's own work. Swap `src` for real shots in /public/photos and /public/space,
 * and replace the titles and settings with the real ones.
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

const film = (stock: string, settings: string) => ({ kind: 'film' as const, stock, settings })
const digital = (stock: string, settings: string) => ({ kind: 'digital' as const, stock, settings })

/** Street, travel, everyday. Mostly digital, with the odd roll of film on the OM-1. */
export const streetPhotos: Photo[] = [
  { src: 'photos/p797.webp', w: 1800, h: 1200, title: 'Red umbrella', ...digital('ISO 3200', 'f/1.8 · 1/125'), credit: { author: 'Gabriel Santiago', url: 'https://unsplash.com/photos/F2ZERoNAqEw' } },
  { src: 'photos/p345.webp', w: 1800, h: 1200, title: 'Last train', ...film('HP5 @ 1600', 'f/2 · 1/15'), credit: { author: 'Mario Calvo', url: 'https://unsplash.com' } },
  { src: 'photos/p1033.webp', w: 1800, h: 1200, title: 'Underground', ...digital('ISO 800', 'f/4 · 1/60'), credit: { author: 'Erez Attias', url: 'https://unsplash.com' } },
  { src: 'photos/p579.webp', w: 1800, h: 1198, title: 'Crossing', ...digital('ISO 1600', 'f/2.8 · 1/125'), credit: { author: 'Israel Sundseth', url: 'https://unsplash.com' } },
  { src: 'photos/p195.webp', w: 1800, h: 2400, title: 'Lanterns', ...digital('ISO 3200', 'f/1.8 · 1/60'), credit: { author: 'Matthew Skinner', url: 'https://unsplash.com' } },
  { src: 'photos/p704.webp', w: 1800, h: 1200, title: 'Bamboo', ...digital('ISO 800', 'f/4 · 1/125'), credit: { author: 'Ståle Grut', url: 'https://unsplash.com' } },
  { src: 'photos/p783.webp', w: 1800, h: 1200, title: 'Macaque', ...digital('ISO 400', 'f/4 · 1/500'), credit: { author: 'Damir Kotoric', url: 'https://unsplash.com' } },
  { src: 'photos/p827.webp', w: 1800, h: 2700, title: 'Blue hour', ...digital('ISO 100', 'f/8 · 2s'), credit: { author: 'kazuend', url: 'https://unsplash.com' } },
  { src: 'photos/p1077.webp', w: 1800, h: 1197, title: 'Commute', ...film('Tri-X 400', 'f/8 · 1/15'), credit: { author: 'Maico Amorim', url: 'https://unsplash.com' } },
  { src: 'photos/p821.webp', w: 1800, h: 1200, title: 'Platform', ...film('HP5 400', 'f/2.8 · 1/60'), credit: { author: 'Eutah Mizushima', url: 'https://unsplash.com' } },
  { src: 'photos/p1078.webp', w: 1800, h: 1200, title: 'Ten thousand windows', ...digital('ISO 3200', 'f/2 · 1/60'), credit: { author: 'Vladimir Kudinov', url: 'https://unsplash.com' } },
  { src: 'photos/p352.webp', w: 1800, h: 1200, title: 'Light trails', ...digital('ISO 100', 'f/11 · 20s'), credit: { author: 'Caleb George', url: 'https://unsplash.com' } },
  { src: 'photos/p539.webp', w: 1800, h: 1195, title: 'Window seat', ...film('Tri-X 400', 'f/2.8 · 1/125'), credit: { author: 'Samuel Zeller', url: 'https://unsplash.com' } },
  { src: 'photos/p220.webp', w: 1800, h: 1123, title: 'Fog', ...digital('ISO 1600', 'f/2 · 1/30'), credit: { author: 'Robin Röcker', url: 'https://unsplash.com' } },
  { src: 'photos/p690.webp', w: 1800, h: 1196, title: 'Home', ...digital('ISO 200', 'f/5.6 · 1/250'), credit: { author: 'David Marcu', url: 'https://unsplash.com' } },
  { src: 'photos/p212.webp', w: 1800, h: 1255, title: 'After rain', ...film('Portra 400', 'f/2.8 · 1/60'), credit: { author: 'Sylwia Bartyzel', url: 'https://unsplash.com' } },
  { src: 'photos/p396.webp', w: 1800, h: 1200, title: 'Tunnel', ...digital('ISO 800', 'f/4 · 1/30'), credit: { author: 'Sam X', url: 'https://unsplash.com' } },
  { src: 'photos/p331.webp', w: 1800, h: 1200, title: 'Waiting', ...digital('ISO 400', 'f/4 · 1/250'), credit: { author: 'Thong Vo', url: 'https://unsplash.com' } },
]

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
