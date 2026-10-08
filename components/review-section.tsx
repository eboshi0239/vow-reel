'use client'

import { MessageSquareText } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { GalleryUpload } from '@/components/image-upload'
import { toast } from '@/components/toast'
import {
  createId,
  customersStore,
  reviewsStore,
  useSession,
} from '@/lib/store'
import type { Review } from '@/lib/types'

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString('ko-KR')
}

export function ReviewSection({
  vendorId,
  reviews,
}: {
  vendorId: string
  reviews: Review[]
}) {
  const session = useSession()
  const customers = customersStore.useAll()
  const me = customers.find((c) => c.id === session.customerId)

  const [text, setText] = useState('')
  const [photos, setPhotos] = useState<string[]>([])

  const vendorReviews = reviews
    .filter((r) => r.vendorId === vendorId)
    .sort((a, b) => b.createdAt - a.createdAt)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) {
      toast('리뷰 내용을 입력해 주세요.', { variant: 'info' })
      return
    }
    reviewsStore.add({
      id: createId('r'),
      vendorId,
      customerName: me?.name ?? '익명',
      text: text.trim(),
      photos,
      createdAt: Date.now(),
    })
    setText('')
    setPhotos([])
    toast('리뷰가 등록되었습니다.', {
      description: '솔직한 후기를 남겨주셔서 감사합니다.',
    })
  }

  return (
    <div>
      <h3 className="mb-1 flex items-center gap-2 font-serif text-xl font-bold text-foreground">
        <MessageSquareText className="size-5 text-primary" />
        리뷰 {vendorReviews.length}
      </h3>
      <p className="mb-4 text-sm text-muted-foreground">
        VowReel은 별점 없이 사진과 솔직한 텍스트 리뷰만 제공합니다.
      </p>

      {me ? (
        <form
          onSubmit={submit}
          className="mb-6 rounded-xl border border-border bg-card p-4"
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="촬영/서비스 경험을 솔직하게 남겨주세요."
            className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:border-primary"
          />
          <div className="mt-3">
            <GalleryUpload
              label="사진 첨부 (선택)"
              values={photos}
              onChange={setPhotos}
              ratio="square"
            />
          </div>
          <button
            type="submit"
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:opacity-90"
          >
            리뷰 등록
          </button>
        </form>
      ) : (
        <p className="mb-6 rounded-xl border border-dashed border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          리뷰는 고객 로그인 후 작성할 수 있습니다.
        </p>
      )}

      {vendorReviews.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border py-10 text-center text-sm text-muted-foreground">
          아직 리뷰가 없습니다. 첫 리뷰의 주인공이 되어주세요.
        </p>
      ) : (
        <ul className="flex flex-col gap-4">
          {vendorReviews.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-border bg-card p-4"
            >
              <div className="mb-1 flex items-center justify-between">
                <span className="text-sm font-semibold text-foreground">
                  {r.customerName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(r.createdAt)}
                </span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90">
                {r.text}
              </p>
              {r.photos.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {r.photos.map((src, i) => (
                    <span
                      key={src.slice(0, 20) + i}
                      className="relative size-20 overflow-hidden rounded-lg border border-border"
                    >
                      <Image
                        src={src || "/placeholder.svg"}
                        alt={`리뷰 사진 ${i + 1}`}
                        fill
                        className="object-cover"
                      />
                    </span>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
