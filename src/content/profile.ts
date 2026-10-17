/**
 * Who Joe is. Shared by every concept, so edit here once.
 * Source: LinkedIn (Oct 2026) plus Joe's update: new role from Oct 2026. Lines marked CHECK still need confirming.
 */
export const profile = {
  name: 'Joe Thornton',
  firstName: 'Joe',
  role: 'Member of Technical Staff',
  location: 'London',
  /** Short positioning line, used in heroes. */
  headline: 'I build systems that have to work: AI infrastructure, satellite ground systems, realtime games.',
  /** Three short lines: the past, the present, life outside work. Some concepts index them. */
  bio: [
    'Software engineer from the UK. Two years in Tokyo at Axelspace on satellite ground systems, finishing as team lead, then AI infrastructure at PolyAI.',
    'Now a member of technical staff at a stealth-mode startup. In my own time I ship party games, developer tools and orbital simulators.',
    'Away from the keyboard: space, photography (mostly digital, the odd roll of film on an OM-1), reading and musical theatre.',
  ],
  email: 'joe.clifford.thornton@gmail.com',
  links: {
    github: 'https://github.com/FlyLikeAPenguin',
    linkedin: 'https://www.linkedin.com/in/joecthornton/',
    instagram: 'https://www.instagram.com/always_just_joe/',
  },
  interests: ['Space', 'Photography', 'Reading', 'Musical theatre'],
  languages: ['English (native)', 'Japanese (elementary)'],
  /** Kit, for the photography sections. Mostly digital; film is occasional. Keep the OM-1 first: some concepts read cameras[0]. */
  cameras: [
    { name: 'Olympus OM-1', kind: 'Film', detail: '35mm SLR, 1972, for the occasional roll. Zuiko 50mm f/1.8.' }, // CHECK: lens
    { name: 'Digital', kind: 'Digital', detail: 'Most of what I shoot: streets, travel, the night sky.' }, // CHECK: body
  ],
  /** Skills grouped for quick scanning. Keep these keys: concepts read them by name. */
  stack: {
    Languages: ['Python', 'TypeScript', 'Go', 'C#', 'Rust'],
    Frontend: ['React', 'Vue', 'Three.js / CesiumJS', 'GSAP'],
    Backend: ['Kafka', 'Protobuf / gRPC', 'FastAPI', 'Node', '.NET', 'Postgres'],
    Infra: ['Kubernetes', 'Terraform', 'Azure', 'AWS', 'Cloudflare', 'Datadog'],
    AI: ['RAG & vector search', 'LLM serving', 'Agents & tool use'],
  },
}

export type TimelineEntry = {
  /** Start year, for compact scales. */
  year: string
  /** Human-readable dates, e.g. "Mar 2025 – now". */
  period: string
  title: string
  org: string
  /** One short line. */
  detail: string
  place: string
}

/** Oldest first. */
export const timeline: TimelineEntry[] = [
  { year: '2014', period: '2014 – 2017', title: 'BSc Computer Science, First Class', org: 'Sheffield Hallam University', detail: 'First Class (Hons).', place: 'Sheffield' },
  { year: '2017', period: '2017 – 2018', title: 'PGCE in Computing', org: 'Sheffield Hallam University', detail: 'Trained as a computing teacher.', place: 'Sheffield' },
  { year: '2018', period: 'Jul 2018 – Oct 2022', title: 'Software Engineer', org: 'LabLogic Systems', detail: 'C#/.NET, then development lead of a radiopharmaceutical LIMS.', place: 'Sheffield' },
  { year: '2022', period: 'Nov 2022 – Mar 2023', title: 'Satellite Ops DevOps Engineer (consultant)', org: 'Axelspace', detail: 'Started remotely from the UK.', place: 'UK' },
  { year: '2023', period: 'Mar – Oct 2023', title: 'Satellite Ops DevOps Engineer', org: 'Axelspace', detail: 'Moved to Tokyo.', place: 'Tokyo' },
  { year: '2023', period: 'Oct 2023 – May 2024', title: 'Senior Software Engineer', org: 'Axelspace', detail: 'Satellite ground systems.', place: 'Tokyo' },
  { year: '2024', period: 'May 2024 – Mar 2025', title: 'Team Leader, Data Acquisition & Delivery', org: 'Axelspace', detail: 'Satellite communications and ground systems.', place: 'Tokyo' },
  { year: '2025', period: 'Mar 2025 – Oct 2026', title: 'Senior Software Engineer, R&D', org: 'PolyAI', detail: 'AI infrastructure for enterprise voice agents.', place: 'London' },
  { year: '2026', period: 'Oct 2026 – now', title: 'Member of Technical Staff', org: 'Stealth-mode startup', detail: 'Early-stage, in stealth.', place: 'London' },
]
