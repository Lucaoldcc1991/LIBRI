import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'

import Home from './pages/Home'
import Library from './pages/Library'
import Wishlist from './pages/Wishlist'
import Settings from './pages/Settings'
import Explore from './pages/Explore'

export default function App() {
  const [showSplash, setShowSplash] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (showSplash) {
    return (
      <div style={styles.splash}>
        <div style={styles.content}>
          <div style={styles.iconPill}>📚</div>
          <h1 style={styles.title}>Reading Tracker</h1>
          <p style={styles.splashSub}>3D iOS Edition</p>
        </div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <div style={styles.app}>
        <div style={styles.contentArea}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/library" element={<Library />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        <Navbar />
      </div>
    </BrowserRouter>
  )
}

/* =========================
   STILI iOS WHITE 3D
========================= */

const styles: Record<string, React.CSSProperties> = {
  splash: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: '#F2F2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
  },

  content: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px'
  },

  iconPill: {
    width: '80px',
    height: '80px',
    borderRadius: '24px',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
    boxShadow: '8px 8px 18px #D8DBE0, -8px -8px 18px #FFFFFF'
  },

  title: {
    color: '#1C1C1E',
    fontSize: '22px',
    fontWeight: 700,
    letterSpacing: '-0.5px',
    margin: 0
  },

  splashSub: {
    color: '#8E8E93',
    fontSize: '12px',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: 0
  },

  app: {
    minHeight: '100vh',
    background: '#F2F2F7',
    display: 'flex',
    flexDirection: 'column'
  },

  contentArea: {
    flex: 1,
    width: '100%',
    maxWidth: '520px',
    margin: '0 auto',
    boxSizing: 'border-box'
  }
}