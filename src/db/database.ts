import Dexie from 'dexie'
import type { Table } from 'dexie'

/* =========================
   BOOKS & WISHLIST
========================= */

export type Book = {
  id?: number
  title: string
  author: string
  genre: string
  series?: string
  country?: string
  cover?: string
  publisher?: string
  publicationYear?: number
  pages: number
  readingMonth?: number
  readingYear?: number
  classic?: boolean
  isClassic?: boolean
  createdAt: number
}

export type WishlistItem = {
  id?: number
  title: string
  author: string
  genre: string
  createdAt: number
}

/* =========================
   MIND MAP TYPES
========================= */

export type NodeType = 'concept' | 'author' | 'book' | 'history' | 'genre'

export type MindNode = {
  id: string
  label: string
  type: NodeType
  x: number
  y: number
  notes?: string
}

export type MindConnection = {
  id: string
  fromId: string
  toId: string
  relation?: string
}

export type MindMapItem = {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  nodes: MindNode[]
  connections: MindConnection[]
}

/* =========================
   DATABASE
========================= */

class AppDatabase extends Dexie {
  books!: Table<Book, number>
  wishlist!: Table<WishlistItem, number>
  mindMaps!: Table<MindMapItem, string>

  constructor() {
    super('readingTrackerDB')

    this.version(1).stores({
      books: '++id, title, author, genre, pages, readingYear, createdAt',
      wishlist: '++id, title, author, genre, createdAt'
    })

    this.version(2).stores({
      books: '++id, title, author, genre, country, series, pages, readingYear, createdAt',
      wishlist: '++id, title, author, genre, createdAt'
    })

    this.version(3).stores({
      books: '++id, title, author, genre, country, series, pages, readingYear, createdAt',
      wishlist: '++id, title, author, genre, createdAt'
    })

    this.version(4).stores({
      books: '++id, title, author, genre, country, series, pages, readingYear, createdAt',
      wishlist: '++id, title, author, genre, createdAt',
      mindNodes: 'id, label, type',
      mindConnections: 'id, fromId, toId'
    })

    // Versione 5: Gestione Mappe Multiple (Salva/Carica/Crea/Elimina)
    this.version(5).stores({
      books: '++id, title, author, genre, country, series, pages, readingYear, createdAt',
      wishlist: '++id, title, author, genre, createdAt',
      mindNodes: null, // Rimosse tabelle singole
      mindConnections: null,
      mindMaps: 'id, title, updatedAt'
    })
  }
}

export const db = new AppDatabase()