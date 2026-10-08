'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

function iso(y: number, m: number, d: number) {
  return `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
}

export function BookingCalendar({
  bookedDates,
  mode,
  selected,
  onSelect,
  onToggle,
}: {
  bookedDates: string[]
  mode: 'select' | 'manage'
  selected?: string
  onSelect?: (date: string) => void
  onToggle?: (date: string) => void
}) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [view, setView] = useState({
    y: today.getFullYear(),
    m: today.getMonth(),
  })

  const first = new Date(view.y, view.m, 1)
  const startDay = first.getDay()
  const daysInMonth = new Date(view.y, view.m + 1, 0).getDate()
  const booked = new Set(bookedDates)

  const cells: (number | null)[] = []
  for (let i = 0; i < startDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  function shift(delta: number) {
    setView((v) => {
      const nm = v.m + delta
      return { y: v.y + Math.floor(nm / 12), m: ((nm % 12) + 12) % 12 }
    })
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shift(-1)}
          aria-label="이전 달"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-semibold text-foreground">
          {view.y}년 {view.m + 1}월
        </span>
        <button
          type="button"
          onClick={() => shift(1)}
          aria-label="다음 달"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((w) => (
          <div key={w} className="py-1 text-xs font-medium text-muted-foreground">
            {w}
          </div>
        ))}
        {cells.map((d, i) => {
          if (d === null) return <div key={`e-${i}`} />
          const date = iso(view.y, view.m, d)
          const cellDate = new Date(view.y, view.m, d)
          const isPast = cellDate < today
          const isBooked = booked.has(date)
          const isSelected = selected === date

          const disabled =
            mode === 'select' ? isPast || isBooked : isPast

          function handle() {
            if (disabled) return
            if (mode === 'select') onSelect?.(date)
            else onToggle?.(date)
          }

          return (
            <button
              key={date}
              type="button"
              disabled={disabled}
              onClick={handle}
              className={cn(
                'relative aspect-square rounded-lg text-sm transition-colors',
                isSelected && 'bg-primary text-primary-foreground font-semibold',
                !isSelected &&
                  isBooked &&
                  'bg-muted text-muted-foreground line-through',
                !isSelected &&
                  !isBooked &&
                  !disabled &&
                  'text-foreground hover:bg-accent',
                isPast && !isBooked && 'text-muted-foreground/40',
              )}
            >
              {d}
            </button>
          )
        })}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-accent" /> 예약 가능
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-3 rounded bg-muted" /> 예약 마감
        </span>
        {mode === 'manage' && (
          <span className="text-muted-foreground">
            날짜를 눌러 마감/해제를 전환하세요.
          </span>
        )}
      </div>
    </div>
  )
}
