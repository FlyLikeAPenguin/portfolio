/**
 * Selected work. Kept short on purpose: a couple of lines, the numbers, and links.
 * Numbers come from the repos (Oct 2026); re-check before launch.
 * Dropped on purpose: university projects, HackerRank, tutorial repos and stubs.
 */
export type Stat = { value: string; label: string }
/** Longer detail. Legacy: only concepts 02–05 still render these; Ground Station doesn't. */
export type Highlight = { title: string; detail: string }

export type Project = {
  slug: string
  name: string
  year: string
  tier: 'flagship' | 'featured' | 'experiment'
  /** Category label, e.g. "Multiplayer party-game platform". */
  kind: string
  status: string
  /** One line. */
  oneLiner: string
  /** One or two short sentences, no more. */
  summary: string
  role: string
  highlights: Highlight[]
  stats: Stat[]
  stack: string[]
  /** Where people can see it: Live first, then Source/GitHub. */
  links: { label: string; href: string }[]
  cover: string
  gallery: string[]
  accent: string
  credit?: string
}

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
    highlights: [
      { title: 'A pure, replayable engine', detail: 'Games are reducers with no I/O and no clocks, driven by a seeded PRNG. State persists after every action, so any match can be replayed exactly.' },
      { title: 'Secrets that provably don’t leak', detail: 'A breadth-first property harness walks every reachable state and checks that no player’s view ever contains another player’s hidden information.' },
      { title: 'Phones as controllers', detail: 'A 20 Hz lossy input relay drives slot-car physics in Redline and a gyroscope tilt-maze in Wobble, both rendered live on the host screen.' },
      { title: 'Load-tested on the real edge', detail: 'A full game at 100 players in one room. 200 hibernated WebSockets wake in 28 ms.' },
      { title: 'Design as a discipline', detail: '19 recorded art-direction rounds that became a written house style and an original cast of 20 deadpan characters.' },
    ],
    stats: [
      { value: '17', label: 'original games' },
      { value: '3,700', label: 'tests' },
      { value: '511', label: 'commits in 10 weeks' },
      { value: '28 ms', label: 'cold room wake' },
    ],
    stack: ['React', 'TypeScript', 'Cloudflare Workers', 'Durable Objects', 'WebSockets'],
    links: [{ label: 'Live', href: 'https://quibble.party' }],
    cover: 'projects/quibble/key-art.webp',
    gallery: [
      'projects/quibble/shot-bluffing-reveal.webp',
      'projects/quibble/shot-hot-take.webp',
      'projects/quibble/shot-oracle.webp',
      'projects/quibble/shot-auction.webp',
      'projects/quibble/shot-bingo.webp',
      'projects/quibble/shot-oracle-prophecy.webp',
    ],
    accent: '#e96545',
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
    highlights: [
      { title: 'Fingerprint before you spend', detail: 'Strips UUIDs, timestamps, IPs, hex addresses and tokens, folds in the top stack frames, then hashes. ~40k raw entries become a few hundred problems.' },
      { title: 'Safe by default', detail: 'Investigations are read-only. Fixes run in isolated git worktrees, are capped at 250 changed lines, and arrive as PRs that are tracked to merge or close.' },
      { title: 'Robust to messy model output', detail: 'Candidate-scanning JSON extraction keeps the best schema match. It fixed a 17% parse-failure rate on Go services.' },
    ],
    stats: [
      { value: '1,378', label: 'investigations' },
      { value: '1,030', label: 'issues filed' },
      { value: '$0.81', label: 'per investigation' },
    ],
    stack: ['Python', 'Claude Code', 'SQLite', 'Datadog', 'GitHub'],
    links: [{ label: 'GitHub', href: 'https://github.com/FlyLikeAPenguin/nitpick' }],
    cover: 'projects/nitpick/social.svg',
    gallery: ['projects/nitpick/dashboard.png'],
    accent: '#4ade80',
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
    highlights: [
      { title: '14-day pass prediction', detail: 'Ground-station passes computed two weeks out with a 5° minimum elevation, surfacing the next ten.' },
      { title: 'Tracking before the catalogue', detail: 'Launch-day TLEs loaded from a live sheet, so new rideshare objects can be followed in the hours after deployment.' },
      { title: 'Forward and back in time', detail: 'Scrub orbits forwards and backwards in 3D with SGP4 via satellite.js.' },
    ],
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
    cover: 'projects/satboard/live.png',
    gallery: [],
    accent: '#5cc8ff',
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
    highlights: [
      { title: 'Forked and published', detail: '@flylikeapenguin/react-flip-clock-countdown keeps the clock running through T-0 and fires completion exactly once.' },
      { title: 'Editable on the day', detail: 'Milestones come from a hosted JSON document, not the bundle.' },
    ],
    stats: [
      { value: 'T±', label: 'counts through zero' },
      { value: 'npm', label: 'published fork' },
    ],
    stack: ['React', 'TypeScript', 'fireworks-js'],
    links: [
      { label: 'Live', href: 'https://flylikeapenguin.github.io/MissionCountdown/' },
      { label: 'GitHub', href: 'https://github.com/FlyLikeAPenguin/MissionCountdown' },
    ],
    cover: 'projects/mission-countdown/live.png',
    gallery: [],
    accent: '#ffb547',
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
    highlights: [],
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
    cover: 'projects/genki/card.webp',
    gallery: ['projects/genki/card-back.webp'],
    accent: '#f472b6',
  },
]

export const flagship = projects.find((p) => p.tier === 'flagship')!
export const featured = projects.filter((p) => p.tier === 'featured')
export const experiments = projects.filter((p) => p.tier === 'experiment')

/** Current role, for concepts that feature it. Stealth: keep it vague on purpose. */
export const currentJob = {
  title: 'Member of Technical Staff',
  org: 'Stealth-mode startup',
  place: 'London, 2026–now',
  summary: 'Early-stage and in stealth. More when it’s public.',
  stack: [] as string[],
}

/** The role before that. */
export const previousJob = {
  title: 'Senior Software Engineer, R&D',
  org: 'PolyAI',
  place: 'PolyAI · London, 2025–26',
  summary: 'AI infrastructure behind enterprise voice and chat agents: retrieval (RAG), live-agent handoff to contact centres, and LLM serving.',
  stack: ['Python', 'Go', 'Kafka', 'Protobuf / gRPC', 'Kubernetes', 'Azure'],
}

/** The satellite years, for concepts that tell the career story alongside the side projects. */
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
