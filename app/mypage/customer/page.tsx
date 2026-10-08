'use client'

import {
  BellRing,
  CalendarPlus,
  Check,
  Copy,
  Download,
  Gift,
  LogOut,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { ChatModal } from '@/components/chat-panel'
import { CheckoutModal } from '@/components/checkout-modal'
import { Modal } from '@/components/modal'
import { EscrowBadge, PaymentBadge } from '@/components/status-badge'
import { toast } from '@/components/toast'
import {
  chatStore,
  createId,
  customersStore,
  generateReferralCode,
  invoicesStore,
  setSessionCustomer,
  threadMessages,
  unreadCount,
  useSession,
  vendorsStore,
} from '@/lib/store'
import { downloadIcs, googleCalendarUrl } from '@/lib/ics'
import { formatPrice, type Customer, type Invoice } from '@/lib/types'
import { cn } from '@/lib/utils'

const DAY = 1000 * 60 * 60 * 24

function daysUntil(dateISO: string): number {
  if (!dateISO) return Number.POSITIVE_INFINITY
  const target = new Date(dateISO + 'T00:00:00').getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.ceil((target - today.getTime()) / DAY)
}

export default function CustomerMyPage() {
  const session = useSession()
  const customers = customersStore.useAll()
  const me = customers.find((c) => c.id === session.customerId)

  if (!session.customerId || !me) {
    return <CustomerAuth customers={customers} />
  }
  return <CustomerDashboard me={me} />
}

/* ----------------------------- Auth ----------------------------- */

function CustomerAuth({ customers }: { customers: Customer[] }) {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [weddingDate, setWeddingDate] = useState('')

  const field =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'

  function login(e: React.FormEvent) {
    e.preventDefault()
    const found = customers.find(
      (c) => c.email === email.trim() && c.password === password,
    )
    if (!found) {
      toast('로그인 정보를 확인해 주세요.', { variant: 'info' })
      return
    }
    setSessionCustomer(found.id)
    toast('로그인되었습니다.')
  }

  function signup(e: React.FormEvent) {
    e.preventDefault()
    if (customers.some((c) => c.email === email.trim())) {
      toast('이미 가입된 이메일입니다.', { variant: 'info' })
      return
    }
    const customer: Customer = {
      id: createId('c'),
      name: name.trim(),
      email: email.trim(),
      password,
      referralCode: generateReferralCode(),
      referredBy: '',
      weddingDate,
      ceremonyOrder: '',
      invitationLink: '',
      shootingRequest: '',
      createdAt: Date.now(),
    }
    customersStore.add(customer)
    setSessionCustomer(customer.id)
    toast('가입이 완료되었습니다.', { description: '나만의 짝꿍 코드가 발급되었어요.' })
  }

  return (
    <main className="mx-auto max-w-md px-4 py-12 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-foreground">
        내 예약 · 마이페이지
      </h1>
      <p className="mt-2 text-muted-foreground">
        결제 요청 확인, 예약 관리, 예식 알림을 한 곳에서.
      </p>

      <div className="mt-6 inline-flex rounded-lg border border-border bg-card p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            mode === 'login'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          로그인
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={cn(
            'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
            mode === 'signup'
              ? 'bg-primary text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          회원가입
        </button>
      </div>

      {mode === 'login' ? (
        <form
          onSubmit={login}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <Labeled label="이메일">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </Labeled>
          <Labeled label="비밀번호">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </Labeled>
          <button
            type="submit"
            className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            로그인
          </button>
          <p className="text-xs text-muted-foreground">
            데모 계정: bride@vowreel.kr / demo1234
          </p>
        </form>
      ) : (
        <form
          onSubmit={signup}
          className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-5"
        >
          <Labeled label="이름">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={field}
            />
          </Labeled>
          <Labeled label="이메일">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </Labeled>
          <Labeled label="비밀번호">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </Labeled>
          <Labeled label="예식일 (선택)">
            <input
              type="date"
              value={weddingDate}
              onChange={(e) => setWeddingDate(e.target.value)}
              className={field}
            />
          </Labeled>
          <button
            type="submit"
            className="mt-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            가입하기
          </button>
        </form>
      )}
    </main>
  )
}

/* --------------------------- Dashboard --------------------------- */

const MILESTONES = [
  { days: 30, label: 'D-30', desc: '예식 준비를 시작할 시점입니다.' },
  { days: 14, label: 'D-14', desc: '업체와 세부 일정을 조율하세요.' },
  {
    days: 7,
    label: 'D-7',
    desc: '식순지, 모바일 청첩장 링크, 촬영 요청사항을 등록해 주세요.',
    action: true,
  },
  { days: 3, label: 'D-3', desc: '최종 준비 사항을 점검하세요.' },
  { days: 1, label: 'D-1', desc: '내일이 예식입니다. 소지품을 확인하세요.' },
  { days: 0, label: 'D-Day', desc: '행복한 예식날입니다!' },
]

function CustomerDashboard({ me }: { me: Customer }) {
  const invoices = invoicesStore
    .useAll()
    .filter((i) => i.customerId === me.id)
    .sort((a, b) => b.createdAt - a.createdAt)

  const [payFor, setPayFor] = useState<Invoice | null>(null)
  const [copied, setCopied] = useState(false)

  const d = daysUntil(me.weddingDate)

  function copyCode() {
    navigator.clipboard?.writeText(me.referralCode)
    setCopied(true)
    toast('짝꿍 코드를 복사했습니다.')
    setTimeout(() => setCopied(false), 1500)
  }

  const bookedInvoices = invoices.filter(
    (i) => i.paymentStatus === 'paid' || i.paymentStatus === 'confirmed',
  )

  return (
    <main className="mx-auto max-w-4xl px-4 pb-20 pt-8 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground">
            {me.name}님의 마이페이지
          </h1>
          {me.weddingDate && (
            <p className="mt-1 text-sm text-muted-foreground">
              예식일 {me.weddingDate}
              {Number.isFinite(d) && d >= 0 && (
                <span className="ml-1 font-semibold text-primary">
                  · D-{d}
                </span>
              )}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            setSessionCustomer(null)
            toast('로그아웃되었습니다.')
          }}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          <LogOut className="size-4" /> 로그아웃
        </button>
      </div>

      {/* Referral code */}
      <section className="mt-6 flex flex-col gap-3 rounded-2xl border border-primary/30 bg-accent/50 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Gift className="size-5" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">
              나의 짝꿍(추천인) 코드
            </p>
            <p className="font-serif text-2xl font-bold tracking-wide text-primary">
              {me.referralCode}
            </p>
            <p className="text-xs text-muted-foreground">
              친구가 이 코드로 상담·결제하면 5% 할인 혜택을 받아요.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={copyCode}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          {copied ? '복사됨' : '코드 복사'}
        </button>
      </section>

      {/* Payment requests */}
      <section className="mt-8">
        <h2 className="mb-3 font-serif text-xl font-bold text-foreground">
          결제 요청 · 예약 현황
        </h2>
        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            받은 결제 요청이 없습니다. 마음에 드는 업체에 상담을 신청해 보세요.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="rounded-xl border border-border bg-card p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-foreground">
                    {inv.vendorName}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <PaymentBadge status={inv.paymentStatus} />
                    <EscrowBadge stage={inv.escrowStage} />
                  </div>
                </div>
                {inv.memo && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {inv.memo}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                  <p className="font-serif text-lg font-bold text-primary">
                    {formatPrice(inv.finalAmount)}
                    {inv.discount > 0 && (
                      <span className="ml-2 text-xs font-normal text-muted-foreground line-through">
                        {formatPrice(inv.amount)}
                      </span>
                    )}
                  </p>
                  {inv.paymentStatus === 'pending' ? (
                    <button
                      type="button"
                      onClick={() => setPayFor(inv)}
                      className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
                    >
                      결제하기
                    </button>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-sm text-primary">
                      <ShieldCheck className="size-4" /> 계약금 에스크로 보호 중
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Chat threads */}
      <ChatThreads me={me} />

      {/* Calendar sync */}
      {bookedInvoices.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-3 font-serif text-xl font-bold text-foreground">
            내 캘린더에 예식 일정 추가
          </h2>
          <ul className="flex flex-col gap-3">
            {bookedInvoices.map((inv) => {
              const event = {
                title: `[VowReel] ${inv.vendorName} 예식`,
                dateISO: inv.weddingDate || me.weddingDate,
                location: inv.venue || '',
                description: `${inv.vendorName} · ${formatPrice(inv.finalAmount)}`,
              }
              return (
                <li
                  key={inv.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-card p-4"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {inv.vendorName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {event.dateISO || '예식일 미정'}{' '}
                      {inv.venue && `· ${inv.venue}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => downloadIcs(event)}
                      disabled={!event.dateISO}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50"
                    >
                      <Download className="size-4" /> .ics 다운로드
                    </button>
                    <a
                      href={event.dateISO ? googleCalendarUrl(event) : undefined}
                      target="_blank"
                      rel="noreferrer"
                      aria-disabled={!event.dateISO}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90',
                        !event.dateISO && 'pointer-events-none opacity-50',
                      )}
                    >
                      <CalendarPlus className="size-4" /> 구글 캘린더
                    </a>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {/* D-Day notifications */}
      {me.weddingDate && (
        <section className="mt-8">
          <h2 className="mb-1 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
            <BellRing className="size-5 text-primary" /> 예식 D-Day 알림
          </h2>
          <p className="mb-4 text-sm text-muted-foreground">
            예식일 기준으로 준비 안내 알림이 자동 발송됩니다.
          </p>
          <ol className="relative flex flex-col gap-3 border-l border-border pl-5">
            {MILESTONES.map((m) => {
              const reached = d <= m.days
              return (
                <li key={m.label} className="relative">
                  <span
                    className={cn(
                      'absolute -left-[27px] top-1 size-3 rounded-full border-2',
                      reached
                        ? 'border-primary bg-primary'
                        : 'border-border bg-background',
                    )}
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {m.label}
                    </span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-xs font-medium',
                        reached
                          ? 'bg-primary/12 text-primary'
                          : 'bg-secondary text-secondary-foreground',
                      )}
                    >
                      {reached ? '발송 완료' : '발송 예정'}
                    </span>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {m.desc}
                  </p>
                  {m.action && reached && <D7Checklist me={me} />}
                </li>
              )
            })}
          </ol>
        </section>
      )}

      <CheckoutModal invoice={payFor} onClose={() => setPayFor(null)} />
      <DDayAlarm me={me} />
    </main>
  )
}

function D7Checklist({ me }: { me: Customer }) {
  const [order, setOrder] = useState(me.ceremonyOrder)
  const [link, setLink] = useState(me.invitationLink)
  const [req, setReq] = useState(me.shootingRequest)

  const field =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'

  function save() {
    customersStore.update(me.id, {
      ceremonyOrder: order,
      invitationLink: link,
      shootingRequest: req,
    })
    toast('예식 정보가 저장되었습니다.')
  }

  return (
    <div className="mt-3 flex flex-col gap-2 rounded-xl border border-primary/25 bg-accent/40 p-4">
      <Labeled label="식순지 내용">
        <textarea
          rows={2}
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className={cn(field, 'resize-none')}
          placeholder="예: 개식 → 신랑입장 → 신부입장 → ..."
        />
      </Labeled>
      <Labeled label="모바일 청첩장 링크">
        <input
          value={link}
          onChange={(e) => setLink(e.target.value)}
          className={field}
          placeholder="https://..."
        />
      </Labeled>
      <Labeled label="촬영 / 진행 요청사항">
        <textarea
          rows={2}
          value={req}
          onChange={(e) => setReq(e.target.value)}
          className={cn(field, 'resize-none')}
          placeholder="꼭 담아야 할 장면, 진행 관련 요청 등"
        />
      </Labeled>
      <button
        type="button"
        onClick={save}
        className="self-start rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        예식 정보 저장
      </button>
    </div>
  )
}

/* --------------------------- D-Day auto alarm --------------------------- */

function DDayAlarm({ me }: { me: Customer }) {
  const [alarm, setAlarm] = useState<{ label: string; desc: string } | null>(
    null,
  )

  useEffect(() => {
    if (!me.weddingDate) return
    const d = daysUntil(me.weddingDate)
    const reached = MILESTONES.filter((m) => d <= m.days)
    const current = reached[reached.length - 1] // smallest-days milestone reached
    if (!current) return
    const key = `vowreel_dday_ack_${me.id}`
    let ack: string[] = []
    try {
      ack = JSON.parse(localStorage.getItem(key) || '[]')
    } catch {
      ack = []
    }
    if (ack.includes(current.label)) return
    setAlarm({ label: current.label, desc: current.desc })
    toast(`${current.label} · 예식 자동 알림`, { description: current.desc })
    try {
      localStorage.setItem(key, JSON.stringify([...ack, current.label]))
    } catch {
      // ignore
    }
  }, [me.id, me.weddingDate])

  return (
    <Modal
      open={alarm !== null}
      onClose={() => setAlarm(null)}
      title={alarm ? `${alarm.label} 예식 알림` : ''}
      description="예식일 기준 자동 안내 알림이 도착했어요."
    >
      <div className="flex flex-col items-center gap-4 py-2 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/12 text-primary">
          <BellRing className="size-7" />
        </span>
        <p className="text-pretty leading-relaxed text-foreground">
          {alarm?.desc}
        </p>
        {alarm?.label === 'D-7' && (
          <p className="text-sm text-muted-foreground">
            아래 &lsquo;예식 D-Day 알림&rsquo;에서 식순지, 모바일 청첩장 링크,
            촬영 요청사항을 등록해 주세요.
          </p>
        )}
        <button
          type="button"
          onClick={() => setAlarm(null)}
          className="mt-1 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
        >
          확인
        </button>
      </div>
    </Modal>
  )
}

/* --------------------------- Chat threads --------------------------- */

function ChatThreads({ me }: { me: Customer }) {
  const chats = chatStore.useAll()
  const vendors = vendorsStore.useAll()
  const [openWith, setOpenWith] = useState<string | null>(null)

  const vendorIds = Array.from(
    new Set(chats.filter((c) => c.customerId === me.id).map((c) => c.vendorId)),
  )

  if (vendorIds.length === 0) return null

  const activeVendor = vendors.find((v) => v.id === openWith)

  return (
    <section className="mt-8">
      <h2 className="mb-3 font-serif text-xl font-bold text-foreground">
        상담 채팅
      </h2>
      <ul className="flex flex-col gap-2">
        {vendorIds.map((vid) => {
          const vendor = vendors.find((v) => v.id === vid)
          const thread = threadMessages(chats, vid, me.id)
          const last = thread[thread.length - 1]
          const unread = unreadCount(chats, 'customer', vid, me.id)
          return (
            <li key={vid}>
              <button
                type="button"
                onClick={() => setOpenWith(vid)}
                className="flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:bg-muted"
              >
                <MessageCircle className="size-5 shrink-0 text-primary" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-foreground">
                    {vendor?.businessName ?? '업체'}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {last
                      ? last.kind === 'invoice'
                        ? '결제 요청이 도착했습니다.'
                        : last.text
                      : '대화를 시작해 보세요.'}
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

      {activeVendor && (
        <ChatModal
          open={openWith !== null}
          onClose={() => setOpenWith(null)}
          vendorId={activeVendor.id}
          vendorName={activeVendor.businessName}
          customerId={me.id}
          customerName={me.name}
          role="customer"
        />
      )}
    </section>
  )
}

/* ------------------------------ UI ------------------------------ */

function Labeled({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-foreground">
        {label}
      </span>
      {children}
    </label>
  )
}
