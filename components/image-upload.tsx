'use client'

import { ImagePlus, Upload, X } from 'lucide-react'
import Image from 'next/image'
import { useRef } from 'react'

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function AvatarUpload({
  value,
  onChange,
}: {
  value: string
  onChange: (dataUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await readAsDataUrl(file))
    e.target.value = ''
  }

  return (
    <div className="flex items-center gap-4">
      <div className="relative size-20 overflow-hidden rounded-full border border-border bg-muted">
        {value ? (
          <Image src={value || "/placeholder.svg"} alt="프로필 사진" fill className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-muted-foreground">
            <ImagePlus className="size-6" />
          </div>
        )}
      </div>
      <div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Upload className="size-4" />
          프로필 사진 업로드
        </button>
        <p className="mt-1 text-xs text-muted-foreground">
          정사각형 이미지를 권장합니다.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handle}
          className="hidden"
        />
      </div>
    </div>
  )
}

export function SingleImageUpload({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint?: string
  value: string
  onChange: (dataUrl: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    onChange(await readAsDataUrl(file))
    e.target.value = ''
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <Upload className="size-3.5" />
          {value ? '변경' : '업로드'}
        </button>
      </div>
      <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted">
        {value ? (
          <Image src={value || "/placeholder.svg"} alt={label} fill className="object-cover" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">
            {hint ?? '이미지를 업로드하세요.'}
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handle}
        className="hidden"
      />
    </div>
  )
}

export function GalleryUpload({
  label,
  values,
  onChange,
  ratio = 'video',
}: {
  label: string
  values: string[]
  onChange: (next: string[]) => void
  ratio?: 'video' | 'square'
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  async function handle(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    const urls = await Promise.all(files.map(readAsDataUrl))
    onChange([...values, ...urls])
    e.target.value = ''
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
        >
          <ImagePlus className="size-3.5" />
          사진 추가
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {values.map((src, i) => (
          <div
            key={src.slice(0, 24) + i}
            className={`group relative overflow-hidden rounded-lg border border-border bg-muted ${
              ratio === 'video' ? 'aspect-video' : 'aspect-square'
            }`}
          >
            <Image src={src || "/placeholder.svg"} alt={`${label} ${i + 1}`} fill className="object-cover" />
            <button
              type="button"
              onClick={() => onChange(values.filter((_, idx) => idx !== i))}
              aria-label="사진 삭제"
              className="absolute right-1 top-1 rounded-md bg-foreground/60 p-1 text-background opacity-0 transition-opacity group-hover:opacity-100"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
        {values.length === 0 && (
          <div
            className={`flex items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted-foreground ${
              ratio === 'video' ? 'aspect-video' : 'aspect-square'
            } col-span-3 sm:col-span-4`}
          >
            아직 등록된 사진이 없습니다.
          </div>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handle}
        className="hidden"
      />
    </div>
  )
}
