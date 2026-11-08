'use client'

import {
  PRODUCTS,
  TOPPINGS,
  getProduct,
  getUnitPrice,
  type CartItem,
  type IceOption,
  type Product,
  type SizeOption,
  type SugarOption,
} from './menu'
import { createPersistentStore } from './persistent-store'

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'COMPLETED' | 'CANCELLED'
export type PaymentMethod = 'MOMO' | 'VIETQR'
export type Fulfillment = 'pickup'

export type OrderLine = {
  productId: string
  name: string
  category: Product['category']
  size: SizeOption
  sugar: SugarOption
  ice: IceOption
  toppings: string[]
  note: string
  quantity: number
  unitPrice: number
}

export type Order = {
  code: string
  customerId?: string
  customerEmail?: string
  customerName: string
  phone: string
  fulfillment: Fulfillment
  address?: string
  note?: string
  lines: OrderLine[]
  subtotal: number
  discountAmount?: number
  promotionCode?: string
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod | null
  status: OrderStatus
  createdAt: number
  updatedAt: number
  preparationTime: number
  completedAt: number
  isArchived: boolean
}

/** Order details collected at checkout, before the payment is confirmed. */
export type OrderDraft = Omit<
  Order,
  'paymentMethod' | 'status' | 'createdAt' | 'updatedAt' | 'preparationTime' | 'completedAt' | 'isArchived'
>

export const PAYMENT_LABEL: Record<PaymentMethod, string> = { MOMO: 'Ví MoMo', VIETQR: 'VietQR' }

export const STATUS_LABEL: Record<OrderStatus, string> = {
  PENDING: 'Chờ thanh toán',
  CONFIRMED: 'Đã nhận đơn',
  PREPARING: 'Đang pha chế',
  COMPLETED: 'Mời nhận món tại quầy',
  CANCELLED: 'Đã hủy',
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  CONFIRMED: 'PREPARING',
  PREPARING: 'COMPLETED',
}

export function generateOrderCode() {
  return `ORD-${Math.floor(1000 + Math.random() * 9000)}`
}

export function cartItemToLine(item: CartItem): OrderLine {
  const product = getProduct(item.productId)
  return {
    productId: item.productId,
    name: product?.name ?? item.productId,
    category: product?.category ?? 'coffee',
    size: item.size,
    sugar: item.sugar,
    ice: item.ice,
    toppings: item.toppingIds.map((id) => TOPPINGS.find((t) => t.id === id)?.name ?? id),
    note: item.note,
    quantity: item.quantity,
    unitPrice: getUnitPrice(item),
  }
}

type SeedSpec = {
  code: string
  name: string
  minutesAgo: number
  status: OrderStatus
  payment: PaymentMethod
  fulfillment: Fulfillment
  items: { id: string; qty: number; size?: SizeOption; sugar?: SugarOption; ice?: IceOption; toppings?: string[] }[]
}

