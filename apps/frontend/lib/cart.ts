'use client'

import { MAX_ITEM_QUANTITY, buildCartKey, type CartItem } from './menu'
import { createPersistentStore } from './persistent-store'

export type CartAction =
  | { type: 'add'; item: Omit<CartItem, 'key'> }
  | { type: 'edit'; key: string; item: Omit<CartItem, 'key'> }
  | { type: 'setQuantity'; key: string; quantity: number }
  | { type: 'remove'; key: string }
  | { type: 'replace'; items: CartItem[] }
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
    case 'edit': {
      const key = buildCartKey(action.item)
      const existing = state.find((item) => item.key === key && item.key !== action.key)
      if (existing) {
        return state
          .filter((item) => item.key !== action.key)
          .map((item) =>
            item.key === key
              ? { ...item, quantity: clampQuantity(item.quantity + action.item.quantity) }
              : item,
          )
      }
      return state.map((item) =>
        item.key === action.key
          ? { ...action.item, key, quantity: clampQuantity(action.item.quantity) }
          : item,
      )
    }
    case 'setQuantity':
      return state.map((i) => (i.key === action.key ? { ...i, quantity: clampQuantity(action.quantity) } : i))
    case 'remove':
      return state.filter((i) => i.key !== action.key)
    case 'replace':
      return action.items.map((item) => ({ ...item, quantity: clampQuantity(item.quantity) }))
    case 'clear':
      return []
  }
}

export const cartStore = createPersistentStore<CartItem[]>('brewlite.cart', [])

export function dispatchCart(action: CartAction) {
  cartStore.set((state) => cartReducer(state, action))
}

export function cartContainsItems(items: CartItem[]) {
  const cart = cartStore.get()
  return items.every((item) =>
    cart.some((current) => current.key === item.key && current.quantity >= item.quantity),
  )
}

export function restoreCartItems(items: CartItem[]) {
  for (const item of items) {
    const current = cartStore.get().find((entry) => entry.key === item.key)
    if (current && current.quantity >= item.quantity) continue
    const { key: _key, ...cartItem } = item
    dispatchCart({ type: 'add', item: cartItem })
  }
}

export function removeCartItems(items: CartItem[]) {
  for (const item of items) {
    const current = cartStore.get().find((entry) => entry.key === item.key)
    if (!current) continue
    const remaining = current.quantity - item.quantity
    dispatchCart(
      remaining > 0
        ? { type: 'setQuantity', key: item.key, quantity: remaining }
        : { type: 'remove', key: item.key },
    )
  }
}
