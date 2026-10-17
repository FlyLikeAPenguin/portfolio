import { useState } from 'react'
import { dayJob, flagship, profile, timeline } from '../../content'
import SectionHead from './SectionHead'

type Row = { k: string; v: string; sub?: string; call?: 'A' | 'B' | 'C' | 'D' }

const stat = (needle: string) => flagship.stats.find((s) => s.label.includes(needle))
const tests = stat('tests')
const commits = stat('commits')
const edge = flagship.highlights.find((h) => h.title.toLowerCase().includes('load'))
const lead = timeline.find((t) => t.title.toLowerCase().includes('lead'))
const degree = timeline[0]
const [film, digital] = profile.cameras

const ROWS: Row[] = [
  { k: 'Type', v: `${profile.role}, full-frame`, sub: `UK-made. Three years in Tokyo. Now ${profile.location}.` },
  { k: 'Mount', v: profile.stack.Languages.join(' · '), sub: 'Languages', call: 'C' },
  { k: 'Viewfinder', v: profile.stack.Frontend.join(' · '), sub: 'Frontend', call: 'B' },
  { k: 'Drive', v: profile.stack.Backend.join(' · '), sub: 'Backend' },
  { k: 'Metering', v: 'Tests first', sub: tests ? `${tests.value} ${tests.label} on ${flagship.name}` : undefined, call: 'D' },
  { k: 'Shutter', v: 'Ships', sub: commits ? `${commits.value} ${commits.label} · ${flagship.name}` : undefined, call: 'A' },
  { k: 'Weather sealing', v: edge?.title ?? 'Production-grade', sub: edge?.detail },
  { k: 'Tripod socket', v: profile.stack.Infra.join(' · '), sub: 'Infrastructure' },
  { k: 'Auto mode', v: profile.stack.AI.join(' · '), sub: 'AI' },
  { k: 'Field service', v: `${dayJob.title}, ${dayJob.place}`, sub: lead?.title },
  { k: 'Film', v: `${film.name}. ${film.detail}`, sub: `${digital.kind}: ${digital.detail}` },
  { k: 'Manufactured', v: degree.title, sub: `${degree.detail.replace(/\.$/, '')} · ${degree.year}` },
]

