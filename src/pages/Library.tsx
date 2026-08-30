import { useEffect, useState } from 'react'
import { db } from '../db/database'
import BookForm from '../components/BookForm'

type Book = {
  id?: number
  title: string
  author: string
  genre?: string
  series?: string
  country?: string
  cover?: string
  pages: number
  publicationYear?: number
  publishYear?: number
  year?: number
  readingMonth?: number | string
  month?: number | string
  readingYear?: number
  classic?: boolean
  isClassic?: boolean
  createdAt?: number
  tags?: string[]
}

const MONTHS_IT = [
  '', 'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
  'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
]

const COUNTRY_FLAGS: Record<string, string> = {
  Italia: '🇮🇹',
  'Stati Uniti': '🇺🇸',
  'Regno Unito': '🇬🇧',
  Francia: '🇫🇷',
  Germania: '🇩🇪',
  Spagna: '🇪🇸',
  Giappone: '🇯🇵',
  Cina: '🇨🇳',
  Russia: '🇷🇺',
  India: '🇮🇳',
  Canada: '🇨🇦',
  Australia: '🇦🇺',
  Brasile: '🇧🇷',
  Argentina: '🇦🇷',
  Messico: '🇲🇽',
  Svezia: '🇸🇪',
  Norvegia: '🇳🇴',
  Irlanda: '🇮🇪',
  Polonia: '🇵🇱',
  Portogallo: '🇵🇹',
  Grecia: '🇬🇷',
  Olanda: '🇳🇱',
  Austria: '🇦🇹',
  Svizzera: '🇨🇭',
  Impero: '🏛️',
  'Impero Romano': '🏛️',
  'Impero Ottomano': '🇹🇷'
}

function getCountryFlag(country?: string) {
  if (!country) return ''
  const trimmed = country.trim().toLowerCase()
  const key = Object.keys(COUNTRY_FLAGS).find(
    (k) => k.toLowerCase() === trimmed
  )
  return key ? `${COUNTRY_FLAGS[key]} ` : '🌐 '
}

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    const data = await db.books.toArray()
    // Ordine Crescente: Dal Primo Letto in Assoluto (in alto a sinistra) al Più Recente
    const sorted = data.sort((a, b) => {
      const aMonthNum = typeof a.readingMonth === 'number' ? a.readingMonth : 0
      const bMonthNum = typeof b.readingMonth === 'number' ? b.readingMonth : 0
      const aScore = (a.readingYear ?? 0) * 100 + aMonthNum
      const bScore = (b.readingYear ?? 0) * 100 + bMonthNum
      
      if (aScore !== bScore) return aScore - bScore
      return (a.createdAt ?? 0) - (b.createdAt ?? 0)
    })
    setBooks(sorted)
  }

  const formatReadingMonth = (monthVal?: number | string) => {
    if (!monthVal) return null
    if (typeof monthVal === 'number' && monthVal >= 1 && monthVal <= 12) {
      return MONTHS_IT[monthVal]
    }
    return monthVal
  }

  const isClassic = (b: Book) =>
    b.classic === true || b.isClassic === true

  const years = [...new Set(books.map((b) => b.readingYear).filter(Boolean))] as number[]

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase()
    const matchesSearch =
      (b.title || '').toLowerCase().includes(q) ||
      (b.author || '').toLowerCase().includes(q) ||
      (b.genre || '').toLowerCase().includes(q) ||
      (b.series || '').toLowerCase().includes(q) ||
      (b.country || '').toLowerCase().includes(q) ||
      (b.tags || []).some((t) => t.toLowerCase().includes(q))

    const matchesYear = yearFilter === 'all' || b.readingYear === yearFilter
    return matchesSearch && matchesYear
  })

  const totalPages = filteredBooks.reduce((acc, b) => acc + (b.pages || 0), 0)

  const openAdd = () => {
    setEditingBook(null)
    setShowForm(true)
  }

  const openEdit = (book: Book) => {
    setEditingBook(book)
    setShowForm(true)
  }

  const deleteBook = async (id?: number) => {
    if (!id) return
    if (!confirm('Eliminare questo libro?')) return
    await db.books.delete(id)
    loadBooks()
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.headerGroup}>
        <div style={styles.titleContainer}>
          <h1 style={styles.headerTitle}>📖 Cronologia Visiva</h1>
          <div style={styles.badgeRow}>
            <div style={styles.badge}>
              <span style={styles.badgeValue}>{filteredBooks.length}</span>
              <span style={styles.badgeLabel}>
                {filteredBooks.length === 1 ? 'libro' : 'libri'}
              </span>
            </div>
            <div style={styles.badge}>
              <span style={styles.badgeValue}>{totalPages.toLocaleString('it-IT')}</span>
              <span style={styles.badgeLabel}>pagine</span>
            </div>
          </div>
        </div>
        <button onClick={openAdd} style={styles.addIconBtn} title="Aggiungi libro">
          ＋
        </button>
      </header>

      {/* Filtri */}
      <div style={styles.filterRow}>
        <input
          placeholder="Cerca..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select
          value={yearFilter}
          onChange={(e) =>
            setYearFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))
          }
          style={styles.select}
        >
          <option value="all">Anni</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      {/* Form Modale */}
      {showForm && (
        <div style={styles.modalOverlay}>
          <BookForm
            book={editingBook as any}
            onClose={() => {
              setShowForm(false)
              setEditingBook(null)
              loadBooks()
            }}
          />
        </div>
      )}

      {/* Griglia Ordinata da Sinistra a Destra */}
      <div style={styles.gridContainer}>
        {filteredBooks.map((book) => {
          const readingMonthFormatted = formatReadingMonth(book.readingMonth || book.month)

          return (
            <div key={book.id} style={styles.card} onClick={() => openEdit(book)}>
              {/* Contenitore Copertina Miniatura */}
              <div style={styles.coverWrapper}>
                {book.cover ? (
                  <img
                    src={book.cover}
                    alt={book.title}
                    style={styles.coverImage}
                    loading="lazy"
                  />
                ) : (
                  <div style={styles.placeholderCover}>
                    <span style={styles.placeholderIcon}>📚</span>
                    <span style={styles.placeholderTitle}>{book.title}</span>
                  </div>
                )}
                {isClassic(book) && (
                  <span style={styles.classicTag}>Classico</span>
                )}
                <button
                  style={styles.deleteQuickBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBook(book.id)
                  }}
                  title="Elimina"
                >
                  ✕
                </button>
              </div>

              {/* Dettagli con Genere e Mese/Anno discreto */}
              <div style={styles.cardInfo}>
                <div style={styles.bookTitle} title={book.title}>
                  {book.title}
                </div>
                <div style={styles.bookAuthor}>{book.author}</div>
                
                {book.genre && (
                  <div style={styles.bookGenre}>{book.genre}</div>
                )}

                <div style={styles.metaRow}>
                  <div style={styles.readingDateDiscrete}>
                    {readingMonthFormatted ? `${String(readingMonthFormatted).slice(0, 3)} ` : ''}
                    {book.readingYear || ''}
                  </div>
                  {book.country && <span>{getCountryFlag(book.country)}</span>}
                </div>
              </div>
            </div>
          )
        })}

        {filteredBooks.length === 0 && (
          <div style={styles.emptyState}>Nessun libro trovato.</div>
        )}
      </div>
    </div>
  )
}

