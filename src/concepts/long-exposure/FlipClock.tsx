import { useEffect, useRef, useState } from 'react'

/**
 * A minimal flip clock that counts down to T-0 and keeps going, the way Mission Countdown's
 * forked clock does. It arms when scrolled into view: T−10s, liftoff, then T+ forever.
 */
function FlipDigit({ value }: { value: string }) {
  const [state, setState] = useState({ cur: value, prev: value, n: 0 })
  if (state.cur !== value) setState({ cur: value, prev: state.cur, n: state.n + 1 })
  const { cur, prev, n } = state
  return (
    <span className="le-flip" aria-hidden="true">
      <span className="le-flip-half le-flip-top">
        <span>{cur}</span>
      </span>
      <span className="le-flip-half le-flip-bottom">
        <span>{n ? prev : cur}</span>
      </span>
      {n > 0 && (
        <>
          <span key={`t${n}`} className="le-flip-half le-flip-top le-flip-flap-top">
            <span>{prev}</span>
          </span>
          <span key={`b${n}`} className="le-flip-half le-flip-bottom le-flip-flap-bottom">
            <span>{cur}</span>
          </span>
        </>
      )}
    </span>
  )
}

const pad = (n: number) => String(n).padStart(2, '0')
const LEAD = 10

export default function FlipClock() {
  const ref = useRef<HTMLDivElement>(null)
  const [t, setT] = useState(-LEAD)
  const [armed, setArmed] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let zero = 0
    let timer = 0
    let visible = false
    const step = () => {
      if (!zero) zero = performance.now() + LEAD * 1000
      setT(Math.floor((performance.now() - zero) / 1000))
    }
    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting
        if (visible && !timer) {
          setArmed(true)
          step()
          timer = window.setInterval(step, 200)
        } else if (!visible && timer) {
          window.clearInterval(timer)
          timer = 0
        }
      },
      { threshold: 0.35 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      window.clearInterval(timer)
    }
  }, [])

  const neg = t < 0
  const a = Math.abs(t)
  const hh = pad(Math.floor(a / 3600) % 100)
  const mm = pad(Math.floor((a % 3600) / 60))
  const ss = pad(a % 60)
  const groups = [
    { k: 'h', v: hh, l: 'hrs' },
    { k: 'm', v: mm, l: 'min' },
    { k: 's', v: ss, l: 'sec' },
  ]
  const lifted = armed && !neg

  return (
    <div className={`le-clock${lifted ? ' is-lifted' : ''}`} ref={ref}>
      <div className="le-clock-row" role="timer" aria-label={`T${neg ? ' minus' : ' plus'} ${hh} hours ${mm} minutes ${ss} seconds`}>
        <span className="le-clock-sign" aria-hidden="true">
          T<span className="le-clock-pm">{neg ? '−' : '+'}</span>
        </span>
        {groups.map((g, gi) => (
          <span className="le-clock-group" key={g.k}>
            {gi > 0 && (
              <span className="le-clock-colon" aria-hidden="true">
                :
              </span>
            )}
            <span className="le-clock-pair">
              <FlipDigit value={g.v[0]} />
              <FlipDigit value={g.v[1]} />
              <span className="le-clock-unit" aria-hidden="true">
                {g.l}
              </span>
            </span>
          </span>
        ))}
      </div>
      <ol className="le-clock-steps" aria-label="Demo milestones">
        <li className={lifted ? 'is-done' : ''}>
          <span className="le-clock-dot" /> Liftoff
        </li>
        <li className={lifted && t >= 8 ? 'is-done' : ''}>
          <span className="le-clock-dot" /> Separation
        </li>
        <li className={lifted && t >= 20 ? 'is-done' : ''}>
          <span className="le-clock-dot" /> First contact
        </li>
      </ol>
    </div>
  )
}
