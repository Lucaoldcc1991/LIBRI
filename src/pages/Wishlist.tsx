import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'

type WishlistItem = {
  id?: number
  title: string
  author: string
  genre: string
  createdAt: number
}

const genres = [
  'Giallo/Noir/Legal',
  'Thriller',
  'Horror/Gotico/Paranormale',
  'Realista/Psicologico/Filosofico',
  'Narrativa per ragazzi',
  'Saggio',
  'Fumetto',
  'Storico/Di formazione/Autobiografico',
  'Fantascienza',
  'Fantasy',
  'Avventura',
  'Distopico'
]

const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [genreCustom, setGenreCustom] = useState('')

  const [search, setSearch] = useState('')
  const [selectedAuthorFilter, setSelectedAuthorFilter] = useState<string>('')
  const [selectedGenreFilter, setSelectedGenreFilter] = useState<string>('')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.wishlist
      .orderBy('createdAt')
      .reverse()
      .toArray()

    setItems(data)
  }

  const addItem = async () => {
    if (!title.trim() || !author.trim() || !genre) return

    const finalGenre = genreCustom.trim()
      ? `${genre} - ${genreCustom.trim()}`
      : genre

    await db.wishlist.add({
      title,
      author,
      genre: finalGenre,
      createdAt: Date.now()
    })

    setTitle('')
    setAuthor('')
    setGenre('')
    setGenreCustom('')
    load()
  }

  const removeItem = async (id?: number) => {
    if (!id) return
    await db.wishlist.delete(id)
    load()
  }

  const wishlistAuthors = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => {
      if (i.author) set.add(i.author.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const wishlistGenres = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => {
      if (i.genre) set.add(i.genre.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  const filtered = items.filter((i) => {
    const q = search.toLowerCase().trim()
    const matchText =
      !q ||
      i.title.toLowerCase().includes(q) ||
      i.author.toLowerCase().includes(q) ||
      i.genre.toLowerCase().includes(q)

    const matchAuthor =
      !selectedAuthorFilter ||
      i.author.trim().toLowerCase() === selectedAuthorFilter.trim().toLowerCase()

    const matchGenre =
      !selectedGenreFilter ||
      i.genre.toLowerCase().includes(selectedGenreFilter.toLowerCase())

    return matchText && matchAuthor && matchGenre
  })

  const isValid = title.trim() && author.trim() && genre
  const hasActiveFilters = !!search || !!selectedAuthorFilter || !!selectedGenreFilter

  const resetFilters = () => {
    setSearch('')
    setSelectedAuthorFilter('')
    setSelectedGenreFilter('')
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Wishlist</h1>
        <span style={styles.metaLine}>{items.length} libri in lista</span>
      </header>

      {/* Form Aggiunta */}
      <div style={styles.card3d}>
        <input
          placeholder="Titolo libro *"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Autore *"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          style={styles.input}
        />

        <select
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
          style={styles.select}
        >
          <option value="">Seleziona genere *</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          placeholder="Nota sul genere (es. Ambientato a Roma)..."
          value={genreCustom}
          onChange={(e) => setGenreCustom(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={addItem}
          disabled={!isValid}
          style={{
            ...styles.addButton,
            opacity: isValid ? 1 : 0.4,
            cursor: isValid ? 'pointer' : 'not-allowed'
          }}
        >
          Aggiungi alla wishlist
        </button>
      </div>

      {/* Cerca & Filtri */}
      {items.length > 0 && (
        <div style={styles.searchContainer}>
          <div style={styles.searchRow}>
            <input
              placeholder="Cerca per titolo o parola chiave..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {hasActiveFilters && (
              <button onClick={resetFilters} style={styles.resetButton}>
                Reset
              </button>
            )}
          </div>

          <div style={styles.selectGrid}>
            <select
              value={selectedAuthorFilter}
              onChange={(e) => setSelectedAuthorFilter(e.target.value)}
              style={{
                ...styles.filterSelect,
                color: selectedAuthorFilter ? TEXT_MAIN : TEXT_MUTED
              }}
            >
              <option value="">Tutti gli autori</option>
              {wishlistAuthors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>

            <select
              value={selectedGenreFilter}
              onChange={(e) => setSelectedGenreFilter(e.target.value)}
              style={{
                ...styles.filterSelect,
                color: selectedGenreFilter ? TEXT_MAIN : TEXT_MUTED
              }}
            >
              <option value="">Tutti i generi</option>
              {wishlistGenres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Lista Libri */}
      <div style={styles.stack}>
        {filtered.map((item) => (
          <div key={item.id} style={styles.rowCard}>
            <div style={styles.details}>
              <h3 style={styles.bookTitle}>{item.title}</h3>
              <p style={styles.author}>{item.author}</p>
              <div style={styles.metaRow}>
                <span>{item.genre}</span>
              </div>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              style={styles.delete}
              aria-label="Rimuovi"
            >
              ✕
            </button>
          </div>
        ))}

        {items.length > 0 && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>Nessun libro corrisponde ai filtri selezionati.</p>
          </div>
        )}

        {items.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>La tua wishlist è vuota.</p>
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
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },
  metaLine: {
    fontSize: 12,
    fontWeight: 500,
    color: TEXT_MUTED
  },
  card3d: {
    padding: 14,
    borderRadius: 16,
    background: '#FFFFFF',
    boxShadow: '4px 4px 12px #D8DBE0, -4px -4px 12px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  input: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#F2F2F7',
    fontSize: 14,
    color: TEXT_MAIN,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#F2F2F7',
    fontSize: 14,
    color: TEXT_MAIN,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },
  addButton: {
    marginTop: 2,
    padding: '12px',
    borderRadius: 12,
    border: 'none',
    background: '#FFFFFF',
    color: TEXT_MAIN,
    fontWeight: 600,
    fontSize: 14,
    boxShadow: '2px 2px 6px #D8DBE0, -2px -2px 6px #FFFFFF',
    transition: 'opacity 0.2s ease'
  },
  searchContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8
  },
  searchRow: {
    display: 'flex',
    gap: 10
  },
  searchInput: {
    flex: 1,
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#F2F2F7',
    fontSize: 14,
    color: TEXT_MAIN,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },
  resetButton: {
    padding: '10px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#FFFFFF',
    color: TEXT_MAIN,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '2px 2px 5px #D8DBE0, -2px -2px 5px #FFFFFF'
  },
  selectGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 8
  },
  filterSelect: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: 10,
    border: 'none',
    background: '#FFFFFF',
    fontSize: 12,
    fontWeight: 600,
    boxShadow: '2px 2px 5px #D8DBE0, -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer'
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  rowCard: {
    padding: '12px 14px',
    borderRadius: 16,
    background: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '4px 4px 12px #D8DBE0, -4px -4px 12px #FFFFFF',
    gap: 12
  },
  details: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    flex: 1,
    overflow: 'hidden'
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_MAIN,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  author: {
    fontSize: 12,
    color: TEXT_MUTED,
    margin: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  metaRow: {
    fontSize: 11,
    color: '#A1A1A6',
    marginTop: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  delete: {
    border: 'none',
    background: '#F2F2F7',
    width: 28,
    height: 28,
    borderRadius: 14,
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    color: TEXT_MUTED,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '2px 2px 5px #D8DBE0, -2px -2px 5px #FFFFFF'
  },
  emptyState: {
    textAlign: 'center',
    padding: '20px 16px'
  },
  emptyText: {
    fontSize: 13,
    color: TEXT_MUTED,
    margin: 0
  }
}