import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'
import { CustomEase } from 'gsap/CustomEase'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, SplitText, CustomEase, ScrambleTextPlugin, useGSAP)

/** Long, confident deceleration. The house ease for every reveal. */
CustomEase.create('ltOut', '0.16,1,0.3,1')
/** Symmetric in-out for things that leave and come back (rules, panels). */
CustomEase.create('ltInOut', '0.65,0,0.35,1')

export const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

export { gsap, ScrollTrigger, SplitText, useGSAP }
