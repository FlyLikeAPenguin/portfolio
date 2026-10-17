# Joe Thornton: portfolio concepts

Five working design directions for a new portfolio, sharing one content layer.

```bash
pnpm install
pnpm dev          # http://localhost:5173 → concept picker
pnpm build        # static build in dist/ (relative paths, hash routing: works on GitHub Pages)
```

| Route | Concept | Signature scroll interaction |
|---|---|---|
| `#/ground-station` | 01 Ground Station | Satellite flies a 3D night-side Earth; each project is a ground-station pass |
| `#/contact-sheet` | 02 Contact Sheet | 35mm strip advances sideways; frames develop from negative to positive |
| `#/long-exposure` | 03 Long Exposure | Scroll is exposure time: star trails draw around the pole, night turns to dawn |
| `#/viewfinder` | 04 Viewfinder | OM-1 iris opens, split-prism rack focus on headings, shutter-dial nav |
| `#/light-table` | 05 Light Table | Kinetic Swiss index, cursor-preview work table, stacking case studies |

## Where things live

```
src/content/      ← edit this: profile, timeline, projects, photos (shared by every concept)
src/concepts/     ← one folder per concept, styles scoped under a root class
src/shared/       ← Lenis + GSAP smooth scroll, hash router, concept switcher
public/photos/    ← street photography (PLACEHOLDERS: replace with your own)
public/space/     ← night sky (PLACEHOLDERS) + NASA Earth textures
public/projects/  ← project art and screenshots
scripts/shoot.mjs ← screenshot a page at several scroll depths (Playwright)
```

## Before launch

- **Photos**: everything in `public/photos` and `public/space/p*.webp` is a stand-in (Unsplash/NASA).
  Drop your own in and update `src/content/photos.ts` (titles, film stock, settings).
- **Lines marked `CHECK`** in `src/content/` are inferred and need confirming.
