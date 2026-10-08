'use client'

import { CheckCircle2, Clock, Pencil, Users } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Modal } from '@/components/modal'
import { VendorStatusBadge } from '@/components/status-badge'
import { toast } from '@/components/toast'
import { Button } from '@/components/ui/button'
import {
  VendorProfileForm,
  type VendorFormData,
} from '@/components/vendor-profile-form'
import { vendorsStore } from '@/lib/store'
import { formatPrice, type Vendor } from '@/lib/types'

export default function AdminPage() {
  const vendors = vendorsStore.useAll()
  const [editing, setEditing] = useState<Vendor | null>(null)

  const stats = useMemo(() => {
    const total = vendors.length
    const pending = vendors.filter((v) => v.status === 'pending').length
    const approved = vendors.filter((v) => v.status === 'approved').length
    return { total, pending, approved }
  }, [vendors])

  const ordered = useMemo(
    () =>
      [...vendors].sort((a, b) => {
        if (a.status !== b.status) return a.status === 'pending' ? -1 : 1
        return b.createdAt - a.createdAt
      }),
    [vendors],
  )

  function handleApprove(vendor: Vendor) {
    vendorsStore.update(vendor.id, { status: 'approved' })
    toast('승인 완료', {
      description: `${vendor.businessName}이(가) 마켓플레이스에 노출됩니다.`,
    })
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-foreground sm:text-4xl">
            입점 심사 관리
          </h1>
          <p className="mt-2 text-muted-foreground">
            신청된 업체를 검토하고 승인하거나 정보를 직접 수정하세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            label="전체 등록 업체"
            value={stats.total}
            icon={<Users className="size-5" />}
            tone="neutral"
          />
          <StatCard
            label="심사 대기"
            value={stats.pending}
            icon={<Clock className="size-5" />}
            tone="pending"
          />
          <StatCard
            label="승인 완료"
            value={stats.approved}
            icon={<CheckCircle2 className="size-5" />}
            tone="approved"
          />
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="hidden grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1.4fr] gap-4 border-b border-border bg-muted/50 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground md:grid">
            <span>소속사명</span>
            <span>카테고리</span>
            <span>지역</span>
            <span>상태</span>
            <span className="text-right">관리</span>
          </div>

          <ul className="divide-y divide-border">
            {ordered.map((vendor) => (
              <li
                key={vendor.id}
                className="flex flex-col gap-3 px-5 py-4 md:grid md:grid-cols-[1.4fr_1fr_0.8fr_0.9fr_1.4fr] md:items-center md:gap-4"
              >
                <div>
                  <p className="font-semibold text-card-foreground">
                    {vendor.businessName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    대표 {vendor.representativeName} ·{' '}
                    {formatPrice(vendor.basePrice)}
                  </p>
                </div>

                <div className="text-sm text-foreground">
                  <span className="text-muted-foreground md:hidden">
                    카테고리:{' '}
                  </span>
                  {vendor.category}
                </div>

                <div className="text-sm text-foreground">
                  <span className="text-muted-foreground md:hidden">지역: </span>
                  {vendor.region}
                </div>

                <div>
                  <VendorStatusBadge status={vendor.status} />
                </div>

                <div className="flex flex-wrap gap-2 md:justify-end">
                  {vendor.status === 'pending' ? (
                    <Button size="sm" onClick={() => handleApprove(vendor)}>
                      <CheckCircle2 className="size-4" />
                      원클릭 승인
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditing(vendor)}
                  >
                    <Pencil className="size-4" />
                    상세 검토 및 수정
                  </Button>
                </div>
              </li>
            ))}
          </ul>

          {ordered.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-muted-foreground">
              등록된 업체가 없습니다.
            </div>
          ) : null}
        </div>
      </div>

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title="업체 정보 상세 검토 및 수정"
        description={editing?.businessName}
      >
        {editing && (
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {editing.status === 'pending' ? (
                <Button
                  size="sm"
                  onClick={() => {
                    handleApprove(editing)
                    setEditing(null)
                  }}
                >
                  <CheckCircle2 className="size-4" /> 승인 처리
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    vendorsStore.update(editing.id, { status: 'pending' })
                    toast('심사 대기 상태로 변경했습니다.')
                    setEditing(null)
                  }}
                >
                  승인 취소 (심사대기로)
                </Button>
              )}
            </div>
            <VendorProfileForm
              initial={editing}
              withAuth={false}
              submitLabel="변경사항 저장"
              onSubmit={(data: VendorFormData) => {
                vendorsStore.update(editing.id, {
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
                toast('업체 정보가 수정되었습니다.')
                setEditing(null)
              }}
            />
          </div>
        )}
      </Modal>
    </main>
  )
}

function StatCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string
  value: number
  icon: React.ReactNode
  tone: 'neutral' | 'pending' | 'approved'
}) {
  const toneClass =
    tone === 'approved'
      ? 'bg-primary/12 text-primary'
      : tone === 'pending'
        ? 'bg-accent text-accent-foreground'
        : 'bg-muted text-muted-foreground'

  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 font-serif text-3xl font-bold text-foreground">
          {value}
        </p>
      </div>
      <span
        className={`flex size-11 items-center justify-center rounded-xl ${toneClass}`}
      >
        {icon}
      </span>
    </div>
  )
}
