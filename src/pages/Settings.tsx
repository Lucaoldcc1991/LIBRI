import { useState } from 'react'
import { db } from '../db/database'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

type Book = {
  id?: number
  title: string
  author: string
  genre?: string
  series?: string
  country?: string
  pages: number
  readingYear?: number
  classic?: boolean
  cover?: string
}

/* ================= iOS WHITE 3D PALETTE ================= */
const TEXT_MAIN = '#1C1C1E'
const TEXT_MUTED = '#8E8E93'
const ACCENT_BLUE = '#007AFF'
const ACCENT_PURPLE = '#5856D6'
const ACCENT_GREEN = '#34C759'
const ACCENT_RED = '#FF3B30'

export default function Settings() {
  const [fileName, setFileName] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle')

  /* =========================
     UTILITY: OTTIENI LIBRI LETTI
  ========================= */
  const getSortedReadBooks = async (): Promise<Book[]> => {
    const allBooks: Book[] = await db.books.toArray()
    return allBooks
      .filter((b) => b.readingYear)
      .sort((a, b) => {
        const yearA = a.readingYear || 0
        const yearB = b.readingYear || 0
        if (yearA !== yearB) return yearA - yearB
        return a.title.localeCompare(b.title)
      })
  }

  /* =========================
     UTILITY: CARICA IMMAGINE IN BASE64
  ========================= */
  const loadImageAsBase64 = (url: string): Promise<{ dataUrl: string; format: string } | null> => {
    return new Promise((resolve) => {
      // Se è già in formato Base64 Data URL
      if (url.startsWith('data:image/')) {
        const format = url.substring(url.indexOf('/') + 1, url.indexOf(';')).toUpperCase()
        resolve({ dataUrl: url, format: format === 'JPG' ? 'JPEG' : format })
        return
      }

      const img = new Image()
      img.crossOrigin = 'Anonymous'
      img.src = url
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          resolve(null)
          return
        }
        ctx.drawImage(img, 0, 0)
        const format = url.toLowerCase().endsWith('.png') ? 'PNG' : 'JPEG'
        resolve({ dataUrl: canvas.toDataURL(format === 'PNG' ? 'image/png' : 'image/jpeg'), format })
      }
      img.onerror = () => resolve(null)
    })
  }

  /* =========================
     EXPORT BACKUP (JSON)
  ========================= */
  const exportBackup = async () => {
    const books = await db.books.toArray()
    const wishlist = await db.wishlist.toArray()

    const data = {
      books,
      wishlist,
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })

    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ReadingTracker_Backup_${
      new Date().toISOString().split('T')[0]
    }.json`

    a.click()
    URL.revokeObjectURL(url)
  }

  /* =========================
     EXPORT EXCEL (.xlsx)
  ========================= */
  const exportExcel = async () => {
    const readBooks = await getSortedReadBooks()

    if (readBooks.length === 0) {
      alert('Nessun libro letto registrato da esportare.')
      return
    }

    const excelData = readBooks.map((b, index) => ({
      '#': index + 1,
      'Anno di Lettura': b.readingYear || '-',
      'Titolo': b.title,
      'Autore': b.author,
      'Genere': b.genre || '-',
      'Pagine': b.pages || 0,
      'Serie': b.series || '-',
      'Paese': b.country || '-',
      'Classico': b.classic ? 'Sì' : 'No'
    }))

    const worksheet = XLSX.utils.json_to_sheet(excelData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Libreria Letti')

    const maxCols = [
      { wch: 5 },  // #
      { wch: 15 }, // Anno
      { wch: 30 }, // Titolo
      { wch: 25 }, // Autore
      { wch: 18 }, // Genere
      { wch: 10 }, // Pagine
      { wch: 20 }, // Serie
      { wch: 15 }, // Paese
      { wch: 10 }  // Classico
    ]
    worksheet['!cols'] = maxCols

    XLSX.writeFile(
      workbook,
      `ReadingTracker_Libreria_${new Date().toISOString().split('T')[0]}.xlsx`
    )
  }

  /* =========================
     EXPORT PDF (.pdf) CON COPERTINE
  ========================= */
  const exportPDF = async () => {
    const readBooks = await getSortedReadBooks()

    if (readBooks.length === 0) {
      alert('Nessun libro letto registrato da esportare.')
      return
    }

    // Pre-carica e converte tutte le copertine presenti
    const loadedCovers = await Promise.all(
      readBooks.map(async (b) => {
        if (!b.cover) return null
        return await loadImageAsBase64(b.cover)
      })
    )

    const doc = new jsPDF()

    // Header del documento
    doc.setFontSize(18)
    doc.setTextColor(28, 28, 30)
    doc.text('Registro Letture', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(142, 142, 147)
    doc.text('Elenco cronologico (dal primo letto ad oggi)', 14, 26)

    const totalPages = readBooks.reduce((acc, b) => acc + (b.pages || 0), 0)
    doc.setFontSize(10)
    doc.setTextColor(0, 122, 255)
    doc.text(
      `Totale: ${readBooks.length} libri | ${totalPages.toLocaleString('it-IT')} pagine`,
      196,
      26,
      { align: 'right' }
    )

    // Tabella PDF (Colonna 1 riservata alla Copertina)
    const tableData = readBooks.map((b, index) => [
      index + 1,
      '', // Spazio per l'immagine della copertina
      b.readingYear || '-',
      b.title,
      b.author,
      b.genre || '-',
      b.pages ? `${b.pages} pag.` : '-'
    ])

    autoTable(doc, {
      startY: 32,
      head: [['#', 'Copertina', 'Anno', 'Titolo', 'Autore', 'Genere', 'Pagine']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [0, 122, 255],
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center'
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
        valign: 'middle'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 10 },
        1: { halign: 'center', cellWidth: 16 }, // Colonna Copertina
        2: { halign: 'center', cellWidth: 16 },
        3: { cellWidth: 50 },
        4: { cellWidth: 40 },
        5: { cellWidth: 32 },
        6: { halign: 'right', cellWidth: 18 }
      },

      // Render dell'immagine della copertina nella colonna dedicata
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 1) {
          const coverObj = loadedCovers[data.row.index]
          if (coverObj) {
            const imgWidth = 10
            const imgHeight = 14
            const posX = data.cell.x + (data.cell.width - imgWidth) / 2
            const posY = data.cell.y + (data.cell.height - imgHeight) / 2

            try {
              doc.addImage(
                coverObj.dataUrl,
                coverObj.format,
                posX,
                posY,
                imgWidth,
                imgHeight
              )
            } catch (err) {
              console.error('Errore durante il rendering dell\'immagine nel PDF:', err)
            }
          }
        }
      }
    })

    // Footer
    const dateStr = new Date().toLocaleDateString('it-IT')
    doc.setFontSize(8)
    doc.setTextColor(142, 142, 147)
    doc.text(
      `Generato da Reading Tracker il ${dateStr}`,
      105,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )

    doc.save(
      `ReadingTracker_Report_${new Date().toISOString().split('T')[0]}.pdf`
    )
  }

  /* =========================
     IMPORT BACKUP (JSON)
  ========================= */
  const importBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setImportStatus('idle')

    const reader = new FileReader()

    reader.onload = async (e) => {
      try {
        const result = e.target?.result as string
        const data = JSON.parse(result)

        if (data.books) {
          await db.books.clear()
          await db.books.bulkAdd(data.books)
        }

        if (data.wishlist) {
          await db.wishlist.clear()
          await db.wishlist.bulkAdd(data.wishlist)
        }

        setImportStatus('success')
      } catch (err) {
        setImportStatus('error')
      }
    }

    reader.readAsText(file)
  }

  /* =========================
     RESET BOOKS
  ========================= */
  const resetBooks = async () => {
    const confirmReset = confirm(
      'Vuoi eliminare tutti i libri? Questa azione non può essere annullata.'
    )

    if (!confirmReset) return

    await db.books.clear()
    alert('Tutti i libri sono stati eliminati')
  }

  return (
    <div style={styles.container}>
      <style>{`
        .rt-file-input::file-selector-button {
          padding: 8px 14px;
          border-radius: 12px;
          border: none;
          background: #FFFFFF;
          color: ${ACCENT_BLUE};
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          margin-right: 12px;
          box-shadow: 2px 2px 6px rgba(0,0,0,0.08);
          transition: all 0.2s ease;
        }
        .rt-file-input::file-selector-button:hover {
          background: #F2F2F7;
        }
      `}</style>

      {/* Header */}
      <div style={styles.headerGroup}>
        <h2 style={styles.header}>⚙️ Impostazioni</h2>
        <p style={styles.eyebrow}>Backup, esportazione e gestione dati</p>
      </div>

      {/* EXPORT EXCEL */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={styles.cardIconPill}>📊</div>
          <div>
            <p style={styles.cardLabel}>Esporta Libreria Excel (.xlsx)</p>
            <p style={styles.cardHint}>
              Scarica un foglio di calcolo completo con tutti i libri letti e le relative informazioni
            </p>
          </div>
        </div>
        <button onClick={exportExcel} style={styles.buttonGreen}>
          Esporta in Excel
        </button>
      </div>

      {/* EXPORT PDF */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={styles.cardIconPill}>📄</div>
          <div>
            <p style={styles.cardLabel}>Esporta Cronologia PDF</p>
            <p style={styles.cardHint}>
              Scarica un documento PDF con l’elenco dei libri letti in ordine cronologico e relative copertine
            </p>
          </div>
        </div>
        <button onClick={exportPDF} style={styles.buttonPurple}>
          Esporta report PDF
        </button>
      </div>

      {/* EXPORT JSON BACKUP */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={styles.cardIconPill}>⬇️</div>
          <div>
            <p style={styles.cardLabel}>Backup locale (JSON)</p>
            <p style={styles.cardHint}>
              Salva una copia completa di libri e desideri da ripristinare in seguito
            </p>
          </div>
        </div>
        <button onClick={exportBackup} style={styles.buttonPrimary}>
          Esporta backup .json
        </button>
      </div>

      {/* IMPORT BACKUP */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={styles.cardIconPill}>⬆️</div>
          <div>
            <p style={styles.cardLabel}>Ripristina backup</p>
            <p style={styles.cardHint}>Carica un file .json esportato in precedenza</p>
          </div>
        </div>

        <input
          type="file"
          accept="application/json"
          onChange={importBackup}
          className="rt-file-input"
          style={styles.fileInput}
        />

        {fileName && importStatus === 'success' && (
          <p style={styles.successText}>✓ “{fileName}” importato con successo</p>
        )}
        {fileName && importStatus === 'error' && (
          <p style={styles.errorText}>⚠ Errore durante l’importazione di “{fileName}”</p>
        )}
      </div>

      {/* CLOUD */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={styles.cardIconPill}>☁️</div>
          <div>
            <p style={styles.cardLabel}>Backup Cloud</p>
            <p style={styles.cardHint}>Sincronizzazione automatica multi-dispositivo</p>
          </div>
        </div>
        <button
          onClick={() => alert('Funzione cloud in arrivo nei prossimi aggiornamenti.')}
          style={styles.buttonSecondary}
        >
          Backup cloud (in arrivo)
        </button>
      </div>

      {/* RESET LIBRI */}
      <div style={styles.card}>
        <div style={styles.cardHead}>
          <div style={{ ...styles.cardIconPill, color: ACCENT_RED }}>🗑️</div>
          <div>
            <p style={styles.cardLabel}>Reset libreria</p>
            <p style={styles.cardHint}>Elimina definitivamente tutti i dati della libreria</p>
          </div>
        </div>
        <button onClick={resetBooks} style={styles.buttonDanger}>
          Elimina tutti i libri
        </button>
      </div>

      {/* FOOTER INFO */}
      <div style={styles.footerCard}>
        <p style={styles.footerText}>📚 Reading Tracker 2.0</p>
        <p style={styles.footerSub}>
          Database Locale · Salvataggio su Dexie.js
        </p>
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
    // MODIFICATO: Aumentato il padding inferiore a 110px per non far coprire i contenuti dalla nav bar
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

  card: {
    padding: '18px',
    borderRadius: '24px',
    background: '#FFFFFF',
    boxShadow: '6px 6px 14px #D8DBE0, -6px -6px 14px #FFFFFF',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px'
  },

  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px'
  },

  cardIconPill: {
    width: '38px',
    height: '38px',
    borderRadius: '14px',
    background: '#F2F2F7',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    flexShrink: 0,
    boxShadow: 'inset 1.5px 1.5px 3px #D8DBE0, inset -1.5px -1.5px 3px #FFFFFF'
  },

  cardLabel: {
    fontSize: '15px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0,
    letterSpacing: '-0.3px'
  },

  cardHint: {
    fontSize: '12px',
    color: TEXT_MUTED,
    margin: '2px 0 0 0',
    lineHeight: '1.4'
  },

  buttonPrimary: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: 'linear-gradient(180deg, #007AFF 0%, #0051A8 100%)',
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '3px 3px 8px rgba(0, 122, 255, 0.3)',
    alignSelf: 'flex-start'
  },

  buttonGreen: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: `linear-gradient(180deg, ${ACCENT_GREEN} 0%, #248A3D 100%)`,
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '3px 3px 8px rgba(52, 199, 89, 0.3)',
    alignSelf: 'flex-start'
  },

  buttonPurple: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: `linear-gradient(180deg, ${ACCENT_PURPLE} 0%, #3B38B3 100%)`,
    color: '#FFFFFF',
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '3px 3px 8px rgba(88, 86, 214, 0.3)',
    alignSelf: 'flex-start'
  },

  buttonSecondary: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: '#F2F2F7',
    color: TEXT_MUTED,
    fontSize: '13px',
    fontWeight: 600,
    cursor: 'not-allowed',
    alignSelf: 'flex-start',
    boxShadow: 'inset 1px 1px 3px #D8DBE0, inset -1px -1px 3px #FFFFFF'
  },

  buttonDanger: {
    padding: '12px 18px',
    borderRadius: '14px',
    border: 'none',
    background: '#FF3B301A',
    color: ACCENT_RED,
    fontSize: '13px',
    fontWeight: 700,
    cursor: 'pointer',
    alignSelf: 'flex-start'
  },

  fileInput: {
    fontSize: '12px',
    color: TEXT_MUTED,
    padding: '4px 0'
  },

  successText: {
    fontSize: '12px',
    color: '#34C759',
    margin: 0,
    fontWeight: 600
  },

  errorText: {
    fontSize: '12px',
    color: ACCENT_RED,
    margin: 0,
    fontWeight: 700
  },

  footerCard: {
    padding: '16px',
    borderRadius: '20px',
    background: '#F2F2F7',
    textAlign: 'center',
    boxShadow: 'inset 2px 2px 5px #D8DBE0, inset -2px -2px 5px #FFFFFF'
  },

  footerText: {
    fontSize: '13px',
    fontWeight: 700,
    color: TEXT_MAIN,
    margin: 0
  },

  footerSub: {
    fontSize: '11px',
    color: TEXT_MUTED,
    margin: '3px 0 0 0'
  }
}