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

  const isClassic = (b: Book) =>
    b.classic === true || (b as any).isClassic === true

  const formatReadingMonth = (monthVal?: number | string) => {
    if (!monthVal) return null
    if (typeof monthVal === 'number' && monthVal >= 1 && monthVal <= 12) {
      return MONTHS_IT[monthVal]
    }
    return monthVal
  }

  return (
    <div style={styles.container}>
      {/* Header essenziale con solo il riferimento all'anno */}
      <header style={styles.headerGroup}>
        <h1 style={styles.header}>Anno {currentYear}</h1>
      </header>

      {/* Sintesi dati minimale */}
      <section style={styles.summaryBox}>
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Libri letti:</span>
          <span style={styles.statValue}>{booksThisYear.length}</span>
        </div>
        <div style={styles.statDivider} />
        <div style={styles.statItem}>
          <span style={styles.statLabel}>Pagine totali:</span>
          <span style={styles.statValue}>{totalPages.toLocaleString('it-IT')}</span>
        </div>
      </section>

      <h2 style={styles.sectionTitle}>Letture di quest'anno</h2>

      {/* ELENCO/REGISTRO LETTURE */}
      {booksThisYear.length > 0 ? (
        <div style={styles.listContainer}>
          {booksThisYear.map((book, index) => {
            const pubYear = book.publicationYear || book.publishYear || book.year
            const readingMonthFormatted = formatReadingMonth(book.readingMonth || book.month)

            return (
              <div key={book.id || index} style={styles.listItem}>
                <div style={styles.indexColumn}>
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div style={styles.bookDetails}>
                  <div style={styles.titleRow}>
                    <span style={styles.bookTitle}>{book.title}</span>
                    {isClassic(book) && <span style={styles.classicTag}>Classico</span>}
                  </div>

                  <p style={styles.bookAuthor}>{book.author}</p>
                  
                  {/* Genere inserito sotto l'autore */}
                  {book.genre && <p style={styles.bookGenre}>{book.genre}</p>}

                  <div style={styles.metaRow}>
                    {readingMonthFormatted && <span>{readingMonthFormatted}</span>}
                    {readingMonthFormatted && <span>•</span>}
                    <span>{book.pages} pagine</span>
                    {pubYear && <span>•</span>}
                    {pubYear && <span>{pubYear}</span>}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div style={styles.emptyState}>
          Nessuna lettura registrata per l'anno {currentYear}.
        </div>
      )}
    </div>
  )
}

/* ================= STILI AUSTERI E ESSENZIALI ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    background: '#FFFFFF',
    color: '#111111',
    minHeight: '100vh',
    padding: '24px 20px 80px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
    boxSizing: 'border-box',
    maxWidth: '680px',
    margin: '0 auto'
  },

  headerGroup: {
    borderBottom: '1px solid #E5E5E5',
    paddingBottom: '12px'
  },

  header: {
    fontSize: '22px',
    fontWeight: 600,
    color: '#111111',
    margin: 0,
    letterSpacing: '-0.3px'
  },

  sectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#111111',
    margin: '8px 0 0',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },

  summaryBox: {
    padding: '12px 16px',
    border: '1px solid #E5E5E5',
    borderRadius: '4px',
    background: '#FAFAFA',
    display: 'flex',
    alignItems: 'center',
    gap: '24px'
  },

  statItem: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px'
  },

  statLabel: {
    fontSize: '13px',
    color: '#666666'
  },

  statValue: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111111'
  },

  statDivider: {
    width: '1px',
    height: '16px',
    background: '#E5E5E5'
  },

  listContainer: {
    display: 'flex',
    flexDirection: 'column',
    borderTop: '1px solid #E5E5E5'
  },

  listItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #E5E5E5'
  },

  indexColumn: {
    fontSize: '12px',
    fontFamily: 'monospace',
    color: '#888888',
    paddingTop: '2px',
    width: '20px'
  },

  bookDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },

  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: '8px',
    justifyContent: 'space-between'
  },

  bookTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#111111',
    margin: 0
  },

  classicTag: {
    fontSize: '11px',
    color: '#555555',
    border: '1px solid #CCCCCC',
    padding: '1px 5px',
    borderRadius: '2px',
    textTransform: 'uppercase'
  },

  bookAuthor: {
    fontSize: '13px',
    color: '#444444',
    margin: 0
  },

  bookGenre: {
    fontSize: '12px',
    color: '#666666',
    margin: 0,
    fontStyle: 'italic'
  },

  metaRow: {
    fontSize: '12px',
    color: '#777777',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },

  emptyState: {
    padding: '24px 0',
    fontSize: '13px',
    color: '#666666',
    fontStyle: 'italic'
  }
}