/**
 * Who Joe is: bio, links, cameras and career timeline.
 * Source: LinkedIn (Oct 2026) plus Joe's update: new role from Oct 2026. Cameras from photo EXIF.
 */
export const profile = {
  name: 'Joe Thornton',
  role: 'Member of Technical Staff',
  location: 'London',
  /** Three short lines: the past, the present, life outside work. The site indexes them. */
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
  /** Kit, for the photography section. Mostly digital; film is occasional. */
  cameras: [
    { name: 'Sony ZV-E10', kind: 'Digital', detail: 'Most of what I shoot. Sigma 30mm and 56mm f/1.4, Tamron 18–300mm.' },
    { name: 'Olympus OM-1', kind: 'Film', detail: '35mm SLR from 1972, for the occasional roll.' },
  ],
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
