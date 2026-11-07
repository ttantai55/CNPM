'use client'

import Image from 'next/image'
import { Heart, Plus, Star } from 'lucide-react'
import { CATEGORY_LABELS, formatPrice, type Product } from '@/lib/menu'
import { cn } from '@/lib/utils'

type ProductCardProps = {
  product: Product
  isFavorite: boolean
  onToggleFavorite: (id: string) => void
  onAdd: (product: Product) => void
}

export function ProductCard({ product, isFavorite, onToggleFavorite, onAdd }: ProductCardProps) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[0_1px_2px_rgba(43,29,22,0.04)] transition-shadow hover:shadow-md">
      <div className="relative aspect-[16/10] overflow-hidden bg-muted">
        <Image
          src={product.image || '/placeholder.svg'}
          alt={product.name}
          fill
          sizes="(min-width: 1280px) 22vw, (min-width: 640px) 45vw, 100vw"
          className={cn(
            'object-cover transition-transform duration-500 group-hover:scale-105',
            !product.inStock && 'grayscale-[60%]',
          )}
        />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {product.popular && (
            <span className="rounded-full bg-caramel-soft px-2.5 py-1 text-[10px] font-semibold text-primary">
              Phổ biến
            </span>
          )}
          <span
            className={cn(
              'rounded-full px-2.5 py-1 text-[10px] font-semibold',
              product.inStock ? 'bg-card/95 text-success' : 'bg-foreground/80 text-card',
            )}
          >
            {product.inStock ? 'Còn hàng' : 'Hết hàng'}
          </span>
        </div>
        <button
          type="button"
          onClick={() => onToggleFavorite(product.id)}
          aria-pressed={isFavorite}
          className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-card/95 text-foreground shadow-sm transition-transform hover:scale-110"
        >
          <Heart
            className={cn('size-4', isFavorite && 'fill-destructive text-destructive')}
            aria-hidden="true"
          />
          <span className="sr-only">
            {isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'} {product.name}
          </span>
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {CATEGORY_LABELS[product.category]}
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-foreground/80">
            <Star className="size-3.5 fill-caramel text-caramel" aria-hidden="true" />
            <span className="sr-only">Đánh giá</span>
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground text-balance">
          {product.name}
        </h3>
        <p className="mb-4 mt-1.5 text-xs leading-relaxed text-muted-foreground text-pretty">
          {product.description}
        </p>

        <div className="mt-auto flex items-end justify-between gap-2 border-t border-border pt-4">
          <div>
            <p className="whitespace-nowrap text-lg font-bold leading-none text-foreground">{formatPrice(product.price)}</p>
            <p className="mt-1.5 text-[10px] text-muted-foreground">Giá từ</p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={!product.inStock}
            className="flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Plus className="size-3.5" aria-hidden="true" />
            {product.inStock ? 'Thêm món' : 'Tạm hết'}
            <span className="sr-only"> {product.name}</span>
          </button>
        </div>
      </div>
    </article>
  )
}
