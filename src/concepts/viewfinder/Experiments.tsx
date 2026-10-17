import { experiments } from '../../content'
import SectionHead from './SectionHead'

export default function Experiments() {
  return (
    <section id="vf-lab" className="vf-section vf-lab" aria-labelledby="vf-lab-title">
      <div className="vf-wrap">
        <SectionHead no="06" label="Lab" sectionIndex={5} title="Experiments" titleId="vf-lab-title" />
        <ul className="vf-lab__list">
          {experiments.map((p, i) => (
            <li key={p.slug} className="vf-lab__row">
              <span className="vf-lab__no vf-mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="vf-lab__yr vf-mono">{p.year}</span>
              <div className="vf-lab__main">
                <h3 className="vf-lab__name">{p.name}</h3>
                <span className="vf-engr">{p.kind}</span>
              </div>
              <p className="vf-lab__one">{p.oneLiner}</p>
              <div className="vf-lab__side">
                <span className="vf-lab__stack vf-mono">{p.stack.join(' / ')}</span>
                <span className="vf-lab__links">
                  {p.links.map((l) => (
                    <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="vf-lab__link">
                      {l.label}
                      <svg viewBox="0 0 10 10" aria-hidden="true">
                        <path d="M2 8 8 2M3.5 2H8v4.5" fill="none" stroke="currentColor" strokeWidth="1.1" />
                      </svg>
                    </a>
                  ))}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
