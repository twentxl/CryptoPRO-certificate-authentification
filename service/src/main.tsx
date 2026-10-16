import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import CertAuthModal from './CertAuthModal.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CertAuthModal />
  </StrictMode>,
)
