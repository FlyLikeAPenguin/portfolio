import { useEffect, useRef, useState } from 'react'

/** One mechanical flip card. Uses the "previous value in state" pattern to replay the flip. */
function Card({ v }: { v: string }) {
  const [s, setS] = useState({ cur: v, prev: v, n: 0 })
  if (s.cur !== v) setS({ cur: v, prev: s.cur, n: s.n + 1 })
  return (
    <span className="vf-flip__d">
      <span className="vf-flip__half vf-flip__top">
        <span>{s.cur}</span>
      </span>
      <span className="vf-flip__half vf-flip__bot">
        <span>{s.n ? s.prev : s.cur}</span>
      </span>
      {s.n > 0 && (
        <>
          <span key={`t${s.n}`} className="vf-flip__half vf-flip__top vf-flip__flap-top">
            <span>{s.prev}</span>
          </span>
          <span key={`b${s.n}`} className="vf-flip__half vf-flip__bot vf-flip__flap-bot">
            <span>{s.cur}</span>
          </span>
        </>
      )}
    </span>
  )
}

const Pair = ({ n, label }: { n: number; label: string }) => {
  const t = String(n).padStart(2, '0')
  return (
    <span className="vf-flip__unit">
      <span className="vf-flip__pair">
        <Card v={t[0]} />
        <Card v={t[1]} />
      </span>
      <span className="vf-engr">{label}</span>
    </span>
  )
}

/**
 * A mission clock that does what Joe's fork does: counts down to T−0 and keeps going
 * through it into T+, firing "liftoff" exactly once. Arms 10 seconds out when first seen.
 */
export default function FlipClock() {
  const ref = useRef<HTMLDivElement>(null)
  const [t0, setT0] = useState<number | null>(null)
  const [now, setNow] = useState(0)
  const [visible, setVisible] = useState(false)
  const [fired, setFired] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  useEffect(() => {
    if (!visible) return
    const start = Date.now()
    setT0((t) => t ?? start + 10_000)
    setNow(start)
    const id = window.setInterval(() => setNow(Date.now()), 200)
    return () => window.clearInterval(id)
  }, [visible])

  const diff = t0 === null ? -10_000 : now - t0
  const plus = diff >= 0
  const total = plus ? Math.floor(diff / 1000) : Math.ceil(-diff / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60

  useEffect(() => {
    if (plus && t0 !== null && !fired) setFired(true)
  }, [plus, t0, fired])

  return (
    <div ref={ref} className="vf-flip" role="timer" aria-label={`Mission clock, T${plus ? 'plus' : 'minus'} ${total} seconds`}>
      <div className="vf-flip__row" aria-hidden="true">
        <span className="vf-flip__unit">
          <span className="vf-flip__pair">
            <span className="vf-flip__t">T</span>
            <Card v={plus ? '+' : '−'} />
          </span>
          <span className="vf-engr">{plus ? 'Plus' : 'Minus'}</span>
        </span>
        <Pair n={h} label="Hrs" />
        <span className="vf-flip__colon">:</span>
        <Pair n={m} label="Min" />
        <span className="vf-flip__colon">:</span>
        <Pair n={s} label="Sec" />
      </div>
      <ol className="vf-flip__steps" aria-hidden="true">
        <li className={fired ? 'is-lit' : ''}>
          <i />
          <span className="vf-engr">Liftoff</span>
        </li>
        <li className={fired && total >= 4 && plus ? 'is-lit' : ''}>
          <i />
          <span className="vf-engr">Separation</span>
        </li>
        <li className={fired && total >= 8 && plus ? 'is-lit' : ''}>
          <i />
          <span className="vf-engr">First contact</span>
        </li>
      </ol>
      <span className="vf-flip__note vf-engr">Recreated in code · armed when it entered the frame</span>
    </div>
  )
}
