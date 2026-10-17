import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Relative asset paths: the build works from any host or sub-path (GitHub Pages, Cloudflare Pages, a folder).
  base: './',
  build: {
    // The 3D scene chunk (three.js + react-three-fiber) is ~930 kB and lazy-loaded after the page renders.
    chunkSizeWarningLimit: 1000,
  },
})
