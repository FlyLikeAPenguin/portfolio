import { useEffect, useState } from 'react'

/*
 * Mission Countdown's own screenshot is mostly empty, so the frame is recreated in code:
 * a flip clock at T+00:00:00 with the launch-day milestones, painted to a canvas once
 * (after the fonts load) and used as an ordinary image so it can be developed, printed and loupe'd.
 */
const W = 1500
const H = 1000


function rng(seed: number) {
  let s = seed >>> 0
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0
    return s / 4294967296
  }
}

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.moveTo(x + r, y)
  g.arcTo(x + w, y, x + w, y + h, r)
  g.arcTo(x + w, y + h, x, y + h, r)
  g.arcTo(x, y + h, x, y, r)
  g.arcTo(x, y, x + w, y, r)
  g.closePath()
}

function burst(g: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string, rand: () => number) {
  const n = 22
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2 + rand() * 0.12
    const r0 = r * (0.18 + rand() * 0.12)
    const r1 = r * (0.75 + rand() * 0.3)
    g.strokeStyle = color
    g.globalAlpha = 0.5 + rand() * 0.5
    g.lineWidth = 2.2
    g.lineCap = 'round'
    g.beginPath()
    g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0)
    g.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1)
    g.stroke()
    g.beginPath()
    g.fillStyle = color
    g.arc(cx + Math.cos(a) * (r1 + 9), cy + Math.sin(a) * (r1 + 9), 2.6, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1
}

