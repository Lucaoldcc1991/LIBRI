import { useEffect, useState, useMemo } from 'react'
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

  const readBooks = useMemo(() => books.filter((b) => b.readingYear), [books])

  const totalBooks = readBooks.length

  const totalPages = useMemo(() => {
    return readBooks.reduce((sum, b) => sum + (b.pages || 0), 0)
  }, [readBooks])

  const classicBooks = useMemo(() => {
    return readBooks.filter((b) => b.classic === true)
  }, [readBooks])

  const uniqueAuthors = useMemo(() => {
    return new Set(readBooks.map((b) => b.author)).size
  }, [readBooks])

  const uniqueGenres = useMemo(() => {
    return new Set(readBooks.map((b) => b.genre).filter(Boolean)).size
  }, [readBooks])

  const uniqueCountries = useMemo(() => {
    return new Set(readBooks.map((b) => b.country).filter(Boolean)).size
  }, [readBooks])

  /* ⭐ MOTORE DI ANALISI E DIAGNOSI DEL LETTORE */
  const profileAnalysis = useMemo(() => {
    if (totalBooks === 0) {
      return {
        archetype: {
          title: 'Lettore in Divenire',
          desc: 'Aggiungi i tuoi primi libri per sbloccare l’analisi approfondita della tua mente letteraria.',
          icon: '🌱',
          badge: 'Nuovo Profilo'
        },
        insights: []
      }
    }

    // Calcoli comportamentali
    const seriesCount = readBooks.filter(
      (b) => b.series && b.series.trim().length > 0
    ).length
    const seriesRatio = Math.round((seriesCount / totalBooks) * 100)

    const genreCounts: Record<string, number> = {}
    readBooks.forEach((b) => {
      if (b.genre) genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1
    })
    const sortedGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])
    const topGenre = sortedGenres[0]?.[0] || 'Non specificato'
    const topGenrePct = sortedGenres[0]
      ? Math.round((sortedGenres[0][1] / totalBooks) * 100)
      : 0

    const authorCounts: Record<string, number> = {}
    readBooks.forEach((b) => {
      authorCounts[b.author] = (authorCounts[b.author] || 0) + 1
    })
    const repeatBooksCount = readBooks.filter(
      (b) => authorCounts[b.author] > 1
    ).length
    const repeatRatio = Math.round((repeatBooksCount / totalBooks) * 100)

    const foreignCount = readBooks.filter(
      (b) => b.country && b.country.trim().toLowerCase() !== 'italia'
    ).length
    const foreignRatio = Math.round((foreignCount / totalBooks) * 100)

    const classicRatio = Math.round((classicBooks.length / totalBooks) * 100)

    // 1. Definizione dell'Archetipo Guida
    let archetype = {
      title: 'Devoto delle Storie',
      desc: 'Un lettore guidato dalla pura curiosità e dal piacere del racconto.',
      icon: '📖',
      badge: 'Equilibrato'
    }

    if (classicRatio >= 35) {
      archetype = {
        title: 'Custode del Canone',
        desc: 'Prediligi opere che hanno superato la prova del tempo e lasciano un’impronta duratura.',
        icon: '🏛️',
        badge: 'Classico'
      }
    } else if (uniqueCountries >= 5 || foreignRatio >= 60) {
      archetype = {
        title: 'Esploratore Cosmopolita',
        desc: 'Usi la letteratura come passaporto per esplorare culture e prospettive lontane.',
        icon: '🌍',
        badge: 'Internazionale'
      }
    } else if (seriesRatio >= 40) {
      archetype = {
        title: 'Architetto di Saghe',
        desc: 'Ami immergerti in universi complessi e seguire la crescita dei personaggi nel tempo.',
        icon: '🏰',
        badge: 'Seriale'
      }
    } else if (uniqueGenres >= 5 && topGenrePct < 30) {
      archetype = {
        title: 'Eclettico Digitale',
        desc: 'Non ti lasci ingabbiare nei generi: saltelli tra stili e forme narrative opposte.',
        icon: '🎭',
        badge: 'Variegato'
      }
    }

    // 2. Generazione delle Osservazioni Qualitative
    const insights = []

    // Osservazione A: Focus vs Varietà dei Generi
    if (topGenrePct >= 35) {
      insights.push({
        tag: 'Centro di Gravità',
        icon: '🎯',
        title: `Dominanza del genere "${topGenre}"`,
        text: `Il ${topGenrePct}% della tua libreria appartiene a questo genere. Hai un baricentro narrativo forte a cui ami ritornare periodicamente per ricaricarti.`
      })
    } else {
      insights.push({
        tag: 'Varietà Narrativa',
        icon: '🔀',
        title: 'Gusto eclettico e bilanciato',
        text: `Nessun genere supera il 30% del totale. Distribuisci le tue letture su uno spettro ampio senza creare monopoli concettuali.`
      })
    }

    // Osservazione B: Struttura delle Letture (Saghe vs Autori vs Standalone)
    if (seriesRatio >= 30) {
      insights.push({
        tag: 'Continuità Narrative',
        icon: '📚',
        title: 'Attrazione per gli universi espansi',
        text: `Circa il ${seriesRatio}% dei tuoi libri fa parte di una serie. Mostri una forte propensione a seguire percorsi narrativi a lungo termine.`
      })
    } else if (repeatRatio >= 25) {
      insights.push({
        tag: 'Fidelizzazione',
        icon: '✍️',
        title: 'Esplorazione profonda degli autori',
        text: `Il ${repeatRatio}% delle tue letture appartiene ad autori già letti. Quando trovi una voce affine, preferisci scavare nella sua produzione intera.`
      })
    } else {
      insights.push({
        tag: 'Sperimentazione',
        icon: '✨',
        title: 'Ricerca costante di voci nuove',
        text: 'Prediligi storie autoconclusive e rinnovi quasi sempre l’autore. La tua priorità è scoprire punti di vista sempre differenti.'
      })
    }

    // Osservazione C: Orizzonte temporale o geografico
    if (classicRatio >= 25) {
      insights.push({
        tag: 'Profondità Temporale',
        icon: '⏳',
        title: 'Ancoraggio ai classici',
        text: `Il ${classicRatio}% delle tue letture appartiene al canone dei classici. Alterni il ritmo contemporaneo con opere di rilevanza storica.`
      })
    } else if (foreignRatio >= 40) {
      insights.push({
        tag: 'Geografia Narrativa',
        icon: '🗺️',
        title: 'Sguardo oltre confine',
        text: `Il ${foreignRatio}% delle tue letture proviene dall'estero. Cerchi attivamente ambientazioni e sensibilità culturali internazionali.`
      })
    } else {
      insights.push({
        tag: 'Contemporaneità',
        icon: '💡',
        title: 'Sintonia con il presente',
        text: 'La tua selezione è fortemente ancorata alla narrativa contemporanea, riflettendo le sensibilità e i temi del mondo attuale.'
      })
    }

    return { archetype, insights }
  }, [readBooks, totalBooks, classicBooks, uniqueCountries, uniqueGenres])

  const evolutionBase = useMemo(() => {
    return Object.entries(
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
  }, [readBooks])

  /* ⭐ NUOVI AUTORI PER ANNO */
  const newAuthorsByYear = useMemo(() => {
    const allSorted = [...readBooks].sort(
      (a, b) => (a.readingYear || 0) - (b.readingYear || 0)
    )
    const seenAuthors = new Set<string>()
    const res: Record<number, number> = {}

    allSorted.forEach((b) => {
      if (!b.readingYear) return
      if (!seenAuthors.has(b.author)) {
        seenAuthors.add(b.author)
        res[b.readingYear] = (res[b.readingYear] || 0) + 1
      }
    })
    return res
  }, [readBooks])

  const maxValue = Math.max(
    ...evolutionBase.map(([year, d]) => {
      if (chartMode === 'books') return d.books
      if (chartMode === 'pages') return d.pages
      if (chartMode === 'classics') return d.classics
      return newAuthorsByYear[Number(year)] || 0
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

      {/* ⭐ CARTA PROFILO & ANALISI QUALITATIVA */}
      <div style={styles.dnaCard}>
        <div style={styles.dnaHeader}>
          <span style={styles.dnaBadge}>
            {profileAnalysis.archetype.badge}
          </span>
          <span style={styles.dnaSub}>Analisi del Lettore</span>
        </div>

        {/* HERO PROFILO */}
        <div style={styles.dnaBody}>
          <div style={styles.dnaIconBox}>
            {profileAnalysis.archetype.icon}
          </div>
          <div style={styles.dnaTextGroup}>
            <h4 style={styles.dnaTitle}>
              {profileAnalysis.archetype.title}
            </h4>
            <p style={styles.dnaDesc}>
              {profileAnalysis.archetype.desc}
            </p>
          </div>
        </div>

        {/* SEPARATORE DELICATO */}
        {profileAnalysis.insights.length > 0 && (
          <div style={styles.divider} />
        )}

        {/* SEZIONE ANALISI COMPORTAMENTALE */}
        {profileAnalysis.insights.length > 0 && (
          <div style={styles.analysisContainer}>
            <p style={styles.analysisSectionTitle}>
              OSSERVAZIONI SULLE TUE LETTURE
            </p>

            <div style={styles.analysisList}>
              {profileAnalysis.insights.map((item, idx) => (
                <div key={idx} style={styles.analysisCard}>
                  <div style={styles.analysisCardHeader}>
                    <span style={styles.analysisIcon}>{item.icon}</span>
                    <span style={styles.analysisTag}>{item.tag}</span>
                  </div>
                  <h5 style={styles.analysisTitle}>{item.title}</h5>
                  <p style={styles.analysisText}>{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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

  /* ⭐ CARD PROFILO & ANALISI QUALITATIVA */
  dnaCard: {
    padding: '20px',
    borderRadius: '24px',
    background: 'linear-gradient(135deg, #FFFFFF 0%, #F8FAFC 100%)',
    boxShadow: '6px 6px 16px #D8DBE0, -6px -6px 16px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid rgba(255, 255, 255, 0.8)'
  },

  dnaHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  dnaBadge: {
    padding: '4px 10px',
    borderRadius: '12px',
    background: 'rgba(0, 122, 255, 0.1)',
    color: ACCENT_BLUE,
    fontSize: '11px',
    fontWeight: 700,
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },

  dnaSub: {
    fontSize: '12px',
    fontWeight: 600,
    color: TEXT_MUTED
  },

  dnaBody: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  dnaIconBox: {
    width: '54px',
    height: '54px',
    borderRadius: '18px',
    background: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    flexShrink: 0,
    boxShadow: '4px 4px 10px #D8DBE0, -4px -4px 10px #FFFFFF'
  },

  dnaTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px'
  },

  dnaTitle: {
    fontSize: '18px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.3px'
  },

  dnaDesc: {
    fontSize: '12px',
    color: TEXT_MUTED,
    margin: 0,
    lineHeight: '1.4',
    fontWeight: 400
  },

  divider: {
    height: '1px',
    background: '#E5E5EA',
    margin: '2px 0'
  },

  analysisContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  analysisSectionTitle: {
    fontSize: '10px',
    fontWeight: 700,
    color: TEXT_MUTED,
    letterSpacing: '0.6px',
    margin: 0
  },

  analysisList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },

  analysisCard: {
    padding: '12px 14px',
    borderRadius: '16px',
    background: '#F2F2F7',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    boxShadow: 'inset 1.5px 1.5px 3px #D8DBE0, inset -1.5px -1.5px 3px #FFFFFF'
  },

  analysisCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },

  analysisIcon: {
    fontSize: '14px'
  },

  analysisTag: {
    fontSize: '10px',
    fontWeight: 700,
    color: ACCENT_BLUE,
    textTransform: 'uppercase',
    letterSpacing: '0.4px'
  },

  analysisTitle: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0
  },

  analysisText: {
    fontSize: '11px',
    color: TEXT_MUTED,
    margin: 0,
    lineHeight: '1.35'
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