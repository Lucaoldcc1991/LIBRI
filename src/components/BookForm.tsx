import { useEffect, useState } from 'react'
import { db } from '../db/database'
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
  createdAt?: number
  classic?: boolean
  tags?: string[]
}

const GENRES = [
  'Giallo',
  'Noir',
  'Legal',
  'Thriller',
  'Horror',
  'Gotico',
  'Paranormale',
  'Realista',
  'Psicologico',
  'Filosofico',
  'Narrativa per ragazzi',
  'Saggio',
  'Fumetto',
  'Storico',
  'Di formazione',
  'Autobiografico',
  'Fantascienza',
  'Fantasy',
  'Avventura',
  'Distopico'
]

const MONTHS = [
  'Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno',
  'Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'
]

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'

export default function BookForm({
  book,
  onClose
}: {
  book: Book | null
  onClose: () => void
}) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [genre, setGenre] = useState('')
  const [series, setSeries] = useState('')
  const [country, setCountry] = useState('')
  const [cover, setCover] = useState<string>('')
  const [pages, setPages] = useState<number | ''>('')
  const [publicationYear, setPublicationYear] = useState<number | ''>('')
  const [readingMonth, setReadingMonth] = useState<number | ''>('')
  const [readingYear, setReadingYear] = useState<number | ''>('')
  const [classic, setClassic] = useState(false)
  const [tagsText, setTagsText] = useState('')

  useEffect(() => {
    if (book) {
      setTitle(book.title)
      setAuthor(book.author)
      setGenre(book.genre)
      setSeries(book.series || '')
      setCountry(book.country || '')
      setCover(book.cover || '')
      setPages(book.pages || '')
      setPublicationYear(book.publicationYear || '')
      setReadingMonth(book.readingMonth || '')
      setReadingYear(book.readingYear || '')
      setClassic(book.classic || false)
      setTagsText(book.tags && book.tags.length ? book.tags.join(', ') : '')
    }
  }, [book])

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const MAX_WIDTH = 180
        const MAX_HEIGHT = 270

        let width = img.width
        let height = img.height

        const ratio = Math.min(
          MAX_WIDTH / width,
          MAX_HEIGHT / height,
          1
        )

        width = Math.round(width * ratio)
        height = Math.round(height * ratio)

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        ctx.drawImage(img, 0, 0, width, height)
        const base64 = canvas.toDataURL('image/jpeg', 0.82)
        setCover(base64)
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!title || !author || !genre) return

    const tags = tagsText
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const payload = {
      title,
      author,
      genre,
      series,
      country,
      cover,
      pages: Number(pages) || 0,
      publicationYear: publicationYear ? Number(publicationYear) : undefined,
      readingMonth: readingMonth ? Number(readingMonth) : undefined,
      readingYear: readingYear ? Number(readingYear) : undefined,
      classic,
      tags
    }

    if (book?.id) {
      await db.books.update(book.id, payload)
    } else {
      await db.books.add({
        ...payload,
        createdAt: Date.now()
      } as any)
    }

    onClose()
  }

  return (
    <>
      <style>{`
        input[type=number]::-webkit-outer-spin-button,
        input[type=number]::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        input[type=number] {
          -moz-appearance: textfield;
        }
      `}</style>

      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          
          {/* Header */}
          <div style={styles.headerRow}>
            <h3 style={styles.title}>
              {book ? '✏️ Modifica Libro' : '📖 Nuovo Libro'}
            </h3>
            <button style={styles.closeIconButton} onClick={onClose}>
              ✕
            </button>
          </div>

          <div style={styles.scrollContent}>
            
            {/* Sezione: Info Principali */}
            <div style={styles.sectionCard}>
              <span style={styles.sectionLabel}>Informazioni Principali</span>
              
              <input
                style={styles.input}
                placeholder="Titolo libro *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <input
                style={styles.input}
                placeholder="Autore *"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />

              <select
                style={styles.input}
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
              >
                <option value="">Seleziona Genere *</option>
                {GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Sezione: Dettagli Opera */}
            <div style={styles.sectionCard}>
              <span style={styles.sectionLabel}>Dettagli & Tag</span>
              
              <input
                style={styles.input}
                placeholder="Serie o Saga (opzionale)"
                value={series}
                onChange={(e) => setSeries(e.target.value)}
              />

              <select
                style={styles.input}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              >
                <option value="">Seleziona Paese d'origine</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.flag} {c.name}
                  </option>
                ))}
              </select>

              <div>
                <input
                  style={styles.input}
                  placeholder="Tag (es. spionaggio, guerra, saggio...)"
                  value={tagsText}
                  onChange={(e) => setTagsText(e.target.value)}
                />
                <p style={styles.tagsHint}>Separa i tag con una virgola</p>
              </div>

              {/* Checkbox Classico integrato come Pillola */}
              <label
                style={{
                  ...styles.classicPill,
                  ...(classic ? styles.classicPillActive : {})
                }}
              >
                <input
                  type="checkbox"
                  checked={classic}
                  onChange={(e) => setClassic(e.target.checked)}
                  style={{ display: 'none' }}
                />
                <span>🏛️</span>
                <span style={{ fontWeight: 600 }}>Opera Classica</span>
              </label>
            </div>

            {/* Sezione: Edizione e Copertina */}
            <div style={styles.sectionCard}>
              <span style={styles.sectionLabel}>Edizione & Copertina</span>

              <div style={styles.rowTwo}>
                <input
                  style={styles.input}
                  type="number"
                  placeholder="Pagine"
                  value={pages}
                  onChange={(e) =>
                    setPages(e.target.value === '' ? '' : Number(e.target.value))
                  }
                />

                <input
                  style={styles.input}
                  type="number"
                  placeholder="Anno Pubbl."
                  value={publicationYear}
                  onChange={(e) =>
                    setPublicationYear(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                />
              </div>

              <div style={styles.coverSection}>
                <label style={styles.coverLabel}>
                  <span style={{ fontSize: 18 }}>📷</span>
                  <span style={{ fontWeight: 600, fontSize: 13 }}>
                    {cover ? 'Cambia copertina' : 'Carica copertina'}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverUpload}
                    style={{ display: 'none' }}
                  />
                </label>

                {cover && (
                  <div style={styles.previewContainer}>
                    <img
                      src={cover}
                      alt="Anteprima"
                      style={styles.preview}
                    />
                    <button
                      type="button"
                      style={styles.removeCoverBtn}
                      onClick={() => setCover('')}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Sezione: Lettura */}
            <div style={styles.sectionCard}>
              <span style={styles.sectionLabel}>Cronologia Lettura</span>
              <div style={styles.rowTwo}>
                <select
                  style={styles.input}
                  value={readingMonth}
                  onChange={(e) =>
                    setReadingMonth(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                >
                  <option value="">Mese</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1}>
                      {m}
                    </option>
                  ))}
                </select>

                <input
                  style={styles.input}
                  type="number"
                  placeholder="Anno lettura"
                  value={readingYear}
                  onChange={(e) =>
                    setReadingYear(
                      e.target.value === '' ? '' : Number(e.target.value)
                    )
                  }
                />
              </div>
            </div>

          </div>

          {/* Pulsanti di Azione */}
          <div style={styles.actions}>
            <button onClick={onClose} style={styles.cancel}>
              Annulla
            </button>

            <button
              onClick={save}
              style={{
                ...styles.save,
                opacity: title && author && genre ? 1 : 0.5
              }}
              disabled={!title || !author || !genre}
            >
              Salva Libro
            </button>
          </div>

        </div>
      </div>
    </>
  )
}

