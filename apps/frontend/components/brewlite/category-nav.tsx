'use client'

import { Coffee, CupSoda, GlassWater, Heart, MapPin, Sparkles, type LucideIcon } from 'lucide-react'
import { CATEGORY_LABELS, type CategoryId, type MenuCategory } from '@/lib/menu'
import { cn } from '@/lib/utils'

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  coffee: Coffee,
  'milk-tea': CupSoda,
  juice: GlassWater,
}

export type CategoryFilter = CategoryId | 'all' | 'favorites'
type CategoryCounts = Record<string, number> & { favorites: number }

type CategoryNavProps = {
  active: CategoryFilter
  counts: CategoryCounts
  onChange: (id: CategoryFilter) => void
  categories: MenuCategory[]
}

function getNavigation(categories: MenuCategory[]) {
  return [
    { id: 'all', name: CATEGORY_LABELS.all, Icon: Sparkles },
    ...categories.filter((category) => category.isActive).map((category) => ({
      id: category.id,
      name: category.name,
      Icon: CATEGORY_ICONS[category.slug] ?? Coffee,
    })),
    { id: 'favorites', name: 'Gu của bạn', Icon: Heart },
  ]
}

export function CategorySidebar({ active, counts, onChange, categories }: CategoryNavProps) {
  const navigation = getNavigation(categories)
  return (
    <aside className="hidden lg:block" aria-label="Danh mục">
      <div className="sticky top-[84px] flex flex-col gap-6">
        <nav>
          <p className="px-2 pb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Danh mục
          </p>
          <ul className="flex flex-col gap-1.5">
            {navigation.map(({ id, name, Icon }) => {
              const isActive = id === active
              return (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => onChange(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'text-foreground/80 hover:bg-secondary hover:text-foreground',
                    )}
                  >
                    <Icon className={cn('size-[18px]', id === 'favorites' && 'fill-rose-500 text-rose-500')} aria-hidden="true" />
                    <span className="flex-1 text-left">{name}</span>
                    <span
                      className={cn(
                        'text-xs font-medium',
                        isActive ? 'text-primary-foreground/80' : 'text-muted-foreground',
                      )}
                    >
                      {counts[id]}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="rounded-2xl bg-sand p-4">
          <span className="flex size-9 items-center justify-center rounded-full bg-card text-primary">
            <MapPin className="size-4" aria-hidden="true" />
          </span>
          <p className="mt-5 text-sm font-semibold text-foreground">Cửa hàng gần bạn</p>
          <p className="mt-1 text-xs text-muted-foreground">BrewLite Quận 1</p>
          <p className="text-xs text-muted-foreground">Cách bạn 0,8 km</p>
          <a
            href="https://maps.google.com/?q=Quan+1+Ho+Chi+Minh"
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-block text-xs font-semibold text-primary underline-offset-4 hover:underline"
          >
            Xem bản đồ
          </a>
        </div>
      </div>
    </aside>
  )
}

export function CategoryChips({ active, counts, onChange, categories }: CategoryNavProps) {
  const navigation = getNavigation(categories)
  return (
    <nav aria-label="Danh mục" className="-mx-4 lg:hidden">
      <ul className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-1">
        {navigation.map(({ id, name, Icon }) => {
          const isActive = id === active
          return (
            <li key={id} className="shrink-0">
              <button
                type="button"
                onClick={() => onChange(id)}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors',
                  isActive
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground/80 hover:bg-secondary',
                )}
              >
                <Icon className={cn('size-4', id === 'favorites' && 'fill-rose-500 text-rose-500')} aria-hidden="true" />
                {name}
                <span className={cn('text-xs', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                  {counts[id]}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
