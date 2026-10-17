import { Fragment, useRef } from 'react'
import { asset, type Project } from '../../content'
import { gsap, useGSAP } from './gsap'
import { cases, pad2 } from './data'
import { SectionHead } from './SectionHead'
import { FlipClock } from './FlipClock'

/** Desktop with enough height for a full card: pin and stack. Everything else reads as a sequence. */
const STACK_MQ = '(min-width: 901px) and (min-height: 680px) and (prefers-reduced-motion: no-preference)'

function Media({ p }: { p: Project }) {
  if (p.slug === 'quibble' && p.gallery.length >= 4)
    return (
      <div className="lt-mosaic">
        {p.gallery.slice(0, 6).map((g, i) => (
          <figure key={g} className={`lt-mosaic__c lt-mosaic__c--${i}`}>
            <img src={asset(g)} alt={`${p.name} screen ${i + 1}`} loading="lazy" decoding="async" />
          </figure>
        ))}
      </div>
    )
  if (p.slug === 'mission-countdown')
    return (
      <div className="lt-media-mc">
        <FlipClock
          milestones={['Liftoff', 'Separation', 'First contact']}
          pkg={p.highlights.map((h) => h.detail.match(/@[\w-]+\/[\w-]+/)?.[0]).find(Boolean)}
        />
      </div>
    )
  if (p.slug === 'nitpick')
    return (
      <div className="lt-prints">
        <figure className="lt-print lt-print--a">
          <img src={asset(p.cover)} alt={`${p.name}: Datadog errors to Claude root-cause analysis to reviewable PRs`} loading="lazy" decoding="async" />
          <figcaption className="lt-label">Fig. 1 — Pipeline</figcaption>
        </figure>
        {p.gallery[0] && (
          <figure className="lt-print lt-print--b">
            <img src={asset(p.gallery[0])} alt={`${p.name} dashboard`} loading="lazy" decoding="async" />
            <figcaption className="lt-label">Fig. 2 — Dashboard</figcaption>
          </figure>
        )}
      </div>
    )
  const gs = p.stats.find((s) => /ground station/i.test(s.label))
  return (
    <figure className={`lt-shot lt-shot--${p.slug}`}>
      <img src={asset(p.cover)} alt={`${p.name}, live`} loading="lazy" decoding="async" />
      {gs && (
        <figcaption className="lt-shot__tag">
          <span className="lt-shot__x" aria-hidden="true" />
          <span className="lt-label">
            {gs.label} · {gs.value}
          </span>
        </figcaption>
      )}
    </figure>
  )
}

export function CaseStack() {
  const ref = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      const cards = gsap.utils.toArray<HTMLElement>('.lt-card')
      const anchors = gsap.utils.toArray<HTMLElement>('.lt-card__anchor')

      mm.add(STACK_MQ, () => {
        cards.forEach((card, i) => {
          const nextAnchor = anchors[i + 1]
          const inner = card.querySelector('.lt-card__in')
          const shade = card.querySelector('.lt-card__shade')
          if (nextAnchor) {
            gsap
              .timeline({
                scrollTrigger: {
                  trigger: nextAnchor,
                  start: 'top bottom',
                  end: () => `top top+=${parseFloat(getComputedStyle(card).top) || 0}`,
                  scrub: true,
                  invalidateOnRefresh: true,
                },
              })
              .to(inner, { scale: 0.92, ease: 'none' }, 0)
              .to(shade, { opacity: 0.6, ease: 'none' }, 0)
          }
          if (i > 0) {
            gsap.fromTo(
              card.querySelector('.lt-card__media-in'),
              { scale: 1.14, transformOrigin: '50% 100%' },
              { scale: 1, ease: 'none', scrollTrigger: { trigger: anchors[i], start: 'top bottom', end: 'top top', scrub: true } },
            )
          }
        })
      })

      mm.add('(prefers-reduced-motion: no-preference)', () => {
        cards.forEach((card, i) => {
          const tl = gsap.timeline({ scrollTrigger: { trigger: anchors[i], start: 'top 60%', toggleActions: 'play none none reverse' } })
          tl.from(card.querySelector('.lt-card__name-i'), { yPercent: 105, duration: 1.1, ease: 'ltOut' }, 0)
          tl.from(card.querySelectorAll('[data-cr]'), { y: 24, autoAlpha: 0, duration: 0.9, ease: 'ltOut', stagger: 0.05 }, 0.1)
        })
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <section className="lt-sec lt-cases" id="lt-selected" ref={ref} aria-labelledby="lt-selected-h">
      <SectionHead no="03" id="lt-selected-h" title="Selected work" aside={`${cases.length} case studies`} />
      <div className="lt-stack">
        {cases.map((p, i) => (
          <Fragment key={p.slug}>
            <span className="lt-card__anchor" id={`lt-case-${p.slug}`} aria-hidden="true" />
            <article
              className={`lt-card lt-card--${p.slug}${i % 2 ? ' is-flip' : ''}`}
              style={{ '--accent': p.accent, '--i': i } as React.CSSProperties}
              aria-labelledby={`lt-card-${p.slug}`}
            >
              <div className="lt-card__in">
                <div className="lt-card__media">
                  <div className="lt-card__media-in">
                    <Media p={p} />
                  </div>
                </div>

                <div className="lt-card__body">
                  <div className="lt-card__meta lt-label" data-cr>
                    <span>
                      {pad2(i + 1)} / {pad2(cases.length)}
                    </span>
                    <span>{p.tier === 'flagship' ? 'Flagship' : 'Featured'}</span>
                    <span>{p.year}</span>
                    <span>{p.status}</span>
                  </div>

                  <h3 className="lt-card__name" id={`lt-card-${p.slug}`}>
                    <span className="lt-card__mask">
                      <span className="lt-card__name-i">{p.name}</span>
                    </span>
                  </h3>
                  <p className="lt-card__kind" data-cr>
                    {p.kind}
                  </p>
                  <p className="lt-card__sum" data-cr>
                    {p.summary}
                  </p>

                  <ol className="lt-card__hl" data-cr>
                    {p.highlights.slice(0, 3).map((h, k) => (
                      <li key={h.title}>
                        <span className="lt-label">{pad2(k + 1)}</span>
                        <div>
                          <strong>{h.title}</strong>
                          <p>{h.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>

                  <dl className="lt-card__stats" data-cr>
                    {p.stats.slice(0, 4).map((s) => (
                      <div key={s.label}>
                        <dd>{s.value}</dd>
                        <dt className="lt-label">{s.label}</dt>
                      </div>
                    ))}
                  </dl>

                  <div className="lt-card__foot" data-cr>
                    <span className="lt-label">
                      {p.role}
                      {p.credit && <> · {p.credit}</>}
                    </span>
                    <ul className="lt-links">
                      {p.links.map((l) => (
                        <li key={l.href}>
                          <a href={l.href} target="_blank" rel="noreferrer">
                            {l.label}
                            <span aria-hidden="true"> ↗</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="lt-card__shade" aria-hidden="true" />
              </div>
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  )
}
