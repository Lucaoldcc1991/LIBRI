import { useEffect, useRef, useState } from 'react'
import { db } from '../db/database'
import BookForm from '../components/BookForm'

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
  'Gen', 'Feb', 'Mar', 'Apr',
  'Mag', 'Giu', 'Lug', 'Ago',
  'Set', 'Ott', 'Nov', 'Dic'
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
  const [openSwipeId, setOpenSwipeId] = useState<number | null>(null)
  const [activeOffset, setActiveOffset] = useState<{ id: number; offset: number } | null>(null)

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

  const moveBook = async (filteredIndex: number, direction: 'up' | 'down') => {
    const targetFilteredIndex = direction === 'up' ? filteredIndex - 1 : filteredIndex + 1
    if (targetFilteredIndex < 0 || targetFilteredIndex >= filteredBooks.length) return

    const currentBook = { ...filteredBooks[filteredIndex] }
    const targetBook = { ...filteredBooks[targetFilteredIndex] }

    if (!currentBook.id || !targetBook.id) return

    const tempYear = currentBook.readingYear
    const tempMonth = currentBook.readingMonth
    currentBook.readingYear = targetBook.readingYear
    currentBook.readingMonth = targetBook.readingMonth
    targetBook.readingYear = tempYear
    targetBook.readingMonth = tempMonth

    let tempCreated = currentBook.createdAt ?? Date.now()
    let targetCreated = targetBook.createdAt ?? (Date.now() - 1000)

    if (tempCreated === targetCreated) {
      tempCreated = Date.now()
      targetCreated = Date.now() - 1000
    }

    currentBook.createdAt = targetCreated
    targetBook.createdAt = tempCreated

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

    await loadBooks()
  }

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

  // Touch Swipe
  const touchStartRef = useRef<{ id: number; startX: number; startY: number } | null>(null)

  const handleTouchStart = (e: React.TouchEvent, id?: number) => {
    if (!id) return
    touchStartRef.current = {
      id,
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY
    }
  }

  const handleTouchMove = (e: React.TouchEvent, id?: number) => {
    if (!id || !touchStartRef.current || touchStartRef.current.id !== id) return

    const deltaX = e.touches[0].clientX - touchStartRef.current.startX
    const deltaY = e.touches[0].clientY - touchStartRef.current.startY

    if (Math.abs(deltaY) > Math.abs(deltaX)) return

    const baseOffset = openSwipeId === id ? -150 : 0
    const newOffset = Math.min(0, Math.max(-160, baseOffset + deltaX))
    setActiveOffset({ id, offset: newOffset })
  }

  const handleTouchEnd = (id?: number) => {
    if (!id || !touchStartRef.current) return

    if (activeOffset && activeOffset.id === id) {
      if (activeOffset.offset < -75) {
        setOpenSwipeId(id)
      } else {
        setOpenSwipeId(null)
      }
    }
    setActiveOffset(null)
    touchStartRef.current = null
  }

  const getCardOffset = (id?: number) => {
    if (!id) return 0
    if (activeOffset && activeOffset.id === id) return activeOffset.offset
    return openSwipeId === id ? -150 : 0
  }

  return (
    <div style={styles.container}>
      {/* Header Minimalista */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Libreria</h1>
          <span style={styles.subtitle}>{filteredBooks.length} titoli</span>
        </div>
        <button onClick={openAdd} style={styles.addIconBtn} title="Aggiungi libro">
          ＋
        </button>
      </header>

      {/* Bar dei filtri essenziale */}
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
            book={editingBook}
            onClose={() => {
              setShowForm(false)
              setEditingBook(null)
              loadBooks()
            }}
          />
        </div>
      )}

      {/* Lista Libri Minimal */}
      <div style={styles.list}>
        {filteredBooks.map((book, index) => {
          const monthName = book.readingMonth ? MONTHS[book.readingMonth - 1] : null
          const isFirst = index === 0
          const isLast = index === filteredBooks.length - 1
          const readingDateStr = [monthName, book.readingYear].filter(Boolean).join(' ')

          return (
            <div key={book.id} style={styles.swipeWrapper}>
              {/* Azioni Swipe Nascoste */}
              <div style={styles.actionsBehind}>
                <button
                  style={{ ...styles.actionBtn, opacity: isFirst ? 0.3 : 1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBook(index, 'up')
                  }}
                  disabled={isFirst}
                >
                  ↑
                </button>
                <button
                  style={{ ...styles.actionBtn, opacity: isLast ? 0.3 : 1 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    moveBook(index, 'down')
                  }}
                  disabled={isLast}
                >
                  ↓
                </button>
                <button
                  style={styles.actionBtn}
                  onClick={(e) => {
                    e.stopPropagation()
                    openEdit(book)
                  }}
                >
                  ✎
                </button>
                <button
                  style={{ ...styles.actionBtn, color: '#FF3B30' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteBook(book.id)
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Card libro */}
              <div
                style={{
                  ...styles.card,
                  transform: `translateX(${getCardOffset(book.id)}px)`
                }}
                onTouchStart={(e) => handleTouchStart(e, book.id)}
                onTouchMove={(e) => handleTouchMove(e, book.id)}
                onTouchEnd={() => handleTouchEnd(book.id)}
                onClick={() => {
                  if (openSwipeId === book.id) {
                    setOpenSwipeId(null)
                  } else {
                    openEdit(book)
                  }
                }}
              >
                {book.cover ? (
                  <img src={book.cover} alt="" style={styles.cover} />
                ) : (
                  <div style={styles.coverPlaceholder} />
                )}

                <div style={styles.details}>
                  <div style={styles.titleRow}>
                    <h3 style={styles.bookTitle}>{book.title}</h3>
                    {book.classic && <span style={styles.classicTag}>Classico</span>}
                  </div>

                  <p style={styles.author}>{book.author}</p>

                  <div style={styles.metaRow}>
                    {book.genre && <span>{book.genre}</span>}
                    {book.publicationYear && <span>• {book.publicationYear}</span>}
                    {book.pages > 0 && <span>• {book.pages} p.</span>}
                    {book.country && (
                      <span>
                        • {getCountryFlag(book.country)}
                        {book.country}
                      </span>
                    )}
                  </div>

                  {readingDateStr && (
                    <div style={styles.readingDateRow}>
                      📅 {readingDateStr}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {filteredBooks.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Nessun libro trovato.</p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ================= STILI MINIMALISTI ================= */

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '24px 16px 100px',
    background: '#F2F2F7',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1C1C1E',
    margin: 0,
    letterSpacing: '-0.5px'
  },
  subtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: 500
  },
  addIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    border: 'none',
    background: '#FFFFFF',
    color: '#1C1C1E',
    fontSize: 18,
    fontWeight: 400,
    cursor: 'pointer',
    boxShadow: '3px 3px 8px #D8DBE0, -3px -3px 8px #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  filterRow: {
    display: 'flex',
    gap: 10,
    marginBottom: 16
  },
  search: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#F2F2F7',
    fontSize: 14,
    color: '#1C1C1E',
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    padding: '10px 12px',
    borderRadius: 12,
    border: 'none',
    background: '#F2F2F7',
    color: '#8E8E93',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    cursor: 'pointer'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  swipeWrapper: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden'
  },
  actionsBehind: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 150,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingRight: 6,
    background: '#F2F2F7',
    zIndex: 1
  },
  actionBtn: {
    width: 30,
    height: 30,
    borderRadius: 10,
    border: 'none',
    background: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '2px 2px 5px #D8DBE0, -2px -2px 5px #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  card: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 10,
    borderRadius: 16,
    background: '#FFFFFF',
    boxShadow: '4px 4px 12px #D8DBE0, -4px -4px 12px #FFFFFF',
    transition: 'transform 0.15s ease-out',
    touchAction: 'pan-y',
    userSelect: 'none',
    cursor: 'pointer'
  },
  cover: {
    width: 42,
    height: 62,
    borderRadius: 6,
    objectFit: 'cover',
    flexShrink: 0
  },
  coverPlaceholder: {
    width: 42,
    height: 62,
    borderRadius: 6,
    background: '#E5E5EA',
    flexShrink: 0
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    overflow: 'hidden'
  },
  titleRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 8
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1C1C1E',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  classicTag: {
    fontSize: '11px',
    color: '#555555',
    border: '1px solid #CCCCCC',
    padding: '1px 5px',
    borderRadius: '2px',
    textTransform: 'uppercase',
    flexShrink: 0
  },
  author: {
    fontSize: 12,
    color: '#8E8E93',
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  metaRow: {
    fontSize: 11,
    color: '#A1A1A6',
    display: 'flex',
    gap: 4,
    alignItems: 'center',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  readingDateRow: {
    fontSize: 11,
    fontWeight: 600,
    color: '#1C1C1E',
    marginTop: 3
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
  },
  emptyState: {
    padding: '30px 16px',
    textAlign: 'center'
  },
  emptyText: {
    fontSize: 13,
    color: '#8E8E93',
    margin: 0
  }
}