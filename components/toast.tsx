'use client'

import { CheckCircle2, Info, X } from 'lucide-react'
import { useEffect, useState } from 'react'

type ToastVariant = 'success' | 'info'

interface ToastItem {
  id: number
  title: string
  description?: string
  variant: ToastVariant
}

type Listener = (toast: ToastItem) => void

const listeners = new Set<Listener>()
let counter = 0

export function toast(
  title: string,
  options?: { description?: string; variant?: ToastVariant },
) {
  const item: ToastItem = {
    id: ++counter,
    title,
    description: options?.description,
    variant: options?.variant ?? 'success',
  }
  for (const listener of listeners) listener(item)
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  useEffect(() => {
    const listener: Listener = (item) => {
      setToasts((prev) => [...prev, item])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== item.id))
      }, 3600)
    }
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  function dismiss(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6">
      {toasts.map((item) => (
        <div
          key={item.id}
          role="status"
          className="pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-lg shadow-black/5 animate-in fade-in slide-in-from-bottom-4"
        >
          <span
            className={
              item.variant === 'success'
                ? 'mt-0.5 text-primary'
                : 'mt-0.5 text-muted-foreground'
            }
          >
            {item.variant === 'success' ? (
              <CheckCircle2 className="size-5" />
            ) : (
              <Info className="size-5" />
            )}
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-card-foreground">
              {item.title}
            </p>
            {item.description ? (
              <p className="mt-0.5 text-sm text-muted-foreground">
                {item.description}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => dismiss(item.id)}
            aria-label="알림 닫기"
            className="text-muted-foreground transition-colors hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
