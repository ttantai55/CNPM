'use client'

import Image from 'next/image'
import { Heart, Plus, Star } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/menu'
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
        <div className="flex items-center justify-start text-left">
          <span className="flex items-center justify-start gap-1 text-left text-xs font-semibold text-foreground/80">
            <Star className="size-3.5 fill-caramel text-caramel" aria-hidden="true" />
            <span className="sr-only">Đánh giá</span>
            {product.rating.toFixed(1)}
          </span>
        </div>
        <h3 className="mt-2 text-[15px] font-semibold leading-snug text-foreground text-balance">
          {product.name}
        </h3>
        <p className="mt-1 text-[10px] font-medium text-caramel">
          🔥 Đã bán: {product.weeklySalesCount.toLocaleString('vi-VN')} lượt/tuần
        </p>
        <p className="mb-4 mt-1.5 text-xs leading-relaxed text-muted-foreground text-pretty">
          {product.description}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 border-t border-border pt-4">
          <div>
            <p className="whitespace-nowrap text-lg font-bold leading-none text-[#2e2520]">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => onAdd(product)}
            disabled={!product.inStock}
            aria-label={product.inStock ? `Thêm ${product.name} vào giỏ hàng` : `${product.name} tạm hết`}
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#548565] text-white shadow-sm transition hover:scale-105 hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
          >
            <Plus className="size-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  )
}
