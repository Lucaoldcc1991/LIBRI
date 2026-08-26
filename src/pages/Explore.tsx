import { useEffect, useState, useMemo } from 'react'
import { db } from '../db/database'
import { COUNTRIES } from '../utils/countries'

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
  'Gennaio','Febbraio','Marzo','Aprile',
  'Maggio','Giugno','Luglio','Agosto',
  'Settembre','Ottobre','Novembre','Dicembre'
]

type View = 'home' | 'genres' | 'classics' | 'authorsAll' | 'periods' | 'series' | 'countries' | 'lengths' | 'tags'

type AuthorItem = {
  author: string
  count: number
  surname: string
  name: string
}

const PERIOD_ORDER = [
  'Pre-1700 · Imperi · Medioevo · Gotico',
  '1700–1849 · Illuminismo · Rivoluzioni · Romanticismo',
  '1850–1900 · Vittoriano · Neogotico · Realismo',
  '1900–1945 · Modernità · Avanguardie · Guerre',
  '1946–1979 · Guerra Fredda · Esistenzialismo · Postmoderno',
  '1980–1999 · Globalizzazione · Contemporaneo',
  '2000+ · Contemporaneo',
  'Sconosciuto'
]

const LENGTH_ORDER = [
  '📘 Brevi',
  '📗 Medi',
  '📙 Lunghi',
  '📕 Mattoni',
  '🧱 Colossi',
  'Sconosciuto'
]

const LENGTH_RANGES: Record<string, string> = {
  '📘 Brevi': 'fino a 199 pagine',
  '📗 Medi': '200–399 pagine',
  '📙 Lunghi': '400–599 pagine',
  '📕 Mattoni': '600–899 pagine',
  '🧱 Colossi': '900+ pagine',
  'Sconosciuto': ''
}

const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'

const HOME_CARDS: { view: View; icon: string; title: string; desc: string }[] = [
  { view: 'authorsAll', icon: '👤', title: 'Autori', desc: 'Esplora gli autori' },
  { view: 'genres', icon: '📚', title: 'Generi', desc: 'Esplora i libri per categoria' },
  { view: 'classics', icon: '🏛️', title: 'Classici', desc: 'Autori e opere classiche' },
  { view: 'periods', icon: '⏳', title: 'Periodi storici', desc: 'Esplora per epoca' },
  { view: 'series', icon: '📖', title: 'Serie', desc: 'Esplora i libri per saga' },
  { view: 'countries', icon: '🌍', title: 'Paesi', desc: 'Esplora i libri per provenienza' },
  { view: 'lengths', icon: '📏', title: 'Lunghezza', desc: 'Esplora i libri per numero di pagine' },
  { view: 'tags', icon: '🏷️', title: 'Tag', desc: 'Esplora i libri per argomento' }
]

