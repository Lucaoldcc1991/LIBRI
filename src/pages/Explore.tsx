import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'

type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  pages?: number
  readingMonth?: number
  readingYear?: number
  publicationYear?: number
  classic?: boolean
  cover?: string
  tags?: string[]
}

const MONTHS = [
  'Gen', 'Feb', 'Mar', 'Apr',
  'Mag', 'Giu', 'Lug', 'Ago',
  'Set', 'Ott', 'Nov', 'Dic'
]

type View = 'home' | 'genres' | 'classics' | 'authorsAll' | 'series' | 'tags' | 'countries'

type AuthorItem = {
  author: string
  count: number
  surname: string
  name: string
}

const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'

const HOME_CARDS: { view: View; icon: string; title: string; desc: string }[] = [
  { view: 'authorsAll', icon: '👤', title: 'Autori', desc: 'Esplora gli autori' },
  { view: 'genres', icon: '📚', title: 'Generi', desc: 'Esplora per categoria' },
  { view: 'classics', icon: '🏛️', title: 'Classici', desc: 'Autori e opere classiche' },
  { view: 'series', icon: '📖', title: 'Serie', desc: 'Esplora per saga' },
  { view: 'tags', icon: '🏷️', title: 'Tag', desc: 'Esplora per argomento' },
  { view: 'countries', icon: '🌐', title: 'Paesi', desc: 'Esplora per nazione' }
]

const COUNTRY_FLAGS: Record<string, string> = {
  'Italia': '🇮🇹',
  'Stati Uniti': '🇺🇸',
  'Regno Unito': '🇬🇧',
  'Francia': '🇫🇷',
  'Germania': '🇩🇪',
  'Spagna': '🇪🇸',
  'Giappone': '🇯🇵',
  'Russia': '🇷🇺',
  'Cina': '🇨🇳',
  'Brasile': '🇧🇷',
  'Canada': '🇨🇦',
  'Australia': '🇦🇺',
  'Irlanda': '🇮🇪',
  'Svezia': '🇸🇪',
  'Norvegia': '🇳🇴',
  'Polonia': '🇵🇱',
  'Portogallo': '🇵🇹',
  'Grecia': '🇬🇷',
  'Austria': '🇦🇹',
  'Svizzera': '🇨🇭',
  'Messico': '🇲🇽',
  'Argentina': '🇦🇷',
  'Cile': '🇨🇱',
  'Colombia': '🇨🇴'
}

