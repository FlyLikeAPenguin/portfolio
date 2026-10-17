import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GroundStation from './site/GroundStation'
import './base.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GroundStation />
  </StrictMode>,
)
