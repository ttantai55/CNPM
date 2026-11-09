'use client'

import { createPersistentStore } from './persistent-store'

export type UnitType = 'PACK' | 'CAN' | 'BOX' | 'PIECE'

export const UNIT_LABELS: Record<UnitType, string> = {
  PACK: 'Gói / Bịch',
  CAN: 'Lon / Hộp thiếc',
  BOX: 'Thùng / Hộp',
  PIECE: 'Cái / Quả',
}

export interface Ingredient {
  id: string
  name: string
  unit: UnitType
  currentStock: number
  minAlertThreshold: number
}

export type InventoryTransactionType = 'IMPORT' | 'EXPORT' | 'ADJUSTMENT'

export const TRANSACTION_TYPE_LABELS: Record<
  InventoryTransactionType,
  { label: string; color: string }
> = {
  IMPORT: {
    label: 'Nhập kho',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  EXPORT: {
    label: 'Xuất kho',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
  ADJUSTMENT: {
    label: 'Kiểm kê / Điều chỉnh',
    color: 'text-amber-700 bg-amber-50 border-amber-200',
  },
}

export interface InventoryTransactionDetails {
  id: string
  ingredientId: string
  quantity: number
  price: number
}

export interface InventoryTransaction {
  id: string
  type: InventoryTransactionType
  createAt: string
  note: string
  staffName: string
  details: InventoryTransactionDetails
}

export const ingredientStore = createPersistentStore<Ingredient[]>(
  'brewlite.raw-materials',
  [],
)

export const inventoryTransactionStore = createPersistentStore<InventoryTransaction[]>(
  'brewlite.raw-material-transactions',
  [],
)
