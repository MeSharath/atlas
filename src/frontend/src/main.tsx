import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Reshaped } from 'reshaped'
import App from './App.tsx'
import './index.css'

// Initialize Firebase
import './services/firebase'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Reshaped theme="reshaped" defaultColorMode="light">
      <App />
    </Reshaped>
  </StrictMode>,
)
