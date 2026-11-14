'use client'

import {
  getProduct,
  getTopping,
  getUnitPrice,
  toppingStore,
  type CartItem,
  type IceOption,
  type Product,
  type SizeOption,
  type SugarOption,
  buildCartKey,
} from './menu'
import { createStore } from './persistent-store'
import { ordersApi, paymentsApi, type ApiOrder } from './api'

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
  paymentCompletedAt: number
  preparationTime: number
  completedAt: number
  isArchived: boolean
}

/** Order details collected at checkout, before the payment is confirmed. */
export type OrderDraft = Omit<
  Order,
  'code' | 'paymentMethod' | 'status' | 'createdAt' | 'updatedAt' | 'preparationTime' | 'completedAt' | 'isArchived' | 'paymentCompletedAt'
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

export function cartItemToLine(item: CartItem): OrderLine {
  const product = getProduct(item.productId)
  return {
    productId: item.productId,
    name: product?.name ?? item.productId,
    category: product?.category ?? 'coffee',
    size: item.size,
    sugar: item.sugar,
    ice: item.ice,
    toppings: item.toppingIds.map((id) => getTopping(id)?.name ?? id),
    note: item.note,
    quantity: item.quantity,
    unitPrice: getUnitPrice(item),
  }
}

export const orderStore = createStore<Order[]>([])

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
    typeof order.paymentCompletedAt !== 'number' ||
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
      paymentCompletedAt: order.paymentCompletedAt ?? 0,
      isArchived:
        order.isArchived ??
        (status === 'COMPLETED' &&
          Date.now() - completedAt >= 5 * 60_000),
    }
  }))
}

export function fromApiOrder(remote: ApiOrder): Order {
  const now = new Date(remote.createdAt).getTime()
  const confirmedAt = remote.processes?.find((process) => process.status === 'CONFIRMED')?.updateAt
  const paymentCompletedAt = confirmedAt ? new Date(confirmedAt).getTime() : 0
  return {
    code: remote.id,
    customerId: remote.customerId,
    customerName: remote.customerName ?? '',
    phone: remote.customerPhone ?? '',
    fulfillment: 'pickup',
    lines: remote.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      category: getProduct(item.productId)?.category ?? 'coffee',
      size: item.size === 'L' ? 'L' : item.size === 'S' ? 'S' : 'M',
      sugar: `${item.sugarPercent ?? 50}%` as SugarOption,
      ice: ({ 0: 'Không đá', 25: 'Ít đá', 50: 'Đá vừa', 100: 'Nhiều đá' }[item.icePercent ?? 50] ?? 'Đá vừa') as IceOption,
      toppings: item.toppings ?? [],
      note: item.note ?? '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })),
    subtotal: remote.totalAmount,
    discountAmount: remote.discountAmount,
    promotionCode: remote.voucherCode ?? undefined,
    deliveryFee: 0,
    total: remote.finalAmount,
    paymentMethod: remote.paymentMethod ?? null,
    status: remote.status as OrderStatus,
    createdAt: now,
    updatedAt: now,
    paymentCompletedAt: Number.isFinite(paymentCompletedAt) ? paymentCompletedAt : 0,
    preparationTime: 0,
    completedAt: 0,
    isArchived: false,
  }
}

export async function placeOrder(draft: OrderDraft) {
  const remote = await ordersApi.create({
    customerId: draft.customerId ?? '',
    customerName: draft.customerName,
    phone: draft.phone,
    voucherCode: draft.promotionCode,
    items: draft.lines.map((line) => ({
      productId: line.productId,
      quantity: line.quantity,
      note: line.note,
      size: line.size,
      sugarPercent: Number.parseInt(line.sugar, 10),
      icePercent: line.ice === 'Không đá' ? 0 : line.ice === 'Ít đá' ? 25 : line.ice === 'Nhiều đá' ? 100 : 50,
      toppings: line.toppings,
    })),
  })
  const order: Order = {
    ...fromApiOrder(remote),
    customerEmail: draft.customerEmail,
    note: draft.note,
  }
  orderStore.set((orders) => [order, ...orders.filter((o) => o.code !== order.code)])
  return order
}

export async function confirmOrderPayment(code: string, paymentMethod: PaymentMethod, amount: number) {
  await paymentsApi.confirm(code, paymentMethod, amount)
  let updatedOrder: Order | undefined
  await ordersApi.get(code).then((remote) => {
    updatedOrder = { ...fromApiOrder(remote), paymentMethod }
    orderStore.set((orders) => [updatedOrder!, ...orders.filter((order) => order.code !== code)])
  })
  return updatedOrder
}

export async function cancelOrderPayment(order: Order) {
  const remote = await ordersApi.status(order.code, 'CANCELLED')
  const mapped = {
    ...fromApiOrder(remote),
    customerEmail: order.customerEmail,
    note: order.note,
    paymentCompletedAt: 0,
  }
  orderStore.set((orders) => [mapped, ...orders.filter((entry) => entry.code !== order.code)])
  return mapped
}

export async function resumeOrderPayment(
  order: Order,
  customerEmail = order.customerEmail,
  customerId = order.customerId,
) {
  if (order.status === 'PENDING') return order
  if (order.status !== 'CANCELLED') {
    throw new Error('Chỉ có thể tiếp tục thanh toán đơn đang chờ hoặc đã hủy.')
  }

  return placeOrder({
    customerId,
    customerEmail,
    customerName: order.customerName,
    phone: order.phone,
    fulfillment: 'pickup',
    address: undefined,
    note: order.note,
    lines: order.lines,
    subtotal: order.subtotal,
    discountAmount: order.discountAmount,
    promotionCode: order.promotionCode,
    deliveryFee: 0,
    total: order.total,
  })
}

export function orderToCartItems(order: Order): CartItem[] {
  const toppings = toppingStore.get()
  return order.lines.map((line) => {
    const item = {
      productId: line.productId,
      size: line.size,
      sugar: line.sugar,
      ice: line.ice,
      toppingIds: line.toppings.map(
        (name) => toppings.find((topping) => topping.id === name || topping.name === name)?.id ?? name,
      ),
      note: line.note,
      quantity: line.quantity,
    }
    return { ...item, key: buildCartKey(item) }
  })
}

export async function advanceOrder(code: string) {
  const current = orderStore.get().find((order) => order.code === code)
  const next = current ? NEXT_STATUS[current.status] : undefined
  if (!next) return
  const remote = await ordersApi.status(code, next)
  const mapped = fromApiOrder(remote)
  const now = Date.now()
  orderStore.set((orders) =>
    orders.map((order) => order.code !== code ? order : {
      ...mapped,
      customerEmail: order.customerEmail,
      note: order.note,
      paymentMethod: order.paymentMethod,
      updatedAt: now,
      preparationTime: next === 'COMPLETED' ? Math.max(0, Math.round((now - order.updatedAt) / 60_000)) : order.preparationTime,
      completedAt: next === 'COMPLETED' ? now : order.completedAt,
      isArchived: false,
    }),
  )
}

export async function refreshOrders(query = '') {
  const remoteOrders = await ordersApi.list(query)
  orderStore.set(remoteOrders.map(fromApiOrder))
}

export function archiveCompletedOrder(code: string) {
  orderStore.set((orders) =>
    orders.map((order) =>
      order.code === code && order.status === 'COMPLETED'
        ? { ...order, isArchived: true }
        : order,
    ),
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
