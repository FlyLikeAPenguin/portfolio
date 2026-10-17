/**
 * Selected work. Kept short on purpose: a couple of lines, the numbers, and links.
 * Numbers come from the repos (Oct 2026); re-check them now and then.
 */
export type Stat = { value: string; label: string }

/** An image in a project's gallery, in display order. Paths are relative to /public. */
export type Shot = {
  src: string
  w: number
  h: number
  alt: string
  /** CSS object-position when the frame crops the image. */
  pos?: string
}

export type Project = {
  slug: string
  name: string
  year: string
  tier: 'flagship' | 'featured'
  /** Category label, e.g. "Multiplayer party-game platform". */
  kind: string
  status: string
  /** One line. */
  oneLiner: string
  /** One or two short sentences, no more. */
  summary: string
  role: string
  stats: Stat[]
  stack: string[]
  /** Where people can see it: Live first, then GitHub. */
  links: { label: string; href: string }[]
  gallery: Shot[]
  credit?: string
}

const hd = (src: string, alt: string): Shot => ({ src, w: 1920, h: 1080, alt })

export const projects: Project[] = [
  {
    slug: 'quibble',
    name: 'quibble.party',
    year: '2026',
    tier: 'flagship',
    kind: 'Multiplayer party-game platform',
    status: 'Live · private beta',
    oneLiner: 'Party games for a room full of phones.',
    summary:
      'Put the game on the TV and everyone plays from their phone with a four-letter code. 17 original games, each room a Cloudflare Durable Object running a replayable game engine.',
    role: 'Solo: product, engineering, art direction',
    stats: [
      { value: '17', label: 'original games' },
      { value: '3,700', label: 'tests' },
      { value: '511', label: 'commits in 10 weeks' },
      { value: '28 ms', label: 'cold room wake' },
    ],
    stack: ['React', 'TypeScript', 'Cloudflare Workers', 'Durable Objects', 'WebSockets'],
    links: [{ label: 'Live', href: 'https://quibble.party' }],
    gallery: [
      { src: 'projects/quibble/home-hero.webp', w: 1840, h: 1193, alt: 'quibble.party homepage: “One room. All in.” with the house-style cast', pos: '50% 38%' },
      hd('projects/quibble/shot-oracle-prophecy.webp', 'quibble.party gameplay: Emoji Oracle, a film guessed from 🐭👨‍🍳'),
      hd('projects/quibble/shot-bluffing-reveal.webp', 'quibble.party gameplay: the bluffing reveal screen'),
      hd('projects/quibble/shot-hot-take.webp', 'quibble.party gameplay: Hot Take'),
      hd('projects/quibble/shot-bingo.webp', 'quibble.party gameplay: Bingo, a full house called on the host screen'),
      hd('projects/quibble/shot-auction.webp', 'quibble.party gameplay: the auction'),
    ],
  },
  {
    slug: 'nitpick',
    name: 'Nitpick',
    year: '2026',
    tier: 'featured',
    kind: 'Open-source AI incident triage',
    status: 'Open source · MIT',
    oneLiner: 'Datadog errors → Claude root-cause analysis → GitHub issues and fix PRs.',
    summary:
      'Deduplicates production errors into distinct problems, has Claude investigate each one read-only, and opens small fix PRs for a human to review.',
    role: 'Author',
    stats: [
      { value: '1,378', label: 'investigations' },
      { value: '1,030', label: 'issues filed' },
      { value: '$0.81', label: 'per investigation' },
    ],
    stack: ['Python', 'Claude Code', 'SQLite', 'Datadog', 'GitHub'],
    links: [{ label: 'GitHub', href: 'https://github.com/FlyLikeAPenguin/nitpick' }],
    gallery: [{ src: 'projects/nitpick/dashboard.png', w: 1038, h: 882, alt: 'Nitpick dashboard: error list with service, error and cost columns', pos: 'left top' }],
  },
  {
    slug: 'satboard',
    name: 'Satboard',
    year: '2023–25',
    tier: 'featured',
    kind: '3D satellite tracker',
    status: 'Live',
    oneLiner: 'A 3D satellite tracker with ground-station pass prediction.',
    summary: 'Tracks an Earth-observation constellation over Svalbard, with 14-day pass predictions and launch-day tracking of freshly deployed satellites.',
    role: 'Extended and maintained',
    stats: [
      { value: '14 d', label: 'pass window' },
      { value: '78.2°N', label: 'ground station' },
      { value: 'SGP4', label: 'propagation' },
    ],
    stack: ['Vue', 'CesiumJS', 'satellite.js'],
    links: [
      { label: 'Live', href: 'https://flylikeapenguin.github.io/Satboard/?gs=78.2298,15.4078' },
      { label: 'GitHub', href: 'https://github.com/FlyLikeAPenguin/Satboard' },
    ],
    gallery: [{ src: 'projects/satboard/live.png', w: 1600, h: 1000, alt: 'Satboard: a 3D globe with satellite orbits and a ground-station pass timeline', pos: '50% 52%' }],
    credit: 'Built on SatVis by Flowm (MIT)',
  },
  {
    slug: 'mission-countdown',
    name: 'Mission Countdown',
    year: '2024',
    tier: 'featured',
    kind: 'Launch-day mission clock',
    status: 'Live',
    oneLiner: 'T-minus to liftoff, then T-plus through separation and first contact.',
    summary: 'A launch-day clock with milestones you can edit on the day, and fireworks. I forked the flip-clock library so it keeps counting after T-0.',
    role: 'Author',
    stats: [
      { value: 'T±', label: 'counts through zero' },
      { value: 'npm', label: 'published fork' },
    ],
    stack: ['React', 'TypeScript', 'fireworks-js'],
    links: [
      { label: 'Live', href: 'https://flylikeapenguin.github.io/MissionCountdown/' },
      { label: 'GitHub', href: 'https://github.com/FlyLikeAPenguin/MissionCountdown' },
    ],
    // The site recreates the flip clock in code instead of showing a screenshot.
    gallery: [],
  },
  {
    slug: 'genki',
    name: 'Genki Flashcards',
    year: '2021',
    tier: 'featured',
    kind: 'Japanese study app',
    status: 'Live',
    oneLiner: 'Kanji and kana flashcards for the Genki textbooks.',
    summary: 'Pick your lessons and draw cards, each with readings and example words. Your lesson choices are remembered between sessions.',
    role: 'Author',
    stats: [
      { value: '525', label: 'cards' },
      { value: '23', label: 'lessons' },
      { value: '1,859', label: 'example words' },
    ],
    stack: ['React', 'JavaScript', 'GitHub Pages'],
    links: [
      { label: 'Live', href: 'https://flylikeapenguin.github.io/Genki-Flashcards/' },
      { label: 'GitHub', href: 'https://github.com/FlyLikeAPenguin/Genki-Flashcards' },
    ],
    gallery: [
      { src: 'projects/genki/card.webp', w: 1600, h: 1143, alt: 'Genki Flashcards: card front showing the kanji 何, with the lesson list' },
      { src: 'projects/genki/card-back.webp', w: 1600, h: 1143, alt: 'Genki Flashcards: card back with the readings なに / なん and the meaning “what”' },
    ],
  },
]

