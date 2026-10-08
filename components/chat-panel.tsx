'use client'

import { ReceiptText, Send, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { CheckoutModal } from '@/components/checkout-modal'
import { PaymentBadge } from '@/components/status-badge'
import { toast } from '@/components/toast'
import {
  chatStore,
  createId,
  customersStore,
  invoicesStore,
  markChatRead,
  threadMessages,
} from '@/lib/store'
import { formatPrice, type Invoice } from '@/lib/types'
import { cn } from '@/lib/utils'

interface ChatModalProps {
  open: boolean
  onClose: () => void
  vendorId: string
  vendorName: string
  customerId: string
  customerName: string
  role: 'vendor' | 'customer'
}

export function ChatModal(props: ChatModalProps) {
  const { open, onClose, vendorId, vendorName, customerId, customerName, role } =
    props

  const allMsgs = chatStore.useAll()
  const invoices = invoicesStore.useAll()
  const msgs = threadMessages(allMsgs, vendorId, customerId)

  const [text, setText] = useState('')
  const [showInvoice, setShowInvoice] = useState(false)
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [payFor, setPayFor] = useState<Invoice | null>(null)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Mark the other party's messages as read whenever the thread is open.
  useEffect(() => {
    if (open) markChatRead(role, vendorId, customerId)
  }, [open, role, vendorId, customerId, allMsgs])

  // Keep the newest message in view.
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [open, msgs.length])

  // Lock body scroll while open.
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  function sendText() {
    const t = text.trim()
    if (!t) return
    chatStore.add({
      id: createId('msg'),
      vendorId,
      customerId,
      sender: role,
      kind: 'text',
      text: t,
      invoiceId: '',
      createdAt: Date.now(),
      readByVendor: role === 'vendor',
      readByCustomer: role === 'customer',
    })
    setText('')
  }

  function sendInvoice() {
    const value = Number(amount) || 0
    if (value <= 0) {
      toast('결제 요청 금액을 입력해 주세요.', { variant: 'info' })
      return
    }
    const customer = customersStore.current().find((c) => c.id === customerId)
    const invId = createId('inv')
    const invoice: Invoice = {
      id: invId,
      vendorId,
      vendorName,
      customerId,
      customerName,
      amount: value,
      memo: memo.trim(),
      weddingDate: customer?.weddingDate ?? '',
      venue: '',
      method: '',
      referralCode: '',
      discount: 0,
      finalAmount: value,
      paymentStatus: 'pending',
      escrowStage: 'none',
      createdAt: Date.now(),
      paidAt: null,
    }
    invoicesStore.add(invoice)
    chatStore.add({
      id: createId('msg'),
      vendorId,
      customerId,
      sender: 'vendor',
      kind: 'invoice',
      text: memo.trim() || '맞춤 견적 결제 요청',
      invoiceId: invId,
      createdAt: Date.now(),
      readByVendor: true,
      readByCustomer: false,
    })
    setAmount('')
    setMemo('')
    setShowInvoice(false)
    toast('결제 요청을 채팅으로 보냈습니다.', {
      description: `${customerName}님에게 인보이스가 전달되었어요.`,
    })
  }

  const other = role === 'vendor' ? customerName : vendorName

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-foreground/40 p-0 backdrop-blur-sm sm:items-center sm:p-6 animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-label={`${other}님과의 상담 채팅`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="flex h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl animate-in slide-in-from-bottom-6 sm:h-[600px] sm:rounded-2xl sm:zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3.5">
          <div>
            <p className="font-serif text-lg font-bold text-card-foreground">
              {other}
            </p>
            <p className="text-xs text-muted-foreground">
              실시간 상담 채팅 · {role === 'vendor' ? '고객 문의' : vendorName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 space-y-3 overflow-y-auto bg-background/40 px-4 py-4"
        >
          {msgs.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 text-center text-sm text-muted-foreground">
              {role === 'customer'
                ? '궁금한 점을 편하게 문의해 보세요. 상담 후 맞춤 견적을 받을 수 있어요.'
                : '고객의 첫 메시지를 기다리고 있어요. 상담 후 결제 요청을 보낼 수 있습니다.'}
            </div>
          ) : (
            msgs.map((m) => {
              const mine = m.sender === role
              if (m.kind === 'invoice') {
                const inv = invoices.find((i) => i.id === m.invoiceId)
                return (
                  <div
                    key={m.id}
                    className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                  >
                    <div className="max-w-[85%] rounded-2xl border border-primary/30 bg-accent/60 p-4">
                      <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
                        <ReceiptText className="size-3.5" /> 맞춤 견적 결제 요청
                      </div>
                      {m.text && (
                        <p className="mb-1 text-sm text-foreground/90">
                          {m.text}
                        </p>
                      )}
                      <p className="font-serif text-xl font-bold text-primary">
                        {formatPrice(inv?.amount ?? 0)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        {inv && <PaymentBadge status={inv.paymentStatus} />}
                        {role === 'customer' &&
                          inv &&
                          inv.paymentStatus === 'pending' && (
                            <button
                              type="button"
                              onClick={() => setPayFor(inv)}
                              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                            >
                              결제하기
                            </button>
                          )}
                      </div>
                      <p className="mt-1.5 text-[11px] text-muted-foreground">
                        {timeLabel(m.createdAt)}
                      </p>
                    </div>
                  </div>
                )
              }
              return (
                <div
                  key={m.id}
                  className={cn('flex', mine ? 'justify-end' : 'justify-start')}
                >
                  <div className="max-w-[80%]">
                    <div
                      className={cn(
                        'rounded-2xl px-3.5 py-2.5 text-sm',
                        mine
                          ? 'bg-primary text-primary-foreground'
                          : 'border border-border bg-card text-foreground',
                      )}
                    >
                      {m.text}
                    </div>
                    <p
                      className={cn(
                        'mt-1 text-[11px] text-muted-foreground',
                        mine ? 'text-right' : 'text-left',
                      )}
                    >
                      {timeLabel(m.createdAt)}
                    </p>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Vendor: payment request form */}
        {role === 'vendor' && showInvoice && (
          <div className="border-t border-border bg-accent/40 px-4 py-3">
            <div className="flex flex-col gap-2">
              <input
                type="number"
                min={0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="결제 요청 금액 (원)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <input
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="메모 (포함 사항 등, 선택)"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={sendInvoice}
                  className="flex-1 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                >
                  결제 요청 전송
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoice(false)}
                  className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="flex items-center gap-2 border-t border-border px-4 py-3">
          {role === 'vendor' && !showInvoice && (
            <button
              type="button"
              onClick={() => setShowInvoice(true)}
              aria-label="결제 요청 보내기"
              title="결제 요청 보내기"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-primary bg-primary/10 text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              <ReceiptText className="size-5" />
            </button>
          )}
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                !e.nativeEvent.isComposing &&
                e.keyCode !== 229
              ) {
                e.preventDefault()
                sendText()
              }
            }}
            placeholder="메시지를 입력하세요"
            className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={sendText}
            aria-label="전송"
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-colors hover:opacity-90"
          >
            <Send className="size-5" />
          </button>
        </div>
      </div>

      <CheckoutModal invoice={payFor} onClose={() => setPayFor(null)} />
    </div>
  )
}

function timeLabel(ts: number) {
  return new Date(ts).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
