# Joe Thornton · portfolio

**Live: https://flylikeapenguin.github.io/portfolio/**

A one-page portfolio styled as a satellite ground station. Scroll flies a satellite around a 3D
night-side Earth, and each project is a "pass" over a ground station: signal acquired, telemetry
in, images downlinked line by line.

React 19 · TypeScript · three.js / react-three-fiber · GSAP + ScrollTrigger · Lenis · Vite

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm build        # type-check and build to dist/
pnpm preview      # serve the build
```

## Editing content

Everything the page says lives in [`src/content/`](src/content):

| File | What's in it |
|---|---|
| `profile.ts` | Name, role, bio lines, links, cameras, career timeline |
| `projects.ts` | Projects (copy, stats, links, gallery), current/previous role, the Axelspace chapter |
| `photos.json` | Photos: titles, order, crop and EXIF (see below) |

Images live in `public/` and are referenced by path relative to it (`projects/quibble/shot-bingo.webp`).
Each gallery image carries its pixel size and alt text.

## Adding photos

```bash
pnpm photos ~/Pictures/portfolio      # a folder of original JPEGs (any size)
```

For each original this writes a 720px thumbnail (`public/photos/thumb/`) and a 2048px version for the
viewer (`public/photos/full/`) as WebP, with EXIF and GPS removed. It also updates
`src/content/photos.json`: camera, lens and settings come from EXIF; titles, order and crop (`pos`)
are yours to edit there and survive re-runs. New photos are added at the end, titled with their file
name. Film scans are detected and credited to the OM-1 (50mm, Kodak Gold 200). The first photo in the list is the large
tile, the first 17 show on the page and the rest sit behind "Show all".

## Code layout

```
src/
  main.tsx            entry
  content/            all copy and data
  lib/                Lenis smooth scroll, wired into GSAP's ticker
  site/
    GroundStation.tsx page root: flight plan (scroll → globe choreography), HUD, sections
    plan.ts           which station each pass flies over, scroll keyframes
    scene/            three.js Earth, orbit, stations (lazy-loaded)
    sections/         hero, project passes, career, photos, contact
    ui/               HUD, downlink image reveal, flip clock, pipeline diagram
    gs.css            all styles, scoped under .gs
scripts/shoot.mjs     screenshot the page at several scroll depths (Playwright)
```

`pnpm shoot --url http://localhost:5173/ --out shots/d --stops 0,0.25,0.5,0.75,1` saves screenshots
down the page (add `--mobile` for a phone viewport). Run `npx playwright install chromium` once first.

## Deploying

Every push to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`
(Settings → Pages → Source: GitHub Actions). You can also run the *Deploy* workflow by hand.

The build is static with relative paths, so `dist/` also works on any other host or sub-path
(Cloudflare Pages, Netlify, Vercel: build command `pnpm build`, output `dist`). If the address
changes, update `og:url`, `og:image` and the canonical link in `index.html`.

## Credits

Earth textures: NASA Blue Marble and Black Marble. Satboard is built on SatVis by Flowm (MIT).
