// Turn original photos into web-ready files and keep src/content/photos.json in sync.
//
//   pnpm photos <folder-of-originals> [--force]
//
// For each JPEG/PNG/TIFF in the folder:
//   public/photos/thumb/<id>.webp   short edge 720px, for the grid (lazy-loaded)
//   public/photos/full/<id>.webp    long edge 2048px, loaded only when a photo is opened
// Output files carry no metadata (sharp drops EXIF and GPS by default).
//
// The manifest keeps your edits: titles, order, crop position (`pos`) and anything else you add stay
// as they are. Camera, lens, settings, date and size are refreshed from EXIF. New photos are appended
// with their file name as the title, ready to rename. Order in the file is display order.
import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import exifr from 'exifr'

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const OUT = path.join(ROOT, 'public/photos')
const MANIFEST = path.join(ROOT, 'src/content/photos.json')
const FILM_CAMERA = 'Olympus OM-1'
const THUMB_SHORT_EDGE = 720
const FULL_LONG_EDGE = 2048

const args = process.argv.slice(2)
const force = args.includes('--force')
const src = args.find((a) => !a.startsWith('--'))
if (!src) {
  console.error('Usage: pnpm photos <folder-of-originals> [--force]')
  process.exit(1)
}

const slug = (file) =>
  path
    .basename(file, path.extname(file))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** "E 18-300mm F3.5-6.3 B061" → "Tamron 18–300mm f/3.5–6.3" and friends. */
function prettyLens(lens) {
  if (!lens) return undefined
  let s = String(lens).trim()
  if (/\|\s*(Contemporary|Art|Sports)/i.test(s)) s = `Sigma ${s.split('|')[0].trim()}`
  else if (/\bB0\d\d\b|\bA0\d\d\b/.test(s)) s = `Tamron ${s.replace(/^E\s+/, '').replace(/\s+[AB]0\d\d$/, '')}`
  else if (/^(E|FE)\s/.test(s)) s = `Sony ${s}`
  return s.replace(/(\d)-(\d)/g, '$1–$2').replace(/\bF(\d)/g, 'f/$1')
}

const shutter = (t) => (t >= 1 ? `${+t.toFixed(1)}s` : `1/${Math.round(1 / t)}`)

async function readMeta(file) {
  const x = (await exifr.parse(file, ['Make', 'Model', 'LensModel', 'FNumber', 'ExposureTime', 'ISO', 'FocalLength', 'DateTimeOriginal']).catch(() => null)) ?? {}
  const model = String(x.Model ?? '')
  const film = /EZ Controller|Noritsu|Frontier|scan/i.test(model) || (!x.FNumber && !x.LensModel)
  if (film) return { kind: 'film', camera: FILM_CAMERA }
  const make = String(x.Make ?? '').trim()
  const brand = make ? make[0].toUpperCase() + make.slice(1).toLowerCase() : ''
  const parts = [
    x.FocalLength && `${Math.round(x.FocalLength)}mm`,
    x.FNumber && `f/${+x.FNumber.toFixed(1)}`,
    x.ExposureTime && shutter(x.ExposureTime),
    x.ISO && `ISO ${x.ISO}`,
  ].filter(Boolean)
  const d = x.DateTimeOriginal instanceof Date ? x.DateTimeOriginal : null
  return {
    kind: 'digital',
    camera: [brand, model].filter(Boolean).join(' '),
    lens: prettyLens(x.LensModel),
    settings: parts.join(' · ') || undefined,
    date: d ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` : undefined,
  }
}

const fresh = (out, srcFile) => !force && fs.existsSync(out) && fs.statSync(out).mtimeMs > fs.statSync(srcFile).mtimeMs

fs.mkdirSync(path.join(OUT, 'thumb'), { recursive: true })
fs.mkdirSync(path.join(OUT, 'full'), { recursive: true })

const manifest = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, 'utf8')) : []
const byId = new Map(manifest.map((p) => [p.id, p]))
const files = fs
  .readdirSync(src)
  .filter((f) => /\.(jpe?g|png|tiff?)$/i.test(f))
  .sort()

let made = 0
for (const f of files) {
  const file = path.join(src, f)
  const id = slug(f)
  const thumb = path.join(OUT, 'thumb', `${id}.webp`)
  const full = path.join(OUT, 'full', `${id}.webp`)

  if (!fresh(full, file)) {
    await sharp(file).rotate().resize(FULL_LONG_EDGE, FULL_LONG_EDGE, { fit: 'inside', withoutEnlargement: true }).webp({ quality: 82 }).toFile(full)
    made++
  }
  if (!fresh(thumb, file)) {
    const { width, height } = await sharp(full).metadata()
    const portrait = height >= width
    await sharp(full)
      .resize(portrait ? THUMB_SHORT_EDGE : null, portrait ? null : THUMB_SHORT_EDGE, { withoutEnlargement: true })
      .webp({ quality: 76 })
      .toFile(thumb)
  }

  const { width: w, height: h } = await sharp(full).metadata()
  const meta = await readMeta(file)
  const prev = byId.get(id)
  const entry = { id, title: prev?.title ?? id, ...prev, ...meta, w, h }
  for (const k of Object.keys(entry)) if (entry[k] === undefined) delete entry[k]
  if (prev) Object.assign(prev, entry)
  else {
    manifest.push(entry)
    byId.set(id, entry)
  }
  process.stdout.write(`\r${files.indexOf(f) + 1}/${files.length} ${id.padEnd(30)}`)
}

fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n')
const kb = (dir) => Math.round(fs.readdirSync(dir).reduce((n, f) => n + fs.statSync(path.join(dir, f)).size, 0) / 1024)
console.log(`\n${files.length} photos (${made} encoded). Thumbs ${kb(path.join(OUT, 'thumb'))} KB, full ${kb(path.join(OUT, 'full'))} KB.`)
console.log(`Manifest: ${path.relative(ROOT, MANIFEST)} (${manifest.length} entries). Edit titles and order there.`)