/* ================= STILI COMPATTI PER LIBRERIA ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    background: '#FFFFFF',
    color: '#000000',
    minHeight: '100vh',
    padding: '24px 16px 80px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Helvetica, Arial, sans-serif',
    boxSizing: 'border-box',
    maxWidth: '800px',
    margin: '0 auto'
  },
  headerGroup: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: '12px',
    borderBottom: '1px solid #E5E5E5'
  },
  titleContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  headerTitle: {
    fontSize: '28px',
    fontWeight: 700,
    color: '#000000',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  badgeRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  badge: {
    display: 'inline-flex',
    alignItems: 'baseline',
    gap: 4,
    background: '#F2F2F7',
    padding: '2px 8px',
    borderRadius: 10
  },
  badgeValue: {
    fontSize: 12,
    fontWeight: 700,
    color: '#000000'
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: '#8E8E93'
  },
  addIconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    border: '1px solid #E5E5E5',
    background: '#FFFFFF',
    color: '#000000',
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    padding: 0
  },
  filterRow: {
    display: 'flex',
    gap: 8
  },
  search: {
    flex: 1,
    padding: '8px 12px',
    borderRadius: 10,
    border: '1px solid #E5E5E5',
    background: '#FFFFFF',
    fontSize: 13,
    color: '#000000',
    outline: 'none'
  },
  select: {
    padding: '8px 10px',
    borderRadius: 10,
    border: '1px solid #E5E5E5',
    background: '#FFFFFF',
    color: '#8E8E93',
    fontSize: 12,
    fontWeight: 600,
    outline: 'none',
    cursor: 'pointer'
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '18px 12px',
    marginTop: '4px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer'
  },
  coverWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '2/3',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #E5E5E5',
    background: '#F9F9FB'
  },
  coverImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  placeholderCover: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    boxSizing: 'border-box',
    textAlign: 'center',
    background: '#F2F2F7'
  },
  placeholderIcon: {
    fontSize: '18px',
    marginBottom: '4px'
  },
  placeholderTitle: {
    fontSize: '9px',
    fontWeight: 600,
    color: '#8E8E93',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 3,
    WebkitBoxOrient: 'vertical'
  },
  classicTag: {
    position: 'absolute',
    top: 4,
    left: 4,
    background: 'rgba(0, 0, 0, 0.75)',
    color: '#FFFFFF',
    fontSize: '8px',
    fontWeight: 600,
    padding: '1px 4px',
    borderRadius: '3px',
    textTransform: 'uppercase'
  },
  deleteQuickBtn: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    border: 'none',
    background: 'rgba(0, 0, 0, 0.6)',
    color: '#FFFFFF',
    fontSize: 9,
    cursor: 'pointer',
    display: 'grid',
    placeItems: 'center',
    padding: 0
  },
  cardInfo: {
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  bookTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#000000',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  bookAuthor: {
    fontSize: '10px',
    color: '#3A3A3C',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  bookGenre: {
    fontSize: '9px',
    color: '#8E8E93',
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  metaRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '2px'
  },
  readingDateDiscrete: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#1C1C1E'
  },
  emptyState: {
    gridColumn: '1 / -1',
    padding: '24px 0',
    fontSize: '12px',
    color: '#8E8E93',
    fontStyle: 'italic',
    textAlign: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  }
}