const SEED: SeedSpec[] = [
  { code: 'ORD-2031', name: 'Phạm Gia Huy', minutesAgo: 2, status: 'CONFIRMED', payment: 'MOMO', fulfillment: 'pickup', items: [{ id: 'tra-sua-tran-chau', qty: 2, toppings: ['tran-chau-duong-den'] }, { id: 'cold-brew', qty: 1, size: 'L', sugar: '25%' }] },
  { code: 'ORD-2030', name: 'Đỗ Khánh Linh', minutesAgo: 5, status: 'CONFIRMED', payment: 'VIETQR', fulfillment: 'pickup', items: [{ id: 'dua-hau', qty: 1, ice: 'Nhiều đá' }, { id: 'buoi-hong', qty: 1, sugar: '0%' }] },
  { code: 'ORD-2029', name: 'Võ Thành Nam', minutesAgo: 9, status: 'PREPARING', payment: 'MOMO', fulfillment: 'pickup', items: [{ id: 'latte-kem-sua', qty: 1, toppings: ['kem-pho-mai-bien'] }] },
  { code: 'ORD-2028', name: 'Hoàng Bảo Ngọc', minutesAgo: 12, status: 'PREPARING', payment: 'VIETQR', fulfillment: 'pickup', items: [{ id: 'tra-sua-matcha', qty: 2, size: 'L', ice: 'Ít đá' }, { id: 'mocha-caramel', qty: 1 }] },
  { code: 'ORD-2027', name: 'Bùi Anh Thư', minutesAgo: 18, status: 'COMPLETED', payment: 'MOMO', fulfillment: 'pickup', items: [{ id: 'thanh-long-xoai', qty: 1 }, { id: 'chanh-day', qty: 1, sugar: '75%' }] },
  { code: 'ORD-2026', name: 'Ngô Đức Tài', minutesAgo: 34, status: 'COMPLETED', payment: 'VIETQR', fulfillment: 'pickup', items: [{ id: 'cold-brew', qty: 2 }, { id: 'xanh-thanh-loc', qty: 1 }] },
  { code: 'ORD-2025', name: 'Lý Mỹ Duyên', minutesAgo: 61, status: 'COMPLETED', payment: 'MOMO', fulfillment: 'pickup', items: [{ id: 'tra-sua-tran-chau', qty: 3, toppings: ['suong-sao'] }] },
  { code: 'ORD-2024', name: 'Trịnh Hữu Phúc', minutesAgo: 95, status: 'CANCELLED', payment: 'VIETQR', fulfillment: 'pickup', items: [{ id: 'latte-kem-sua', qty: 1 }] },
  { code: 'ORD-2023', name: 'Mai Phương Thảo', minutesAgo: 140, status: 'COMPLETED', payment: 'MOMO', fulfillment: 'pickup', items: [{ id: 'mocha-caramel', qty: 2 }, { id: 'buoi-hong', qty: 2 }] },
  { code: 'ORD-2022', name: 'Đặng Quang Vinh', minutesAgo: 210, status: 'COMPLETED', payment: 'VIETQR', fulfillment: 'pickup', items: [{ id: 'dua-hau', qty: 2 }, { id: 'cold-brew', qty: 1 }] },
]

function seedOrders(): Order[] {
  const now = Date.now()
  return SEED.map((spec) => {
    const lines = spec.items.map((i) =>
      cartItemToLine({
        key: '',
        productId: i.id,
        size: i.size ?? 'M',
        sugar: i.sugar ?? '50%',
        ice: i.ice ?? 'Đá vừa',
        toppingIds: i.toppings ?? [],
        note: '',
        quantity: i.qty,
      }),
    )
    const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0)
    const deliveryFee = 0
    const createdAt = now - spec.minutesAgo * 60_000
    const completedAt = spec.status === 'COMPLETED' ? createdAt : 0
    return {
      code: spec.code,
      customerName: spec.name,
      phone: '0900000000',
      fulfillment: spec.fulfillment,
      lines,
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
      paymentMethod: spec.payment,
      status: spec.status,
      createdAt,
      updatedAt: createdAt,
      preparationTime: 0,
      completedAt,
      isArchived: false,
    }
  })
}

export const orderStore = createPersistentStore<Order[]>('brewlite.orders', [], seedOrders)

