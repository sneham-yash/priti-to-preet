import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

// iOS: don't recalculate every time the address bar shows/hides (R-04).
ScrollTrigger.config({ ignoreMobileResize: true })
gsap.defaults({ ease: 'power2.out', duration: 1 })

/** Scrub smoothing used by every scroll-linked timeline (UX-006). */
export const SCRUB = 1

export { gsap, ScrollTrigger }
