import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { dayJob, profile, timeline } from '../../content'
import { Tape, Tri } from './film'
import { markTimeline } from './FilmAdvance'
import { GreaseNote } from './marks'

/** Line drawing of an OM-1, front-on. Every stroke is drawn in on scroll. */
function OM1() {
  return (
    <svg className="cs-cam" viewBox="0 0 400 250" role="img" aria-label="Line drawing of an Olympus OM-1">
      <g className="cs-cam__lines">
        {/* top plate + prism */}
        <path d="M34 78V66c0-6 4-10 10-10h96l20-40h80l20 40h96c6 0 10 4 10 10v12" />
        <path d="M168 24h64M176 16l-8 8M224 16l8 8" />
        <path d="M56 56v-14h42v14M62 42v-6h30v6" />
        <path d="M300 56v-6h52v6M326 50v-8" />
        <path d="M278 52h14v4h-14z" />
        {/* body */}
        <path d="M22 82c0-6 5-8 12-8h332c7 0 12 2 12 8v120c0 10-6 16-16 16H38c-10 0-16-6-16-16z" />
        <path d="M22 106h105M273 106h105M22 196h108M270 196h108" />
        {/* lens mount + barrel */}
        <circle cx="200" cy="150" r="78" />
        <circle cx="200" cy="150" r="66" />
        <circle cx="200" cy="150" r="50" />
        <circle cx="200" cy="150" r="30" />
        <path d="M184 136c6-6 16-8 24-4" />
        {/* knurled focus ring */}
        <path d="M200 72v8M239 82l-4 7M268 111l-7 4M278 150h-8M268 189l-7-4M239 218l-4-7M200 228v-8M161 218l4-7M132 189l7-4M122 150h8M132 111l7 4M161 82l4 7" />
        {/* self-timer + strap lugs */}
        <circle cx="84" cy="128" r="11" />
        <path d="M84 117v-8" />
        <path d="M22 92h-8v12h8M378 92h8v12h-8" />
        <text x="200" y="44" textAnchor="middle" className="cs-cam__txt">
          OM-1
        </text>
      </g>
    </svg>
  )
}

/** A generic digital body, for the second camera. */
function Digital() {
  return (
    <svg className="cs-cam cs-cam--digital" viewBox="0 0 400 250" role="img" aria-label="Line drawing of a digital camera">
      <g className="cs-cam__lines">
        <path d="M40 92c0-8 6-14 14-14h86l18-34h84l18 34h86c8 0 14 6 14 14v104c0 10-8 18-18 18H58c-10 0-18-8-18-18z" />
        <path d="M40 104c-12 0-18 10-18 22v52c0 12 8 20 20 20" />
        <path d="M300 78v-12h44v12M60 78v-8h30v8" />
        <circle cx="200" cy="150" r="70" />
        <circle cx="200" cy="150" r="56" />
        <circle cx="200" cy="150" r="36" />
        <path d="M186 136c6-5 14-6 21-3" />
        <circle cx="330" cy="104" r="8" />
      </g>
    </svg>
  )
}

export default function Notes() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        gsap.utils.toArray<SVGElement>('.cs-cam').forEach((svg) => {
          const lines = svg.querySelectorAll('.cs-cam__lines path, .cs-cam__lines circle')
          gsap.fromTo(
            lines,
            { drawSVG: '0%' },
            {
              drawSVG: '100%',
              duration: 1.4,
              ease: 'power2.inOut',
              stagger: 0.04,
              scrollTrigger: { trigger: svg, start: 'top 80%', once: true },
            },
          )
        })
        gsap.utils.toArray<HTMLElement>('[data-marks]').forEach((g) => {
          const tl = markTimeline(g)
          ScrollTrigger.create({ trigger: g, start: 'top 75%', once: true, onEnter: () => tl.play() })
        })
        gsap.from('.cs-log li', {
          opacity: 0,
          x: -14,
          duration: 0.6,
          ease: 'power2.out',
          stagger: 0.07,
          scrollTrigger: { trigger: '.cs-log', start: 'top 78%', once: true },
        })
        gsap.fromTo(
          '.cs-daycard',
          { rotation: 4, y: 60 },
          {
            rotation: -1.6,
            y: 0,
            ease: 'power2.out',
            scrollTrigger: { trigger: '.cs-daycard', start: 'top bottom', end: 'top 45%', scrub: 0.8 },
          },
        )
      })
    },
    { scope: root },
  )

  const [first, ...more] = profile.bio
  return (
    <section className="cs-notes" id="cs-notes" ref={root} aria-labelledby="cs-notes-title">
      <div className="cs-notebook">
        <div className="cs-notebook__margin" aria-hidden="true" />
        <header className="cs-notebook__head">
          <p className="cs-kicker">
            <span>Lab book</span>
            <Tri />
            <span>p. 36</span>
          </p>
          <h2 className="cs-h2" id="cs-notes-title">
            Darkroom <em>notes</em>
          </h2>
        </header>

        <div className="cs-notebook__bio">
          <p className="cs-bio__lead">{first}</p>
          {more.map((b) => (
            <p key={b}>{b}</p>
          ))}
        </div>

        <div className="cs-notebook__log">
          <h3 className="cs-notebook__sub">
            <span>Exposure log</span>
            <span className="cs-notebook__subr">year · entry · place</span>
          </h3>
          <ol className="cs-log">
            {timeline.map((t) => (
              <li key={`${t.year}-${t.title}`}>
                <span className="cs-log__y">{t.year}</span>
                <span className="cs-log__body">
                  <span className="cs-log__t">{t.title}</span>
                  <span className="cs-log__d">{t.detail}</span>
                </span>
                <span className="cs-log__p">{t.place}</span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="cs-daycard" aria-labelledby="cs-day-title">
          <Tape className="cs-tape--top" />
          <p className="cs-kicker">
            <span>Day job</span>
            <Tri />
            <span>{dayJob.place}</span>
          </p>
          <h3 className="cs-daycard__t" id="cs-day-title">
            {dayJob.title}
          </h3>
          <p className="cs-daycard__s">{dayJob.summary}</p>
          <dl className="cs-daycard__stats">
            {dayJob.stats.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </aside>

        <div className="cs-notebook__kit">
          <h3 className="cs-notebook__sub">
            <span>In the bag</span>
            <span className="cs-notebook__subr">cameras</span>
          </h3>
          <div className="cs-kit">
            {profile.cameras.map((c, i) => (
              <figure className="cs-kit__item" key={c.name}>
                {i === 0 ? <OM1 /> : <Digital />}
                {i === 0 && (
                  <span className="cs-kit__mark" data-marks="">
                    <GreaseNote text="loaded" />
                  </span>
                )}
                <figcaption>
                  <span className="cs-kit__name">{c.name}</span>
                  <span className="cs-kit__kind">{c.kind}</span>
                  <span className="cs-kit__detail">{c.detail}</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>

        <div className="cs-notebook__chem">
          <h3 className="cs-notebook__sub">
            <span>Chemistry</span>
            <span className="cs-notebook__subr">the stack</span>
          </h3>
          <dl className="cs-chem">
            {Object.entries(profile.stack).map(([k, v]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>{v.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}
