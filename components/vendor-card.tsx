'use client'

import { Crown, MapPin, MessageSquareText, Play, Sun } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { CategoryIcon } from '@/components/category-icon'
import { formatPrice, type Vendor } from '@/lib/types'
import { cn } from '@/lib/utils'

export function VendorCard({
  vendor,
  reviewCount,
  popular,
  sunlight,
}: {
  vendor: Vendor
  reviewCount: number
  popular: boolean
  sunlight: boolean
}) {
  const [hover, setHover] = useState(false)
  const showPreview = hover && vendor.hoverPreview

  return (
    <Link
      href={`/vendor/${vendor.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      className={cn(
        'group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5',
        popular
          ? 'border-primary/50 ring-1 ring-primary/30'
          : 'border-border',
      )}
    >
      {/* Fixed 16:9 thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={(showPreview ? vendor.hoverPreview : vendor.thumbnail) || "/placeholder.svg"}
          alt={vendor.businessName}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className={cn(
            'object-cover transition-transform duration-500',
            hover && 'scale-105',
          )}
        />

        {vendor.hoverPreview && (
          <span
            className={cn(
              'absolute inset-0 flex items-center justify-center bg-foreground/25 text-background transition-opacity',
              hover ? 'opacity-100' : 'opacity-0',
            )}
          >
            <span className="flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-semibold text-foreground">
              <Play className="size-3.5 fill-current" /> 영상 미리보기
            </span>
          </span>
        )}

        <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
          {popular && (
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2 py-1 text-[11px] font-bold text-primary-foreground shadow-sm">
              <Crown className="size-3" /> 인기 작가
            </span>
          )}
          {sunlight && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-400 px-2 py-1 text-[11px] font-bold text-amber-950 shadow-sm">
              <Sun className="size-3" /> 햇빛 노출
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <span className="relative size-8 shrink-0 overflow-hidden rounded-full border border-border">
            <Image
              src={vendor.profilePhoto || "/placeholder.svg"}
              alt={vendor.representativeName}
              fill
              className="object-cover"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-card-foreground">
              {vendor.businessName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              대표 {vendor.representativeName}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CategoryIcon category={vendor.category} className="size-3.5" />
            {vendor.category}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {vendor.region}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquareText className="size-3.5" />
            리뷰 {reviewCount}
          </span>
        </div>

        <div className="mt-auto flex items-end justify-between pt-2">
          <div>
            <p className="text-[11px] text-muted-foreground">기본가</p>
            <p className="font-serif text-lg font-bold text-primary">
              {formatPrice(vendor.basePrice)}
            </p>
          </div>
          <span className="rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            상세보기
          </span>
        </div>
      </div>
    </Link>
  )
}
