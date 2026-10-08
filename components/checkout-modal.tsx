'use client'

import { ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '@/components/modal'
import { toast } from '@/components/toast'
import { invoicesStore, vendorsStore } from '@/lib/store'
import { formatPrice, REFERRAL_DISCOUNT_RATE, type Invoice } from '@/lib/types'
import { cn } from '@/lib/utils'

const METHODS = ['신용/체크카드', '계좌이체', '카카오페이', '네이버페이']

export function CheckoutModal({
  invoice,
  onClose,
  onPaid,
}: {
  invoice: Invoice | null
  onClose: () => void
  onPaid?: () => void
}) {
  const [method, setMethod] = useState(METHODS[0])
  const [referral, setReferral] = useState('')

  const key = invoice?.id ?? ''
  const [lastKey, setLastKey] = useState('')
  if (key !== lastKey) {
    setLastKey(key)
    setMethod(METHODS[0])
    setReferral(invoice?.referralCode ?? '')
  }

  if (!invoice) return null

  const discount = referral.trim()
    ? Math.round(invoice.amount * REFERRAL_DISCOUNT_RATE)
    : 0
  const finalAmount = invoice.amount - discount

  function pay() {
    invoicesStore.update(invoice!.id, {
      paymentStatus: 'paid',
      escrowStage: 'holding',
      method,
      referralCode: referral.trim(),
      discount,
      finalAmount,
      paidAt: Date.now(),
    })
    // Auto-block the wedding date on the vendor's calendar.
    if (invoice!.weddingDate) {
      const vendor = vendorsStore
        .current()
        .find((v) => v.id === invoice!.vendorId)
      if (vendor && !vendor.bookedDates.includes(invoice!.weddingDate)) {
        vendorsStore.update(vendor.id, {
          bookedDates: [...vendor.bookedDates, invoice!.weddingDate],
        })
      }
    }
    toast('결제가 완료되었습니다.', {
      description: '계약금은 에스크로로 안전하게 보관됩니다.',
    })
    onPaid?.()
    onClose()
  }

  return (
    <Modal
      open={invoice !== null}
      onClose={onClose}
      title="결제하기"
      description={`${invoice.vendorName} · 안심 에스크로 결제`}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-xl border border-border bg-secondary/50 p-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>요청 금액</span>
            <span>{formatPrice(invoice.amount)}</span>
          </div>
          {discount > 0 && (
            <div className="mt-1 flex items-center justify-between text-sm text-primary">
              <span>추천인 할인 (5%)</span>
              <span>-{formatPrice(discount)}</span>
            </div>
          )}
          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <span className="font-semibold text-foreground">결제 금액</span>
            <span className="font-serif text-xl font-bold text-primary">
              {formatPrice(finalAmount)}
            </span>
          </div>
        </div>

        <label className="block">
          <span className="mb-1 block text-sm font-medium text-foreground">
            추천인 코드 (선택)
          </span>
          <input
            value={referral}
            onChange={(e) => setReferral(e.target.value)}
            placeholder="짝꿍 코드 입력 시 5% 할인"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
        </label>

        <div>
          <p className="mb-1.5 text-sm font-medium text-foreground">결제 수단</p>
          <div className="grid grid-cols-2 gap-2">
            {METHODS.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={cn(
                  'rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors',
                  method === m
                    ? 'border-primary bg-accent text-accent-foreground'
                    : 'border-border bg-card text-muted-foreground hover:text-foreground',
                )}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg bg-accent/50 p-3 text-xs text-accent-foreground">
          <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
          <p>
            결제하신 계약금은 예식/납품 완료 시점까지 VowReel 에스크로에 안전하게
            보관되며, 완료 확인 후 업체에 정산됩니다.
          </p>
        </div>

        <button
          type="button"
          onClick={pay}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          {formatPrice(finalAmount)} 결제하기
        </button>
      </div>
    </Modal>
  )
}
