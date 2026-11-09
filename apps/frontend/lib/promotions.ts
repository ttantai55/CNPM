'use client'

import { createStore } from './persistent-store'

export type Promotion = {
  id: string
  voucherCode: string
  description: string
  discountType: 'PERCENTAGE' | 'FIX_AMOUNT'
  discountValue: number
  startDate: string
  endDate: string
  usageLimit: number
  usedCount: number
  isActive: boolean
}

export const promotionStore = createStore<Promotion[]>([])

export function getEligiblePromotions(promotions: Promotion[], subtotal: number, now = new Date()) {
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return promotions.filter(
    (promotion) =>
      promotion.isActive &&
      promotion.startDate <= today &&
      promotion.endDate >= today &&
      promotion.usedCount < promotion.usageLimit &&
      subtotal > 0,
  )
}

export function getDiscountAmount(promotion: Promotion | undefined, subtotal: number) {
  if (!promotion || subtotal <= 0) return 0
  const amount =
    promotion.discountType === 'PERCENTAGE'
      ? Math.round((subtotal * promotion.discountValue) / 100)
      : promotion.discountValue
  return Math.min(subtotal, Math.max(0, amount))
}
