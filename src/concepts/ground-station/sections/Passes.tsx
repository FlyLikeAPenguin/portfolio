import type { ReactNode } from 'react'
import { asset, featured, flagship, type Project } from '../../../content'
import { STATIONS } from '../scene/orbit'
import { PASS_STATIONS, deltaLon } from '../plan'
import Downlink from '../ui/Downlink'
import FlipClock from '../ui/FlipClock'
import Pipeline from '../ui/Pipeline'
import { Arrow, PassHeader, Readout, coord } from '../ui/bits'

const bySlug = (slug: string) => featured.find((p) => p.slug === slug)!
const file = (p: string) => p.split('/').pop()!.toUpperCase()
const frameId = (n: number) => `FRM 0x${(0x2a40 + n * 37).toString(16).toUpperCase()}`
const p2 = (n: number) => String(n).padStart(2, '0')
const host = (href: string) => href.replace(/^https?:\/\/(www\.)?/, '').replace(/[/?].*$/, '')
const HD = 16 / 9

/** Interstitial between passes: the satellite goes once around while the Earth turns. */
export function Transit({ id, next }: { id: string; next: number }) {
  const st = STATIONS[PASS_STATIONS[next]]
  return (
    <div className="gs-transit" data-shot={id} aria-hidden="true">
      <div className="gs-transit__in">
        <span className="gs-transit__k">
          Transit <i>·</i> orbit {p2(next + 1)}
        </span>
        <span className="gs-transit__big">
          Next AOS <b>STN {st.id}</b>
        </span>
        <span className="gs-transit__m">
          {coord(st.lat, st.lon)} <i>·</i> Earth turns +{next > 0 ? deltaLon(next) : '12.0'}°
        </span>
        <span className="gs-transit__bar" data-scrub-bar>
          <i />
        </span>
      </div>
    </div>
  )
}

/** Live / GitHub: the main call to action for every project. */
export function Uplinks({ p }: { p: Project }) {
  return (
    <div className="gs-uplinks">
      {p.links.map((l, i) => (
        <a key={l.href} className={`gs-btn ${i === 0 ? 'gs-btn--primary' : ''}`} href={l.href} target="_blank" rel="noreferrer">
          <span className="gs-btn__k">{l.label}</span>
          <span className="gs-btn__v">{host(l.href)}</span>
          <Arrow />
        </a>
      ))}
    </div>
  )
}