export const flagship = projects.find((p) => p.tier === 'flagship')!
export const featured = projects.filter((p) => p.tier === 'featured')

/** Current role. Stealth: keep it vague on purpose. */
export const currentJob = {
  title: 'Member of Technical Staff',
  org: 'Stealth-mode startup',
  place: 'London, 2026–now',
}

/** The role before that. */
export const previousJob = {
  title: 'Senior Software Engineer, R&D',
  org: 'PolyAI',
  place: 'PolyAI · London, 2025–26',
  summary: 'AI infrastructure behind enterprise voice and chat agents: retrieval (RAG), live-agent handoff to contact centres, and LLM serving.',
  stack: ['Python', 'Go', 'Kafka', 'Protobuf / gRPC', 'Kubernetes', 'Azure'],
}

/** The satellite years. */
export const dayJob = {
  title: 'Satellite ground systems',
  org: 'Axelspace',
  place: 'Axelspace · Tokyo, 2023–25',
  summary: 'Ground systems for an Earth-observation satellite constellation. Joined as a DevOps engineer, promoted to senior, then led the Data Acquisition & Delivery team.',
  stats: [
    { value: '2023–25', label: 'in Tokyo' },
    { value: '2×', label: 'promotions' },
    { value: 'Team lead', label: 'acquisition & delivery' },
  ],
}
