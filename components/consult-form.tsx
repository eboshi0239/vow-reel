'use client'

import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from '@/components/toast'
import { customersStore, useSession } from '@/lib/store'
import type { Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'

export function ConsultForm({
  vendor,
  selectedDate,
  onStartChat,
}: {
  vendor: Vendor
  selectedDate: string
  onStartChat: (info: { weddingDate: string; venue: string }) => void
}) {
  const session = useSession()
  const customers = customersStore.useAll()
  const me = customers.find((c) => c.id === session.customerId)

  const [venue, setVenue] = useState('')
  const [weddingDate, setWeddingDate] = useState('')

  const date = selectedDate || weddingDate

  function start() {
    if (!me) {
      toast('고객 로그인 후 상담 채팅을 이용할 수 있어요.', { variant: 'info' })
      return
    }
    if (!date) {
      toast('예식일을 선택해 주세요.', { variant: 'info' })
      return
    }
    onStartChat({ weddingDate: date, venue: venue.trim() })
  }

  const field =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'

  return (
    <div className="flex flex-col gap-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          예식일
        </label>
        {selectedDate ? (
          <p className={cn(field, 'bg-muted')}>{selectedDate} (캘린더 선택)</p>
        ) : (
          <input
            type="date"
            value={weddingDate}
            onChange={(e) => setWeddingDate(e.target.value)}
            className={field}
          />
        )}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          예식장
        </label>
        <input
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
          placeholder="예식장 이름 / 지역"
          className={field}
        />
      </div>

      <button
        type="button"
        onClick={start}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        <MessageCircle className="size-4" />
        실시간 상담 시작하기
      </button>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        예식일과 예식장을 입력하면 작가와 실시간 채팅으로 상담하고,
        <br className="hidden sm:block" />
        맞춤 견적과 결제 요청까지 받아볼 수 있어요.
      </p>
    </div>
  )
}
