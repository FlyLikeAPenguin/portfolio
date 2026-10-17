import { useEffect, useRef, useState } from 'react'

/** One split-flap digit. The old value folds down over the new one. */
function Flap({ v }: { v: string }) {
  const [s, setS] = useState({ cur: v, old: v, n: 0 })
  if (v !== s.cur) setS({ cur: v, old: s.cur, n: s.n + 1 })
  return (
    <span className="lt-flap">
      <span className="lt-flap__h lt-flap__t">
        <span>{s.cur}</span>
      </span>
      <span className="lt-flap__h lt-flap__b">
        <span>{s.old}</span>
      </span>
      {s.n > 0 && (
        <>
          <span key={`t${s.n}`} className="lt-flap__h lt-flap__t lt-flap__ft">
            <span>{s.old}</span>
          </span>
          <span key={`b${s.n}`} className="lt-flap__h lt-flap__b lt-flap__fb">
            <span>{s.cur}</span>
          </span>
        </>
      )}
    </span>
  )
}

const LEAD = 10

/**
 * A demo of Mission Countdown's whole point: start at T−10, flip through zero,
 * and keep counting T+ instead of freezing. Pauses when off-screen.
 */
export function FlipClock({ milestones, pkg }: { milestones: string[]; pkg?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(-LEAD)
  const [run, setRun] = useState(0)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let id = 0
    let t0 = 0
    setT(-LEAD)
    const tick = () => setT(Math.floor((performance.now() - t0) / 1000) - LEAD)
    const io = new IntersectionObserver(
      ([e]) => {
        window.clearInterval(id)
        if (!e.isIntersecting) return
        if (!t0) t0 = performance.now()
        tick()
        id = window.setInterval(tick, 200)
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(id)
    }
  }, [run])

  const a = Math.abs(t)
  const parts = [Math.floor(a / 86400), Math.floor((a % 86400) / 3600), Math.floor((a % 3600) / 60), a % 60].map((n) => String(n).padStart(2, '0'))
  const units = ['Days', 'Hours', 'Minutes', 'Seconds']
  const plus = t >= 0

  return (
    <div className={`lt-clock${plus ? ' is-plus' : ''}`} ref={ref}>
      <div className="lt-clock__top">
        <span className="lt-label">Demo · counts through zero</span>
        <button type="button" className="lt-label lt-clock__replay" onClick={() => setRun((r) => r + 1)}>
          Replay T−{LEAD}
        </button>
      </div>

      <div className="lt-clock__mid">
        <div className="lt-clock__face" role="timer" aria-label={`T${plus ? 'plus' : 'minus'} ${parts.join(':')}`}>
          <span className="lt-clock__sign" aria-hidden="true">
            T{plus ? '+' : '−'}
            {plus && t < 2 && <span className="lt-clock__burst" key={run} />}
          </span>
          {parts.map((p, i) => (
            <span className="lt-clock__grp" key={units[i]} aria-hidden="true">
              <span className="lt-clock__digits">
                <Flap v={p[0]} />
                <Flap v={p[1]} />
              </span>
              <span className="lt-label">{units[i]}</span>
            </span>
          ))}
        </div>

        <ol className="lt-clock__ms">
          {milestones.map((m, i) => {
            const done = i === 0 && plus
            return (
              <li key={m} className={done ? 'is-done' : ''}>
                <span className="lt-clock__tick" aria-hidden="true" />
                <span>{m}</span>
                <span className="lt-label">{done ? 'T+00:00:00' : 'Pending'}</span>
              </li>
            )
          })}
        </ol>
      </div>
      {pkg && (
        <p className="lt-clock__pkg">
          <span className="lt-label">npm</span> {pkg}
        </p>
      )}
    </div>
  )
}
