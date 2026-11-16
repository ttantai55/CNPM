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
import { createPersistentStore, createStore } from './persistent-store'
import { ordersApi, paymentsApi, type ApiOrder } from './api'
import { publishPaymentNotification } from './notifications'

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
  loyaltyRewardCode?: string
  deliveryFee: number
  total: number
  paymentMethod: PaymentMethod | null
  status: OrderStatus
  createdAt: number
  updatedAt: number
  paymentCompletedAt: number
  preparedAt: number
  preparationTime: number
  completedAt: number
  isArchived: boolean
}

/** Order details collected at checkout, before the payment is confirmed. */
export type OrderDraft = Omit<
  Order,
  'code' | 'paymentMethod' | 'status' | 'createdAt' | 'updatedAt' | 'paymentCompletedAt' | 'preparedAt' | 'preparationTime' | 'completedAt' | 'isArchived'
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

const ORDER_STATUS_RANK: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  COMPLETED: 3,
  CANCELLED: 4,
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
const locallyDeletedOrderCodes = createPersistentStore<string[]>('brewlite.locally-deleted-cancelled-orders', [])
const locallyArchivedOrderCodes = createPersistentStore<string[]>('brewlite.locally-archived-orders', [])

function parseApiDateTime(value?: string | null) {
  if (!value) return 0
  const timestamp = /(?:Z|[+-]\d{2}:\d{2})$/i.test(value) ? value : `${value}+07:00`
  return new Date(timestamp).getTime()
}

export function isOrderLocallyDeleted(code: string) {
  return locallyDeletedOrderCodes.get().includes(code)
}

export function removeCancelledOrder(code: string) {
  const order = orderStore.get().find((entry) => entry.code === code)
  if (!order || order.status !== 'CANCELLED') {
    throw new Error('Chỉ có thể xóa đơn hàng đã hủy.')
  }
  locallyDeletedOrderCodes.set((codes) => codes.includes(code) ? codes : [...codes, code])
  orderStore.set((orders) => orders.filter((entry) => entry.code !== code))
}

export function migrateOrderStatuses() {
  const existingOrders = orderStore.get()
  const needsMigration = existingOrders.some((order) =>
    ['NEW', 'READY'].includes(String(order.status)) ||
    String(order.fulfillment) !== 'pickup' ||
    order.deliveryFee !== 0 ||
    order.total !== order.subtotal - (order.discountAmount ?? 0) ||
    Boolean(order.address) ||
    typeof order.preparationTime !== 'number' ||
    typeof order.preparedAt !== 'number' ||
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
      preparedAt: order.preparedAt ?? (status === 'COMPLETED' ? order.paymentCompletedAt ?? order.updatedAt : 0),
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
  const confirmedAt = remote.processes?.find((process) => process.status === 'CONFIRMED')?.updateAt
  const paymentCompletedAt = parseApiDateTime(remote.paidAt ?? confirmedAt)
  const preparedAtValue = remote.preparedAt ??
    remote.processes?.find((process) => process.status === 'PREPARING')?.updateAt
  const completedAtValue = remote.completedAt ??
    remote.processes?.find((process) => process.status === 'COMPLETED')?.updateAt
  const preparedAt = parseApiDateTime(preparedAtValue)
  const completedAt = parseApiDateTime(completedAtValue)
  const createdAt = parseApiDateTime(remote.createdAt)
  const lastProcessAt = remote.processes?.reduce(
    (latest, process) => Math.max(latest, parseApiDateTime(process.updateAt)),
    createdAt,
  ) ?? createdAt
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
    createdAt,
    updatedAt: lastProcessAt,
    paymentCompletedAt: Number.isFinite(paymentCompletedAt) ? paymentCompletedAt : 0,
    preparedAt: Number.isFinite(preparedAt) ? preparedAt : 0,
    preparationTime: preparedAt > 0 && completedAt > 0
      ? Math.max(0, Math.round((completedAt - preparedAt) / 60_000))
      : 0,
    completedAt: Number.isFinite(completedAt) ? completedAt : 0,
    isArchived: false,
  }
}

export async function placeOrder(draft: OrderDraft) {
  const remote = await ordersApi.create({
    customerId: draft.customerId ?? '',
    customerName: draft.customerName,
    phone: draft.phone,
    voucherCode: draft.promotionCode,
    loyaltyRewardCode: draft.loyaltyRewardCode,
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
  if (updatedOrder) publishPaymentNotification(updatedOrder.code)
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
  orderStore.set((orders) =>
    orders.map((order) => order.code !== code ? order : {
      ...mapped,
      customerEmail: order.customerEmail,
      note: order.note,
      paymentMethod: order.paymentMethod,
      isArchived: false,
    }),
  )
}

export async function refreshOrders(query = '') {
  const remoteOrders = await ordersApi.list(query)
  const deletedCodes = new Set(locallyDeletedOrderCodes.get())
  const archivedCodes = new Set(locallyArchivedOrderCodes.get())
  const currentOrders = new Map(orderStore.get().map((order) => [order.code, order]))
  orderStore.set(remoteOrders.map((remote) => {
    const order = fromApiOrder(remote)
    const current = currentOrders.get(order.code)
    if (current && ORDER_STATUS_RANK[current.status] > ORDER_STATUS_RANK[order.status]) {
      return current
    }
    return {
      ...order,
      customerEmail: current?.customerEmail,
      note: current?.note,
      isArchived: archivedCodes.has(order.code) || current?.isArchived === true,
    }
  }).filter((order) => !deletedCodes.has(order.code)))
}

export function archiveCompletedOrder(code: string) {
  locallyArchivedOrderCodes.set((codes) => codes.includes(code) ? codes : [...codes, code])
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
  const newlyArchived = orders.filter(
    (order) =>
      order.status === 'COMPLETED' &&
      !order.isArchived &&
      order.completedAt > 0 &&
      now - order.completedAt >= 5 * 60_000,
  ).map((order) => order.code)
  if (newlyArchived.length === 0) return
  locallyArchivedOrderCodes.set((codes) => [...new Set([...codes, ...newlyArchived])])
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
