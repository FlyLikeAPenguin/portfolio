# Joe Thornton · portfolio

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
| `photos.ts` | Night-sky and orbit photos, Earth textures |

Images live in `public/` and are referenced by path relative to it (`projects/quibble/shot-bingo.webp`).
Each gallery image carries its pixel size and alt text.

**Photos:** the night-sky photos in `public/space/p*.webp` are placeholders from Unsplash. Replace
the files and their entries in `photos.ts` (title, settings) with your own. The orbit photos are NASA.

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

The build is static with relative paths, so `dist/` works on any host or sub-path.

- **GitHub Pages:** in the repo settings choose Pages → Source → GitHub Actions, then run the
  *Deploy* workflow. Pages on a private repo needs a paid GitHub plan; on a public repo it's free.
  To deploy on every push to `main`, uncomment the `push` trigger in `.github/workflows/deploy.yml`.
- **Cloudflare Pages / Netlify / Vercel:** build command `pnpm build`, output directory `dist`.

Once the final domain is known, make `og:image` in `index.html` an absolute URL so link previews work.

## Credits

Earth textures: NASA Blue Marble and Black Marble. Satboard is built on SatVis by Flowm (MIT).
