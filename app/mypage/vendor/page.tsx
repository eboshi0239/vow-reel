'use client'

import {
  CalendarDays,
  ClipboardList,
  LogOut,
  MessageCircle,
  ReceiptText,
  ShieldCheck,
  UserCog,
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { BookingCalendar } from '@/components/booking-calendar'
import { ChatModal } from '@/components/chat-panel'
import { Modal } from '@/components/modal'
import {
  EscrowBadge,
  PaymentBadge,
  VendorStatusBadge,
} from '@/components/status-badge'
import { toast } from '@/components/toast'
import {
  VendorProfileForm,
  type VendorFormData,
} from '@/components/vendor-profile-form'
import {
  chatStore,
  createId,
  customersStore,
  inquiriesStore,
  invoicesStore,
  setSessionVendor,
  threadMessages,
  unreadCount,
  useSession,
  vendorsStore,
} from '@/lib/store'
import {
  formatPrice,
  type Inquiry,
  type Invoice,
  type Vendor,
} from '@/lib/types'
import { cn } from '@/lib/utils'

type Tab = 'profile' | 'schedule' | 'inquiries' | 'payments' | 'chats'

export default function VendorMyPage() {
  const session = useSession()
  const vendors = vendorsStore.useAll()
  const me = vendors.find((v) => v.id === session.vendorId)

  if (!session.vendorId || !me) {
    return <VendorAuth vendors={vendors} />
  }
  return <VendorDashboard me={me} />
}

/* ----------------------------- Auth ----------------------------- */

function VendorAuth({ vendors }: { vendors: Vendor[] }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  function login(e: React.FormEvent) {
    e.preventDefault()
    const found = vendors.find(
      (v) => v.email === email.trim() && v.password === password,
    )
    if (!found) {
      toast('로그인 정보를 확인해 주세요.', { variant: 'info' })
      return
    }
    setSessionVendor(found.id)
    toast('로그인되었습니다.', { description: `${found.businessName} 환영합니다.` })
  }

  function signup(data: VendorFormData) {
    if (vendors.some((v) => v.email === data.email.trim())) {
      toast('이미 가입된 이메일입니다.', { variant: 'info' })
      return
    }
    const vendor: Vendor = {
      id: createId('v'),
      ...data,
      email: data.email.trim(),
      bookedDates: [],
      status: 'pending',
      boosted: true,
      createdAt: Date.now(),
    }
    vendorsStore.add(vendor)
    setSessionVendor(vendor.id)
    toast('가입 완료! 심사가 신청되었습니다.', {
      description: '관리자 승인 후 마켓플레이스에 노출됩니다.',
    })
  }

  const field =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'

  return (
    <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">업체 회원</h1>
      <p className="mt-2 text-muted-foreground">
        프로필과 포트폴리오를 등록하고 심사를 신청하세요.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1">
        <TabButton active={mode === 'login'} onClick={() => setMode('login')}>
          로그인
        </TabButton>
        <TabButton active={mode === 'signup'} onClick={() => setMode('signup')}>
          회원가입
        </TabButton>
      </div>

      {mode === 'login' ? (
        <form
          onSubmit={login}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">
              이메일
            </span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-foreground">
              비밀번호
            </span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </label>
          <button
            type="submit"
            className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            로그인
          </button>
          <p className="text-xs text-muted-foreground">
            데모 계정: lumiere@vowreel.kr / demo1234
          </p>
        </form>
      ) : (
        <div className="mt-6 rounded-2xl border border-border bg-card p-5">
          <VendorProfileForm
            withAuth
            submitLabel="프로필 저장 및 심사 신청"
            onSubmit={signup}
          />
        </div>
      )}
    </main>
  )
}

/* --------------------------- Dashboard --------------------------- */

function VendorDashboard({ me }: { me: Vendor }) {
  const [tab, setTab] = useState<Tab>('profile')
  const inquiries = inquiriesStore
    .useAll()
    .filter((i) => i.vendorId === me.id)
    .sort((a, b) => b.createdAt - a.createdAt)
  const invoices = invoicesStore
    .useAll()
    .filter((i) => i.vendorId === me.id)
    .sort((a, b) => b.createdAt - a.createdAt)

  const [invoiceFor, setInvoiceFor] = useState<Inquiry | null>(null)

  const chats = chatStore.useAll()
  const chatCustomerIds = Array.from(
    new Set(
      chats.filter((c) => c.vendorId === me.id).map((c) => c.customerId),
    ),
  )
  const totalUnread = chatCustomerIds.reduce(
    (n, cid) => n + unreadCount(chats, 'vendor', me.id, cid),
    0,
  )

  const pendingPay = invoices.filter((i) => i.paymentStatus === 'pending').length
  const confirmed = invoices.filter((i) => i.paymentStatus === 'confirmed').length

  return (
    <main className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {me.businessName}
            </h1>
            <VendorStatusBadge status={me.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {me.category} · {me.region} · 대표 {me.representativeName}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/vendor/${me.id}`}
            className="rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            공개 페이지 보기
          </Link>
          <button
            type="button"
            onClick={() => {
              setSessionVendor(null)
              toast('로그아웃되었습니다.')
            }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
          >
            <LogOut className="size-4" /> 로그아웃
          </button>
        </div>
      </div>

      {me.status === 'pending' && (
        <div className="mt-4 rounded-xl border border-primary/30 bg-accent/60 px-4 py-3 text-sm text-accent-foreground">
          현재 <strong>심사 대기</strong> 상태입니다. 관리자 승인 후
          마켓플레이스에 노출됩니다.
        </div>
      )}

      {/* Stats */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="상담 요청" value={inquiries.length} />
        <Stat label="결제 대기" value={pendingPay} />
        <Stat label="예약 확정" value={confirmed} />
        <Stat
          label="정산 완료"
          value={invoices.filter((i) => i.escrowStage === 'settled').length}
        />
      </div>

      {/* Tabs */}
      <div className="mt-6 flex gap-1 overflow-x-auto border-b border-border">
        <DashTab active={tab === 'profile'} onClick={() => setTab('profile')} icon={<UserCog className="size-4" />}>
          프로필 관리
        </DashTab>
        <DashTab active={tab === 'schedule'} onClick={() => setTab('schedule')} icon={<CalendarDays className="size-4" />}>
          일정 관리
        </DashTab>
        <DashTab active={tab === 'inquiries'} onClick={() => setTab('inquiries')} icon={<ClipboardList className="size-4" />}>
          상담 요청 ({inquiries.length})
        </DashTab>
        <DashTab active={tab === 'payments'} onClick={() => setTab('payments')} icon={<ReceiptText className="size-4" />}>
          결제·예약 ({invoices.length})
        </DashTab>
        <DashTab active={tab === 'chats'} onClick={() => setTab('chats')} icon={<MessageCircle className="size-4" />}>
          상담 채팅{totalUnread > 0 ? ` (${totalUnread})` : ''}
        </DashTab>
      </div>

      <div className="mt-6">
        {tab === 'profile' && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <VendorProfileForm
              initial={me}
              withAuth={false}
              submitLabel="프로필 저장"
              onSubmit={(data) => {
                vendorsStore.update(me.id, {
                  profilePhoto: data.profilePhoto,
                  thumbnail: data.thumbnail,
                  hoverPreview: data.hoverPreview,
                  businessName: data.businessName,
                  representativeName: data.representativeName,
                  category: data.category,
                  region: data.region,
                  basePrice: data.basePrice,
                  portfolioImages: data.portfolioImages,
                  youtubeLinks: data.youtubeLinks,
                  introText: data.introText,
                  options: data.options,
                })
                toast('프로필이 저장되었습니다.')
              }}
            />
          </div>
        )}

        {tab === 'schedule' && (
          <div className="max-w-md">
            <p className="mb-3 text-sm text-muted-foreground">
              예약이 마감된 날짜를 직접 관리하세요. 고객 결제가 완료되면 예식일이
              자동으로 마감 처리됩니다.
            </p>
            <BookingCalendar
              bookedDates={me.bookedDates}
              mode="manage"
              onToggle={(date) => {
                const next = me.bookedDates.includes(date)
                  ? me.bookedDates.filter((d) => d !== date)
                  : [...me.bookedDates, date]
                vendorsStore.update(me.id, { bookedDates: next })
              }}
            />
          </div>
        )}

        {tab === 'inquiries' && (
          <InquiryList
            inquiries={inquiries}
            onInvoice={(inq) => setInvoiceFor(inq)}
          />
        )}

        {tab === 'payments' && <PaymentList invoices={invoices} />}

        {tab === 'chats' && (
          <VendorChats vendorId={me.id} vendorName={me.businessName} />
        )}
      </div>

      <InvoiceModal
        inquiry={invoiceFor}
        vendor={me}
        onClose={() => setInvoiceFor(null)}
      />
    </main>
  )
}

/* --------------------------- Sub-parts --------------------------- */

function InquiryList({
  inquiries,
  onInvoice,
}: {
  inquiries: Inquiry[]
  onInvoice: (inq: Inquiry) => void
}) {
  if (inquiries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
        아직 접수된 상담 요청이 없습니다.
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {inquiries.map((inq) => (
        <li key={inq.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-foreground">
              {inq.customerName}
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {inq.contact}
              </span>
            </p>
            <button
              type="button"
              onClick={() => onInvoice(inq)}
              className="rounded-lg bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
            >
              결제 요청 보내기
            </button>
          </div>
          <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
            <Row label="예식일" value={inq.weddingDate || '-'} />
            <Row label="예식장" value={inq.venue || '-'} />
            <Row
              label="예상 견적"
              value={formatPrice(inq.estimatedTotal)}
            />
            {inq.referralCode && (
              <Row label="추천인 코드" value={inq.referralCode} />
            )}
            {inq.selectedOptions.length > 0 && (
              <Row label="선택 옵션" value={inq.selectedOptions.join(', ')} />
            )}
            {inq.ribbonText && <Row label="리본 문구" value={inq.ribbonText} />}
            {inq.senderName && <Row label="보내는 분" value={inq.senderName} />}
            {inq.minGuests > 0 && (
              <Row label="보증 인원" value={`${inq.minGuests}명`} />
            )}
            {inq.tastingRequested && <Row label="시식 신청" value="예" />}
          </dl>
          {inq.message && (
            <p className="mt-2 rounded-lg bg-muted px-3 py-2 text-sm text-foreground/90">
              {inq.message}
            </p>
          )}
        </li>
      ))}
    </ul>
  )
}

function PaymentList({ invoices }: { invoices: Invoice[] }) {
  if (invoices.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
        발송한 결제 요청이 없습니다. 상담 요청에서 결제 요청을 보내보세요.
      </div>
    )
  }
  return (
    <ul className="flex flex-col gap-3">
      {invoices.map((inv) => (
        <li key={inv.id} className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-foreground">{inv.customerName}</p>
            <div className="flex flex-wrap items-center gap-2">
              <PaymentBadge status={inv.paymentStatus} />
              <EscrowBadge stage={inv.escrowStage} />
            </div>
          </div>
          <p className="mt-1 font-serif text-lg font-bold text-primary">
            {formatPrice(inv.finalAmount)}
          </p>
          {inv.memo && (
            <p className="mt-1 text-sm text-muted-foreground">{inv.memo}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {inv.paymentStatus === 'paid' && (
              <ActionBtn
                onClick={() =>
                  invoicesStore.update(inv.id, { paymentStatus: 'confirmed' })
                }
              >
                예약 확정 처리
              </ActionBtn>
            )}
            {inv.paymentStatus === 'confirmed' &&
              inv.escrowStage === 'holding' && (
                <ActionBtn
                  onClick={() =>
                    invoicesStore.update(inv.id, { escrowStage: 'delivered' })
                  }
                >
                  예식 종료 / 납품 완료
                </ActionBtn>
              )}
            {inv.escrowStage === 'delivered' && (
              <ActionBtn
                onClick={() =>
                  invoicesStore.update(inv.id, { escrowStage: 'settled' })
                }
              >
                정산 완료 처리
              </ActionBtn>
            )}
            {inv.paymentStatus === 'pending' && (
              <span className="text-sm text-muted-foreground">
                고객의 결제를 기다리는 중입니다.
              </span>
            )}
            {inv.escrowStage === 'settled' && (
              <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                <ShieldCheck className="size-4" /> 거래가 안전하게 완료되었습니다.
              </span>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}

function VendorChats({
  vendorId,
  vendorName,
}: {
  vendorId: string
  vendorName: string
}) {
  const chats = chatStore.useAll()
  const customers = customersStore.useAll()
  const [openWith, setOpenWith] = useState<string | null>(null)

  const customerIds = Array.from(
    new Set(
      chats.filter((c) => c.vendorId === vendorId).map((c) => c.customerId),
    ),
  )

  if (customerIds.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border py-14 text-center text-sm text-muted-foreground">
        아직 상담 채팅이 없습니다. 고객이 상세페이지에서 채팅을 시작하면 여기에
        표시됩니다.
      </div>
    )
  }

  const active = customers.find((c) => c.id === openWith)

  return (
    <>
      <ul className="flex flex-col gap-2">
        {customerIds.map((cid) => {
          const customer = customers.find((c) => c.id === cid)
          const thread = threadMessages(chats, vendorId, cid)
          const last = thread[thread.length - 1]
          const unread = unreadCount(chats, 'vendor', vendorId, cid)
          return (
            <li key={cid}>
              <button
                type="button"
                onClick={() => setOpenWith(cid)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <MessageCircle className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {customer?.name ?? '고객'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {last
                      ? last.kind === 'invoice'
                        ? '결제 요청을 보냈습니다.'
                        : last.text
                      : '대화 없음'}
                  </p>
                </div>
                {unread > 0 && (
                  <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-primary px-1.5 py-0.5 text-xs font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      {active && (
        <ChatModal
          open={openWith !== null}
          onClose={() => setOpenWith(null)}
          vendorId={vendorId}
          vendorName={vendorName}
          customerId={active.id}
          customerName={active.name}
          role="vendor"
        />
      )}
    </>
  )
}

function InvoiceModal({
  inquiry,
  vendor,
  onClose,
}: {
  inquiry: Inquiry | null
  vendor: Vendor
  onClose: () => void
}) {
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')

  // Sync defaults when a new inquiry is selected.
  const key = inquiry?.id ?? ''
  const [lastKey, setLastKey] = useState('')
  if (key !== lastKey) {
    setLastKey(key)
    setAmount(inquiry ? String(inquiry.estimatedTotal) : '')
    setMemo('')
  }

  const field =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'

  function send() {
    if (!inquiry) return
    const value = Number(amount) || 0
    if (value <= 0) {
      toast('결제 금액을 입력해 주세요.', { variant: 'info' })
      return
    }
    const invoice: Invoice = {
      id: createId('inv'),
      vendorId: vendor.id,
      vendorName: vendor.businessName,
      customerId: inquiry.customerId,
      customerName: inquiry.customerName,
      amount: value,
      memo: memo.trim(),
      weddingDate: inquiry.weddingDate,
      venue: inquiry.venue,
      method: '',
      referralCode: inquiry.referralCode,
      discount: 0,
      finalAmount: value,
      paymentStatus: 'pending',
      escrowStage: 'none',
      createdAt: Date.now(),
      paidAt: null,
    }
    invoicesStore.add(invoice)
    inquiriesStore.update(inquiry.id, { status: 'responded' })
    toast('결제 요청을 보냈습니다.', {
      description: `${inquiry.customerName}님에게 인보이스가 전달되었어요.`,
    })
    onClose()
  }

  return (
    <Modal
      open={inquiry !== null}
      onClose={onClose}
      title="맞춤 견적 결제 요청"
      description={
        inquiry
          ? `${inquiry.customerName}님 · 예식일 ${inquiry.weddingDate || '-'}`
          : ''
      }
    >
      <div className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            결제 요청 금액 (원)
          </label>
          <input
            type="number"
            min={0}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={field}
          />
          {inquiry && inquiry.referralCode && (
            <p className="mt-1 text-xs text-primary">
              추천인 코드({inquiry.referralCode}) 할인이 견적에 이미 반영되어
              있습니다.
            </p>
          )}
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            메모 (선택)
          </label>
          <textarea
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            rows={3}
            placeholder="상담 내용, 포함 사항 등을 적어주세요."
            className={cn(field, 'resize-none')}
          />
        </div>
        <button
          type="button"
          onClick={send}
          className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          결제 요청 전송
        </button>
      </div>
    </Modal>
  )
}

/* ------------------------------ UI ------------------------------ */

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-serif text-2xl font-bold text-foreground">
        {value}
      </p>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground">{value}</dd>
    </div>
  )
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}

function DashTab({
  active,
  onClick,
  icon,
  children,
}: {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors',
        active
          ? 'border-primary text-primary'
          : 'border-transparent text-muted-foreground hover:text-foreground',
      )}
    >
      {icon}
      {children}
    </button>
  )
}

function ActionBtn({
  onClick,
  children,
}: {
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
    >
      {children}
    </button>
  )
}
