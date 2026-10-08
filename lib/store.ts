'use client'

import { useEffect, useSyncExternalStore } from 'react'
import {
  SEED_CUSTOMERS,
  SEED_INVOICES,
  SEED_REVIEWS,
  SEED_VENDORS,
} from './seed'
import type { ChatMessage, Customer, Invoice, Review, Vendor } from './types'

interface Identifiable {
  id: string
}

function createCollection<T extends Identifiable>(
  storageKey: string,
  seed: T[],
) {
  const EMPTY: T[] = []
  let data: T[] = []
  let loaded = false
  const listeners = new Set<() => void>()

  function emit() {
    for (const l of listeners) l()
  }

  function persist() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data))
    } catch {
      // ignore quota/availability errors
    }
    emit()
  }

  function load() {
    if (loaded) return
    loaded = true
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        data = JSON.parse(raw) as T[]
      } else {
        data = seed
        localStorage.setItem(storageKey, JSON.stringify(seed))
      }
    } catch {
      data = seed
    }
    window.addEventListener('storage', (event) => {
      if (event.key === storageKey && event.newValue) {
        try {
          data = JSON.parse(event.newValue) as T[]
          emit()
        } catch {
          // ignore parse errors
        }
      }
    })
    emit()
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function getSnapshot() {
    return loaded ? data : EMPTY
  }

  function useAll(): T[] {
    const all = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY)
    useEffect(() => {
      load()
    }, [])
    return all
  }

  return {
    useAll,
    current: () => data,
    add(item: T) {
      data = [item, ...data]
      persist()
    },
    update(id: string, updates: Partial<T>) {
      data = data.map((it) => (it.id === id ? { ...it, ...updates } : it))
      persist()
    },
    remove(id: string) {
      data = data.filter((it) => it.id !== id)
      persist()
    },
  }
}

export const vendorsStore = createCollection<Vendor>(
  'vowreel_vendors_v2',
  SEED_VENDORS,
)
export const reviewsStore = createCollection<Review>(
  'vowreel_reviews_v2',
  SEED_REVIEWS,
)
export const invoicesStore = createCollection<Invoice>(
  'vowreel_invoices_v2',
  SEED_INVOICES,
)
export const customersStore = createCollection<Customer>(
  'vowreel_customers_v2',
  SEED_CUSTOMERS,
)

// ---------- Inquiries (starts empty) ----------
import type { Inquiry } from './types'
export const inquiriesStore = createCollection<Inquiry>(
  'vowreel_inquiries_v2',
  [],
)

// ---------- Chat (starts empty) ----------
export const chatStore = createCollection<ChatMessage>('vowreel_chats_v2', [])

export function threadMessages(
  msgs: ChatMessage[],
  vendorId: string,
  customerId: string,
) {
  return msgs
    .filter((m) => m.vendorId === vendorId && m.customerId === customerId)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export function markChatRead(
  role: 'vendor' | 'customer',
  vendorId: string,
  customerId: string,
) {
  const field = role === 'vendor' ? 'readByVendor' : 'readByCustomer'
  for (const m of chatStore.current()) {
    if (m.vendorId === vendorId && m.customerId === customerId && !m[field]) {
      chatStore.update(m.id, { [field]: true } as Partial<ChatMessage>)
    }
  }
}

export function unreadCount(
  msgs: ChatMessage[],
  role: 'vendor' | 'customer',
  vendorId: string,
  customerId: string,
) {
  return msgs.filter(
    (m) =>
      m.vendorId === vendorId &&
      m.customerId === customerId &&
      m.sender !== role &&
      !(role === 'vendor' ? m.readByVendor : m.readByCustomer),
  ).length
}

// ---------- ID helper ----------
export function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

// ---------- Session (current logged-in vendor / customer) ----------
const SESSION_KEY = 'vowreel_session_v2'
type Session = { vendorId: string | null; customerId: string | null }
const EMPTY_SESSION: Session = { vendorId: null, customerId: null }
let session: Session = EMPTY_SESSION
let sessionLoaded = false
const sessionListeners = new Set<() => void>()

function emitSession() {
  for (const l of sessionListeners) l()
}

function loadSession() {
  if (sessionLoaded) return
  sessionLoaded = true
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (raw) session = JSON.parse(raw) as Session
  } catch {
    session = EMPTY_SESSION
  }
  emitSession()
}

function persistSession() {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } catch {
    // ignore
  }
  emitSession()
}

export function setSessionVendor(vendorId: string | null) {
  session = { ...session, vendorId }
  persistSession()
}

export function setSessionCustomer(customerId: string | null) {
  session = { ...session, customerId }
  persistSession()
}

export function useSession(): Session {
  const s = useSyncExternalStore(
    (l) => {
      sessionListeners.add(l)
      return () => sessionListeners.delete(l)
    },
    () => (sessionLoaded ? session : EMPTY_SESSION),
    () => EMPTY_SESSION,
  )
  useEffect(() => {
    loadSession()
  }, [])
  return s
}

// ---------- Derived helpers ----------
export function reviewCountFor(reviews: Review[], vendorId: string) {
  return reviews.filter((r) => r.vendorId === vendorId).length
}

export function confirmedCountFor(invoices: Invoice[], vendorId: string) {
  return invoices.filter(
    (i) => i.vendorId === vendorId && i.paymentStatus === 'confirmed',
  ).length
}

export function isPopularVendor(
  reviews: Review[],
  invoices: Invoice[],
  vendorId: string,
) {
  return (
    reviewCountFor(reviews, vendorId) >= 3 ||
    confirmedCountFor(invoices, vendorId) >= 2
  )
}

// Sunlight boost windows: two per day (10:00-12:00 and 18:00-20:00).
export function isSunlightWindow(date = new Date()) {
  const h = date.getHours()
  return (h >= 10 && h < 12) || (h >= 18 && h < 20)
}

export function generateReferralCode() {
  return 'PAIR-' + Math.random().toString(36).slice(2, 6).toUpperCase()
}