export function migrateOrderStatuses() {
  const existingOrders = orderStore.get()
  const needsMigration = existingOrders.some((order) =>
    ['NEW', 'READY'].includes(String(order.status)) ||
    String(order.fulfillment) !== 'pickup' ||
    order.deliveryFee !== 0 ||
    order.total !== order.subtotal - (order.discountAmount ?? 0) ||
    Boolean(order.address) ||
    typeof order.preparationTime !== 'number' ||
    typeof order.completedAt !== 'number' ||
    (order.status === 'COMPLETED' && order.completedAt <= 0) ||
    typeof order.isArchived !== 'boolean',
  )
  if (!needsMigration) return

  orderStore.set((orders) => orders.map((order) => {
    const legacyStatus = String(order.status)
    const status = legacyStatus === 'NEW' ? 'CONFIRMED'
      : legacyStatus === 'READY' ? 'COMPLETED'
        : order.status
    const completedAt =
      order.completedAt > 0
        ? order.completedAt
        : status === 'COMPLETED'
          ? order.updatedAt
          : 0
    return {
      ...order,
      status,
      fulfillment: 'pickup',
      address: undefined,
      deliveryFee: 0,
      total: order.subtotal - (order.discountAmount ?? 0),
      preparationTime: order.preparationTime ?? 0,
      completedAt,
      isArchived:
        order.isArchived ??
        (status === 'COMPLETED' &&
          Date.now() - completedAt >= 5 * 60_000),
    }
  }))
}

export function placeOrder(draft: OrderDraft) {
  const now = Date.now()
  const order: Order = {
    ...draft,
    preparationTime: 0,
    completedAt: 0,
    isArchived: false,
    paymentMethod: null,
    status: 'PENDING',
    createdAt: now,
    updatedAt: now,
  }
  orderStore.set((orders) => [order, ...orders.filter((o) => o.code !== order.code)])
  return order
}

export function confirmOrderPayment(code: string, paymentMethod: PaymentMethod) {
  let updatedOrder: Order | undefined
  orderStore.set((orders) =>
    orders.map((order) => {
      if (order.code !== code || order.status !== 'PENDING') return order
      updatedOrder = { ...order, paymentMethod, status: 'CONFIRMED', updatedAt: Date.now() }
      return updatedOrder
    }),
  )
  return updatedOrder
}

export function advanceOrder(code: string) {
  const now = Date.now()
  orderStore.set((orders) =>
    orders.map((o) => {
      const next = NEXT_STATUS[o.status]
      if (o.code !== code || !next) return o
      if (next === 'PREPARING') return { ...o, status: next, updatedAt: now }
      return {
        ...o,
        status: next,
        updatedAt: now,
        preparationTime: Math.max(0, Math.round((now - o.updatedAt) / 60_000)),
        completedAt: now,
        isArchived: false,
      }
    }),
  )
}

export function archiveCompletedOrders(now = Date.now()) {
  const orders = orderStore.get()
  if (!orders.some(
    (order) =>
      order.status === 'COMPLETED' &&
      !order.isArchived &&
      order.completedAt > 0 &&
      now - order.completedAt >= 5 * 60_000,
  )) return
  orderStore.set((current) =>
    current.map((order) =>
      order.status === 'COMPLETED' &&
      !order.isArchived &&
      order.completedAt > 0 &&
      now - order.completedAt >= 5 * 60_000
        ? { ...order, isArchived: true }
        : order,
    ),
  )
}

export type InventoryEntry = { stock: number; available: boolean }

const LOW_STOCK_THRESHOLD = 5

function seedInventory(): Record<string, InventoryEntry> {
  const stock = [42, 28, 4, 36, 3, 0, 24, 18, 31, 2, 15]
  return Object.fromEntries(
    PRODUCTS.map((p, i) => [p.id, { stock: stock[i] ?? 20, available: p.inStock }]),
  )
}

export const inventoryStore = createPersistentStore<Record<string, InventoryEntry>>(
  'brewlite.inventory',
  Object.fromEntries(PRODUCTS.map((p) => [p.id, { stock: 20, available: p.inStock }])),
  seedInventory,
)

export function isLowStock(entry: InventoryEntry | undefined) {
  return !entry || !entry.available || entry.stock <= LOW_STOCK_THRESHOLD
}

export function setAvailability(productId: string, available: boolean) {
  inventoryStore.set((inv) => ({
    ...inv,
    [productId]: { stock: inv[productId]?.stock ?? 0, available },
  }))
}
