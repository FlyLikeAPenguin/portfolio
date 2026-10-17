import type { ReactNode } from 'react'
import { asset, featured, flagship, type Project } from '../../content'
import FlipClock from './FlipClock'

const bySlug = (slug: string) => featured.find((p) => p.slug === slug)!

function Meta({ p }: { p: Project }) {
  return (
    <p className="le-meta le-ch-meta">
      <span>{p.kind}</span>
      <span className="le-dot" aria-hidden="true" />
      <span>{p.status}</span>
      <span className="le-dot" aria-hidden="true" />
      <span className="le-num">{p.year}</span>
    </p>
  )
}

function Head({ n, label, title, p, className = '' }: { n: string; label: string; title: ReactNode; p: Project; className?: string }) {
  return (
    <header className={`le-ch-head ${className}`}>
      <span className="le-numeral" aria-hidden="true">
        {n}
      </span>
      <div className="le-ch-headtext">
        <p className="le-meta le-gold le-fade">
          Chapter {n} <span className="le-rule" aria-hidden="true" /> {label}
        </p>
        <h2 className="le-ch-title le-display le-split">{title}</h2>
        <div className="le-fade">
          <Meta p={p} />
        </div>
      </div>
    </header>
  )
}

function Links({ p }: { p: Project }) {
  return (
    <p className="le-links le-fade">
      {p.links.map((l) => (
        <a key={l.href} className="le-link" href={l.href} target="_blank" rel="noreferrer">
          <span>{l.label}</span>
          <span className="le-link-arrow" aria-hidden="true">
            ↗
          </span>
        </a>
      ))}
    </p>
  )
}

function Stats({ p, className = '' }: { p: Project; className?: string }) {
  return (
    <dl className={`le-stats ${className}`}>
      {p.stats.map((s) => (
        <div className="le-stat le-fade" key={s.label}>
          <dt className="le-meta">{s.label}</dt>
          <dd className="le-stat-v">{s.value}</dd>
        </div>
      ))}
    </dl>
  )
}

function Highlights({ p, className = '' }: { p: Project; className?: string }) {
  return (
    <ol className={`le-hl ${className}`}>
      {p.highlights.map((h, i) => (
        <li className="le-hl-item le-fade" key={h.title}>
          <span className="le-hl-n" aria-hidden="true">
            {String(i + 1).padStart(2, '0')}
          </span>
          <h3 className="le-hl-title">{h.title}</h3>
          <p className="le-hl-detail">{h.detail}</p>
        </li>
      ))}
    </ol>
  )
}

function Frame({ src, alt, className = '', caption, w, h, eager = false }: { src: string; alt: string; className?: string; caption?: ReactNode; w: number; h: number; eager?: boolean }) {
  return (
    <figure className={`le-figure ${className}`}>
      <div className="le-frame">
        <img src={asset(src)} alt={alt} width={w} height={h} loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
      {caption && <figcaption className="le-caption le-fade">{caption}</figcaption>}
    </figure>
  )
}

const GALLERY_CAPTIONS: Record<string, [string, string]> = {
  'shot-bluffing-reveal': ['Bluffing', 'the reveal, on the host screen'],
  'shot-hot-take': ['Hot Take', 'host screen'],
  'shot-oracle': ['Oracle', 'host screen'],
  'shot-auction': ['Auction', 'host screen'],
  'shot-bingo': ['Bingo', 'a full house, host screen'],
  'shot-oracle-prophecy': ['Emoji Oracle', 'the prophecy, host screen'],
}
const GALLERY_SIZES: Record<string, [number, number]> = {
  'hero-redline': [2172, 724],
  'poster-atlas': [1252, 1252],
}

export function ChapterOne() {
  const p = flagship
  return (
    <section className="le-ch le-ch1" id="le-work" aria-labelledby="le-ch1-title">
      <Head
        n="I"
        label="Flagship"
        p={p}
        title={
          <span id="le-ch1-title">
            quibble<em>.party</em>
          </span>
        }
      />

      <div className="le-ch1-spread">
        <Frame
          className="le-ch1-art"
          src={p.cover}
          w={1586}
          h={992}
          alt="quibble.party key art: a cast of deadpan characters (a question mark at a podium, an ampersand, a paper plane, a rock) argue under a spotlight."
          caption={
            <>
              <span className="le-caption-k">Fig. I</span> Key art. An original cast of deadpan characters.
            </>
          }
        />
        <div className="le-ch1-text">
          <p className="le-lead le-split">{p.oneLiner}</p>
          <p className="le-body le-fade">{p.summary}</p>
          <p className="le-meta le-role le-fade">
            <span className="le-gold">Role</span> {p.role}
          </p>
          <Links p={p} />
        </div>
      </div>

      <div className="le-ch1-lower">
        <p className="le-meta le-gold le-section-k le-fade">What’s inside</p>
        <Highlights p={p} className="le-hl--two" />
      </div>

      <Stats p={p} className="le-stats--row" />
      <p className="le-stack le-meta le-fade">{p.stack.join('  ·  ')}</p>

      <div className="le-hg" role="region" aria-label="quibble.party gallery">
        <div className="le-hg-row">
        <div className="le-hg-intro">
          <p className="le-meta le-gold">Contact prints</p>
          <p className="le-hg-note le-fade">
            Frames from the <em>host screen</em>, and the house style around it.
          </p>
          <p className="le-meta le-hg-hint" aria-hidden="true">
            Keep scrolling <span className="le-hg-arrow">→</span>
          </p>
        </div>
        <ul className="le-hg-track">
          {p.gallery.map((src, i) => {
            const key = src.split('/').pop()!.replace(/\.\w+$/, '')
            const [title, sub] = GALLERY_CAPTIONS[key] ?? [key, '']
            const [w, h] = GALLERY_SIZES[key] ?? [1920, 1080]
            return (
              <li className={`le-hg-item${w / h > 2 ? ' is-wide' : w === h ? ' is-square' : ''}`} key={src}>
                <figure>
                  <div className="le-hg-frame">
                    <img src={asset(src)} alt={`quibble.party: ${title}, ${sub}`} width={w} height={h} loading="lazy" decoding="async" />
                  </div>
                  <figcaption className="le-caption">
                    <span className="le-caption-k">I.{i + 1}</span> {title} <span className="le-caption-sub">{sub}</span>
                  </figcaption>
                </figure>
              </li>
            )
          })}
        </ul>
        </div>
      </div>
    </section>
  )
}

