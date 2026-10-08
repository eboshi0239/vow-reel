import { ShieldCheck } from 'lucide-react'
import type { EscrowStage, PaymentStatus, VendorStatus } from '@/lib/types'
import { cn } from '@/lib/utils'

function Pill({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        className,
      )}
    >
      {children}
    </span>
  )
}

export function VendorStatusBadge({ status }: { status: VendorStatus }) {
  if (status === 'approved') {
    return (
      <Pill className="bg-primary/12 text-primary">승인완료</Pill>
    )
  }
  return <Pill className="bg-secondary text-secondary-foreground">심사대기</Pill>
}

const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: '결제 대기',
  paid: '결제 완료',
  confirmed: '예약 확정',
}

export function PaymentBadge({ status }: { status: PaymentStatus }) {
  const cls =
    status === 'confirmed'
      ? 'bg-primary text-primary-foreground'
      : status === 'paid'
        ? 'bg-primary/12 text-primary'
        : 'bg-secondary text-secondary-foreground'
  return <Pill className={cls}>{PAYMENT_LABEL[status]}</Pill>
}

const ESCROW_LABEL: Record<EscrowStage, string> = {
  none: '',
  holding: '에스크로 보관 중',
  delivered: '납품 완료',
  settled: '정산 완료',
}

export function EscrowBadge({ stage }: { stage: EscrowStage }) {
  if (stage === 'none') return null
  return (
    <Pill className="border border-primary/30 bg-accent text-accent-foreground">
      <ShieldCheck className="size-3.5" />
      {ESCROW_LABEL[stage]}
    </Pill>
  )
}