/** Front elevation of an OM-1, drawn in hairlines, with callouts that answer the table. */
function Drawing({ active }: { active: string | null }) {
  const on = (c: string) => (active === c ? ' is-on' : '')
  return (
    <svg className="vf-spec__fig" viewBox="0 0 400 270" role="img" aria-label="Line drawing of an Olympus OM-1, front view">
      <defs>
        <pattern id="vf-leather" width="3" height="3" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="0.45" fill="#ecebe6" fillOpacity="0.16" />
          <circle cx="2.5" cy="2.4" r="0.35" fill="#ecebe6" fillOpacity="0.1" />
        </pattern>
        <mask id="vf-body-mask">
          <rect x="20" y="114" width="360" height="104" rx="8" fill="#fff" />
          <circle cx="200" cy="168" r="76" fill="#000" />
        </mask>
      </defs>
      <g fill="none" stroke="#ecebe6" strokeWidth="0.8" strokeOpacity="0.7">
        {/* top plate and body */}
        <path d="M28 92 H150 L166 44 H234 L250 92 H372 Q380 92 380 100 V212 Q380 220 372 220 H28 Q20 220 20 212 V100 Q20 92 28 92Z" />
        <line x1="20" y1="114" x2="380" y2="114" strokeOpacity="0.45" />
        <rect x="20" y="114" width="360" height="104" fill="url(#vf-leather)" stroke="none" mask="url(#vf-body-mask)" />
        <path d="M172 50 H228" strokeOpacity="0.35" />
        {/* rewind knob + meter switch */}
        <rect x="46" y="76" width="54" height="16" rx="2" />
        <path d="M52 76 V92 M58 76 V92 M64 76 V92 M70 76 V92 M76 76 V92 M82 76 V92 M88 76 V92 M94 76 V92" strokeOpacity="0.35" />
        {/* advance lever + shutter release */}
        <rect x="292" y="82" width="64" height="10" rx="2" />
        <path d="M300 82 L344 70 L350 74 L306 86" strokeOpacity="0.6" />
        <circle cx="318" cy="76" r="5.5" className={`vf-spec__hot${on('A')}`} />
        {/* strap lugs, self-timer */}
        <path d="M20 118 l-6 4 v8 l6 2 M380 118 l6 4 v8 l-6 2" strokeOpacity="0.5" />
        <rect x="92" y="134" width="10" height="30" rx="4" strokeOpacity="0.5" />
        {/* lens */}
        <circle cx="200" cy="168" r="76" strokeOpacity="0.45" />
        <circle cx="200" cy="168" r="70" />
        <circle cx="200" cy="168" r="70" strokeWidth="5" strokeOpacity="0.16" strokeDasharray="0.8 1.6" />
        <circle cx="200" cy="168" r="62" />
        <circle cx="200" cy="168" r="54" strokeOpacity="0.5" />
        <circle cx="200" cy="168" r="34" strokeOpacity="0.85" />
        <path d="M184 154 A20 20 0 0 1 206 148" strokeOpacity="0.6" />
        {/* prism lettering */}
        <text x="200" y="66" className="vf-spec__brand">OLYMPUS</text>
        <text x="200" y="80" className="vf-spec__model">OM-1</text>
      </g>
      {/* callouts */}
      <g className="vf-spec__calls">
        <g className={`vf-spec__call${on('A')}`}>
          <path d="M318 70 V24 H340" />
          <circle cx="352" cy="24" r="8" />
          <text x="352" y="27.5">A</text>
        </g>
        <g className={`vf-spec__call${on('B')}`}>
          <path d="M200 44 V24 H180" />
          <circle cx="168" cy="24" r="8" />
          <text x="168" y="27.5">B</text>
        </g>
        <g className={`vf-spec__call${on('C')}`}>
          <path d="M254 222 L276 252 H300" />
          <circle cx="312" cy="252" r="8" />
          <text x="312" y="255.5">C</text>
        </g>
        <g className={`vf-spec__call${on('D')}`}>
          <path d="M60 76 V40 H40" />
          <circle cx="28" cy="40" r="8" />
          <text x="28" y="43.5">D</text>
        </g>
      </g>
    </svg>
  )
}

export default function Specs() {
  const [active, setActive] = useState<string | null>(null)
  return (
    <section id="vf-specs" className="vf-section vf-spec" aria-labelledby="vf-specs-title">
      <div className="vf-wrap">
        <SectionHead no="03" label="Model JT · Joe Thornton" sectionIndex={2} title="Specifications" titleId="vf-specs-title" />
        <div className="vf-spec__grid">
          <div className="vf-spec__aside">
            <figure className="vf-spec__figwrap">
              <Drawing active={active} />
              <figcaption className="vf-engr">Fig. 1 · Front elevation · Not to scale</figcaption>
            </figure>
            <div className="vf-spec__bio">
              {profile.bio.map((b) => (
                <p key={b.slice(0, 16)} className="vf-body">
                  {b}
                </p>
              ))}
            </div>
          </div>
          <table className="vf-spec__table">
            <caption className="vf-sr">Specifications of Joe Thornton, software engineer</caption>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={r.k}
                  onMouseEnter={() => setActive(r.call ?? null)}
                  onMouseLeave={() => setActive(null)}
                  className={r.call && active === r.call ? 'is-on' : ''}
                >
                  <th scope="row">
                    <span className="vf-mono vf-spec__i">{String(i + 1).padStart(2, '0')}</span>
                    <span className="vf-engr">{r.k}</span>
                    {r.call && <span className="vf-spec__tag vf-mono" aria-hidden="true">{r.call}</span>}
                  </th>
                  <td>
                    <span className="vf-spec__v">{r.v}</span>
                    {r.sub && <span className="vf-spec__sub vf-mono">{r.sub}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
