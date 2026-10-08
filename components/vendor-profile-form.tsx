'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import {
  AvatarUpload,
  GalleryUpload,
  SingleImageUpload,
} from '@/components/image-upload'
import {
  CATEGORIES,
  type Category,
  REGIONS,
  type Region,
  type Vendor,
  type VendorOption,
} from '@/lib/types'
import { cn } from '@/lib/utils'

export interface VendorFormData {
  email: string
  password: string
  profilePhoto: string
  thumbnail: string
  hoverPreview: string
  businessName: string
  representativeName: string
  category: Category
  region: Region
  basePrice: number
  portfolioImages: string[]
  youtubeLinks: string[]
  introText: string
  options: VendorOption[]
}

export function VendorProfileForm({
  initial,
  withAuth,
  submitLabel,
  onSubmit,
}: {
  initial?: Vendor
  withAuth: boolean
  submitLabel: string
  onSubmit: (data: VendorFormData) => void
}) {
  const [email, setEmail] = useState(initial?.email ?? '')
  const [password, setPassword] = useState(initial?.password ?? '')
  const [profilePhoto, setProfilePhoto] = useState(initial?.profilePhoto ?? '')
  const [thumbnail, setThumbnail] = useState(initial?.thumbnail ?? '')
  const [hoverPreview, setHoverPreview] = useState(initial?.hoverPreview ?? '')
  const [businessName, setBusinessName] = useState(initial?.businessName ?? '')
  const [representativeName, setRepresentativeName] = useState(
    initial?.representativeName ?? '',
  )
  const [category, setCategory] = useState<Category>(
    initial?.category ?? CATEGORIES[0],
  )
  const [region, setRegion] = useState<Region>(initial?.region ?? REGIONS[0])
  const [basePrice, setBasePrice] = useState(String(initial?.basePrice ?? ''))
  const [portfolioImages, setPortfolioImages] = useState<string[]>(
    initial?.portfolioImages ?? [],
  )
  const [youtubeLinks, setYoutubeLinks] = useState<string[]>(
    initial?.youtubeLinks?.length ? initial.youtubeLinks : [''],
  )
  const [introText, setIntroText] = useState(initial?.introText ?? '')
  const [options, setOptions] = useState<VendorOption[]>(
    initial?.options ?? [],
  )

  const field =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary'

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const cover = thumbnail || portfolioImages[0] || profilePhoto
    onSubmit({
      email,
      password,
      profilePhoto: profilePhoto || cover,
      thumbnail: cover,
      hoverPreview,
      businessName,
      representativeName,
      category,
      region,
      basePrice: Number(basePrice) || 0,
      portfolioImages,
      youtubeLinks: youtubeLinks.map((l) => l.trim()).filter(Boolean),
      introText,
      options: options
        .map((o) => ({ ...o, label: o.label.trim() }))
        .filter((o) => o.label && o.price >= 0),
    })
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-6">
      {withAuth && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              이메일 (로그인 ID)
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-foreground">
              비밀번호
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={field}
            />
          </div>
        </div>
      )}

      <AvatarUpload value={profilePhoto} onChange={setProfilePhoto} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            업체명
          </label>
          <input
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            대표자명
          </label>
          <input
            required
            value={representativeName}
            onChange={(e) => setRepresentativeName(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            카테고리
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className={field}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            활동 지역
          </label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value as Region)}
            className={field}
          >
            {REGIONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-foreground">
            기본 가격 (원)
          </label>
          <input
            type="number"
            min={0}
            required
            value={basePrice}
            onChange={(e) => setBasePrice(e.target.value)}
            className={field}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <SingleImageUpload
          label="대표 썸네일 (16:9)"
          hint="목록에 노출되는 대표 이미지"
          value={thumbnail}
          onChange={setThumbnail}
        />
        <SingleImageUpload
          label="호버 영상 미리보기 (선택)"
          hint="마우스 오버 시 재생되는 이미지/GIF"
          value={hoverPreview}
          onChange={setHoverPreview}
        />
      </div>

      <GalleryUpload
        label="포트폴리오 사진"
        values={portfolioImages}
        onChange={setPortfolioImages}
      />

      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          유튜브 포트폴리오 링크
        </span>
        <div className="flex flex-col gap-2">
          {youtubeLinks.map((link, i) => (
            <div key={i} className="flex gap-2">
              <input
                value={link}
                onChange={(e) =>
                  setYoutubeLinks((prev) =>
                    prev.map((l, idx) => (idx === i ? e.target.value : l)),
                  )
                }
                placeholder="https://youtube.com/watch?v=..."
                className={field}
              />
              <button
                type="button"
                onClick={() =>
                  setYoutubeLinks((prev) =>
                    prev.length === 1
                      ? ['']
                      : prev.filter((_, idx) => idx !== i),
                  )
                }
                aria-label="링크 삭제"
                className="shrink-0 rounded-lg border border-border px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setYoutubeLinks((prev) => [...prev, ''])}
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="size-4" /> 링크 추가
        </button>
      </div>

      {/* Options */}
      <div>
        <span className="mb-2 block text-sm font-medium text-foreground">
          세부 옵션 (견적 계산기에 노출)
        </span>
        <div className="flex flex-col gap-2">
          {options.map((o, i) => (
            <div key={o.id} className="flex gap-2">
              <input
                value={o.label}
                onChange={(e) =>
                  setOptions((prev) =>
                    prev.map((it, idx) =>
                      idx === i ? { ...it, label: e.target.value } : it,
                    ),
                  )
                }
                placeholder="옵션명 (예: 4K 화질 업그레이드)"
                className={cn(field, 'flex-1')}
              />
              <input
                type="number"
                min={0}
                value={o.price}
                onChange={(e) =>
                  setOptions((prev) =>
                    prev.map((it, idx) =>
                      idx === i
                        ? { ...it, price: Number(e.target.value) || 0 }
                        : it,
                    ),
                  )
                }
                placeholder="금액"
                className={cn(field, 'w-28')}
              />
              <button
                type="button"
                onClick={() =>
                  setOptions((prev) => prev.filter((_, idx) => idx !== i))
                }
                aria-label="옵션 삭제"
                className="shrink-0 rounded-lg border border-border px-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() =>
            setOptions((prev) => [
              ...prev,
              { id: `opt-${Date.now()}`, label: '', price: 0 },
            ])
          }
          className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          <Plus className="size-4" /> 옵션 추가
        </button>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          포트폴리오 소개글
        </label>
        <textarea
          value={introText}
          onChange={(e) => setIntroText(e.target.value)}
          rows={4}
          className={cn(field, 'resize-none')}
          placeholder="업체 소개와 강점을 자유롭게 작성해 주세요."
        />
      </div>

      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
      >
        {submitLabel}
      </button>
    </form>
  )
}
