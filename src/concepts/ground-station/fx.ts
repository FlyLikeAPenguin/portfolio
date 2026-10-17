import gsap from 'gsap'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { SplitText } from 'gsap/SplitText'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin, SplitText, useGSAP)

export { gsap, ScrollTrigger, SplitText }

export const CHARS_ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/<>#'
export const CHARS_NUM = '0123456789'

/** First engineering job: 2018-07-02 00:00 UTC (LabLogic, July 2018). */
export const MET_EPOCH = Date.UTC(2018, 6, 2, 0, 0, 0)

const p2 = (n: number) => String(n).padStart(2, '0')

export function fmtUTC(d: Date) {
  return `${d.getUTCFullYear()}-${p2(d.getUTCMonth() + 1)}-${p2(d.getUTCDate())} ${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`
}

export function fmtTime(d: Date) {
  return `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`
}

export function fmtMET(now: number) {
  const s = Math.max(0, Math.floor((now - MET_EPOCH) / 1000))
  const days = Math.floor(s / 86400)
  const r = s % 86400
  return `T+ ${days.toLocaleString('en-GB')}d ${p2(Math.floor(r / 3600))}:${p2(Math.floor((r % 3600) / 60))}:${p2(r % 60)}`
}

/** Two-line-element style epoch: YYDDD.ff */
export function tleEpoch(d: Date) {
  const start = Date.UTC(d.getUTCFullYear(), 0, 1)
  const doy = (d.getTime() - start) / 86400000 + 1
  return `${String(d.getUTCFullYear()).slice(2)}${doy.toFixed(1).padStart(5, '0')}`
}

type Parsed = { pre: string; num: number; dec: number; comma: boolean; suf: string }
export function parseStat(v: string): Parsed | null {
  const m = v.match(/^([^\d]*?)(\d[\d,]*(?:\.\d+)?)(.*)$/)
  if (!m) return null
  const raw = m[2]
  return {
    pre: m[1],
    num: parseFloat(raw.replace(/,/g, '')),
    dec: (raw.split('.')[1] || '').length,
    comma: raw.includes(','),
    suf: m[3],
  }
}

const fmtNum = (n: number, p: Parsed) => {
  const s = n.toFixed(p.dec)
  if (!p.comma) return s
  const [a, b] = s.split('.')
  return a.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + (b ? `.${b}` : '')
}

/** Count a stat up from zero, or scramble it in when it isn't numeric. */
export function countUp(el: HTMLElement, duration = 0.8) {
  const text = el.dataset.value ?? el.textContent ?? ''
  el.dataset.value = text
  const p = parseStat(text)
  if (!p || el.dataset.mode === 'scramble') {
    return gsap.to(el, { duration: 0.7, scrambleText: { text, chars: CHARS_ALPHA, speed: 0.7 } })
  }
  const o = { v: 0 }
  return gsap.to(o, {
    v: p.num,
    duration,
    ease: 'expo.out',
    onUpdate: () => {
      el.textContent = p.pre + fmtNum(o.v, p) + p.suf
    },
    onComplete: () => {
      el.textContent = text
    },
  })
}

/** Characters resolve out of noise. Kept short so the text stays readable. */
export function scrambleIn(el: HTMLElement, duration = 0.7) {
  const text = el.dataset.text ?? el.textContent ?? ''
  el.dataset.text = text
  el.dataset.scrDone = '1'
  return gsap.fromTo(
    el,
    { scrambleText: { text: '', chars: CHARS_ALPHA } },
    { duration, scrambleText: { text, chars: CHARS_ALPHA, speed: 0.9, revealDelay: duration * 0.25 }, ease: 'none' },
  )
}

let noiseURL = ''
/** A small tile of static, generated once, used by the grain overlay and the downlink frames. */
export function noiseTile() {
  if (noiseURL || typeof document === 'undefined') return noiseURL
  const c = document.createElement('canvas')
  c.width = c.height = 128
  const ctx = c.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = Math.random() * 255
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  noiseURL = c.toDataURL('image/png')
  return noiseURL
}
