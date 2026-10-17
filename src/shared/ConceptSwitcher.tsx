import { concepts } from '../concepts/registry'
import { navigate } from './router'
import './concept-switcher.css'

/** Floating pill for jumping between design concepts. Lives bottom-left on every concept. */
export default function ConceptSwitcher({ current }: { current: string }) {
  const here = concepts.find((c) => c.id === current)
  return (
    <nav className="cswitch" aria-label="Design concepts">
      <button className="cswitch__home" onClick={() => navigate('')} title="All concepts">
        <svg viewBox="0 0 16 16" aria-hidden="true">
          <path d="M10 3 5 8l5 5" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
        <span>Concepts</span>
      </button>
      <span className="cswitch__sep" />
      {concepts.map((c) => (
        <button
          key={c.id}
          className="cswitch__dot"
          aria-current={c.id === current ? 'page' : undefined}
          onClick={() => navigate(c.id)}
          title={`${c.no} · ${c.title}`}
        >
          {c.no}
        </button>
      ))}
      {here && <span className="cswitch__label">{here.title}</span>}
    </nav>
  )
}
