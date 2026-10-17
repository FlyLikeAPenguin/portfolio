import { useState } from 'react'
import { asset, currentJob, dayJob, orbitPhotos, previousJob, profile, skyPhotos, timeline } from '../../../content'
import { PASS_STATIONS } from '../plan'
import Downlink from '../ui/Downlink'
import { Arrow, ExtLink, PassHeader, Readout, SecHead } from '../ui/bits'
import { Tags } from './Passes'

const p2 = (n: number) => String(n).padStart(2, '0')

/* ─────────────────────────────── PASS 06 · ground segment (career) ─────────────────────────────── */

const stationCode = (place: string) =>
  ({ UK: 'UK', Sheffield: 'SHF', Tokyo: 'TKY', London: 'LDN' })[place] ?? place.slice(0, 3).toUpperCase()

export function Ground() {
  const plan = [...timeline].reverse()
  const nowRow = timeline.find((t) => t.org === currentJob.org)
  const lastRow = timeline.find((t) => t.org === previousJob.org)
  const prev = timeline.filter((t) => t.org === dayJob.org)
  const prevDates = prev.length ? `${prev[0].period.split(' – ')[0]} – ${prev[prev.length - 1].period.split(' – ').pop()}` : dayJob.place
  return (
    <section className="gs-pass gs-pass--ground" id="gs-ground" data-pass="6" data-sec="07" data-sec-label="Pass 06 · Career history" aria-labelledby="gs-ground-h">
      <div className="gs-wrap">
        <div data-shot="p6a">
          <PassHeader sec="07" pass="06" station={PASS_STATIONS[5]} />
        </div>
        <div data-shot="p6b">
        <div className="gs-career__head">
          <p className="gs-kicker" data-scr>
            Ground segment · contact plan
          </p>
          <h2 className="gs-h3" id="gs-ground-h" data-scr>
            Career history
          </h2>
        </div>

        <div className="gs-career__row gs-career__row--line">
          <p className="gs-career__k gs-career__k--now">
            <i className="gs-live-dot" aria-hidden="true" /> Now
          </p>
          <p className="gs-nowline">
            <span className="gs-nowline__t">{currentJob.title}</span>
            <span className="gs-nowline__org">{currentJob.org}</span>
            <span className="gs-nowline__d">{nowRow ? `${nowRow.period} · ${nowRow.place}` : currentJob.place}</span>
          </p>
        </div>

        <div className="gs-career__row">
          <p className="gs-career__k">Previously</p>
          <article className="gs-panel gs-now">
            <div className="gs-panel__head">
              <span>Last station</span>
              <span>{lastRow ? `${lastRow.period} · ${lastRow.place}` : previousJob.place}</span>
            </div>
            <div className="gs-now__body">
              <div>
                <h3 className="gs-now__t">{previousJob.title}</h3>
                <p className="gs-now__org">{previousJob.org}</p>
              </div>
              <div className="gs-now__r">
                <p className="gs-now__s">{previousJob.summary}</p>
                <Tags items={previousJob.stack} label="Stack" />
              </div>
            </div>
          </article>
        </div>

        <div className="gs-career__row gs-career__row--prev">
          <p className="gs-career__k">Before that</p>
          <article className="gs-prev">
            <div className="gs-prev__head">
              <span className="gs-prev__org">{dayJob.org}</span>
              <span>{prevDates} · Tokyo</span>
            </div>
            <div className="gs-prev__body">
              <div>
                <h3 className="gs-prev__t">{dayJob.title}</h3>
                <p className="gs-prev__s">{dayJob.summary}</p>
              </div>
              <div className="gs-tele gs-tele--sm gs-tele--prev" data-n={dayJob.stats.length}>
                {dayJob.stats.map((st, i) => (
                  <Readout key={st.label} ch={`CH-${p2(i + 1)}`} value={st.value} label={st.label} mode={st.value === '2×' ? undefined : 'scramble'} />
                ))}
              </div>
            </div>
          </article>
        </div>

        <SecHead n="07.1" aside="AOS = acquisition of signal">
          Contact plan
        </SecHead>
        <div className="gs-panel gs-panel--table">
          <table className="gs-table gs-table--plan">
            <thead>
              <tr>
                <th scope="col">AOS</th>
                <th scope="col">Station</th>
                <th scope="col">Role</th>
                <th scope="col" className="gs-col-wide">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.map((t, i) => {
                const code = stationCode(t.place)
                const now = i === 0
                return (
                  <tr key={t.period + t.title} data-reveal data-hot={t.org === dayJob.org ? '1' : undefined} data-live={now ? '1' : undefined}>
                    <td className="gs-mono gs-mint gs-nowrap">{t.period}</td>
                    <td className="gs-mono gs-nowrap">
                      <span className="gs-stn">{code}</span>
                      <span className="gs-stn__place">{t.place}</span>
                    </td>
                    <th scope="row">
                      <span className="gs-table__name">
                        {t.title}
                        {now ? <span className="gs-live">Now</span> : null}
                      </span>
                      <span className="gs-table__kind">{t.org}</span>
                    </th>
                    <td className="gs-col-wide gs-muted-t">{t.detail}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        </div>
      </div>
    </section>
  )
}

/* ─────────────────────────────── payload: optical ─────────────────────────────── */

export function Optical() {
  const photos = [...skyPhotos.slice(1, 2), ...skyPhotos.slice(0, 1), ...skyPhotos.slice(2), ...orbitPhotos]
  return (
    <section className="gs-optical" id="gs-optical" data-shot="opt" data-sec="08" data-sec-label="Payload · Optical" aria-labelledby="gs-optical-h">
      <div className="gs-wrap">
        <SecHead n="08" aside="Imaging mode">
          Payload · optical
        </SecHead>
        <div className="gs-optical__head">
          <h2 className="gs-h2" id="gs-optical-h" data-scr>
            Ground-based optical
          </h2>
          <div className="gs-optical__cap">
            <p>{profile.bio[2]}</p>
            <ul className="gs-cams">
              {profile.cameras.map((c) => (
                <li key={c.name}>
                  <span className="gs-label">{c.kind}</span>
                  <b>{c.name}</b>
                  <span>{c.detail}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ul className="gs-tiles">
          {photos.map((ph, i) => {
            const r = Math.floor(i / 5)
            const c = i % 5
            return (
              <li key={ph.src} className={`gs-tile ${i === 0 ? 'gs-tile--xl' : ''}`}>
                <Downlink src={asset(ph.src)} alt={ph.title} frame={`TILE R${p2(r + 1)}·C${p2(c + 1)}`} name={ph.title.toUpperCase()} ratio={1} seed={i + 17} className="gs-dl--tile">
                  <div className="gs-tile__over">
                    <span className="gs-tile__cross" aria-hidden="true" />
                    <span className="gs-tile__exif">
                      <b>{ph.title}</b>
                      <span>
                        {ph.kind === 'film' ? 'Film' : 'Digital'} · {ph.stock}
                      </span>
                      <span>{ph.settings}</span>
                      <a href={ph.credit.url} target="_blank" rel="noreferrer">
                        © {ph.credit.author}
                      </a>
                    </span>
                  </div>
                </Downlink>
              </li>
            )
          })}
        </ul>
        <p className="gs-note">Placeholder frames, credited on hover, standing in for Joe’s own photography.</p>
      </div>
    </section>
  )
}

/* ─────────────────────────────── open a channel ─────────────────────────────── */

export function Contact() {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable: the mailto link still works */
    }
  }
  const links = [
    { k: 'GitHub', v: profile.links.github.replace(/^https:\/\/(www\.)?/, ''), href: profile.links.github },
    { k: 'LinkedIn', v: profile.links.linkedin.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''), href: profile.links.linkedin },
    { k: 'Instagram', v: profile.links.instagram.replace(/^https:\/\/(www\.)?/, '').replace(/\/$/, ''), href: profile.links.instagram },
  ]
  return (
    <section className="gs-contact" id="gs-contact" data-shot="end" data-sec="09" data-sec-label="Uplink · Open a channel" aria-labelledby="gs-contact-h">
      <div className="gs-wrap">
        <SecHead n="09" aside="Uplink window open">
          Uplink
        </SecHead>
        <h2 className="gs-contact__h" id="gs-contact-h" data-scr>
          Open a channel
        </h2>
        <div className="gs-contact__grid">
          <div className="gs-contact__mail">
            <span className="gs-label">Frequency</span>
            <a className="gs-contact__email" href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <div className="gs-contact__actions">
              <a className="gs-tx" href={`mailto:${profile.email}?subject=${encodeURIComponent('Hello Joe')}`}>
                <span className="gs-tx__wave" aria-hidden="true">
                  {Array.from({ length: 14 }, (_, i) => (
                    <i key={i} style={{ animationDelay: `${(i * 0.07).toFixed(2)}s` }} />
                  ))}
                </span>
                <span className="gs-tx__t">Transmit</span>
                <Arrow />
              </a>
              <button type="button" className="gs-copy" onClick={copy} aria-live="polite">
                {copied ? 'Copied ✓' : 'Copy address'}
              </button>
            </div>
          </div>
          <ul className="gs-contact__links">
            {links.map((l, i) => (
              <li key={l.k}>
                <ExtLink href={l.href} className="gs-row">
                  <span className="gs-row__n">{p2(i + 1)}</span>
                  <span className="gs-row__k">{l.k}</span>
                  <span className="gs-row__v">{l.v}</span>
                </ExtLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <footer className="gs-foot">
        <div className="gs-wrap gs-foot__wrap">
          <span>GS-LDN · 51.5072°N 0.1276°W</span>
          <span className="gs-foot__tle" aria-hidden="true">
            1 26290U 18246A&nbsp;&nbsp;26290.50000000 .00000000 00000-0 00000-0 0 9991
          </span>
          <span>
            Set in IBM Plex Sans Condensed &amp; Plex Mono · Earth: NASA Blue &amp; Black Marble · © {new Date().getFullYear()} {profile.name}
          </span>
        </div>
      </footer>
    </section>
  )
}
