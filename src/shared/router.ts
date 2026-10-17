import { useSyncExternalStore } from 'react'

/** Minimal hash router: works on GitHub Pages and any static host. */
const subscribe = (cb: () => void) => {
  window.addEventListener('hashchange', cb)
  return () => window.removeEventListener('hashchange', cb)
}

const getRoute = () => window.location.hash.replace(/^#\/?/, '').split(/[?#]/)[0]

export const useRoute = () => useSyncExternalStore(subscribe, getRoute, () => '')

export const navigate = (route: string) => {
  window.location.hash = `/${route}`
}
