import {
  Building2,
  Clapperboard,
  Flower2,
  Camera,
  Scissors,
  Shirt,
  Sparkles,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react'
import type { Category } from '@/lib/types'

const MAP: Record<Category, LucideIcon> = {
  웨딩영상: Clapperboard,
  본식스냅: Camera,
  예식장: Building2,
  드레스: Shirt,
  '헤어/메이크업': Scissors,
  한복: Sparkles,
  출장뷔페: UtensilsCrossed,
  축하화환: Flower2,
}

export function CategoryIcon({
  category,
  className,
}: {
  category: Category
  className?: string
}) {
  const Icon = MAP[category]
  return <Icon className={className} />
}