export default function Explore() {
  const [books, setBooks] = useState<Book[]>([])
  const [view, setView] = useState<View>('home')

  const [globalAuthor, setGlobalAuthor] = useState<string | null>(null)
  const [searchAuthor, setSearchAuthor] = useState('')
  const [letterFilter, setLetterFilter] = useState<string | null>(null)

  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [selectedSeries, setSelectedSeries] = useState<string | null>(null)
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null)
  const [selectedLength, setSelectedLength] = useState<string | null>(null)

  const [selectedGenreAuthor, setSelectedGenreAuthor] = useState<string | null>(null)
  const [selectedClassicAuthor, setSelectedClassicAuthor] = useState<string | null>(null)
  const [selectedPeriodAuthor, setSelectedPeriodAuthor] = useState<string | null>(null)
  const [selectedSeriesAuthor, setSelectedSeriesAuthor] = useState<string | null>(null)
  const [selectedCountryAuthor, setSelectedCountryAuthor] = useState<string | null>(null)
  const [selectedLengthAuthor, setSelectedLengthAuthor] = useState<string | null>(null)

  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [selectedTagAuthor, setSelectedTagAuthor] = useState<string | null>(null)

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

  const booksBySeriesAuthor = useMemo(() => {
    if (!selectedSeriesAuthor) return []
    return booksBySeries.filter(b => b.author === selectedSeriesAuthor)
  }, [booksBySeries, selectedSeriesAuthor])

  const countriesList = useMemo(() => {
    const map: Record<string, Book[]> = {}
    books.forEach(b => {
      const country = b.country || 'Sconosciuto'
      if (!map[country]) map[country] = []
      map[country].push(b)
    })
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length)
  }, [books])

  const booksByCountry = useMemo(() => {
    if (!selectedCountry) return []
    return books.filter(
      b => (b.country || 'Sconosciuto') === selectedCountry
    )
  }, [books, selectedCountry])

  const booksByCountryAuthor = useMemo(() => {
    if (!selectedCountryAuthor) return []
    return booksByCountry.filter(b => b.author === selectedCountryAuthor)
  }, [booksByCountry, selectedCountryAuthor])

  const getPeriod = (year?: number) => {
    if (!year) return 'Sconosciuto'
    if (year < 1700) return 'Pre-1700 · Imperi · Medioevo · Gotico'
    if (year <= 1849) return '1700–1849 · Illuminismo · Rivoluzioni · Romanticismo'
    if (year <= 1900) return '1850–1900 · Vittoriano · Neogotico · Realismo'
    if (year <= 1945) return '1900–1945 · Modernità · Avanguardie · Guerre'
    if (year <= 1979) return '1946–1979 · Guerra Fredda · Esistenzialismo · Postmoderno'
    if (year <= 1999) return '1980–1999 · Globalizzazione · Contemporaneo'
    return '2000+ · Contemporaneo'
  }

  const periods = useMemo(() => {
    const map: Record<string, Book[]> = {}

    books.forEach(b => {
      const period = getPeriod(b.publicationYear ?? b.readingYear)
      if (!map[period]) map[period] = []
      map[period].push(b)
    })

    return Object.entries(map).sort(([a], [b]) => {
      const indexA = PERIOD_ORDER.indexOf(a)
      const indexB = PERIOD_ORDER.indexOf(b)
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
    })
  }, [books])

  const booksByPeriod = useMemo(() => {
    if (!selectedPeriod) return []
    return books.filter(
      b => getPeriod(b.publicationYear ?? b.readingYear) === selectedPeriod
    )
  }, [books, selectedPeriod])

  const booksByPeriodAuthor = useMemo(() => {
    if (!selectedPeriodAuthor) return []
    return booksByPeriod.filter(b => b.author === selectedPeriodAuthor)
  }, [booksByPeriod, selectedPeriodAuthor])

  const getLengthCategory = (pages?: number) => {
    if (!pages) return 'Sconosciuto'
    if (pages <= 199) return '📘 Brevi'
    if (pages <= 399) return '📗 Medi'
    if (pages <= 599) return '📙 Lunghi'
    if (pages <= 899) return '📕 Mattoni'
    return '🧱 Colossi'
  }

  const lengthsList = useMemo(() => {
    const map: Record<string, Book[]> = {}

    books.forEach(b => {
      const category = getLengthCategory(b.pages)
      if (!map[category]) map[category] = []
      map[category].push(b)
    })

    return Object.entries(map).sort(([a], [b]) => {
      const indexA = LENGTH_ORDER.indexOf(a)
      const indexB = LENGTH_ORDER.indexOf(b)
      return (indexA === -1 ? 99 : indexA) - (indexB === -1 ? 99 : indexB)
    })
  }, [books])

  const booksByLength = useMemo(() => {
    if (!selectedLength) return []
    return books.filter(b => getLengthCategory(b.pages) === selectedLength)
  }, [books, selectedLength])

  const booksByLengthAuthor = useMemo(() => {
    if (!selectedLengthAuthor) return []
    return booksByLength.filter(b => b.author === selectedLengthAuthor)
  }, [booksByLength, selectedLengthAuthor])

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
    } else if (view === 'periods') {
      if (selectedPeriodAuthor) {
        setSelectedPeriodAuthor(null)
      } else if (selectedPeriod) {
        setSelectedPeriod(null)
      } else {
        setView('home')
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
      if (selectedSeriesAuthor) {
        setSelectedSeriesAuthor(null)
      } else if (selectedSeries) {
        setSelectedSeries(null)
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
    } else if (view === 'lengths') {
      if (selectedLengthAuthor) {
        setSelectedLengthAuthor(null)
      } else if (selectedLength) {
        setSelectedLength(null)
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
        <div style={styles.metaLine}>👤 {authors.length} autori</div>

        {authors.map(a => (
          <div
            key={a.author}
            style={styles.rowCard}
            onClick={() => onSelect(a.author)}
          >
            <span style={styles.rowTitle}>
              {a.author}
            </span>
            <div style={styles.rightStats}>
              <span style={styles.pill}>{a.count}</span>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderCleanBookList = (list: Book[]) => {
    const sortedList = [...list].sort((a, b) => {
      const aKey = (a.readingYear ?? 0) * 100 + (a.readingMonth ?? 0)
      const bKey = (b.readingYear ?? 0) * 100 + (b.readingMonth ?? 0)
      return aKey - bKey
    })

    return (
      <div style={styles.stack}>
        <div style={styles.metaLine}>📖 {sortedList.length} libri</div>

        {sortedList.map(b => {
          const month = b.readingMonth ? MONTHS[b.readingMonth - 1] : ''

          return (
            <div key={b.id} style={styles.bookCard}>
              {b.cover ? (
                <img src={b.cover} alt={b.title} style={styles.cover} />
              ) : (
                <div style={styles.coverPlaceholder}>📕</div>
              )}

              <div style={styles.info}>
                <div style={styles.bookTitle}>{b.title}</div>
                <div style={styles.bookAuthor}>
                  {b.author}
                </div>
                {!!b.pages && (
                  <div style={styles.pagesMeta}>
                    {b.pages} pagine
                  </div>
                )}
                {month && b.readingYear && (
                  <div style={styles.readingMeta}>
                    📅 {month} {b.readingYear}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Esplora</h2>

      {view !== 'home' && (
        <button style={styles.back} onClick={goBack}>
          ‹ Indietro
        </button>
      )}

      {view === 'home' && (
        <div style={styles.homeGrid}>
          {HOME_CARDS.map(card => (
            <div
              key={card.view}
              style={styles.card3d}
              onClick={() => setView(card.view)}
            >
              <div style={styles.cardIcon}>{card.icon}</div>
              <div style={styles.cardTitle}>{card.title}</div>
              <div style={styles.cardDesc}>{card.desc}</div>
            </div>
          ))}
        </div>
      )}

      {view === 'genres' && !selectedGenre && (
        <div style={styles.stack}>
          {genresList.map(([genre, list]) => {
            const pct = totalBooks > 0 ? ((list.length / totalBooks) * 100).toFixed(1) : '0'

            return (
              <div
                key={genre}
                style={styles.rowCardColumn}
                onClick={() => setSelectedGenre(genre)}
              >
                <div style={styles.rowCardHeader}>
                  <span style={styles.rowTitle}>{genre}</span>
                  <div style={styles.rightStats}>
                    <span style={styles.percentageText}>{pct}%</span>
                    <span style={styles.pill}>{list.length}</span>
                  </div>
                </div>

                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressBar, width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'genres' && selectedGenre && !selectedGenreAuthor &&
        renderAuthorsList(booksByGenre, setSelectedGenreAuthor)
      }

      {view === 'genres' && selectedGenre && selectedGenreAuthor &&
        renderCleanBookList(booksByGenreAuthor)
      }

      {view === 'classics' && !selectedClassicAuthor &&
        renderAuthorsList(classicBooks, setSelectedClassicAuthor)
      }

      {view === 'classics' && selectedClassicAuthor &&
        renderCleanBookList(booksByClassicAuthor)
      }

      {view === 'periods' && !selectedPeriod && (
        <div style={styles.stack}>
          {periods.map(([period, list]) => {
            const [years, ...descParts] = period.split(' · ')
            const desc = descParts.join(' · ')
            const pct = totalBooks > 0 ? ((list.length / totalBooks) * 100).toFixed(1) : '0'

            return (
              <div
                key={period}
                style={styles.rowCardColumn}
                onClick={() => setSelectedPeriod(period)}
              >
                <div style={styles.rowCardHeader}>
                  <span style={styles.periodLabel}>
                    <span style={styles.periodYears}>{years}</span>
                    {desc && <span style={styles.periodDesc}>{desc}</span>}
                  </span>
                  <div style={styles.rightStats}>
                    <span style={styles.percentageText}>{pct}%</span>
                    <span style={styles.pill}>{list.length}</span>
                  </div>
                </div>

                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressBar, width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'periods' && selectedPeriod && !selectedPeriodAuthor &&
        renderAuthorsList(booksByPeriod, setSelectedPeriodAuthor)
      }

      {view === 'periods' && selectedPeriod && selectedPeriodAuthor &&
        renderCleanBookList(booksByPeriodAuthor)
      }

      {view === 'series' && !selectedSeries && (
        <div style={styles.stack}>
          {seriesList.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>📖</p>
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

      {view === 'series' && selectedSeries && !selectedSeriesAuthor &&
        renderAuthorsList(booksBySeries, setSelectedSeriesAuthor)
      }

      {view === 'series' && selectedSeries && selectedSeriesAuthor &&
        renderCleanBookList(booksBySeriesAuthor)
      }

      {view === 'countries' && !selectedCountry && (
        <div style={styles.stack}>
          {countriesList.map(([country, list]) => {
            const flag = COUNTRIES.find(c => c.name === country)?.flag
            const pct = totalBooks > 0 ? ((list.length / totalBooks) * 100).toFixed(1) : '0'

            return (
              <div
                key={country}
                style={styles.rowCardColumn}
                onClick={() => setSelectedCountry(country)}
              >
                <div style={styles.rowCardHeader}>
                  <span style={styles.rowTitle}>{flag ? `${flag} ` : ''}{country}</span>
                  <div style={styles.rightStats}>
                    <span style={styles.percentageText}>{pct}%</span>
                    <span style={styles.pill}>{list.length}</span>
                  </div>
                </div>

                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressBar, width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'countries' && selectedCountry && !selectedCountryAuthor &&
        renderAuthorsList(booksByCountry, setSelectedCountryAuthor)
      }

      {view === 'countries' && selectedCountry && selectedCountryAuthor &&
        renderCleanBookList(booksByCountryAuthor)
      }

      {view === 'lengths' && !selectedLength && (
        <div style={styles.stack}>
          {lengthsList.map(([category, list]) => {
            const pct = totalBooks > 0 ? ((list.length / totalBooks) * 100).toFixed(1) : '0'

            return (
              <div
                key={category}
                style={styles.rowCardColumn}
                onClick={() => setSelectedLength(category)}
              >
                <div style={styles.rowCardHeader}>
                  <span style={styles.periodLabel}>
                    <span style={styles.periodYears}>{category}</span>
                    {LENGTH_RANGES[category] && (
                      <span style={styles.periodDesc}>{LENGTH_RANGES[category]}</span>
                    )}
                  </span>
                  <div style={styles.rightStats}>
                    <span style={styles.percentageText}>{pct}%</span>
                    <span style={styles.pill}>{list.length}</span>
                  </div>
                </div>

                <div style={styles.progressTrack}>
                  <div style={{ ...styles.progressBar, width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {view === 'lengths' && selectedLength && !selectedLengthAuthor &&
        renderAuthorsList(booksByLength, setSelectedLengthAuthor)
      }

      {view === 'lengths' && selectedLength && selectedLengthAuthor &&
        renderCleanBookList(booksByLengthAuthor)
      }

      {view === 'tags' && !selectedTag && (
        <div style={styles.stack}>
          {tagsList.length === 0 && (
            <div style={styles.emptyState}>
              <p style={styles.emptyIcon}>🏷️</p>
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
        renderCleanBookList(booksByTagAuthor)
      }

      {view === 'authorsAll' && !globalAuthor && (
        <>
          <div style={styles.statsCard}>
            <div style={styles.statsBlock}>
              <div style={styles.statsIcon}>📚</div>
              <div>
                <div style={styles.statsNumber}>{totalBooks}</div>
                <div style={styles.statsLabel}>Libri</div>
              </div>
            </div>

            <div style={styles.statsDivider} />

            <div style={styles.statsBlock}>
              <div style={styles.statsIcon}>✍️</div>
              <div>
                <div style={styles.statsNumber}>{totalAuthors}</div>
                <div style={styles.statsLabel}>Autori</div>
              </div>
            </div>
          </div>

          <input
            placeholder="Cerca autore..."
            value={searchAuthor}
            onChange={e => setSearchAuthor(e.target.value)}
            style={styles.search}
          />

          <div style={styles.alphabet}>
            {alphabet.map(l => (
              <button
                key={l}
                onClick={() =>
                  setLetterFilter(prev => (prev === l ? null : l))
                }
                style={{
                  ...styles.letter,
                  background: letterFilter === l ? '#007AFF' : '#FFFFFF',
                  color: letterFilter === l ? '#FFFFFF' : TEXT_MAIN,
                  boxShadow: letterFilter === l
                    ? '0 4px 10px rgba(0, 122, 255, 0.3)'
                    : '4px 4px 8px #D9DCE1, -4px -4px 8px #FFFFFF'
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {(searchAuthor || letterFilter) && (
            <button
              onClick={() => {
                setSearchAuthor('')
                setLetterFilter(null)
              }}
              style={styles.resetLetters}
            >
              Tutti
            </button>
          )}

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
        renderCleanBookList(booksByGlobalAuthor)
      }
    </div>
  )
}

/* ================= STILI ================= */
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    background: '#F2F2F7',
    padding: '16px 16px 32px',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", sans-serif'
  },
  title: {
    fontSize: 28,
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },
  back: {
    padding: '8px 16px',
    borderRadius: 20,
    border: 'none',
    background: '#FFFFFF',
    color: '#007AFF',
    cursor: 'pointer',
    width: 'fit-content',
    fontSize: 14,
    fontWeight: 600,
    boxShadow: '4px 4px 10px #D8DBE0, -4px -4px 10px #FFFFFF',
    transition: 'all 0.2s ease'
  },
  homeGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 14
  },
  card3d: {
    padding: 18,
    borderRadius: 22,
    background: '#FFFFFF',
    color: TEXT_MAIN,
    boxShadow: '8px 8px 18px #D8DBE0, -8px -8px 18px #FFFFFF',
    cursor: 'pointer',
    transition: 'transform 0.15s ease, boxShadow 0.15s ease',
    border: '1px solid rgba(255, 255, 255, 0.8)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  cardIcon: {
    fontSize: 24,
    marginBottom: 8
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 700,
    marginTop: 4,
    color: TEXT_MAIN
  },
  cardDesc: {
    fontSize: 12,
    color: TEXT_MUTED,
    marginTop: 4,
    fontWeight: 400
  },
  statsCard: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
    padding: 18,
    borderRadius: 22,
    background: '#FFFFFF',
    boxShadow: '8px 8px 18px #D8DBE0, -8px -8px 18px #FFFFFF'
  },
  statsBlock: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statsIcon: {
    fontSize: 22
  },
  statsNumber: {
    fontSize: 20,
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
    height: 32,
    background: '#E5E5EA'
  },
  search: {
    padding: '12px 16px',
    border: 'none',
    borderRadius: 16,
    background: '#FFFFFF',
    color: TEXT_MAIN,
    fontSize: 15,
    outline: 'none',
    boxShadow: 'inset 4px 4px 8px #D9DCE1, inset -4px -4px 8px #FFFFFF'
  },
  alphabet: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center'
  },
  letter: {
    width: 32,
    height: 32,
    borderRadius: 10,
    border: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  resetLetters: {
    padding: '8px 16px',
    borderRadius: 16,
    border: 'none',
    background: '#E5E5EA',
    color: TEXT_MAIN,
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 600,
    width: 'fit-content',
    alignSelf: 'center'
  },
  stack: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12
  },
  metaLine: {
    fontSize: 14,
    fontWeight: 600,
    color: TEXT_MUTED,
    marginBottom: 4
  },
  rowCard: {
    padding: '14px 18px',
    borderRadius: 18,
    background: '#FFFFFF',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '6px 6px 14px #D9DCE1, -6px -6px 14px #FFFFFF',
    cursor: 'pointer'
  },
  rowCardColumn: {
    padding: '16px 18px',
    borderRadius: 18,
    background: '#FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
    boxShadow: '6px 6px 14px #D9DCE1, -6px -6px 14px #FFFFFF',
    cursor: 'pointer'
  },
  rowCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: TEXT_MAIN
  },
  rightStats: {
    display: 'flex',
    alignItems: 'center',
    gap: 8
  },
  pill: {
    padding: '4px 10px',
    borderRadius: 12,
    background: '#F2F2F7',
    fontSize: 12,
    fontWeight: 600,
    color: TEXT_MAIN
  },
  percentageText: {
    fontSize: 13,
    fontWeight: 600,
    color: TEXT_MUTED
  },
  progressTrack: {
    width: '100%',
    height: 6,
    borderRadius: 3,
    background: '#E5E5EA',
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    background: '#007AFF',
    borderRadius: 3
  },
  periodLabel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  periodYears: {
    fontSize: 15,
    fontWeight: 600,
    color: TEXT_MAIN
  },
  periodDesc: {
    fontSize: 12,
    color: TEXT_MUTED
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    background: '#FFFFFF',
    borderRadius: 18,
    boxShadow: '6px 6px 14px #D9DCE1, -6px -6px 14px #FFFFFF'
  },
  emptyIcon: {
    fontSize: 32,
    margin: 0
  },
  emptyText: {
    fontSize: 14,
    color: TEXT_MUTED,
    marginTop: 8
  },
  bookCard: {
    display: 'flex',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D9DCE1, -6px -6px 14px #FFFFFF',
    alignItems: 'center'
  },
  cover: {
    width: 48,
    height: 70,
    objectFit: 'cover',
    borderRadius: 6
  },
  coverPlaceholder: {
    width: 48,
    height: 70,
    borderRadius: 6,
    background: '#F2F2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 20
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4
  },
  bookTitle: {
    fontSize: 15,
    fontWeight: 700,
    color: TEXT_MAIN
  },
  bookAuthor: {
    fontSize: 13,
    color: TEXT_MUTED
  },
  pagesMeta: {
    fontSize: 12,
    color: TEXT_MUTED
  },
  readingMeta: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: 600
  },
  letterHeader: {
    fontSize: 16,
    fontWeight: 700,
    color: '#007AFF',
    marginTop: 8,
    marginBottom: 4
  }
}