import { dayJob, profile, timeline } from '../../content'
import { SectionHead } from './SectionHead'

export function About() {
  const rows = [...timeline].reverse()
  const [lead, ...rest] = profile.bio
  return (
    <section className="lt-sec lt-about" id="lt-about" aria-labelledby="lt-about-h">
      <SectionHead no="05" id="lt-about-h" title="About" aside={`${profile.location} · ${timeline[0].year}–now`} />

      <div className="lt-bio">
        <p className="lt-bio__lead" data-reveal>
          {lead}
        </p>
        <div className="lt-bio__rest" data-reveal>
          {rest.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
      </div>

      <div className="lt-dayjob" id="lt-dayjob" data-reveal>
        <div className="lt-dayjob__h">
          <span className="lt-label lt-dayjob__tag">Day job</span>
          <h3>{dayJob.title}</h3>
          <span className="lt-label">{dayJob.place}</span>
        </div>
        <p className="lt-dayjob__sum">{dayJob.summary}</p>
        <dl className="lt-dayjob__stats">
          {dayJob.stats.map((s) => (
            <div key={s.label}>
              <dd>{s.value}</dd>
              <dt className="lt-label">{s.label}</dt>
            </div>
          ))}
        </dl>
      </div>

      <div className="lt-tl">
        <h3 className="lt-label lt-tl__cap">Timeline</h3>
        <table className="lt-tl__t">
          <thead>
            <tr className="lt-label">
              <th scope="col">Year</th>
              <th scope="col">Role</th>
              <th scope="col">Place</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((t, i) => (
              <tr key={`${t.year}-${t.title}`} className={i === 0 ? 'is-now' : undefined} data-tr>
                <td className="lt-tl__y">{t.year}</td>
                <td className="lt-tl__r">
                  <strong>{t.title}</strong>
                  <span>{t.detail}</span>
                </td>
                <td className="lt-tl__p">{t.place}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="lt-skills">
        <h3 className="lt-label lt-skills__cap">Stack</h3>
        <div className="lt-skills__g">
          {Object.entries(profile.stack).map(([group, items]) => (
            <div key={group} className="lt-skills__col" data-reveal>
              <h4 className="lt-label">{group}</h4>
              <ul>
                {items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
