import { useEffect } from 'react'
import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { concepts } from './concepts/registry'
import { asset, projects, streetPhotos } from './content'
import './concepts-index.css'

export default function ConceptsIndex() {
  useEffect(() => {
    window.scrollTo(0, 0)
    document.body.style.background = '#0e0e0d'
  }, [])

  return (
    <main className="ci">
      <header className="ci__top">
        <span>Joe Thornton · Portfolio</span>
        <span>Design concepts · Oct 2026</span>
      </header>

      <section className="ci__intro">
        <h1>
          Five directions,
          <br />
          <em>one portfolio.</em>
        </h1>
        <div className="ci__lede">
          <p>
            Each concept is a working prototype with real content: your projects, your story, and the same data layer
            underneath. Open one and scroll. The scroll interaction is the point.
          </p>
          <p className="ci__small">
            Photos are placeholders until yours go in. Use the switcher in the bottom-left corner to jump between concepts.
          </p>
        </div>
      </section>

      <ol className="ci__list">
        {concepts.map((c) => (
          <li key={c.id} className="ci__row">
            <a href={`#/${c.id}`} className="ci__link" aria-label={`Open concept ${c.no}: ${c.title}`}>
              <span className="ci__no">{c.no}</span>
              <div className="ci__text">
                <h2>{c.title}</h2>
                <p className="ci__tagline">{c.tagline}</p>
                <p className="ci__desc">
                  <span>Scroll</span>
                  {c.interaction}
                </p>
                <p className="ci__desc">
                  <span>Notes</span>
                  {c.note}
                </p>
                <div className="ci__palette" aria-hidden="true">
                  {c.palette.map((p) => (
                    <i key={p} style={{ background: p }} />
                  ))}
                  <span className="ci__open">Open concept →</span>
                </div>
              </div>
              <figure className="ci__thumb" style={{ background: `linear-gradient(135deg, ${c.palette[0]}, ${c.palette[1]})` }}>
                <img src={asset(`concepts/thumbs/${c.id}.webp`)} alt="" loading="lazy" decoding="async" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </figure>
            </a>
          </li>
        ))}
      </ol>

      <section className="ci__shared">
        <div>
          <h3>Shared across all five</h3>
          <p>
            One content layer in <code>src/content/</code> holds your bio, timeline, projects and photos, so whichever direction
            wins (or a hybrid), nothing is rewritten. Featured work: {projects.filter((p) => p.tier !== 'experiment').map((p) => p.name).join(', ')}.
            Uni projects and stubs are dropped.
          </p>
        </div>
        <div className="ci__strip" aria-hidden="true">
          {streetPhotos.slice(0, 6).map((p) => (
            <img key={p.src} src={asset(p.src)} alt="" loading="lazy" decoding="async" />
          ))}
        </div>
      </section>

      <footer className="ci__foot">
        <span>Built with React, GSAP, Lenis and three.js</span>
        <span>Placeholder photography via Unsplash and NASA</span>
      </footer>
    </main>
  )
}
