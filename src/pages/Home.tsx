import { useEffect, useState } from 'react'
import { db } from '../db/database'
import { COUNTRIES } from '../utils/countries'

type Book = {
  id?: number
  title: string
  author: string
  genre?: string
  country?: string
  cover?: string
  pages: number
  readingYear?: number
  classic?: boolean
  isClassic?: boolean
}

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'
const ACCENT_BLUE = '#007AFF'

export default function Home() {
  const [books, setBooks] = useState<Book[]>([])

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const currentYear = new Date().getFullYear()

  // Filtra solo i libri letti nell'anno corrente
  const booksThisYear = books.filter(
    (b) => b.readingYear === currentYear
  )

  const totalPages = booksThisYear.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const isClassic = (b: Book) =>
    b.classic === true || (b as any).isClassic === true

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerGroup}>
        <h2 style={styles.header}>🏠 Home</h2>
        <p style={styles.eyebrow}>Anno {currentYear}</p>
      </div>

      {/* Banner Riassuntivo del Percorso */}
      <div style={styles.summaryCard}>
        <div style={styles.summaryBadge}>🗺️ Il tuo viaggio</div>
        <h3 style={styles.summaryTitle}>
          {booksThisYear.length} {booksThisYear.length === 1 ? 'Libro letto' : 'Libri letti'}
        </h3>
        <p style={styles.summarySub}>
          Hai letto <strong style={{ color: ACCENT_BLUE }}>{totalPages.toLocaleString('it-IT')}</strong> pagine nel {currentYear}
        </p>
      </div>

      <h3 style={styles.sectionTitle}>📍 Percorso di lettura</h3>

      {/* TIMELINE DEL PERCORSO */}
      {booksThisYear.length > 0 ? (
        <div style={styles.timelineContainer}>
          <div style={styles.timelineLine} />
          {booksThisYear.map((book, index) => {
            const countryObj = COUNTRIES.find((c) => c.name === book.country)
            return (
              <div key={book.id || index} style={styles.timelineItem}>
                {/* Nodo 3D numerato */}
                <div style={styles.timelineNode}>{index + 1}</div>

                {/* Scheda del Libro nel Percorso */}
                <div style={styles.timelineCard}>
                  <div style={styles.rowLayout}>
                    {/* Immagine Copertina o Placeholder */}
                    {book.cover ? (
                      <img
                        src={book.cover}
                        alt={book.title}
                        style={styles.cover}
                        onError={(e) => {
                          ;(e.target as HTMLElement).style.display = 'none'
                        }}
                      />
                    ) : (
                      <div style={styles.coverPlaceholder}>
                        📖
                      </div>
                    )}

                    {/* Dettagli del Libro */}
                    <div style={styles.cardContent}>
                      <div style={styles.cardHeader}>
                        <h4 style={styles.bookTitle}>{book.title}</h4>
                        {isClassic(book) && <span style={styles.classicRibbon} title="Classico">🏛️</span>}
                      </div>
                      <p style={styles.bookAuthor}>{book.author}</p>

                      <div style={styles.badgeRow}>
                        <span style={styles.badge}>📄 {book.pages} pag.</span>
                        {book.genre && <span style={styles.badge}>🏷️ {book.genre}</span>}
                        {countryObj && (
                          <span style={styles.badge}>
                            {countryObj.flag} {book.country}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={styles.emptyCard}>
          <span style={{ fontSize: '32px' }}>📖</span>
          <p style={styles.emptyText}>
            Nessun libro ancora letto nel {currentYear}. Aggiungine uno dalla Libreria!
          </p>
        </div>
      )}
    </div>
  )
}

/* ================= STILI iOS WHITE 3D ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#F2F2F7',
    minHeight: '100vh',
    padding: '16px 16px 32px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
    boxSizing: 'border-box'
  },

  headerGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingLeft: '4px'
  },

  header: {
    fontSize: '24px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },

  eyebrow: {
    fontSize: '12px',
    fontWeight: 600,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    margin: 0
  },

  sectionTitle: {
    fontSize: '16px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: '8px 0 0 4px',
    letterSpacing: '-0.3px'
  },

  summaryCard: {
    padding: '20px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },

  summaryBadge: {
    fontSize: '11px',
    fontWeight: 700,
    color: ACCENT_BLUE,
    textTransform: 'uppercase',
    letterSpacing: '0.8px'
  },

  summaryTitle: {
    fontSize: '22px',
    fontWeight: 800,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },

  summarySub: {
    fontSize: '14px',
    color: TEXT_MUTED,
    margin: 0,
    fontWeight: 500
  },

  /* TIMELINE STYLES */
  timelineContainer: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    paddingLeft: '14px',
    marginTop: '8px'
  },

  timelineLine: {
    position: 'absolute',
    top: '16px',
    bottom: '16px',
    left: '27px',
    width: '3px',
    background: 'linear-gradient(180deg, #007AFF 0%, #D8DBE0 100%)',
    borderRadius: '2px',
    zIndex: 1
  },

  timelineItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    zIndex: 2
  },

  timelineNode: {
    width: '28px',
    height: '28px',
    borderRadius: '14px',
    background: '#FFFFFF',
    border: `2px solid ${ACCENT_BLUE}`,
    boxShadow: '3px 3px 8px #D8DBE0, -3px -3px 8px #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 800,
    color: ACCENT_BLUE,
    flexShrink: 0,
    marginTop: '12px'
  },

  timelineCard: {
    flex: 1,
    padding: '14px',
    borderRadius: '20px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF'
  },

  rowLayout: {
    display: 'flex',
    gap: '12px',
    alignItems: 'flex-start'
  },

  cover: {
    width: '55px',
    height: '80px',
    objectFit: 'cover',
    borderRadius: '10px',
    boxShadow: '2px 2px 6px rgba(0,0,0,0.12)',
    flexShrink: 0
  },

  coverPlaceholder: {
    width: '55px',
    height: '80px',
    borderRadius: '10px',
    background: '#F2F2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '22px',
    flexShrink: 0,
    boxShadow: 'inset 2px 2px 4px #D8DBE0, inset -2px -2px 4px #FFFFFF'
  },

  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '8px'
  },

  bookTitle: {
    fontSize: '15px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.3px'
  },

  classicRibbon: {
    fontSize: '15px',
    flexShrink: 0
  },

  bookAuthor: {
    fontSize: '13px',
    color: TEXT_MUTED,
    fontWeight: 500,
    margin: 0
  },

  badgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '4px'
  },

  badge: {
    fontSize: '10px',
    fontWeight: 600,
    color: TEXT_MAIN,
    background: '#F2F2F7',
    padding: '3px 6px',
    borderRadius: '6px',
    boxShadow: 'inset 1px 1px 2px #D8DBE0, inset -1px -1px 2px #FFFFFF'
  },

  emptyCard: {
    padding: '32px 20px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: '12px'
  },

  emptyText: {
    fontSize: '14px',
    color: TEXT_MUTED,
    margin: 0,
    fontWeight: 500
  }
}