const getFlag = (country: string) => {
  return COUNTRY_FLAGS[country] || '📍'
}

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([])
  const [view, setView] = useState<View>('home')

  const [globalAuthor, setGlobalAuthor] = useState<string | null>(null)
  const [searchAuthor, setSearchAuthor] = useState('')
  const [letterFilter, setLetterFilter] = useState<string | null>(null)

  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)

  const [selectedGenreAuthor, setSelectedGenreAuthor] = useState<string | null>(null)
  const [selectedClassicAuthor, setSelectedClassicAuthor] = useState<string | null>(null)

  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedTagAuthor, setSelectedTagAuthor] = useState<string | null>(null)

  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedCountryAuthor, setSelectedCountryAuthor] = useState<string | null>(null)

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const classicBooks = useMemo(() => {
    return books.filter(b => b.classic === true)
  }, [books])

  const booksByClassicAuthor = useMemo(() => {
    if (!selectedClassicAuthor) return []
    return classicBooks.filter(b => b.author === selectedClassicAuthor)
  }, [classicBooks, selectedClassicAuthor])

  const genresList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      if (!b.genre) return
      if (!map[b.genre]) map[b.genre] = []
      map[b.genre].push(b)
    })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [books])

  const booksByGenre = useMemo(() => {
    if (!selectedGenre) return []
    return books.filter(b => b.genre === selectedGenre)
  }, [books, selectedGenre])

  const booksByGenreAuthor = useMemo(() => {
    if (!selectedGenreAuthor) return []
    return booksByGenre.filter(b => b.author === selectedGenreAuthor)
  }, [booksByGenre, selectedGenreAuthor])

  const seriesList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      if (!b.series) return
      if (!map[b.series]) map[b.series] = []
      map[b.series].push(b)
    })
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]))
  }, [books])

  const booksBySeries = useMemo(() => {
    if (!selectedSeries) return []
    return books.filter(b => b.series === selectedSeries)
  }, [books, selectedSeries])

  const tagsList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      (b.tags || []).forEach(tag => {
        if (!tag) return
        if (!map[tag]) map[tag] = []
        map[tag].push(b)
      })
    })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [books])

  const booksByTag = useMemo(() => {
    if (!selectedTag) return []
    return books.filter(b => (b.tags || []).includes(selectedTag))
  }, [books, selectedTag])

  const booksByTagAuthor = useMemo(() => {
    if (!selectedTagAuthor) return []
    return booksByTag.filter(b => b.author === selectedTagAuthor)
  }, [booksByTag, selectedTagAuthor])

  const countriesList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      if (!b.country) return
      if (!map[b.country]) map[b.country] = []
      map[b.country].push(b)
    })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [books])

  const booksByCountry = useMemo(() => {
    if (!selectedCountry) return []
    return books.filter(b => b.country === selectedCountry)
  }, [books, selectedCountry])

  const booksByCountryAuthor = useMemo(() => {
    if (!selectedCountryAuthor) return []
    return booksByCountry.filter(b => b.author === selectedCountryAuthor)
  }, [booksByCountry, selectedCountryAuthor])

  const totalBooks = books.length

  const totalAuthors = useMemo(() => {
    return new Set(books.map(b => b.author)).size
  }, [books])

  const allAuthors: AuthorItem[] = useMemo(() => {
    const map: Record<string, number> = {}

    books.forEach(b => {
      map[b.author] = (map[b.author] || 0) + 1
    })

    return Object.entries(map)
      .map(([author, count]) => {
        const parts = author.trim().split(' ')
        const surname = parts.length > 1 ? parts[parts.length - 1] : author
        const name = parts.slice(0, -1).join(' ')
        return { author, count, surname, name }
      })
      .sort((a, b) => a.surname.localeCompare(b.surname))
  }, [books])

  const filteredAuthors = useMemo(() => {
    return allAuthors.filter(a => {
      const matchSearch =
        a.author.toLowerCase().includes(searchAuthor.toLowerCase())

      const matchLetter =
        !letterFilter || a.surname.toUpperCase().startsWith(letterFilter)

      return matchSearch && matchLetter
    })
  }, [allAuthors, searchAuthor, letterFilter])

  const groupedAuthors = useMemo(() => {
    const groups: Record<string, AuthorItem[]> = {}

    filteredAuthors.forEach(a => {
      const letter = a.surname.charAt(0).toUpperCase()
      if (!groups[letter]) groups[letter] = []
      groups[letter].push(a)
    })

    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b))
  }, [filteredAuthors])

  const booksByGlobalAuthor = useMemo(() => {
    if (!globalAuthor) return []
    return books.filter(b => b.author === globalAuthor)
  }, [books, globalAuthor])

  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')

  const goBack = () => {
    if (view === 'authorsAll') {
      if (globalAuthor) {
        setGlobalAuthor(null)
      } else {
        setView('home')
        setLetterFilter(null)
        setSearchAuthor('')
      }
    } else if (view === 'genres') {
      if (selectedGenreAuthor) {
        setSelectedGenreAuthor(null)
      } else if (selectedGenre) {
        setSelectedGenre(null)
      } else {
        setView('home')
      }
    } else if (view === 'classics') {
      if (selectedClassicAuthor) {
        setSelectedClassicAuthor(null)
      } else {
        setView('home')
      }
    } else if (view === 'series') {
      if (selectedSeries) {
        setSelectedSeries(null)
      } else {
        setView('home')
      }
    } else if (view === 'tags') {
      if (selectedTagAuthor) {
        setSelectedTagAuthor(null)
      } else if (selectedTag) {
        setSelectedTag(null)
      } else {
        setView('home')
      }
    } else if (view === 'countries') {
      if (selectedCountryAuthor) {
        setSelectedCountryAuthor(null)
      } else if (selectedCountry) {
        setSelectedCountry(null)
      } else {
        setView('home')
      }
    } else {
      setView('home')
    }
  }

  const groupAuthorsByCount = (list: Book[]): AuthorItem[] => {
    const map: Record<string, number> = {}
    list.forEach(b => {
      map[b.author] = (map[b.author] || 0) + 1
    })

    return Object.entries(map)
      .map(([author, count]) => {
        const parts = author.trim().split(' ')
        const surname = parts.length > 1 ? parts[parts.length - 1] : author
        const name = parts.slice(0, -1).join(' ')
        return { author, count, surname, name }
      })
      .sort((a, b) => b.count - a.count || a.surname.localeCompare(b.surname))
  }

  const renderAuthorsList = (list: Book[], onSelect: (author: string) => void) => {
    const authors = groupAuthorsByCount(list)

    return (
      <div style={styles.stack}>
        <div style={styles.metaLine}>{authors.length} autori</div>

        {authors.map(a => (
          <div
            key={a.author}
            style={styles.rowCard}
            onClick={() => onSelect(a.author)}
          >
            <span style={styles.rowTitle}>{a.author}</span>
            <div style={styles.rightStats}>
              <span style={styles.pill}>{a.count}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  /* Vista a griglia stile "Library" con copertine in risalto */
  const renderGridBookList = (list: Book[]) => {
    const sortedList = [...list].sort((a, b) => {
      const aKey = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bKey = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
      return aKey - bKey
    })

    return (
      <div>
        <div style={{ ...styles.metaLine, marginBottom: 8 }}>{sortedList.length} libri</div>
        <div style={styles.gridContainer}>
          {sortedList.map(b => {
            const monthName = b.readingMonth ? MONTHS[b.readingMonth - 1] : null

            // Genere + Pagine
            const genreAndPages = [
              b.genre,
              b.pages && b.pages > 0 ? `${b.pages} p.` : null
            ].filter(Boolean).join(' • ')

            return (
              <div key={b.id} style={styles.card}>
                <div style={styles.coverWrapper}>
                  {b.cover ? (
                    <img src={b.cover} alt={b.title} style={styles.coverImage} loading="lazy" />
                  ) : (
                    <div style={styles.placeholderCover}>
                      <span style={styles.placeholderIcon}>📚</span>
                      <span style={styles.placeholderTitle}>{b.title}</span>
                    </div>
                  )}
                  {b.classic && <span style={styles.classicTag}>Classico</span>}
                </div>

                <div style={styles.cardInfo}>
                  <div style={styles.bookTitle} title={b.title}>
                    {b.title}
                  </div>
                  <div style={styles.bookAuthor}>{b.author}</div>
                  
                  {genreAndPages && <div style={styles.bookGenre}>{genreAndPages}</div>}
                  
                  <div style={styles.metaRowGrid}>
                    <div style={styles.readingDateDiscrete}>
                      {monthName ? `${monthName} ` : ''}
                      {b.readingYear || ''}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🔍 Esplora</h1>
        {view !== 'home' && (
          <button style={styles.back} onClick={goBack}>
            ‹ Indietro
          </button>
        )}
      </header>

      {view === 'home' && (
        <div style={styles.homeGrid}>
          {HOME_CARDS.map(card => (
            <div
              key={card.view}
              style={styles.card3d}
              onClick={() => setView(card.view)}
            >
              <div style={styles.cardIcon}>{card.icon}</div>
              <div>
                <div style={styles.cardTitle}>{card.title}</div>
                <div style={styles.cardDesc}>{card.desc}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'genres' && !selectedGenre && (
        <div style={styles.stack}>
          {genresList.map(([genre, list]) => (
            <div
              key={genre}
              style={styles.rowCard}
              onClick={() => setSelectedGenre(genre)}
            >
              <span style={styles.rowTitle}>{genre}</span>
              <div style={styles.rightStats}>
                <span style={styles.pill}>{list.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'genres' && selectedGenre && !selectedGenreAuthor &&
        renderAuthorsList(booksByGenre, setSelectedGenreAuthor)
      }

      {view === 'genres' && selectedGenre && selectedGenreAuthor &&
        renderGridBookList(booksByGenreAuthor)
      }

      {view === 'classics' && !selectedClassicAuthor &&
        renderAuthorsList(classicBooks, setSelectedClassicAuthor)
      }

      {view === 'classics' && selectedClassicAuthor &&
        renderGridBookList(booksByClassicAuthor)
      }

      {view === 'series' && !selectedSeries && (
        <div style={styles.stack}>
          {seriesList.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Nessuna serie registrata.</p>
            </div>
          )}
          {seriesList.map(([series, list]) => (
            <div
              key={series}
              style={styles.rowCard}
              onClick={() => setSelectedSeries(series)}
            >
              <span style={styles.rowTitle}>{series}</span>
              <div style={styles.rightStats}>
                <span style={styles.pill}>{list.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'series' && selectedSeries &&
        renderGridBookList(booksBySeries)
      }

      {view === 'tags' && !selectedTag && (
        <div style={styles.stack}>
          {tagsList.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Nessun tag registrato.</p>
            </div>
          )}
          {tagsList.map(([tag, list]) => (
            <div
              key={tag}
              style={styles.rowCard}
              onClick={() => setSelectedTag(tag)}
            >
              <span style={styles.rowTitle}>🏷️ {tag}</span>
              <div style={styles.rightStats}>
                <span style={styles.pill}>{list.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'tags' && selectedTag && !selectedTagAuthor &&
        renderAuthorsList(booksByTag, setSelectedTagAuthor)
      }

      {view === 'tags' && selectedTag && selectedTagAuthor &&
        renderGridBookList(booksByTagAuthor)
      }

      {view === 'countries' && !selectedCountry && (
        <div style={styles.stack}>
          {countriesList.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyText}>Nessun paese registrato.</p>
            </div>
          )}
          {countriesList.map(([country, list]) => (
            <div
              key={country}
              style={styles.rowCard}
              onClick={() => setSelectedCountry(country)}
            >
              <span style={styles.rowTitle}>{getFlag(country)} {country}</span>
              <div style={styles.rightStats}>
                <span style={styles.pill}>{list.length}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'countries' && selectedCountry && !selectedCountryAuthor &&
        renderAuthorsList(booksByCountry, setSelectedCountryAuthor)
      }

      {view === 'countries' && selectedCountry && selectedCountryAuthor &&
        renderGridBookList(booksByCountryAuthor)
      }

      {view === 'authorsAll' && !globalAuthor && (
        <>
          <div style={styles.statsCard}>
            <div style={styles.statsBlock}>
              <span style={styles.statsNumber}>{totalBooks}</span>
              <span style={styles.statsLabel}>Libri</span>
            </div>
            <div style={styles.statsDivider} />
            <div style={styles.statsBlock}>
              <span style={styles.statsNumber}>{totalAuthors}</span>
              <span style={styles.statsLabel}>Autori</span>
            </div>
          </div>

          <div style={styles.searchRow}>
            <input
              placeholder="Cerca autore..."
              value={searchAuthor}
              onChange={e => setSearchAuthor(e.target.value)}
              style={styles.search}
            />

            {(searchAuthor || letterFilter) && (
              <button
                onClick={() => {
                  setSearchAuthor('')
                  setLetterFilter(null)
                }}
                style={styles.resetLetters}
              >
                Reset
              </button>
            )}
          </div>

          <div style={styles.alphabet}>
            {alphabet.map(l => (
              <button
                key={l}
                onClick={() =>
                  setLetterFilter(prev => (prev === l ? null : l))
                }
                style={{
                  ...styles.letter,
                  background: letterFilter === l ? '#1C1C1E' : '#FFFFFF',
                  color: letterFilter === l ? '#FFFFFF' : TEXT_MAIN,
                  boxShadow: letterFilter === l
                    ? 'none'
                    : '2px 2px 5px #D8DBE0, -2px -2px 5px #FFFFFF'
                }}
              >
                {l}
              </button>
            ))}
          </div>

          <div style={styles.stack}>
            {groupedAuthors.map(([letter, authors]) => (
              <div key={letter} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={styles.letterHeader}>{letter}</div>

                {authors.map(a => (
                  <div
                    key={a.author}
                    style={styles.rowCard}
                    onClick={() => setGlobalAuthor(a.author)}
                  >
                    <span style={styles.rowTitle}>
                      {a.surname}, {a.name}
                    </span>
                    <div style={styles.rightStats}>
                      <span style={styles.pill}>{a.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {view === 'authorsAll' && globalAuthor &&
        renderGridBookList(booksByGlobalAuthor)
      }
    </div>
  )
}

/* ================= STILI STILE LIBRARY ================= */

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
    alignItems: 'center',
    marginBottom: 4
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },
  back: {
    padding: '6px 14px',
    borderRadius: 12,
    border: 'none',
    background: '#FFFFFF',
    color: TEXT_MAIN,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    boxShadow: '2px 2px 6px #D8DBE0, -2px -2px 6px #FFFFFF'
  },
  homeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10
  },
  card3d: {
    padding: 14,
    borderRadius: 16,
    background: '#FFFFFF',
    color: TEXT_MAIN,
    boxShadow: '4px 4px 12px #D8DBE0, -4px -4px 12px #FFFFFF',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    minHeight: 80
  },
  cardIcon: {
    fontSize: 20,
    marginBottom: 6
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_MAIN
  },
  cardDesc: {
    fontSize: 11,
    color: TEXT_MUTED,
    marginTop: 2
  },
  statsCard: {
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '12px 16px',
    borderRadius: 16,
    background: '#FFFFFF',
    boxShadow: '4px 4px 12px #D8DBE0, -4px -4px 12px #FFFFFF'
  },
  statsBlock: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6
  },
  statsNumber: {
    fontSize: 18,
    fontWeight: 700,
    color: TEXT_MAIN
  },
  statsLabel: {
    fontSize: 12,
    color: TEXT_MUTED,
    fontWeight: 500
  },
  statsDivider: {
    width: 1,
    height: 18,
    background: '#E5E5EA'
  },
  searchRow: {
    display: 'flex',
    gap: 10
  },
  search: {
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
  resetLetters: {
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
  alphabet: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 4,
    justifyContent: 'center'
  },
  letter: {
    width: 26,
    height: 26,
    borderRadius: 8,
    border: 'none',
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  metaLine: {
    fontSize: 12,
    fontWeight: 500,
    color: TEXT_MUTED
  },
  rowCard: {
    padding: '12px 14px',
    borderRadius: 16,
    background: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '4px 4px 12px #D8DBE0, -4px -4px 12px #FFFFFF',
    cursor: 'pointer'
  },
  rowTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_MAIN,
    wordBreak: 'break-word'
  },
  rightStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  pill: {
    padding: '2px 8px',
    borderRadius: 8,
    background: '#F2F2F7',
    fontSize: 11,
    fontWeight: 600,
    color: TEXT_MAIN
  },
  emptyState: {
    textAlign: 'center',
    padding: '20px 16px'
  },
  emptyText: {
    fontSize: 13,
    color: TEXT_MUTED,
    margin: 0
  },
  letterHeader: {
    fontSize: 12,
    fontWeight: 700,
    color: TEXT_MUTED,
    marginTop: 6,
    paddingLeft: 2
  },

  /* Stili per la griglia stile Library */
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))',
    gap: '18px 12px'
  },
  card: {
    display: 'flex',
    flexDirection: 'column'
  },
  coverWrapper: {
    position: 'relative',
    width: '100%',
    aspectRatio: '2/3',
    borderRadius: '6px',
    overflow: 'hidden',
    boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
    border: '1px solid #E5E5E5',
    background: '#FFFFFF'
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
    background: '#E5E5EA'
  },
  placeholderIcon: {
    fontSize: '18px',
    marginBottom: '4px'
  },
  placeholderTitle: {
    fontSize: '9px',
    fontWeight: 600,
    color: TEXT_MUTED,
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
  cardInfo: {
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  bookTitle: {
    fontSize: '11px',
    fontWeight: 600,
    color: TEXT_MAIN,
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
    color: TEXT_MUTED,
    fontStyle: 'italic',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  metaRowGrid: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '2px'
  },
  readingDateDiscrete: {
    fontSize: '10px',
    fontWeight: 600,
    color: '#1C1C1E'
  }
}