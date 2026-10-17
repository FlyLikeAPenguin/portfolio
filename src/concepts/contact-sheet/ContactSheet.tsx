import { experiments } from '../../content'
import '@fontsource/instrument-serif/400.css'
import '@fontsource/instrument-serif/400-italic.css'
import '@fontsource/dm-mono/300.css'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import '@fontsource/caveat/400.css'
import '@fontsource/caveat/600.css'
import './contact-sheet.css'

import { useCallback, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { SplitText } from 'gsap/SplitText'
import { useSmoothScroll, prefersReducedMotion } from '../../shared/useSmoothScroll'
import { filmVars } from './film'
import { MarkDefs } from './marks'
import { proofProjects, rollFrames } from './data'
import { useFlipClock } from './flipclock'
import { frameCounter } from './store'
import Header from './Header'
import Hero from './Hero'
import FilmAdvance from './FilmAdvance'
import Proofs from './Proofs'
import Photographs, { type OpenPrint } from './Photographs'
import Lightbox, { type LightboxState } from './Lightbox'
import Notes from './Notes'
import Experiments from './Experiments'
import Contact from './Contact'
import Loupe from './Loupe'

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin, SplitText, useGSAP)

const PAPER = '#efe9dc'
const DARK = '#120404'

export default function ContactSheet() {
  const root = useRef<HTMLDivElement>(null)
  const flicker = useRef<HTMLDivElement>(null)
  const opener = useRef<HTMLElement | null>(null)
  const [darkroom, setDarkroom] = useState(false)
  const [loupe, setLoupe] = useState(false)
  const [lightbox, setLightbox] = useState<LightboxState>(null)
  const flipSrc = useFlipClock()

  useSmoothScroll()

  // body background for overscroll
  useEffect(() => {
    const prev = document.body.style.background
    return () => {
      document.body.style.background = prev
    }
  }, [])
  useEffect(() => {
    document.body.style.background = darkroom ? DARK : PAPER
  }, [darkroom])

  // page-level: fonts, images and the frame counter
  useGSAP(
    () => {
      frameCounter.reset()
      const compute = () => frameCounter.compute(rollFrames.length)
      ScrollTrigger.create({ start: 0, end: 'max', onUpdate: compute, onRefresh: compute })
      let alive = true
      document.fonts?.ready.then(() => alive && ScrollTrigger.refresh())
      const onLoad = () => ScrollTrigger.refresh()
      window.addEventListener('load', onLoad)
      return () => {
        alive = false
        window.removeEventListener('load', onLoad)
      }
    },
    { scope: root },
  )

  const toggleDarkroom = useCallback(() => {
    const next = !darkroom
    const el = flicker.current
    if (!el || prefersReducedMotion()) {
      setDarkroom(next)
      return
    }
    // a light switching: two stutters, then the room changes
    gsap.set(el, { backgroundColor: next ? '#050101' : '#fff6e8', opacity: 0 })
    gsap
      .timeline()
      .to(el, { opacity: 0.88, duration: 0.04, ease: 'none' })
      .to(el, { opacity: 0.15, duration: 0.07, ease: 'none' })
      .to(el, { opacity: 0.95, duration: 0.04, ease: 'none' })
      .to(el, { opacity: 0.35, duration: 0.05, ease: 'none' })
      .to(el, { opacity: 1, duration: 0.05, ease: 'none' })
      .add(() => setDarkroom(next))
      .to(el, { opacity: 1, duration: 0.12 })
      .to(el, { opacity: 0, duration: next ? 0.9 : 0.45, ease: 'power2.out' })
  }, [darkroom])

  const openPrint = useCallback<OpenPrint>((list, index, el, roll) => {
    opener.current = el
    setLightbox({ list, index, roll })
  }, [])
  const closePrint = useCallback(() => {
    setLightbox(null)
    opener.current?.focus({ preventScroll: true })
  }, [])
  const setIndex = useCallback((index: number) => setLightbox((s) => (s ? { ...s, index } : s)), [])

  return (
    <div
      ref={root}
      className={`cs${darkroom ? ' is-darkroom' : ''}${loupe ? ' has-loupe' : ''}`}
      style={filmVars}
      data-theme={darkroom ? 'darkroom' : 'paper'}
    >
      <MarkDefs />
      <Header darkroom={darkroom} onToggle={toggleDarkroom} />
      <main id="cs-main">
        <Hero />
        <FilmAdvance frames={rollFrames} flipSrc={flipSrc} />
        <Proofs projects={proofProjects} flipSrc={flipSrc} />
        <Photographs onOpen={openPrint} />
        <Notes />
        {experiments.length > 0 && <Experiments />}
        <Contact />
      </main>
      <Lightbox state={lightbox} onIndex={setIndex} onClose={closePrint} />
      <Loupe onEnable={setLoupe} />
      <div className="cs-vignette" aria-hidden="true" />
      <div className="cs-grain" aria-hidden="true" />
      <div className="cs-lamp" aria-hidden="true" />
      <div className="cs-safelight" aria-hidden="true" />
      <div className="cs-flicker" ref={flicker} aria-hidden="true" />
    </div>
  )
}
