'use client'

import { ArrowLeft, Crown, MapPin, MessageCircle, Play } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { BookingCalendar } from '@/components/booking-calendar'
import { CategoryIcon } from '@/components/category-icon'
import { ChatModal } from '@/components/chat-panel'
import { ConsultForm } from '@/components/consult-form'
import { ReviewSection } from '@/components/review-section'
import {
  chatStore,
  createId,
  customersStore,
  invoicesStore,
  isPopularVendor,
  reviewCountFor,
  reviewsStore,
  threadMessages,
  useSession,
  vendorsStore,
} from '@/lib/store'
import { formatPrice, youtubeId } from '@/lib/types'

export default function VendorDetailPage() {
  const params = useParams<{ id: string }>()
  const vendors = vendorsStore.useAll()
  const reviews = reviewsStore.useAll()
  const invoices = invoicesStore.useAll()
  const session = useSession()
  const customers = customersStore.useAll()
  const me = customers.find((c) => c.id === session.customerId)

  const [selectedDate, setSelectedDate] = useState('')
  const [chatOpen, setChatOpen] = useState(false)

  const vendor = vendors.find((v) => v.id === params.id)

  function startChat(info: { weddingDate: string; venue: string }) {
    if (!me || !vendor) return
    const existing = threadMessages(chatStore.current(), vendor.id, me.id)
    if (existing.length === 0) {
      const lines = [
        '안녕하세요, 상담 문의드립니다.',
        `예식일: ${info.weddingDate}`,
        info.venue ? `예식장: ${info.venue}` : '',
      ].filter(Boolean)
      chatStore.add({
        id: createId('msg'),
        vendorId: vendor.id,
        customerId: me.id,
        sender: 'customer',
        kind: 'text',
        text: lines.join('\n'),
        invoiceId: '',
        createdAt: Date.now(),
        readByVendor: false,
        readByCustomer: true,
      })
    }
    setChatOpen(true)
  }

  if (vendors.length === 0) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center text-muted-foreground sm:px-6">
        불러오는 중…
      </main>
    )
  }

  if (!vendor) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-muted-foreground">존재하지 않는 업체입니다.</p>
        <Link href="/" className="mt-4 inline-block text-primary hover:underline">
          마켓플레이스로 돌아가기
        </Link>
      </main>
    )
  }

  const reviewCount = reviewCountFor(reviews, vendor.id)
  const popular = isPopularVendor(reviews, invoices, vendor.id)

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <div className="py-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" /> 마켓플레이스
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5 sm:flex-row sm:items-center">
        <span className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-primary/30">
          <Image
            src={vendor.profilePhoto || "/placeholder.svg"}
            alt={vendor.businessName}
            fill
            className="object-cover"
          />
        </span>
        <div className="flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-bold text-foreground">
              {vendor.businessName}
            </h1>
            {popular && (
              <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-primary-foreground">
                <Crown className="size-3" /> 인기 작가
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            대표 {vendor.representativeName}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <CategoryIcon category={vendor.category} className="size-4" />
              {vendor.category}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="size-4" /> {vendor.region}
            </span>
            <span>리뷰 {reviewCount}개</span>
          </div>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-muted-foreground">기본가</p>
          <p className="font-serif text-2xl font-bold text-primary">
            {formatPrice(vendor.basePrice)}
          </p>
        </div>
      </div>

      {/* Intro */}
      <p className="mt-4 rounded-2xl border border-border bg-card p-5 text-pretty leading-relaxed text-foreground/90">
        {vendor.introText}
      </p>

      {/* Portfolio */}
      <section className="mt-8">
        <h2 className="mb-3 font-serif text-xl font-bold text-foreground">
          포트폴리오
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {vendor.portfolioImages.map((src, i) => (
            <div
              key={src.slice(0, 20) + i}
              className="relative aspect-video overflow-hidden rounded-xl border border-border bg-muted"
            >
              <Image
                src={src || "/placeholder.svg"}
                alt={`${vendor.businessName} 포트폴리오 ${i + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        {vendor.youtubeLinks.filter(Boolean).length > 0 && (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {vendor.youtubeLinks.filter(Boolean).map((link, i) => {
              const id = youtubeId(link)
              if (!id)
                return (
                  <a
                    key={link + i}
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-sm text-primary hover:underline"
                  >
                    <Play className="size-4" /> 포트폴리오 영상 보기
                  </a>
                )
              return (
                <div
                  key={link + i}
                  className="relative aspect-video overflow-hidden rounded-xl border border-border bg-black"
                >
                  <iframe
                    src={`https://www.youtube.com/embed/${id}`}
                    title={`포트폴리오 영상 ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="size-full"
                  />
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Main grid */}
      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <section className="mb-8">
            <h2 className="mb-1 font-serif text-xl font-bold text-foreground">
              예약 가능 일정
            </h2>
            <p className="mb-3 text-sm text-muted-foreground">
              예약 마감된 날짜는 선택할 수 없습니다. 예식일을 선택하면 상담
              신청에 자동 반영됩니다.
            </p>
            <BookingCalendar
              bookedDates={vendor.bookedDates}
              mode="select"
              selected={selectedDate}
              onSelect={setSelectedDate}
            />
            {selectedDate && (
              <p className="mt-2 text-sm text-primary">
                선택한 예식일: <strong>{selectedDate}</strong>
              </p>
            )}
          </section>

          <ReviewSection vendorId={vendor.id} reviews={reviews} />
        </div>

        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-20">
            <div className="rounded-2xl border border-border bg-card p-5">
              <h2 className="mb-1 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
                <MessageCircle className="size-5 text-primary" />
                실시간 상담 신청
              </h2>
              <p className="mb-4 text-sm text-muted-foreground">
                예식일과 예식장을 입력하고 작가와 바로 채팅하세요.
              </p>
              <ConsultForm
                vendor={vendor}
                selectedDate={selectedDate}
                onStartChat={startChat}
              />
            </div>
          </div>
        </div>
      </div>

      {me && (
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          vendorId={vendor.id}
          vendorName={vendor.businessName}
          customerId={me.id}
          customerName={me.name}
          role="customer"
        />
      )}
    </main>
  )
}
