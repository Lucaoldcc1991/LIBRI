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
      {/* Header stile iOS Large Title */}
      <header style={styles.headerGroup}>
        <h1 style={styles.headerTitle}>
          📚 Letture del <span style={styles.yearHighlight}>2026</span>
        </h1>
      </header>

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
                  </div>

                  <p style={styles.bookAuthor}>{book.author}</p>
                  
                  {/* Genere inserito sotto l'autore */}
                  {book.genre && <p style={styles.bookGenre}>{book.genre}</p>}

                  <div style={styles.metaRow}>
                    {readingMonthFormatted && (
                      <span style={styles.readingMonthText}>{readingMonthFormatted}</span>
                    )}
                    {readingMonthFormatted && <span>•</span>}
                    <span>{book.pages} pagine</span>
                    {pubYear && <span>•</span>}
                    {pubYear && <span>{pubYear}</span>}
                  </div>
                </div>

                {/* Etichetta posizionata in basso a destra della scheda */}
                {isClassic(book) && (
                  <span style={styles.classicTagBottomRight}>Classico</span>
                )}
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
    color: '#000000',
    minHeight: '100vh',
    padding: '32px 20px 80px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    boxSizing: 'border-box',
    maxWidth: '680px',
    margin: '0 auto'
  },

  headerGroup: {
    paddingBottom: '16px',
    borderBottom: '1px solid #E5E5E5'
  },

  headerTitle: {
    fontSize: '34px',
    fontWeight: 700,
    color: '#000000',
    margin: 0,
    letterSpacing: '-0.8px',
    lineHeight: '1.15'
  },

  yearHighlight: {
    color: '#8E8E93',
    fontWeight: 500
  },

  listContainer: {
    display: 'flex',
    flexDirection: 'column'
  },

  listItem: {
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-start',
    gap: '16px',
    padding: '16px 0',
    borderBottom: '1px solid #E5E5E5'
  },

  indexColumn: {
    fontSize: '12px',
    fontFamily: 'SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    color: '#8E8E93',
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
    gap: '8px'
  },

  bookTitle: {
    fontSize: '15px',
    fontWeight: 600,
    color: '#000000',
    margin: 0
  },

  classicTagBottomRight: {
    position: 'absolute',
    right: 0,
    bottom: '16px',
    fontSize: '10px',
    fontWeight: 500,
    color: '#636366',
    border: '1px solid #D1D1D6',
    padding: '1px 5px',
    borderRadius: '4px',
    textTransform: 'uppercase',
    letterSpacing: '0.3px'
  },

  bookAuthor: {
    fontSize: '13px',
    color: '#3A3A3C',
    margin: 0
  },

  bookGenre: {
    fontSize: '12px',
    color: '#8E8E93',
    margin: 0,
    fontStyle: 'italic'
  },

  metaRow: {
    fontSize: '12px',
    color: '#8E8E93',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '4px'
  },

  readingMonthText: {
    color: '#000000',
    fontWeight: 600
  },

  emptyState: {
    padding: '24px 0',
    fontSize: '13px',
    color: '#8E8E93',
    fontStyle: 'italic'
  }
}