import { Link, useLocation } from 'react-router-dom'

const TABS = [
  { to: '/', label: 'Home', icon: '🏠' },
  { to: '/library', label: 'Libri', icon: '📚' },
  { to: '/explore', label: 'Esplora', icon: '🧭' },
  { to: '/wishlist', label: 'Wishlist', icon: '✨' },
  { to: '/stats', label: 'Stats', icon: '📊' },
  { to: '/settings', label: '', icon: '⚙️' }
]

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MUTED = '#8E8E93'
const ACCENT_BLUE = '#007AFF'

export default function Navbar() {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav style={styles.nav}>
      {TABS.map((tab) => (
        <NavItem
          key={tab.to}
          to={tab.to}
          label={tab.label}
          icon={tab.icon}
          active={isActive(tab.to)}
        />
      ))}
    </nav>
  )
}

function NavItem({
  to,
  label,
  icon,
  active
}: {
  to: string
  label: string
  icon: string
  active: boolean
}) {
  return (
    <Link to={to} style={styles.link}>
      <span
        style={{
          ...styles.iconWrap,
          ...(active ? styles.iconWrapActive : {})
        }}
      >
        {icon}
      </span>
      {label && (
        <span
          style={{
            ...styles.label,
            ...(active ? styles.labelActive : {})
          }}
        >
          {label}
        </span>
      )}
    </Link>
  )
}

/* ================= STILI iOS WHITE 3D ================= */

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '6px 4px calc(6px + env(safe-area-inset-bottom))',
    background: 'rgba(242, 242, 247, 0.88)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid rgba(255, 255, 255, 0.7)',
    borderRadius: '24px 24px 0 0',
    boxShadow: '0 -6px 20px rgba(0, 0, 0, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.8)',
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Helvetica Neue", sans-serif'
  },

  link: {
    textDecoration: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '2px',
    flex: 1,
    padding: '2px 0'
  },

  iconWrap: {
    fontSize: '18px',
    width: '36px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '12px',
    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 0.6
  },

  iconWrapActive: {
    background: '#FFFFFF',
    boxShadow: '4px 4px 10px #D8DBE0, -4px -4px 10px #FFFFFF',
    color: ACCENT_BLUE,
    opacity: 1,
    transform: 'translateY(-2px)'
  },

  label: {
    fontSize: '10px',
    fontWeight: 500,
    color: TEXT_MUTED,
    letterSpacing: '-0.1px',
    transition: 'all 0.2s ease'
  },

  labelActive: {
    color: ACCENT_BLUE,
    fontWeight: 700
  }
}