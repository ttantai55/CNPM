'use client'

import { MAX_ITEM_QUANTITY, buildCartKey, type CartItem } from './menu'
import { cartApi, type ApiCartItem } from './api'
import { getAuthToken } from './session'
import { createPersistentStore, createStore } from './persistent-store'

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
export const cartOwnerStore = createPersistentStore<string | null>('brewlite.cart-owner', null)
export const cartSyncErrorStore = createStore<string | null>(null)

let persistenceUserId: string | null = null
let syncTimer: ReturnType<typeof setTimeout> | null = null
let pendingSync: Promise<void> = Promise.resolve()

function toApiCartItem({ key: _key, ...item }: CartItem): ApiCartItem {
  return {
    ...item,
    sugarPercent: Number.parseInt(item.sugar, 10),
    icePercent: item.ice === 'Không đá' ? 0 : item.ice === 'Ít đá' ? 25 : item.ice === 'Nhiều đá' ? 100 : 50,
  }
}

function fromApiCartItems(items: ApiCartItem[]): CartItem[] {
  return items.map((item) => {
    const cartItem = {
      productId: item.productId,
      size: item.size ?? 'M',
      sugar: `${item.sugarPercent ?? 50}%` as CartItem['sugar'],
      ice: ({ 0: 'Không đá', 25: 'Ít đá', 50: 'Đá vừa', 100: 'Nhiều đá' }[item.icePercent ?? 50] ?? 'Đá vừa') as CartItem['ice'],
      toppingIds: item.toppingIds ?? [],
      note: item.note ?? '',
      quantity: item.quantity,
    }
    return { ...cartItem, key: buildCartKey(cartItem) }
  })
}

export function setCartPersistenceUser(userId: string | null) {
  persistenceUserId = userId && getAuthToken() ? userId : null
  if (!persistenceUserId && syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
}

export async function loadUserCart(
  userId: string,
  guestItems: CartItem[],
  startingItems: CartItem[],
) {
  if (!getAuthToken()) return
  const response = await cartApi.get(userId)
  if (persistenceUserId !== userId) return

  const itemsToMerge = cartStore.get() === startingItems ? guestItems : cartStore.get()
  cartStore.set(fromApiCartItems(response.items ?? []))
  cartOwnerStore.set(userId)
  for (const item of itemsToMerge) {
    const { key: _key, ...cartItem } = item
    dispatchCart({ type: 'add', item: cartItem })
  }
}

function queueCartSync(userId: string, items: CartItem[]) {
  const request = pendingSync.then(async () => {
    if (!getAuthToken()) return
    await cartApi.replace(userId, items.map(toApiCartItem))
    cartSyncErrorStore.set(null)
  })
  pendingSync = request.catch((cause: unknown) => {
    cartSyncErrorStore.set(cause instanceof Error ? cause.message : 'Không thể lưu giỏ hàng.')
  })
  return request
}

export function flushCartSync(userId: string) {
  if (syncTimer) {
    clearTimeout(syncTimer)
    syncTimer = null
  }
  if (!getAuthToken()) return Promise.resolve()
  return queueCartSync(userId, cartStore.get())
}

export function dispatchCart(action: CartAction) {
  cartStore.set((state) => cartReducer(state, action))
  if (!persistenceUserId || !getAuthToken()) return
  if (syncTimer) clearTimeout(syncTimer)
  const userId = persistenceUserId
  syncTimer = setTimeout(() => {
    syncTimer = null
    void queueCartSync(userId, cartStore.get()).catch(() => undefined)
  }, 200)
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
