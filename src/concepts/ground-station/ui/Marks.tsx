import { useEffect, useRef } from 'react'
import { STATIONS } from '../scene/orbit'
import { S } from '../store'
import { coord } from './bits'

/** DOM labels pinned to projected 3D positions: the satellite reticle and the station tags. */
export default function Marks() {
  const ret = useRef<HTMLDivElement>(null)
  const tags = useRef<(HTMLDivElement | null)[]>([])
  useEffect(() => {
    S.reticle = ret.current
    S.stationTags = tags.current
    return () => {
      S.reticle = null
      S.stationTags = []
    }
  }, [])
  return (
    <div className="gs-marks" aria-hidden="true">
      <div className="gs-ret" ref={ret} data-link="idle">
        <span className="gs-ret__box" />
        <span className="gs-ret__label">
          <b>JT-1</b> 512 km <i className="gs-ret__aos">AOS</i>
        </span>
      </div>
      {STATIONS.map((s, i) => (
        <div
          className="gs-stag"
          key={s.id}
          data-link="idle"
          ref={(el) => {
            tags.current[i] = el
          }}
        >
          <span className="gs-stag__dot" />
          <span className="gs-stag__t">
            <b>{s.id}</b> {coord(s.lat, s.lon)}
          </span>
        </div>
      ))}
    </div>
  )
}
