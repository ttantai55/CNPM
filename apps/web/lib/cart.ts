'use client'

import { INITIAL_CART, MAX_ITEM_QUANTITY, buildCartKey, type CartItem } from './menu'
import { createPersistentStore } from './persistent-store'

export type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'key'> }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'clear' }

const clampQuantity = (q: number) => Math.min(MAX_ITEM_QUANTITY, Math.max(1, Math.floor(q)))

function cartReducer(state: CartItem[], action: CartAction): CartItem[] {
  switch (action.type) {
    case 'add': {
      const key = buildCartKey(action.item)
      const existing = state.find((i) => i.key === key)
      if (existing) {
        return state.map((i) =>
          i.key === key ? { ...i, quantity: clampQuantity(i.quantity + action.item.quantity) } : i,
        )
      }
      return [...state, { ...action.item, key, quantity: clampQuantity(action.item.quantity) }]
    }
    case 'setQuantity':
      return state.map((i) => (i.key === action.key ? { ...i, quantity: clampQuantity(action.quantity) } : i))
    case 'remove':
      return state.filter((i) => i.key !== action.key)
    case 'clear':
      return []
  }
}

export const cartStore = createPersistentStore<CartItem[]>('brewlite.cart', INITIAL_CART)

export function dispatchCart(action: CartAction) {
  cartStore.set((state) => cartReducer(state, action))
}
