import { lazy, type ComponentType, type LazyExoticComponent } from 'react'

export type Concept = {
  id: string
  no: string
  title: string
  /** One-line hook shown on the index. */
  tagline: string
  /** What the scroll interaction does. */
  interaction: string
  /** Who this direction is best for / trade-offs. */
  note: string
  palette: string[]
  Component: LazyExoticComponent<ComponentType>
}

export const concepts: Concept[] = [
  {
    id: 'ground-station',
    no: '01',
    title: 'Ground Station',
    tagline: 'Your career as a satellite pass: mission control for a portfolio.',
    interaction: 'Scroll flies a satellite around a 3D night-side Earth. Each project is a ground-station pass: signal acquired, telemetry streams in, loss of signal.',
    note: 'Leans hardest on the space story and your ground-systems background. Most technical-looking of the five.',
    palette: ['#05070b', '#9ef0c6', '#ffb547', '#e8edf2'],
    Component: lazy(() => import('./ground-station/GroundStation')),
  },
  {
    id: 'contact-sheet',
    no: '02',
    title: 'Contact Sheet',
    tagline: 'A roll of 35mm from an OM-1, developed one frame at a time.',
    interaction: 'Vertical scroll advances a film strip sideways. Frames arrive as negatives and develop into positives; grease-pencil marks circle the selects.',
    note: 'The most tactile and handmade. Film is your occasional medium, so the roll is a metaphor here: projects become frames on it.',
    palette: ['#efe9dc', '#1a1714', '#e0412b', '#f2a33a'],
    Component: lazy(() => import('./contact-sheet/ContactSheet')),
  },
  {
    id: 'long-exposure',
    no: '03',
    title: 'Long Exposure',
    tagline: 'Keep the shutter open. The sky draws star trails as you scroll.',
    interaction: 'Scrolling is exposure time: stars wheel around the pole and their trails lengthen. Big editorial type sits over the sky.',
    note: 'Joins astrophotography and engineering in one image. The most cinematic and calm of the five.',
    palette: ['#070912', '#f4efe6', '#c9a46a', '#6f86ff'],
    Component: lazy(() => import('./long-exposure/LongExposure')),
  },
  {
    id: 'viewfinder',
    no: '04',
    title: 'Viewfinder',
    tagline: 'Look through the OM-1: the iris opens, focus racks, the needle meters.',
    interaction: 'An aperture iris opens on scroll to reveal the site. Each section racks into focus through a split-prism, with OM-1 shutter-dial navigation.',
    note: 'Mechanical and precise. Shows craft through interaction detail and keeps the copy minimal.',
    palette: ['#0c0c0c', '#ecebe6', '#ff5a1f', '#8a8a85'],
    Component: lazy(() => import('./viewfinder/Viewfinder')),
  },
  {
    id: 'light-table',
    no: '05',
    title: 'Light Table',
    tagline: 'Calibre first. A Swiss-grid index of everything worth shipping.',
    interaction: 'Kinetic type hero, then a work index where rows expand and previews trail the cursor. Project case studies stack as you scroll.',
    note: 'Easiest for a recruiter to scan in 30 seconds. Least "space", most proof.',
    palette: ['#f3f2ee', '#111111', '#ff4d00', '#c7c4bb'],
    Component: lazy(() => import('./light-table/LightTable')),
  },
]
