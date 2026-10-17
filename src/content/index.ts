export * from './profile'
export * from './projects'
export * from './photos'

/** Resolve a public asset path against Vite's base so it works on any host or sub-path. */
export const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`
