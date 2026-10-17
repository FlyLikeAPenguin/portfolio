import { useEffect, useState } from 'react'
import { asset, type Project } from '../../content'

const hms = (s: number) => {
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  return [h, m, s % 60].map((n) => String(n).padStart(2, '0')).join(':')
}

/** Mission Countdown's screenshot is mostly empty, so its preview is a live T+ readout instead. */
function MissionTile({ p, live }: { p: Project; live: boolean }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    if (!live) return
    const t0 = performance.now()
    const id = window.setInterval(() => setT(Math.floor((performance.now() - t0) / 1000)), 1000)
    return () => window.clearInterval(id)
  }, [live])
  return (
    <div className="lt-cover lt-cover--mc" style={{ '--accent': p.accent } as React.CSSProperties}>
      <span className="lt-cover__k">{p.kind}</span>
      <span className="lt-cover__mc">
        <b>T+</b>
        {hms(t)}
      </span>
      <span className="lt-cover__k">Counts through zero</span>
    </div>
  )
}

/** A project's cover as a tile: the image when there is a good one, typography when there isn't. */
export function Cover({ p, live = false, eager = false }: { p: Project; live?: boolean; eager?: boolean }) {
  if (p.slug === 'mission-countdown') return <MissionTile p={p} live={live} />
  if (p.cover)
    return (
      <div className={`lt-cover lt-cover--img lt-cover--${p.slug}`}>
        <img src={asset(p.cover)} alt="" loading={eager ? 'eager' : 'lazy'} decoding="async" />
      </div>
    )
  return (
    <div className="lt-cover lt-cover--type" style={{ '--accent': p.accent } as React.CSSProperties}>
      <span className="lt-cover__k">{p.tier === 'experiment' ? 'Lab' : p.kind}</span>
      <span className="lt-cover__n">{p.name}</span>
      <span className="lt-cover__k">{p.stack.slice(0, 3).join(' · ')}</span>
    </div>
  )
}
