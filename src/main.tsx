import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

import { registerSW } from 'virtual:pwa-register'

// Registrazione Service Worker per supporto PWA e offline
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Opzionale: Ricarica automatica in caso di aggiornamento dell'app
    if (confirm('È disponibile una nuova versione. Vuoi aggiornare?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('App pronta per il funzionamento offline!')
  }
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)