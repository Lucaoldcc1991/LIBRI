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

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'

export default function Wishlist() {
  const [items, setItems] = useState<WishlistItem[]>([])
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [genreCustom, setGenreCustom] = useState('')

  // Stati per la ricerca e i filtri a tendina
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

  // Estrae gli autori unici presenti nella wishlist per popolarele opzioni della tendina
  const wishlistAuthors = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => {
      if (i.author) set.add(i.author.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  // Estrae i generi unici presenti nella wishlist per la tendina dei generi
  const wishlistGenres = useMemo(() => {
    const set = new Set<string>()
    items.forEach((i) => {
      if (i.genre) set.add(i.genre.trim())
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b))
  }, [items])

  // Filtra i libri della wishlist
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
      {/* Header */}
      <div style={styles.headerGroup}>
        <h2 style={styles.header}>✨ La tua Wishlist</h2>
        <p style={styles.eyebrow}>
          {items.length === 0
            ? 'Ancora nessun libro in lista'
            : `${items.length} ${items.length === 1 ? 'libro in lista' : 'libri in lista'}`}
        </p>
      </div>

      {/* FORM ORIGINALE */}
      <div style={styles.formCard}>
        <span style={styles.sectionLabel}>Aggiungi un desiderio</span>

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
          style={styles.input}
        >
          <option value="">Seleziona genere *</option>
          {genres.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>

        <input
          placeholder="Specifica o nota sul genere (es. Ambientato a Roma)..."
          value={genreCustom}
          onChange={(e) => setGenreCustom(e.target.value)}
          style={styles.input}
        />

        <button
          onClick={addItem}
          disabled={!isValid}
          style={{
            ...styles.addButton,
            opacity: isValid ? 1 : 0.5,
            cursor: isValid ? 'pointer' : 'not-allowed'
          }}
        >
          + Aggiungi alla wishlist
        </button>
      </div>

      {/* SEZIONE DI RICERCA CON TENDINE STILE iOS */}
      {items.length > 0 && (
        <div style={styles.searchSectionCard}>
          <span style={styles.sectionLabel}>Cerca & Filtra</span>

          {/* Input testo libero */}
          <input
            placeholder="🔍 Cerca per titolo o parola chiave..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />

          {/* Griglia Tendine Filtri */}
          <div style={styles.selectGrid}>
            {/* Tendina Autori */}
            <div style={styles.selectWrapper}>
              <select
                value={selectedAuthorFilter}
                onChange={(e) => setSelectedAuthorFilter(e.target.value)}
                style={{
                  ...styles.selectInput,
                  color: selectedAuthorFilter ? TEXT_MAIN : TEXT_MUTED
                }}
              >
                <option value="">👤 Tutti gli autori</option>
                {wishlistAuthors.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>

            {/* Tendina Generi */}
            <div style={styles.selectWrapper}>
              <select
                value={selectedGenreFilter}
                onChange={(e) => setSelectedGenreFilter(e.target.value)}
                style={{
                  ...styles.selectInput,
                  color: selectedGenreFilter ? TEXT_MAIN : TEXT_MUTED
                }}
              >
                <option value="">🏷️ Tutti i generi</option>
                {wishlistGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reset Filtri */}
          {hasActiveFilters && (
            <button onClick={resetFilters} style={styles.resetButton}>
              Mostra tutti i libri
            </button>
          )}
        </div>
      )}

      {/* LISTA LIBRI */}
      <div style={styles.list}>
        {filtered.map((item) => (
          <div key={item.id} style={styles.card}>
            <div style={styles.info}>
              <p style={styles.titleBook}>{item.title}</p>
              <p style={styles.meta}>{item.author}</p>
              <span style={styles.genreTag}>{item.genre}</span>
            </div>

            <button
              onClick={() => removeItem(item.id)}
              style={styles.delete}
              aria-label="Rimuovi dalla wishlist"
            >
              ✕
            </button>
          </div>
        ))}

        {items.length > 0 && filtered.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>🔍</p>
            <p style={styles.emptyText}>Nessun libro corrisponde ai filtri selezionati.</p>
          </div>
        )}

        {items.length === 0 && (
          <div style={styles.emptyState}>
            <p style={styles.emptyIcon}>⭐</p>
            <p style={styles.emptyText}>
              La tua wishlist è vuota.
              <br />
              Aggiungi il primo libro qui sopra.
            </p>
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

  formCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF'
  },

  searchSectionCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '16px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF'
  },

  sectionLabel: {
    fontSize: '11px',
    fontWeight: 700,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: '2px'
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: 'none',
    background: '#F2F2F7',
    color: TEXT_MAIN,
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },

  searchInput: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: '14px',
    border: 'none',
    background: '#F2F2F7',
    color: TEXT_MAIN,
    fontSize: '14px',
    fontWeight: 500,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },

  selectGrid: {
    display: 'flex',
    gap: '10px',
    width: '100%'
  },

  selectWrapper: {
    flex: 1,
    position: 'relative'
  },

  selectInput: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '14px',
    border: 'none',
    background: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 600,
    boxShadow: '3px 3px 8px #D8DBE0, -3px -3px 8px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none'
  },

  addButton: {
    marginTop: '4px',
    padding: '14px',
    borderRadius: '16px',
    border: 'none',
    background: '#FFFFFF',
    color: '#007AFF',
    fontWeight: 700,
    fontSize: '14px',
    boxShadow: '4px 4px 10px #D8DBE0, -4px -4px 10px #FFFFFF',
    transition: 'all 0.2s ease'
  },

  resetButton: {
    alignSelf: 'center',
    padding: '8px 16px',
    borderRadius: '12px',
    border: 'none',
    background: '#E5E5EA',
    color: TEXT_MAIN,
    fontSize: '12px',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: '4px'
  },

  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  card: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderRadius: '20px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF'
  },

  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    paddingRight: '12px'
  },

  titleBook: {
    fontWeight: 700,
    fontSize: '16px',
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.3px'
  },

  meta: {
    fontSize: '13px',
    fontWeight: 500,
    color: TEXT_MUTED,
    margin: 0
  },

  genreTag: {
    fontSize: '11px',
    fontWeight: 600,
    color: TEXT_MUTED,
    background: '#F2F2F7',
    padding: '4px 10px',
    borderRadius: '10px',
    width: 'fit-content',
    marginTop: '4px',
    boxShadow: 'inset 1px 1px 3px #D8DBE0, inset -1px -1px 3px #FFFFFF'
  },

  delete: {
    border: 'none',
    background: '#F2F2F7',
    width: '32px',
    height: '32px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: 700,
    cursor: 'pointer',
    color: '#FF3B30',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '3px 3px 6px #D8DBE0, -3px -3px 6px #FFFFFF'
  },

  emptyState: {
    padding: '36px 16px',
    textAlign: 'center',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF'
  },

  emptyIcon: {
    fontSize: '32px',
    margin: 0
  },

  emptyText: {
    fontSize: '13px',
    fontWeight: 500,
    color: TEXT_MUTED,
    marginTop: '8px',
    lineHeight: 1.5
  }
}