/* ================= STILI iOS WHITE 3D ================= */

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.35)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    padding: 16
  },

  modal: {
    background: '#F2F2F7',
    borderRadius: 28,
    width: '100%',
    maxWidth: 420,
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
    overflow: 'hidden',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
  },

  headerRow: {
    padding: '18px 20px 14px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: '#F2F2F7'
  },

  title: {
    fontSize: 20,
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.4px'
  },

  closeIconButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    border: 'none',
    background: '#FFFFFF',
    color: TEXT_MUTED,
    fontWeight: 700,
    fontSize: 12,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '3px 3px 7px #D8DBE0, -3px -3px 7px #FFFFFF'
  },

  scrollContent: {
    padding: '0 20px 16px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 14
  },

  sectionCard: {
    background: '#FFFFFF',
    borderRadius: 20,
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF'
  },

  sectionLabel: {
    fontSize: 11,
    fontWeight: 700,
    color: TEXT_MUTED,
    textTransform: 'uppercase',
    letterSpacing: '0.8px',
    marginBottom: 2
  },

  input: {
    width: '100%',
    padding: '12px 14px',
    borderRadius: 14,
    border: 'none',
    background: '#F2F2F7',
    color: TEXT_MAIN,
    fontSize: 14,
    fontWeight: 500,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF',
    outline: 'none',
    boxSizing: 'border-box'
  },

  rowTwo: {
    display: 'flex',
    gap: 10
  },

  tagsHint: {
    fontSize: 11,
    color: TEXT_MUTED,
    margin: '4px 0 0 4px',
    fontWeight: 500
  },

  classicPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    padding: '10px 14px',
    borderRadius: 14,
    background: '#F2F2F7',
    color: TEXT_MUTED,
    fontSize: 13,
    cursor: 'pointer',
    userSelect: 'none',
    marginTop: 4,
    alignSelf: 'flex-start',
    boxShadow: '3px 3px 6px #D8DBE0, -3px -3px 6px #FFFFFF',
    transition: 'all 0.2s ease'
  },

  classicPillActive: {
    background: '#FFFFFF',
    color: TEXT_MAIN,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF'
  },

  coverSection: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    marginTop: 4
  },

  coverLabel: {
    flex: 1,
    padding: '12px 14px',
    borderRadius: 14,
    background: '#F2F2F7',
    color: TEXT_MAIN,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF'
  },

  previewContainer: {
    position: 'relative',
    display: 'inline-block'
  },

  preview: {
    width: 44,
    height: 64,
    objectFit: 'cover',
    borderRadius: 10,
    boxShadow: '3px 3px 8px rgba(0,0,0,0.15)'
  },

  removeCoverBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 20,
    height: 20,
    borderRadius: 10,
    border: 'none',
    background: '#FF3B30',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  actions: {
    padding: '14px 20px 18px',
    background: '#F2F2F7',
    display: 'flex',
    gap: 12,
    borderTop: '1px solid rgba(0,0,0,0.03)'
  },

  cancel: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    border: 'none',
    background: '#FFFFFF',
    color: TEXT_MAIN,
    fontWeight: 600,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '4px 4px 10px #D8DBE0, -4px -4px 10px #FFFFFF'
  },

  save: {
    flex: 1,
    padding: 14,
    borderRadius: 16,
    border: 'none',
    background: '#FFFFFF',
    color: '#007AFF',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '4px 4px 10px #D8DBE0, -4px -4px 10px #FFFFFF'
  }
}