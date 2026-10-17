import { useEffect, useState } from 'react'

const timeFmt = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})
const zoneFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', timeZoneName: 'short' })

/** Ticks once a second. Keep it in tiny leaf components so nothing else re-renders. */
export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    let id = 0
    // align ticks to the wall-clock second so the display never lags by ~1s
    const start = window.setTimeout(() => {
      setNow(new Date())
      id = window.setInterval(() => setNow(new Date()), ms)
    }, ms - (Date.now() % ms))
    return () => {
      window.clearTimeout(start)
      window.clearInterval(id)
    }
  }, [ms])
  return now
}

export function LondonTime({ zone = true }: { zone?: boolean }) {
  const now = useNow()
  const z = zoneFmt.formatToParts(now).find((p) => p.type === 'timeZoneName')?.value ?? 'UK'
  return (
    <span className="lt-time">
      <time dateTime={now.toISOString()}>{timeFmt.format(now)}</time>
      {zone && <span className="lt-time__z"> {z}</span>}
    </span>
  )
}
