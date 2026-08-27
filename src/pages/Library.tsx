import { useEffect, useRef, useState } from 'react'
import { db } from '../db/database'
import BookForm from '../components/BookForm'
import { COUNTRIES } from '../utils/countries'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  cover?: string
  pages: number
  publicationYear?: number
  readingMonth?: number
  readingYear?: number
  classic?: boolean
  createdAt: number
  tags?: string[]
}

const MONTHS = [
  'Gennaio','Febbraio','Marzo','Aprile',
  'Maggio','Giugno','Luglio','Agosto',
  'Settembre','Ottobre','Novembre','Dicembre'
]

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'
const TEXT_LIGHT = '#636366'

export default function Library() {
  const [books, setBooks] = useState<Book[]>([])
  const [search, setSearch] = useState('')
  const [editingBook, setEditingBook] = useState<Book | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [yearFilter, setYearFilter] = useState<number | 'all'>('all')

  const [openSwipeId, setOpenSwipeId] = useState<number | null>(null)

  useEffect(() => {
    loadBooks()
  }, [])

  const loadBooks = async () => {
    const data = await db.books.toArray()

    const sorted = data.sort((a, b) => {
      const aScore = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bScore = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)

      if (bScore !== aScore) return bScore - aScore
      return (b.createdAt ?? 0) - (a.createdAt ?? 0)
    })

    setBooks(sorted)
  }

  // Funzione corretta per spostare i libri su e giù nell'elenco
  const moveBook = async (filteredIndex: number, direction: 'up' | 'down') => {
    const targetFilteredIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1
    if (targetFilteredIndex < 0 || targetFilteredIndex >= filteredBooks.length) return

    const currentBook = filteredBooks[filteredIndex]
    const targetBook = filteredBooks[targetFilteredIndex]

    if (!currentBook.id || !targetBook.id) return

    // 1. Scambiamo le date di lettura se differiscono
    const tempYear = currentBook.readingYear
    const tempMonth = currentBook.readingMonth
    currentBook.readingYear = targetBook.readingYear
    currentBook.readingMonth = targetBook.readingMonth
    targetBook.readingYear = tempYear
    targetBook.readingMonth = tempMonth

    // 2. Scambiamo createdAt (e garantiamo che siano distinti)
    let tempCreated = currentBook.createdAt ?? Date.now()
    let targetCreated = targetBook.createdAt ?? (Date.now() - 1000)

    if (tempCreated === targetCreated) {
      tempCreated = Date.now()
      targetCreated = Date.now() - 1000
    }

    currentBook.createdAt = targetCreated
    targetBook.createdAt = tempCreated

    // 3. Aggiorniamo il database Dexie
    await db.books.update(currentBook.id, {
      readingYear: currentBook.readingYear,
      readingMonth: currentBook.readingMonth,
      createdAt: currentBook.createdAt
    })
    await db.books.update(targetBook.id, {
      readingYear: targetBook.readingYear,
      readingMonth: targetBook.readingMonth,
      createdAt: targetBook.createdAt
    })

    // 4. Ricarichiamo la lista ordinata
    await loadBooks()
  }

  const years = [...new Set(
    books.map(b => b.readingYear).filter(Boolean)
  )]

  const filteredBooks = books.filter((b) => {
    const q = search.toLowerCase()

    const matchesSearch =
      b.title.toLowerCase().includes(q) ||
      b.author.toLowerCase().includes(q) ||
      b.genre.toLowerCase().includes(q) ||
      (b.series || '').toLowerCase().includes(q) ||
      (b.tags || []).some(t => t.toLowerCase().includes(q))

    const matchesYear =
      yearFilter === 'all' || b.readingYear === yearFilter

    return matchesSearch && matchesYear
  })

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

  const swipeState = useRef<Record<number, {
    startX: number
    startY: number
    offset: number
    swiping: boolean
  }>>({})

  const handleTouchStart = (e: React.TouchEvent, id?: number) => {
    if (!id) return
    swipeState.current[id] = {
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      offset: 0,
      swiping: false
    }
  }

  const handleTouchMove = (e: React.TouchEvent, id?: number) => {
    if (!id) return
    const state = swipeState.current[id]
    if (!state) return

    const deltaX = e.touches[0].clientX - state.startX
    const deltaY = e.touches[0].clientY - state.startY

    if (Math.abs(deltaY) > Math.abs(deltaX)) return
    if (!state.swiping && Math.abs(deltaX) < 25) return

    state.swiping = true

    if (deltaX < 0) {
      state.offset = Math.max(deltaX, -160)
    } else {
      state.offset = 0
    }
  }

  const handleTouchEnd = (id?: number) => {
    if (!id) return
    const state = swipeState.current[id]
    if (!state) return

    if (state.offset < -90) {
      setOpenSwipeId(id)
    } else {
      setOpenSwipeId(null)
    }
    delete swipeState.current[id]
  }

  const getOffset = (id?: number) => {
    if (!id) return 0
    return openSwipeId === id ? -160 : 0
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>📚 Libreria</h2>
      <p style={styles.eyebrow}>{filteredBooks.length} libri in lista</p>

      <div style={styles.filterRow}>
        <input
          placeholder="Cerca per titolo, autore, genere..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.search}
        />

        <select
          value={yearFilter}
          onChange={(e) =>
            setYearFilter(
              e.target.value === 'all'
                ? 'all'
                : Number(e.target.value)
            )
          }
          style={styles.select}
        >
          <option value="all">Tutti gli anni</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>
      </div>

      <button onClick={openAdd} style={styles.addBtn}>
        + Aggiungi nuovo libro
      </button>

      {showForm && (
        <div style={styles.modalOverlay}>
          <BookForm
            book={editingBook}
            onClose={() => {
              setShowForm(false)
              setEditingBook(null)
              loadBooks()
            }}
          />
        </div>
      )}

      {/* Lista Libri */}
      <div style={styles.list}>
        {filteredBooks.map((book, index) => {
          const country = COUNTRIES.find((c) => c.name === book.country)
          const monthName = book.readingMonth ? MONTHS[book.readingMonth - 1] : null

          return (
            <div key={book.id} style={styles.swipeWrapper}>
              {/* Pulsanti Azioni e Spostamento nascosti dietro lo swipe */}
              <div style={styles.actionsBehind}>
                <button
                  style={{
                    ...styles.actionBtn,
                    opacity: index === 0 ? 0.3 : 1,
                    cursor: index === 0 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBook(index, 'up')
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  disabled={index === 0}
                  title="Sposta Su"
                >
                  ⬆️
                </button>
                <button
                  style={{
                    ...styles.actionBtn,
                    opacity: index === filteredBooks.length - 1 ? 0.3 : 1,
                    cursor: index === filteredBooks.length - 1 ? 'not-allowed' : 'pointer'
                  }}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBook(index, 'down')
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                  disabled={index === filteredBooks.length - 1}
                  title="Sposta Giù"
                >
                  ⬇️
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(book)
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  ✏️
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBook(book.id)
                  }}
                  onTouchStart={(e) => e.stopPropagation()}
                  onTouchEnd={(e) => e.stopPropagation()}
                >
                  🗑️
                </button>
              </div>

              {/* Card Principale */}
              <div
                style={{
                  ...styles.card,
                  transform: `translateX(${getOffset(book.id)}px)`
                }}
                onTouchStart={(e) => handleTouchStart(e, book.id)}
                onTouchMove={(e) => handleTouchMove(e, book.id)}
                onTouchEnd={() => handleTouchEnd(book.id)}
                onClick={() => setOpenSwipeId(null)}
              >
                <div style={styles.cardRow}>
                  {book.cover ? (
                    <img
                      src={book.cover}
                      alt={book.title}
                      style={styles.cover}
                    />
                  ) : (
                    <div style={styles.coverPlaceholder}>
                      📖
                    </div>
                  )}

                  <div style={styles.info}>
                    <div style={styles.titleRow}>
                      <h4 style={styles.titleBook}>{book.title}</h4>
                      {book.classic && (
                        <span style={styles.classicBadge} title="Classico">🏛️</span>
                      )}
                    </div>

                    <p style={styles.author}>{book.author}</p>

                    {book.genre && (
                      <div style={styles.genrePillWrapper}>
                        <span style={styles.genrePill}>{book.genre}</span>
                      </div>
                    )}

                    <div style={styles.metaRow}>
                      {country && (
                        <span>{country.flag} {country.name}</span>
                      )}
                      {country && <span>•</span>}
                      <span>{book.pages} pagine</span>
                      {book.publicationYear && (
                        <>
                          <span>•</span>
                          <span>{book.publicationYear}</span>
                        </>
                      )}
                    </div>

                    {book.series && (
                      <p style={styles.series}>📖 {book.series}</p>
                    )}

                    {/* Data di Lettura - Pillola stile iOS App con testo Nero */}
                    {(monthName || book.readingYear) && (
                      <div style={styles.readingPillWrapper}>
                        <span style={styles.readingPill}>
                          📅 {[monthName, book.readingYear].filter(Boolean).join(' ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}

        {filteredBooks.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>📚</p>
            <p style={styles.emptyText}>Nessun libro trovato.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= STILI iOS WHITE 3D ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14,
    background: '#F2F2F7',
    padding: '16px 16px 110px',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif',
    boxSizing: 'border-box'
  },
  header: {
    fontSize: 28,
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: 600,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: '1px',
    margin: '-8px 0 0 0'
  },
  filterRow: {
    display: 'flex',
    gap: 10
  },
  search: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 14,
    border: 'none',
    background: '#F2F2F7',
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: 500,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none'
  },
  select: {
    padding: '12px 14px',
    borderRadius: 14,
    border: 'none',
    background: '#F2F2F7',
    color: TEXT_MAIN,
    fontSize: 13,
    fontWeight: 600,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none'
  },
  addBtn: {
    padding: 14,
    borderRadius: 16,
    border: 'none',
    background: '#FFFFFF',
    color: TEXT_MAIN,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    transition: 'all 0.2s ease'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  swipeWrapper: {
    position: 'relative',
    borderRadius: 22,
    overflow: 'hidden'
  },
  actionsBehind: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 160,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingRight: 6,
    background: '#F2F2F7',
    zIndex: 1
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 12,
    border: 'none',
    background: '#FFFFFF',
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '3px 3px 8px #D8DBE0, -3px -3px 8px #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    position: 'relative',
    zIndex: 2,
    padding: 16,
    borderRadius: 22,
    background: '#FFFFFF',
    boxShadow: '8px 8px 18px #D8DBE0, -8px -8px 18px #FFFFFF',
    transition: 'transform 0.2s ease',
    touchAction: 'pan-y'
  },
  cardRow: {
    display: 'flex',
    gap: 14,
    alignItems: 'flex-start'
  },
  cover: {
    width: 65,
    height: 95,
    objectFit: 'cover',
    borderRadius: 12,
    boxShadow: '3px 3px 8px rgba(0,0,0,0.12)',
    flexShrink: 0
  },
  coverPlaceholder: {
    width: 65,
    height: 95,
    borderRadius: 12,
    background: '#F2F2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 26,
    flexShrink: 0,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF'
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 3,
    flex: 1
  },
  titleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6
  },
  titleBook: {
    fontSize: 16,
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.3px'
  },
  classicBadge: {
    fontSize: 14,
    flexShrink: 0
  },
  author: {
    fontSize: 13,
    fontWeight: 600,
    color: TEXT_MUTED,
    margin: 0
  },
  genrePillWrapper: {
    display: 'flex',
    marginTop: 3,
    marginBottom: 3
  },
  genrePill: {
    fontSize: 11,
    fontWeight: 700,
    color: TEXT_MUTED,
    background: '#F2F2F7',
    padding: '3px 8px',
    borderRadius: 8,
    letterSpacing: '0.3px'
  },
  metaRow: {
    fontSize: 12,
    color: TEXT_LIGHT,
    fontWeight: 600,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    marginTop: 2
  },
  series: {
    fontSize: 12,
    fontStyle: 'italic',
    color: TEXT_MUTED,
    margin: '2px 0 0 0'
  },
  /* Pillola Data di Lettura iOS Style */
  readingPillWrapper: {
    display: 'flex',
    marginTop: 4
  },
  readingPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    fontSize: 12,
    fontWeight: 600,
    color: TEXT_MAIN,
    background: '#F2F2F7',
    padding: '4px 10px',
    borderRadius: 12,
    boxShadow: 'inset 1.5px 1.5px 4px #D8DBE0, inset -1.5px -1.5px 4px #FFFFFF'
  },
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyState: {
    padding: '40px 16px',
    textAlign: 'center',
    borderRadius: 22,
    background: '#FFFFFF',
    boxShadow: '8px 8px 18px #D8DBE0, -8px -8px 18px #FFFFFF'
  },
  emptyIcon: {
    fontSize: 32,
    margin: 0
  },
  emptyText: {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_MUTED,
    marginTop: 8
  }
}