export function Tags({ items, label = 'Payload' }: { items: string[]; label?: string }) {
  return (
    <div className="gs-tags">
      <span className="gs-label">{label}</span>
      <ul>
        {items.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ul>
    </div>
  )
}

/** Left of the pass: what it is, a line or two, then the links and tags on one row. */
function Brief({ p, id, nod }: { p: Project; id: string; nod?: string }) {
  return (
    <div className="gs-brief">
      <p className="gs-kicker" data-scr>
        {p.kind}
      </p>
      <h2 className="gs-pname" id={id} data-scr>
        {p.name}
      </h2>
      {nod ? (
        <p className="gs-nod">
          <span aria-hidden="true">↳</span> {nod}
        </p>
      ) : null}
      <p className="gs-oneliner" data-stream>
        {p.oneLiner}
      </p>
      <p className="gs-summary" data-stream>
        {p.summary}
      </p>
      <div className="gs-brief__act">
        <Uplinks p={p} />
        <Tags items={p.stack} />
      </div>
    </div>
  )
}

/** Right of the pass: the numbers, then status / year / role as data rows. */
function Telemetry({ p, title = 'Telemetry' }: { p: Project; title?: string }) {
  return (
    <aside className="gs-panel gs-telem" aria-label={`${p.name} stats`}>
      <div className="gs-panel__head">
        <span>{title}</span>
        <span>CH 01–{p2(p.stats.length)}</span>
      </div>
      <div className="gs-telem__grid" data-n={p.stats.length}>
        {p.stats.map((s, i) => (
          <Readout key={s.label} ch={`CH-${p2(i + 1)}`} value={s.value} label={s.label} mode={/\d/.test(s.value) && !/^SGP/.test(s.value) ? undefined : 'scramble'} />
        ))}
      </div>
      <dl className="gs-telem__meta">
        <div>
          <dt>Status</dt>
          <dd>{p.status}</dd>
        </div>
        <div>
          <dt>Year</dt>
          <dd>{p.year}</dd>
        </div>
        <div>
          <dt>Role</dt>
          <dd>{p.role}</dd>
        </div>
      </dl>
    </aside>
  )
}

/**
 * One pass, sized to its content: header (AOS), brief beside telemetry, and the downlinked
 * visuals straight underneath so the title and the first row of pictures share a screen.
 */
function Pass({ p, n, sec, title, nod, children, panel }: { p: Project; n: number; sec: string; title?: string; nod?: string; children: ReactNode; panel?: ReactNode }) {
  return (
    <section className="gs-pass" id={`gs-p${n}`} data-pass={n} data-sec={sec} data-sec-label={`Pass ${p2(n)} · ${p.name}`} aria-labelledby={`gs-p${n}-h`}>
      <div className="gs-wrap">
        <div data-shot={`p${n}a`}>
          <PassHeader sec={sec} pass={p2(n)} station={PASS_STATIONS[n - 1]} title={title} />
        </div>
        <div className="gs-stage" data-shot={`p${n}b`}>
          <div className="gs-stage__body">
            <Brief p={p} id={`gs-p${n}-h`} nod={nod} />
            {panel ?? <Telemetry p={p} />}
          </div>
          <div className="gs-vis">{children}</div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── PASS 01 · flagship ─────────────────────────────── */

export function PassQuibble() {
  const p = flagship
  const gallery = [
    { src: 'projects/quibble/home-hero.webp', w: 1840, h: 1193, alt: `${p.name} homepage: “One room. All in.” with the house-style cast`, pos: '50% 38%' },
    { src: p.gallery[5], w: 1920, h: 1080, alt: `${p.name} gameplay: Emoji Oracle, a film guessed from 🐭👨‍🍳` },
    { src: p.gallery[0], w: 1920, h: 1080, alt: `${p.name} gameplay: the bluffing reveal screen` },
    { src: p.gallery[1], w: 1920, h: 1080, alt: `${p.name} gameplay: Hot Take` },
    { src: p.gallery[4], w: 1920, h: 1080, alt: `${p.name} gameplay: Bingo, a full house called on the host screen` },
    { src: p.gallery[3], w: 1920, h: 1080, alt: `${p.name} gameplay: the auction` },
  ]
  return (
    <Pass p={p} n={1} sec="02" title="Flagship">
      {gallery.map((g, i) => (
        <Downlink key={g.src} className="gs-vis__4" src={asset(g.src)} alt={g.alt} frame={frameId(i)} name={file(g.src)} w={g.w} h={g.h} ratio={HD} position={g.pos} seed={i + 3} />
      ))}
    </Pass>
  )
}

/* ─────────────────────────────── PASS 02 · Nitpick ─────────────────────────────── */

export function PassNitpick() {
  const p = bySlug('nitpick')
  return (
    <Pass p={p} n={2} sec="03">
      <div className="gs-vis__8 gs-panel gs-panel--pipe">
        <div className="gs-panel__head">
          <span>Signal chain</span>
          <span>Datadog → Claude → GitHub</span>
        </div>
        <Pipeline />
      </div>
      <Downlink className="gs-vis__4" src={asset(p.gallery[0])} alt="Nitpick dashboard: error list with service, error and cost columns" frame={frameId(8)} name={file(p.gallery[0])} w={1038} h={882} ratio={HD} seed={11} position="left top" />
    </Pass>
  )
}

/* ─────────────────────────────── PASS 03 · Satboard ─────────────────────────────── */

export function PassSatboard() {
  const p = bySlug('satboard')
  const alt = 'Satboard: a 3D globe with satellite orbits and a ground-station pass timeline'
  return (
    <Pass p={p} n={3} sec="04" nod="You’re looking at a cousin of this.">
      <Downlink className="gs-vis__8" src={asset(p.cover)} alt={alt} frame={frameId(9)} name={file(p.cover)} w={1600} h={1000} ratio={2.2} seed={5} position="50% 52%" />
      <Downlink className="gs-vis__4" src={asset(p.cover)} alt="" frame={`${frameId(9)} · DETAIL 3×`} name="Orbit tracks" ratio={1.07} seed={6} position="53% 18%" zoom={3} />
      {p.credit ? <p className="gs-credit gs-vis__12">{p.credit}</p> : null}
    </Pass>
  )
}

/* ─────────────────────────────── PASS 04 · Mission Countdown ─────────────────────────────── */

export function PassCountdown() {
  const p = bySlug('mission-countdown')
  return (
    <Pass p={p} n={4} sec="05">
      <div className="gs-vis__12 gs-panel gs-panel--clock" aria-label="Flip clock recreation">
        <FlipClock />
      </div>
    </Pass>
  )
}

/* ─────────────────────────────── PASS 05 · Genki Flashcards ─────────────────────────────── */

export function PassGenki() {
  const p = bySlug('genki')
  const frames = [
    { src: p.cover, alt: `${p.name}: card front showing the kanji 何, with the lesson list` },
    { src: p.gallery[0], alt: `${p.name}: card back with the readings なに / なん and the meaning “what”` },
  ]
  return (
    <Pass p={p} n={5} sec="06">
      {frames.map((f, i) => (
        <Downlink key={f.src} className="gs-vis__6" src={asset(f.src)} alt={f.alt} frame={frameId(12 + i)} name={file(f.src)} w={1600} h={1143} ratio={HD} seed={21 + i} />
      ))}
    </Pass>
  )
}
