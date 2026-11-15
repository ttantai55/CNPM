'use client'

import { createPersistentStore } from './persistent-store'

export type CustomerNotification = {
  id: string
  title: string
  body: string
  createdAt: number
  isRead: boolean
  batchKey?: string
  itemCount?: number
  orderCode?: string
}

export const notificationStore = createPersistentStore<CustomerNotification[]>(
  'brewlite.customer-notifications',
  [],
)

export function publishBatchNotification(kind: 'món' | 'khuyến mãi', count: number) {
  if (!Number.isInteger(count) || count < 1) return
  const now = Date.now()
  const batchKey = kind
  notificationStore.set((notifications) => {
    const latest = notifications[0]
    if (latest?.batchKey === batchKey && now - latest.createdAt < 2000) {
      const itemCount = (latest.itemCount ?? 1) + count
      return [
        {
          ...latest,
          title: `Cửa hàng vừa cập nhật thêm ${itemCount} ${kind} mới`,
          body: `Khám phá ${itemCount} ${kind} mới tại BrewLite.`,
          itemCount,
          createdAt: now,
          isRead: false,
        },
        ...notifications.slice(1),
      ]
    }
    return [
      {
        id: `notification-${now}-${Math.random().toString(36).slice(2, 8)}`,
        title: `Cửa hàng vừa cập nhật thêm ${count} ${kind} mới`,
        body: `Khám phá ${count} ${kind} mới tại BrewLite.`,
        createdAt: now,
        isRead: false,
        batchKey,
        itemCount: count,
      },
      ...notifications,
    ].slice(0, 100)
  })
}

export function publishPaymentNotification(orderCode: string) {
  const now = Date.now()
  notificationStore.set((notifications) => [
    {
      id: `payment-${orderCode}-${now}`,
      title: 'Thanh toán thành công',
      body: `Đã thanh toán thành công đơn hàng #${orderCode}`,
      createdAt: now,
      isRead: false,
      orderCode,
    },
    ...notifications,
  ].slice(0, 100))
}
