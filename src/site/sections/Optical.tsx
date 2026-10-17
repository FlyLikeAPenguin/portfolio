import { useEffect, useState } from 'react'
import { asset, photoDate, photoSrc, photos, profile } from '../../content'
import { scrollTo } from '../../lib/useSmoothScroll'
import { ScrollTrigger } from '../fx'
import Downlink from '../ui/Downlink'
import Lightbox from '../ui/Lightbox'
import { Arrow, SecHead } from '../ui/bits'
import { useMedia } from '../useMedia'

const p2 = (n: number) => String(n).padStart(2, '0')

/** Photos on the page before "Show all": the large tile plus four rows of five (two on phones). */
const FEATURED = { desktop: 17, mobile: 9 }

export function Optical() {
  const mobile = useMedia('(max-width: 768px)')
  const [all, setAll] = useState(false)
  const [open, setOpen] = useState<number | null>(null)
  const featured = mobile ? FEATURED.mobile : FEATURED.desktop
  const shown = all ? photos : photos.slice(0, featured)

  // The page got taller or shorter: re-measure the scroll choreography below this section.
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [all])

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
          {shown.map((ph, i) => {
            const date = photoDate(ph)
            return (
              <li key={ph.id} className={`gs-tile ${i === 0 ? 'gs-tile--xl' : ''}`}>
                <Downlink
                  src={asset(photoSrc(ph, 'thumb'))}
                  alt={ph.title}
                  frame={`FRM ${p2(i + 1)}`}
                  name={ph.title.toUpperCase()}
                  ratio={4 / 5}
                  position={ph.pos}
                  seed={i + 17}
                  className="gs-dl--tile"
                >
                  <div className="gs-tile__over" aria-hidden="true">
                    <span className="gs-tile__cross" />
                    <span className="gs-tile__exif">
                      <b>{ph.title}</b>
                      <span>
                        {ph.kind === 'film' ? 'Film' : 'Digital'} · {ph.camera}
                      </span>
                      {ph.settings ? <span>{ph.settings}</span> : null}
                      {date ? <span>{date}</span> : null}
                    </span>
                  </div>
                </Downlink>
                <button type="button" className="gs-tile__open" onClick={() => setOpen(i)} aria-label={`Open photo: ${ph.title}`} />
              </li>
            )
          })}
        </ul>

        <div className="gs-optical__foot">
          {photos.length > featured ? (
            <button
              type="button"
              className="gs-btn"
              aria-expanded={all}
              onClick={() => {
                // Collapsing from the bottom of the grid: bring the gallery back into view.
                if (all) scrollTo('#gs-optical .gs-tiles', -120)
                setAll(!all)
              }}
            >
              <span className="gs-btn__k">{all ? 'Show fewer' : 'Show all'}</span>
              <span className="gs-btn__v">{all ? `${featured} frames` : `${photos.length} frames`}</span>
            </button>
          ) : null}
          <a className="gs-btn" href={profile.links.instagram} target="_blank" rel="noreferrer">
            <span className="gs-btn__k">Instagram</span>
            <span className="gs-btn__v">More photos</span>
            <Arrow />
          </a>
        </div>
      </div>

      {open !== null ? <Lightbox photos={photos} index={open} onIndex={setOpen} onClose={() => setOpen(null)} /> : null}
    </section>
  )
}