export function ChapterTwo() {
  const p = bySlug('nitpick')
  return (
    <section className="le-ch le-ch2" id="le-nitpick" aria-labelledby="le-ch2-title">
      <Head
        n="II"
        label="Open source"
        p={p}
        className="le-ch-head--right"
        title={
          <span id="le-ch2-title">
            <em>Nit</em>pick
          </span>
        }
      />
      <div className="le-ch2-grid">
        <div className="le-ch2-text">
          <p className="le-lead le-split">{p.oneLiner}</p>
          <p className="le-body le-fade">{p.summary}</p>
          <p className="le-meta le-role le-fade">
            <span className="le-gold">Role</span> {p.role}
          </p>
          <Links p={p} />
        </div>
        <div className="le-ch2-media">
          <Frame className="le-ch2-card" src={p.cover} w={1280} h={640} alt="Nitpick: Datadog errors become Claude root-cause analysis and reviewable pull requests." />
          <Frame
            className="le-ch2-inset"
            src={p.gallery[0]}
            w={1038}
            h={882}
            alt="The Nitpick dashboard: error counts, investigation status and cost per run."
            caption={
              <>
                <span className="le-caption-k">Fig. II</span> The local dashboard.
              </>
            }
          />
        </div>
      </div>
      <div className="le-ch2-lower">
        <Stats p={p} className="le-stats--stack" />
        <Highlights p={p} className="le-hl--grid" />
      </div>
    </section>
  )
}

export function ChapterThree() {
  const p = bySlug('satboard')
  const coord = p.stats.find((s) => s.value.includes('°'))
  const rest = p.stats.filter((s) => s !== coord)
  return (
    <section className="le-ch le-ch3" id="le-satboard" aria-labelledby="le-ch3-title">
      <figure className="le-ch3-globe">
        <div className="le-ch3-globe-in">
          {/* The live screenshot, cut out of its black background so the globe sits in this sky. */}
          <img
            src={asset('concepts/long-exposure/satboard-globe.webp')}
            alt="Satboard: a 3D globe with satellite orbits drawn around the Earth."
            width={780}
            height={760}
            loading="lazy"
            decoding="async"
          />
        </div>
      </figure>
      <Head
        n="III"
        label="Orbital"
        p={p}
        className="le-ch-head--center"
        title={
          <span id="le-ch3-title">
            Sat<em>board</em>
          </span>
        }
      />
      <div className="le-ch3-cols">
        <p className="le-lead le-split">{p.oneLiner}</p>
        <div>
          <p className="le-body le-fade">{p.summary}</p>
          <p className="le-meta le-role le-fade">
            <span className="le-gold">Role</span> {p.role}
          </p>
          {p.credit && <p className="le-credit le-fade">{p.credit}.</p>}
          <Links p={p} />
        </div>
      </div>
      <div className="le-ch3-band">
        {coord && (
          <div className="le-ch3-coord le-fade">
            <span className="le-ch3-coord-v">{coord.value}</span>
            <span className="le-meta">{coord.label} · Svalbard</span>
          </div>
        )}
        <dl className="le-stats le-stats--mini">
          {rest.map((s) => (
            <div className="le-stat le-fade" key={s.label}>
              <dt className="le-meta">{s.label}</dt>
              <dd className="le-stat-v">{s.value}</dd>
            </div>
          ))}
        </dl>
      </div>
      <Highlights p={p} className="le-hl--three" />
    </section>
  )
}

export function ChapterFour() {
  const p = bySlug('mission-countdown')
  return (
    <section className="le-ch le-ch4" id="le-countdown" aria-labelledby="le-ch4-title">
      <Head
        n="IV"
        label="Launch day"
        p={p}
        title={
          <span id="le-ch4-title">
            Mission <em>Countdown</em>
          </span>
        }
      />
      <div className="le-ch4-stage le-fade">
        <FlipClock />
        <p className="le-caption le-ch4-cap">
          <span className="le-caption-k">Fig. IV</span> A live recreation. It counts down, passes zero and keeps going, as the forked clock does.
        </p>
      </div>
      <div className="le-ch4-grid">
        <p className="le-lead le-split">{p.oneLiner}</p>
        <div>
          <p className="le-body le-fade">{p.summary}</p>
          <p className="le-meta le-role le-fade">
            <span className="le-gold">Role</span> {p.role}
          </p>
          <Links p={p} />
        </div>
        <div className="le-ch4-side">
          <Highlights p={p} className="le-hl--list" />
          <Stats p={p} className="le-stats--pair" />
        </div>
      </div>
    </section>
  )
}
