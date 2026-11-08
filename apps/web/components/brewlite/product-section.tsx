'use client'

import { ChevronDown, SearchX, Sparkles } from 'lucide-react'
import type { Product } from '@/lib/menu'
import { ProductCard } from './product-card'

export type SortOption = 'popular' | 'rating' | 'price-asc' | 'price-desc'

const SORT_LABELS: Record<SortOption, string> = {
  popular: 'Phổ biến nhất',
  rating: 'Đánh giá cao',
  'price-asc': 'Giá thấp đến cao',
  'price-desc': 'Giá cao đến thấp',
}

type ProductSectionProps = {
  products: Product[]
  sort: SortOption
  onSortChange: (sort: SortOption) => void
  favorites: Set<string>
  onToggleFavorite: (id: string) => void
  onAdd: (product: Product) => void
  query: string
  onResetFilters: () => void
  noProductsMessage?: string
}

export function ProductSection({
  products,
  sort,
  onSortChange,
  favorites,
  onToggleFavorite,
  onAdd,
  query,
  onResetFilters,
  noProductsMessage,
}: ProductSectionProps) {
  const readyCount = products.filter((p) => p.inStock).length

  return (
    <section aria-labelledby="menu-heading" className="min-w-0">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-foreground/70">
            <Sparkles className="size-3.5 text-caramel" aria-hidden="true" />
            Pha mới mỗi ngày
          </p>
          <h1 id="menu-heading" className="mt-1 text-2xl font-bold tracking-tight text-foreground text-balance">
            Chọn thức uống yêu thích
          </h1>
          <p className="mt-1 text-sm text-muted-foreground" aria-live="polite">
            {query
              ? `${products.length} kết quả cho “${query}”`
              : `${readyCount} món đang sẵn sàng phục vụ`}
          </p>
        </div>
        <div className="relative">
          <label htmlFor="sort" className="sr-only">
            Sắp xếp theo
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(event) => onSortChange(event.target.value as SortOption)}
            className="h-10 appearance-none rounded-xl border border-border bg-card pl-4 pr-9 text-xs font-semibold text-foreground shadow-sm focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/30"
          >
            {(Object.keys(SORT_LABELS) as SortOption[]).map((key) => (
              <option key={key} value={key}>
                {SORT_LABELS[key]}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        </div>
      </div>

      {products.length > 0 ? (
        <ul className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[repeat(auto-fill,minmax(210px,1fr))]">
          {products.map((product) => (
            <li id={`product-${product.id}`} key={product.id} className="flex flex-col [&>article]:flex-1">
              <ProductCard
                product={product}
                isFavorite={favorites.has(product.id)}
                onToggleFavorite={onToggleFavorite}
                onAdd={onAdd}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-input bg-card px-6 py-14 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-secondary text-primary">
            <SearchX className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-semibold text-foreground">
            {noProductsMessage ? 'Chưa có món yêu thích' : 'Không tìm thấy món phù hợp'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {noProductsMessage ?? 'Thử từ khóa khác hoặc xem tất cả danh mục.'}
          </p>
          <button
            type="button"
            onClick={onResetFilters}
            className="mt-5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Xem tất cả món
          </button>
        </div>
      )}
    </section>
  )
}
