import { getUnitPrice, type CartItem } from './menu'

export const LOYALTY_REWARDS = [
  { code: 'POINTS_500_10000', points: 500, label: 'Đổi 500 điểm (-10.000đ)', discount: 10_000 },
  { code: 'POINTS_1000_25000', points: 1_000, label: 'Đổi 1.000 điểm (-25.000đ)', discount: 25_000 },
  { code: 'POINTS_2000_FREE_DRINK', points: 2_000, label: 'Đổi 2.000 điểm (Tặng 1 ly cao tiền nhất)', discount: 'highest-drink' },
  { code: 'POINTS_4000_100000', points: 4_000, label: 'Đổi 4.000 điểm (-100.000đ)', discount: 100_000 },
] as const

export type LoyaltyReward = (typeof LOYALTY_REWARDS)[number]

export function getLoyaltyDiscount(
  reward: LoyaltyReward | undefined,
  items: CartItem[],
  subtotal: number,
) {
  if (!reward) return 0
  const amount = reward.discount === 'highest-drink'
    ? Math.max(0, ...items.map((item) => getUnitPrice(item)))
    : reward.discount
  return Math.min(subtotal, amount)
}
