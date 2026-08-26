import { useEffect, useState } from 'react'
import { db } from '../db/database'

type Book = {
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  pages: number
  readingYear?: number
  classic?: boolean
}

type ChartMode = 'books' | 'pages' | 'classics' | 'newAuthors'

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'
const ACCENT_BLUE = '#007AFF'

export default function Stats() {
  const [books, setBooks] = useState<Book[]>([])
  const [chartMode, setChartMode] = useState<ChartMode>('books')

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const data = await db.books.toArray()
    setBooks(data)
  }

  const readBooks = books.filter((b) => b.readingYear)

  const totalBooks = readBooks.length

  const totalPages = readBooks.reduce(
    (sum, b) => sum + (b.pages || 0),
    0
  )

  const classicBooks = readBooks.filter((b) => b.classic === true)

  const uniqueAuthors = new Set(readBooks.map((b) => b.author)).size

  const evolutionBase = Object.entries(
    readBooks.reduce(
      (acc: Record<number, { books: number; pages: number; classics: number }>, b) => {
        if (!b.readingYear) return acc

        if (!acc[b.readingYear]) {
          acc[b.readingYear] = { books: 0, pages: 0, classics: 0 }
        }

        acc[b.readingYear].books += 1
        acc[b.readingYear].pages += b.pages || 0
        if (b.classic) acc[b.readingYear].classics += 1

        return acc
      },
      {}
    )
  ).sort((a, b) => Number(a[0]) - Number(b[0]))

  /* ⭐ NUOVI AUTORI PER ANNO */
  const allSorted = [...readBooks].sort(
    (a, b) => (a.readingYear || 0) - (b.readingYear || 0)
  )

  const seenAuthors = new Set<string>()
  const newAuthorsByYear: Record<number, number> = {}

  allSorted.forEach((b) => {
    if (!b.readingYear) return

    if (!seenAuthors.has(b.author)) {
      seenAuthors.add(b.author)

      newAuthorsByYear[b.readingYear] =
        (newAuthorsByYear[b.readingYear] || 0) + 1
    }
  })

  const maxValue = Math.max(
    ...evolutionBase.map(([_, d]) => {
      if (chartMode === 'books') return d.books
      if (chartMode === 'pages') return d.pages
      if (chartMode === 'classics') return d.classics
      return newAuthorsByYear[Number(_)] || 0
    }),
    1
  )

  const chartModes: { key: ChartMode; label: string }[] = [
    { key: 'books', label: 'Libri' },
    { key: 'pages', label: 'Pagine' },
    { key: 'classics', label: 'Classici' },
    { key: 'newAuthors', label: 'Autori' }
  ]

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.headerGroup}>
        <h2 style={styles.header}>📊 Statistiche</h2>
        <p style={styles.eyebrow}>Panoramica completa della tua lettura</p>
      </div>

      {/* GRID METRICHE PRINCIPALI */}
      <div style={styles.grid}>
        <MetricCard title="Libri letti" value={totalBooks} icon="📚" />
        <MetricCard title="Pagine lette" value={totalPages} icon="📄" />
        <MetricCard title="Autori letti" value={uniqueAuthors} icon="✍️" />
        <MetricCard title="Classici" value={classicBooks.length} icon="🏛️" />
      </div>

      {/* EVOLUZIONE / GRAFICO */}
      <div style={styles.sectionCard}>
        <div style={styles.chartHeader}>
          <h3 style={styles.sectionTitleSmall}>📈 Evoluzione nel tempo</h3>

          {/* Segmented Control Switcher */}
          <div style={styles.segmentedControl}>
            {chartModes.map((m) => {
              const isActive = chartMode === m.key
              return (
                <button
                  key={m.key}
                  onClick={() => setChartMode(m.key)}
                  style={{
                    ...styles.segmentBtn,
                    ...(isActive ? styles.segmentBtnActive : {})
                  }}
                >
                  {m.label}
                </button>
              )
            })}
          </div>
        </div>

        <div style={styles.scrollChart}>
          {evolutionBase.map(([year, data]) => {
            const value =
              chartMode === 'books'
                ? data.books
                : chartMode === 'pages'
                ? data.pages
                : chartMode === 'classics'
                ? data.classics
                : newAuthorsByYear[Number(year)] || 0

            const height = (value / maxValue) * 100
            const isHighest = value === maxValue && maxValue > 0

            return (
              <div key={year} style={styles.columnItem}>
                <div style={styles.columnWrap}>
                  <div
                    style={{
                      ...styles.columnBar,
                      height: `${height}%`,
                      background: isHighest
                        ? 'linear-gradient(180deg, #007AFF 0%, #0051A8 100%)'
                        : 'linear-gradient(180deg, rgba(0, 122, 255, 0.45) 0%, rgba(0, 81, 168, 0.35) 100%)'
                    }}
                  />
                </div>

                <div style={styles.columnValue}>{value}</div>
                <div style={styles.columnLabel}>{year}</div>
              </div>
            )
          })}
          {evolutionBase.length === 0 && (
            <p style={styles.emptyText}>Nessun dato ancora registrato.</p>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================= COMPONENTI ================= */

function MetricCard({
  title,
  value,
  icon
}: {
  title: string
  value: any
  icon: string
}) {
  return (
    <div style={styles.metricCard}>
      <div style={styles.metricIconPill}>{icon}</div>
      <p style={styles.metricTitle}>{title}</p>
      <p style={styles.metricValue}>{value.toLocaleString()}</p>
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

  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px'
  },

  metricCard: {
    padding: '16px',
    borderRadius: '20px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },

  metricIconPill: {
    width: '32px',
    height: '32px',
    borderRadius: '12px',
    background: '#F2F2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    marginBottom: '4px',
    boxShadow: 'inset 1px 1px 3px #D8DBE0, inset -1px -1px 3px #FFFFFF'
  },

  metricTitle: {
    fontSize: '12px',
    fontWeight: 600,
    color: TEXT_MUTED,
    margin: 0
  },

  metricValue: {
    fontSize: '22px',
    fontWeight: 800,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.5px'
  },

  sectionCard: {
    padding: '16px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  sectionTitleSmall: {
    fontSize: '14px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.2px'
  },

  chartHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  segmentedControl: {
    display: 'flex',
    background: '#F2F2F7',
    padding: '3px',
    borderRadius: '14px',
    gap: '2px',
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF'
  },

  segmentBtn: {
    flex: 1,
    padding: '7px 4px',
    borderRadius: '11px',
    border: 'none',
    background: 'transparent',
    color: TEXT_MUTED,
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    textAlign: 'center'
  },

  segmentBtnActive: {
    background: '#FFFFFF',
    color: ACCENT_BLUE,
    boxShadow: '2px 2px 6px rgba(0,0,0,0.08)'
  },

  scrollChart: {
    display: 'flex',
    gap: '16px',
    overflowX: 'auto',
    padding: '12px 4px 4px',
    alignItems: 'flex-end'
  },

  columnItem: {
    minWidth: '40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },

  columnWrap: {
    height: '120px',
    width: '12px',
    display: 'flex',
    alignItems: 'flex-end',
    background: '#F2F2F7',
    borderRadius: '10px',
    boxShadow: 'inset 1.5px 1.5px 3px #D8DBE0, inset -1.5px -1.5px 3px #FFFFFF',
    overflow: 'hidden'
  },

  columnBar: {
    width: '100%',
    borderRadius: '10px',
    transition: 'height 0.3s ease'
  },

  columnValue: {
    fontSize: '11px',
    marginTop: '6px',
    color: TEXT_MAIN,
    fontWeight: 700
  },

  columnLabel: {
    fontSize: '10px',
    color: TEXT_MUTED,
    fontWeight: 500
  },

  emptyText: {
    fontSize: '13px',
    color: TEXT_MUTED,
    fontStyle: 'italic',
    margin: 0
  }
}