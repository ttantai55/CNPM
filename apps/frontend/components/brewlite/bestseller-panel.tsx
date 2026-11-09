'use client'

import Image from 'next/image'
import { Plus, Star } from 'lucide-react'
import { formatPrice, type Product } from '@/lib/menu'

type BestsellerPanelProps = {
  products: Product[]
  onAdd: (product: Product) => void
}

export function BestsellerPanel({ products, onAdd }: BestsellerPanelProps) {
  const bestsellers = [...products]
    .sort((a, b) => b.weeklySalesCount - a.weeklySalesCount)
    .slice(0, 4)

  return (
    <aside className="hidden xl:block" aria-label="Món bestseller">
      <div className="sticky top-[84px] rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-caramel">Được yêu thích</p>
            <h2 className="mt-1 text-base font-bold text-foreground">Bestseller</h2>
          </div>
          <Star className="size-5 fill-caramel text-caramel" aria-hidden="true" />
        </div>
        <ul className="mt-3 divide-y divide-border">
          {bestsellers.map((product) => (
            <li key={product.id} className="flex items-center gap-3 py-3">
              <div className="relative size-14 shrink-0 overflow-hidden rounded-xl bg-muted">
                <Image src={product.imageUrl || '/placeholder.svg'} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-semibold text-foreground">{product.name}</p>
                <p className="mt-1 text-[10px] font-semibold text-caramel">
                  🔥 {product.weeklySalesCount.toLocaleString('vi-VN')} lượt/tuần
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">{formatPrice(product.price)}</p>
              </div>
              <button
                type="button"
                onClick={() => onAdd(product)}
                disabled={!product.status}
                aria-label={`Thêm nhanh ${product.name} vào giỏ`}
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-primary transition hover:bg-primary hover:text-primary-foreground"
              >
                <Plus className="size-4" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  )
}