async function paint(): Promise<string> {
  try {
    await Promise.all([
      document.fonts.load('500 170px "DM Mono"'),
      document.fonts.load('400 30px "DM Mono"'),
      document.fonts.load('italic 400 60px "Instrument Serif"'),
      document.fonts.load('400 196px "Instrument Serif"'),
    ])
  } catch {
    /* fall back to whatever is available */
  }
  const c = document.createElement('canvas')
  const S = 0.8
  c.width = W * S
  c.height = H * S
  // software-backed: no GPU readback when encoding
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return ''
  g.scale(S, S)
  const rand = rng(1972)

  // night sky
  const bg = g.createRadialGradient(W * 0.5, H * 0.58, 40, W * 0.5, H * 0.5, W * 0.75)
  bg.addColorStop(0, '#1d1b26')
  bg.addColorStop(1, '#060609')
  g.fillStyle = bg
  g.fillRect(0, 0, W, H)
  for (let i = 0; i < 260; i++) {
    g.globalAlpha = 0.15 + rand() * 0.6
    g.fillStyle = '#fff6e6'
    g.beginPath()
    g.arc(rand() * W, rand() * H, rand() * 1.5 + 0.3, 0, Math.PI * 2)
    g.fill()
  }
  g.globalAlpha = 1

  burst(g, 250, 230, 150, '#f2a33a', rand)
  burst(g, 1270, 190, 120, '#e0412b', rand)
  burst(g, 1180, 820, 90, '#f2a33a', rand)

  // header
  g.fillStyle = '#9b958a'
  g.font = '400 30px "DM Mono", monospace'
  g.textAlign = 'center'
  g.fillText('M I S S I O N   C L O C K', W / 2, 200)
  g.fillStyle = '#f2a33a'
  g.font = 'italic 400 64px "Instrument Serif", serif'
  g.fillText('Liftoff', W / 2, 284)

  // flip cards: T+ 00 : 00 : 00
  const cw = 132
  const ch = 196
  const gap = 12
  const groupGap = 58
  const groups = 3
  const total = groups * (cw * 2 + gap) + (groups - 1) * groupGap + 130
  let x = (W - total) / 2
  const y = 360

  g.fillStyle = '#f2a33a'
  g.font = 'italic 400 120px "Instrument Serif", serif'
  g.textAlign = 'left'
  g.fillText('T+', x, y + ch / 2 + 40)
  x += 130

  for (let gi = 0; gi < groups; gi++) {
    for (let k = 0; k < 2; k++) {
      // shadow
      g.fillStyle = 'rgba(0,0,0,0.55)'
      roundRect(g, x + 4, y + 10, cw, ch, 14)
      g.fill()
      // top and bottom halves
      g.fillStyle = '#2b2a30'
      roundRect(g, x, y, cw, ch, 14)
      g.fill()
      g.fillStyle = '#232227'
      g.fillRect(x, y + ch / 2, cw, ch / 2 - 14)
      roundRect(g, x, y + ch / 2, cw, ch / 2, 14)
      g.fill()
      // digit
      g.fillStyle = '#f3efe6'
      g.font = '400 196px "Instrument Serif", serif'
      g.textAlign = 'center'
      g.textBaseline = 'alphabetic'
      g.fillText('0', x + cw / 2, y + ch / 2 + 66)
      // split + hinges
      g.fillStyle = '#0a0a0c'
      g.fillRect(x, y + ch / 2 - 2, cw, 4)
      g.fillStyle = '#4a4850'
      g.fillRect(x - 3, y + ch / 2 - 9, 6, 18)
      g.fillRect(x + cw - 3, y + ch / 2 - 9, 6, 18)
      x += cw + (k === 0 ? gap : 0)
    }
    if (gi < groups - 1) {
      g.fillStyle = '#f3efe6'
      g.beginPath()
      g.arc(x + groupGap / 2, y + ch / 2 - 30, 8, 0, Math.PI * 2)
      g.arc(x + groupGap / 2, y + ch / 2 + 30, 8, 0, Math.PI * 2)
      g.fill()
      x += groupGap
    }
  }

  // unit labels
  g.fillStyle = '#9b958a'
  g.font = '400 26px "DM Mono", monospace'
  g.textAlign = 'center'
  const start = (W - total) / 2 + 130
  const gw = cw * 2 + gap
  ;['HRS', 'MIN', 'SEC'].forEach((l, i) => g.fillText(l, start + i * (gw + groupGap) + gw / 2, y + ch + 52))

  // milestone rail
  const railY = 780
  const items = ['LIFTOFF', 'SEPARATION', 'FIRST CONTACT']
  const rx0 = 360
  const rx1 = W - 360
  g.strokeStyle = '#4a4850'
  g.lineWidth = 3
  g.beginPath()
  g.moveTo(rx0, railY)
  g.lineTo(rx1, railY)
  g.stroke()
  items.forEach((label, i) => {
    const px = rx0 + ((rx1 - rx0) * i) / (items.length - 1)
    g.beginPath()
    g.arc(px, railY, 13, 0, Math.PI * 2)
    if (i === 0) {
      g.fillStyle = '#f2a33a'
      g.fill()
    } else {
      g.fillStyle = '#121116'
      g.fill()
      g.strokeStyle = '#8b867c'
      g.stroke()
    }
    g.fillStyle = i === 0 ? '#f2a33a' : '#8b867c'
    g.font = '400 24px "DM Mono", monospace'
    g.fillText(label, px, railY + 56)
  })

  // toBlob encodes off the main thread; a data URL would block for a noticeable moment
  return new Promise<string>((resolve) => {
    c.toBlob((b) => resolve(b ? URL.createObjectURL(b) : c.toDataURL('image/jpeg', 0.9)), 'image/jpeg', 0.92)
  })
}

let cached: Promise<string> | null = null

/** Generated flip-clock image as a data URL (null until painted). */
export function useFlipClock() {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    // paint off the critical path so it never competes with the intro
    cached ??= new Promise<string>((resolve) => {
      const go = () => paint().then(resolve)
      if ('requestIdleCallback' in window) window.requestIdleCallback(go, { timeout: 2500 })
      else setTimeout(go, 1600)
    })
    cached.then((s) => alive && s && setSrc(s))
    return () => {
      alive = false
    }
  }, [])
  return src
}
