'use client'

import { useEffect, useRef, useState } from 'react'
import { Gift, Ticket } from 'lucide-react'
import { formatPrice } from '@/lib/menu'
import type { Promotion } from '@/lib/promotions'

export function HotDealsSlider({
  promotions,
  onUse,
}: {
  promotions: Promotion[]
  onUse: (promotion: Promotion) => void
}) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const activePromotions = promotions.filter((promotion) => promotion.isActive)

  useEffect(() => {
    const slider = sliderRef.current
    if (!slider || activePromotions.length < 2) return
    const timer = window.setInterval(() => {
      const lastCard = slider.lastElementChild as HTMLElement | null
      if (lastCard && slider.scrollLeft + slider.clientWidth >= slider.scrollWidth - 8) {
        slider.scrollTo({ left: 0, behavior: 'smooth' })
      } else {
        slider.scrollBy({ left: (slider.firstElementChild as HTMLElement | null)?.clientWidth ?? 280, behavior: 'smooth' })
      }
    }, 3500)
    return () => window.clearInterval(timer)
  }, [activePromotions.length])

  if (activePromotions.length === 0) return null

  return (
    <section className="mx-auto mb-6 max-w-[1600px] px-4 md:px-6" aria-label="Ưu đãi nổi bật">
      <div className="mb-3 flex items-center gap-2">
        <Gift className="size-5 text-caramel" aria-hidden="true" />
        <h2 className="text-sm font-bold text-foreground sm:text-base">Hot Deals</h2>
        <span className="text-[11px] text-muted-foreground">Ưu đãi dành riêng cho bạn</span>
      </div>
      <div
        ref={sliderRef}
        className="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2"
      >
        {activePromotions.map((promotion) => (
          <article
            key={promotion.id}
            className="min-w-[min(84vw,340px)] snap-start overflow-hidden rounded-2xl border border-caramel/20 bg-gradient-to-br from-[#fff8ed] to-card shadow-sm sm:min-w-[340px]"
          >
            <div className="flex h-full items-center gap-4 p-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-caramel/15 text-caramel">
                <Ticket className="size-6" aria-hidden="true" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold tracking-wide text-foreground">{promotion.voucherCode}</p>
                <p className="mt-1 text-lg font-extrabold leading-tight text-primary">
                  {promotion.discountType === 'PERCENTAGE'
                    ? `Giảm ${promotion.discountValue}%`
                    : `Giảm ${formatPrice(promotion.discountValue)}`}
                </p>
                <p className="mt-1 line-clamp-1 text-[11px] text-muted-foreground">{promotion.description}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">
                  HSD: {promotion.endDate}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onUse(promotion)}
                className="shrink-0 rounded-lg border border-caramel/30 bg-white px-3 py-2 text-[10px] font-bold text-primary transition hover:bg-caramel/10"
              >
                Sử dụng
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
