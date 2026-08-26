import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  id?: number
  title: string
  author: string
  genre?: string
  country?: string
  cover?: string
  pages: number
  publicationYear?: number
  publishYear?: number
  year?: number
  readingYear?: number
  readingMonth?: number | string
  month?: number | string
  classic?: boolean
  isClassic?: boolean
}

/* ================= iOS WHITE 3D PALETTE (BLUE ACCENT TIMELINE) ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'
const TEXT_LIGHT = '#636366' // Stile identico a Library per i metadati opacizzati
const ACCENT_BLUE = '#007AFF' // Accento Blu iOS per la timeline
const ACCENT_HIGHLIGHT = '#FF9500' // Colore speciale per il libro con più pagine (Arancio iOS)

// Mesi in italiano per eventuale conversione da numero a stringa
const MONTHS_IT = [
  '', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

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

  // Trova il numero massimo di pagine tra i libri letti quest'anno (se ci sono libri)
  const maxPages = booksThisYear.length > 0
    ? Math.max(...booksThisYear.map((b) => b.pages || 0))
    : 0

  const isClassic = (b: Book) =>
    b.classic === true || (b as any).isClassic === true

  // Funzione helper per formattare il mese di lettura
  const formatReadingMonth = (monthVal?: number | string) => {
    if (!monthVal) return null
    if (typeof monthVal === 'number' && monthVal >= 1 && monthVal <= 12) {
      return MONTHS_IT[monthVal]
    }
    return monthVal
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerGroup}>
        <h2 style={styles.header}>🏠 Home</h2>
        <p style={styles.eyebrow}>Anno {currentYear}</p>
      </div>

      {/* Banner Riassuntivo Rinnovato (Stile iOS Widget) */}
      <div style={styles.summaryCard}>
        <div style={styles.statBox}>
          <span style={styles.statIcon}>📚</span>
          <div>
            <h3 style={styles.statValue}>
              {booksThisYear.length}
            </h3>
            <p style={styles.statLabel}>
              {booksThisYear.length === 1 ? 'Libro letto' : 'Libri letti'}
            </p>
          </div>
        </div>

        <div style={styles.statDivider} />

        <div style={styles.statBox}>
          <span style={styles.statIcon}>📄</span>
          <div>
            <h3 style={styles.statValue}>
              {totalPages.toLocaleString('it-IT')}
            </h3>
            <p style={styles.statLabel}>Pagine</p>
          </div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>📍 Percorso di lettura</h3>

      {/* TIMELINE DEL PERCORSO */}
      {booksThisYear.length > 0 ? (
        <div style={styles.timelineContainer}>
          <div style={styles.timelineLine} />
          {booksThisYear.map((book, index) => {
            // Controlla se questo libro è quello con più pagine
            const isHighestPages = book.pages === maxPages && maxPages > 0
            
            // Cerca l'anno di pubblicazione in tutte le varianti possibili del DB
            const pubYear = book.publicationYear || book.publishYear || book.year
            const readingMonthFormatted = formatReadingMonth(book.readingMonth || book.month)

            return (
              <div key={book.id || index} style={styles.timelineItem}>
                {/* Nodo 3D numerato Blu iOS (cambia colore se ha più pagine) */}
                <div
                  style={{
                    ...styles.timelineNode,
                    ...(isHighestPages ? styles.timelineNodeHighlight : {})
                  }}
                  title={isHighestPages ? 'Libro più lungo dell\'anno!' : undefined}
                >
                  {index + 1}
                </div>

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

                      {/* Metadati (Genere, Pagine, Anno) stile Library sopra */}
                      <div style={styles.metaRow}>
                        {book.genre && (
                          <>
                            <span>{book.genre}</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{book.pages} pagine</span>
                        {pubYear && (
                          <>
                            <span>•</span>
                            <span>{pubYear}</span>
                          </>
                        )}
                      </div>

                      {/* Mese di lettura in fondo con icona */}
                      {readingMonthFormatted && (
                        <div style={styles.monthRow}>
                          <span style={styles.badgeBold}>📅 {readingMonthFormatted}</span>
                        </div>
                      )}
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
    padding: '16px 16px 110px',
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
    padding: '18px 20px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },

  statBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    flex: 1
  },

  statIcon: {
    fontSize: '26px',
    background: '#F2F2F7',
    padding: '10px',
    borderRadius: '16px',
    boxShadow: 'inset 2px 2px 4px #D8DBE0, inset -2px -2px 4px #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  statValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px',
    lineHeight: 1.1
  },

  statLabel: {
    fontSize: '13px',
    color: TEXT_MUTED,
    margin: 0,
    fontWeight: 500,
    marginTop: '2px'
  },

  statDivider: {
    width: '1px',
    height: '36px',
    background: '#E5E5EA',
    margin: '0 16px'
  },

  /* TIMELINE STYLES (iOS BLUE) */
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
    top: '18px',
    bottom: '18px',
    left: '27.5px',
    width: '1.5px',
    background: 'linear-gradient(180deg, rgba(0, 122, 255, 0.4) 0%, rgba(216, 219, 224, 0.5) 100%)',
    borderRadius: '1px',
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

  timelineNodeHighlight: {
    border: `2px solid ${ACCENT_HIGHLIGHT}`,
    color: ACCENT_HIGHLIGHT
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

  metaRow: {
    fontSize: '12px',
    color: TEXT_LIGHT,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    marginTop: '2px'
  },

  monthRow: {
    display: 'flex',
    marginTop: '6px'
  },

  badgeBold: {
    fontSize: '11px',
    fontWeight: 700,
    color: TEXT_MAIN,
    background: '#F2F2F7',
    padding: '3px 8px',
    borderRadius: '8px',
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