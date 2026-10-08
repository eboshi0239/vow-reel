'use client'

import { CalendarDays, ChevronDown, MapPin, Sun, X } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { CategoryIcon } from '@/components/category-icon'
import { Modal } from '@/components/modal'
import { VendorCard } from '@/components/vendor-card'
import {
  invoicesStore,
  isPopularVendor,
  isSunlightWindow,
  reviewCountFor,
  reviewsStore,
  vendorsStore,
} from '@/lib/store'
import {
  CATEGORIES,
  type Category,
  REGION_DATA,
  REGIONS,
  type Region,
} from '@/lib/types'
import { cn } from '@/lib/utils'

const RegionMap = dynamic(() => import('@/components/region-map'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
      지도를 불러오는 중…
    </div>
  ),
})

export default function MarketplacePage() {
  const vendors = vendorsStore.useAll()
  const reviews = reviewsStore.useAll()
  const invoices = invoicesStore.useAll()

  const [category, setCategory] = useState<Category | '전체'>('전체')
  const [region, setRegion] = useState<Region | '전국'>('전국')
  const [district, setDistrict] = useState<string | null>(null)
  const [date, setDate] = useState('')
  const [mapOpen, setMapOpen] = useState(false)

  const sunlightActive = isSunlightWindow()

  const approved = useMemo(
    () => vendors.filter((v) => v.status === 'approved'),
    [vendors],
  )

  const filtered = useMemo(() => {
    return approved
      .filter((v) => (category === '전체' ? true : v.category === category))
      .filter((v) => (region === '전국' ? true : v.region === region))
      .filter((v) => (district ? v.district === district : true))
      .filter((v) => (date ? !v.bookedDates.includes(date) : true))
  }, [approved, category, region, district, date])

  const decorated = useMemo(() => {
    return filtered.map((v) => {
      const rc = reviewCountFor(reviews, v.id)
      return {
        vendor: v,
        reviewCount: rc,
        popular: isPopularVendor(reviews, invoices, v.id),
        isNew: rc === 0,
        sunlight: sunlightActive && v.boosted && rc === 0,
      }
    })
  }, [filtered, reviews, invoices, sunlightActive])

  const sunlightVendors = useMemo(
    () => decorated.filter((d) => d.vendor.boosted && d.isNew),
    [decorated],
  )

  const sortedMain = useMemo(() => {
    return [...decorated].sort((a, b) => {
      if (a.sunlight !== b.sunlight) return a.sunlight ? -1 : 1
      if (b.reviewCount !== a.reviewCount) return b.reviewCount - a.reviewCount
      return b.vendor.createdAt - a.vendor.createdAt
    })
  }, [decorated])

  const hasFilters =
    category !== '전체' || region !== '전국' || district !== null || date !== ''

  return (
    <main className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      {/* Hero */}
      <section className="py-10 text-center sm:py-14">
        <p className="mb-3 text-sm font-medium tracking-wide text-primary">
          웨딩 종합 마켓플레이스
        </p>
        <h1 className="text-balance font-serif text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          우리 결혼식을 완성할
          <br className="hidden sm:block" /> 모든 업체를 한 곳에서
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-muted-foreground">
          웨딩영상부터 예식장, 드레스, 출장뷔페, 축하화환까지. 지역과 예식일에
          맞춰 검증된 업체를 만나보세요.
        </p>
      </section>

      {/* Category tabs */}
      <div className="mb-8">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={() => setCategory('전체')}
            className={cn(
              'flex h-[92px] min-w-[92px] shrink-0 items-center justify-center rounded-2xl border px-4 text-sm font-semibold transition-colors',
              category === '전체'
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            전체
          </button>
          {CATEGORIES.map((c) => (
            <CategoryTab
              key={c}
              active={category === c}
              onClick={() => setCategory(c)}
              label={c}
              icon={<CategoryIcon category={c} className="size-6" />}
            />
          ))}
        </div>
      </div>

      {/* Region + date filters */}
      <div className="mb-8 flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">지역</span>
          <div className="relative">
            <select
              value={region}
              onChange={(e) => {
                setRegion(e.target.value as Region | '전국')
                setDistrict(null)
              }}
              aria-label="지역 선택"
              className="appearance-none rounded-lg border border-border bg-background py-2 pl-3.5 pr-9 text-sm font-medium text-foreground outline-none focus:border-primary"
            >
              <option value="전국">전국</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
          <button
            type="button"
            disabled={region === '전국'}
            onClick={() => setMapOpen(true)}
            className={cn(
              'flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors',
              region === '전국'
                ? 'cursor-not-allowed border-border bg-muted/50 text-muted-foreground/60'
                : 'border-border bg-background text-foreground hover:border-primary/50',
            )}
          >
            <MapPin className="size-4" />
            {district ? `${region} · ${district}` : '지도에서 위치 지정'}
          </button>
          {district && (
            <button
              type="button"
              onClick={() => setDistrict(null)}
              aria-label="세부 지역 해제"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
        <div className="flex items-center gap-2 border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          <label
            htmlFor="wedding-date"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground"
          >
            <CalendarDays className="size-4" /> 예식일
          </label>
          <input
            id="wedding-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm text-foreground outline-none focus:border-primary"
          />
          {date && (
            <button
              type="button"
              onClick={() => setDate('')}
              aria-label="예식일 필터 해제"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sunlight boost section */}
      {sunlightVendors.length > 0 && (
        <section className="mb-10">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <Sun className="size-5" />
            </span>
            <div>
              <h2 className="font-serif text-lg font-bold text-foreground">
                오늘의 햇빛 신규 업체
              </h2>
              <p className="text-xs text-muted-foreground">
                리뷰가 아직 없는 신규 업체를 응원해요.{' '}
                {sunlightActive
                  ? '지금은 햇빛 우선 노출 시간대입니다.'
                  : '매일 10–12시 · 18–20시에 상단 우선 노출됩니다.'}
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sunlightVendors.map((d) => (
              <VendorCard
                key={d.vendor.id}
                vendor={d.vendor}
                reviewCount={d.reviewCount}
                popular={d.popular}
                sunlight={sunlightActive}
              />
            ))}
          </div>
        </section>
      )}

      {/* Main list */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-foreground">
            {category === '전체' ? '전체 업체' : category}
            <span className="ml-2 text-sm font-normal text-muted-foreground">
              리뷰 많은 순 · {sortedMain.length}곳
            </span>
          </h2>
          {hasFilters && (
            <button
              type="button"
              onClick={() => {
                setCategory('전체')
                setRegion('전국')
                setDate('')
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              필터 초기화
            </button>
          )}
        </div>

        {sortedMain.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center text-muted-foreground">
            조건에 맞는 업체가 없습니다. 필터를 조정해 보세요.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {sortedMain.map((d) => (
              <VendorCard
                key={d.vendor.id}
                vendor={d.vendor}
                reviewCount={d.reviewCount}
                popular={d.popular}
                sunlight={d.sunlight}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}

function CategoryTab({
  active,
  onClick,
  label,
  icon,
}: {
  active: boolean
  onClick: () => void
  label: string
  icon: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex min-w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-xl border px-3 py-3 text-xs font-medium transition-colors',
        active
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
      )}
    >
      {icon}
      {label}
    </button>
  )
}

function RegionChip({
  label,
  active,
  onClick,
}: {
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'rounded-full px-3 py-1 text-sm font-medium transition-colors',
        active
          ? 'bg-primary text-primary-foreground'
          : 'bg-secondary text-secondary-foreground hover:bg-muted',
      )}
    >
      {label}
    </button>
  )
}
