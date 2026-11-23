import type { UnitType } from './raw-material-inventory'
import { authStore } from './session'

const configuredApiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? '/api').replace(/\/+$/, '')
const API_BASE_URL = configuredApiBaseUrl.endsWith('/api')
  ? configuredApiBaseUrl
  : `${configuredApiBaseUrl}/api`

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined'
    ? null
    : authStore.get()?.token ?? null
  const endpoint = path.replace(/^\/api(?=\/)/, '')
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  const responseText = await response.text()
  let body: unknown
  if (responseText.trim()) {
    try {
      body = JSON.parse(responseText)
    } catch {
      if (!response.ok) throw new Error(responseText)
      throw new Error(`API returned an invalid response (${response.status})`)
    }
  }
  if (!response.ok) {
    const errorBody = body as { message?: string; error?: string } | undefined
    throw new Error(errorBody?.message ?? errorBody?.error ?? `API request failed (${response.status})`)
  }
  return body as T
}

const json = (method: string, body?: unknown): RequestInit => ({
  method,
  ...(body === undefined ? {} : { body: JSON.stringify(body) }),
})

export type ApiUser = {
  id: string
  username: string
  email: string
  role: string
  fullName: string
  phone?: string
  avatarUrl?: string
  position?: string
  gender?: boolean
  dateOfBirth?: string
  address?: string
  loyaltyPoints?: number
}
export type AuthResult = { token: string; user: ApiUser }
export type ApiProduct = {
  id: string
  name: string
  description: string
  price: number
  imageUrl: string
  status: boolean
  categoryId: string
  categoryName: string
  rating: number
  weeklySalesCount: number
}
export type ApiCategory = { id: string; name: string; description?: string; slug: string; isActive: boolean }
export type ApiTopping = { id: string; name: string; price: number; isAvailable: boolean }
export type ApiCartItem = {
  id?: string
  productId: string
  quantity: number
  size: 'S' | 'M' | 'L'
  sugarPercent: number
  icePercent: number
  note?: string | null
  toppingIds: string[]
}
export type ApiCart = { id: string; userId: string; totalCartAmount: number; items: ApiCartItem[] }
export type ApiOrderItem = {
  productId: string
  quantity: number
  note?: string
  size: string
  sugarPercent: number
  icePercent: number
  toppings: string[]
}
export type ApiOrder = {
  id: string
  customerId?: string
  customerName?: string | null
  customerPhone?: string | null
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  createdAt: string
  paidAt?: string | null
  preparedAt?: string | null
  completedAt?: string | null
  processes?: Array<{ status: string; updateAt: string }>
  voucherCode?: string | null
  paymentMethod?: 'MOMO' | 'VIET_QR' | null
  items?: Array<ApiOrderItem & { productName: string; unitPrice: number; subtotal: number }> | null
}
export type ApiPromotion = {
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
export type ApiPromotionWrite = Omit<ApiPromotion, 'id' | 'usedCount'>
export type ApiIngredient = {
  id: string
  name: string
  unit: UnitType
  currentStock: number
  minAlertThreshold: number
  isBelowThreshold: boolean
}
export type ApiInventoryTransaction = {
  id: string
  type: 'IMPORT' | 'EXPORT' | 'ADJUSTMENT'
  createAt: string
  note: string
  baristaName: string
  ingredientId: string
  quantity: number
  price: number
}

export const authApi = {
  login: (loginId: string, password: string) =>
    api<AuthResult>('/api/auth/login', json('POST', { loginId, password })),
  loginWithGoogle: (idToken: string) =>
    api<AuthResult>('/api/auth/google', json('POST', { idToken })),
  register: (body: { username: string; password: string; email: string; phone: string; fullName: string }) =>
    api<AuthResult>('/api/auth/register', json('POST', body)),
  changePassword: (id: string, body: { currentPassword: string; newPassword: string }) =>
    api<void>(`/api/users/${encodeURIComponent(id)}/change-password`, json('POST', body)),
  profile: (id: string) => api<ApiUser>(`/api/users/${encodeURIComponent(id)}`),
  updateProfile: (id: string, body: Partial<ApiUser>) =>
    api<ApiUser>(`/api/users/${encodeURIComponent(id)}`, json('PATCH', body)),
}
export const menuApi = {
  products: () => api<ApiProduct[]>('/api/products'),
  categories: () => api<ApiCategory[]>('/api/categories'),
  toppings: () => api<ApiTopping[]>('/api/toppings'),
  publicPromotions: () => api<ApiPromotion[]>('/api/promotions'),
  createProduct: (body: Partial<ApiProduct>) => api<ApiProduct>('/api/admin/products', json('POST', body)),
  updateProduct: (id: string, body: Partial<ApiProduct>) =>
    api<ApiProduct>(`/api/admin/products/${encodeURIComponent(id)}`, json('PUT', body)),
  deleteProduct: (id: string) => api<void>(`/api/admin/products/${encodeURIComponent(id)}`, json('DELETE')),
  createCategory: (body: { name: string; slug: string; description?: string }) =>
    api<ApiCategory>('/api/categories', json('POST', body)),
  updateCategory: (id: string, body: { name: string; slug: string; description?: string }) =>
    api<ApiCategory>(`/api/categories/${encodeURIComponent(id)}`, json('PUT', body)),
  toggleCategory: (id: string) => api<ApiCategory>(`/api/categories/${encodeURIComponent(id)}/status`, json('PATCH')),
}
export const cartApi = {
  get: (userId: string) => api<ApiCart>(`/api/users/${encodeURIComponent(userId)}/cart`),
  replace: (userId: string, items: ApiCartItem[]) =>
    api<ApiCart>(`/api/users/${encodeURIComponent(userId)}/cart`, json('PUT', items)),
}
export const ordersApi = {
  list: (query = '') => api<ApiOrder[]>(`/api/orders${query}`),
  get: (id: string) => api<ApiOrder>(`/api/orders/${encodeURIComponent(id)}`),
  create: (body: {
    customerId?: string
    customerName: string
    phone: string
    voucherCode?: string
    loyaltyRewardCode?: string
    items: ApiOrderItem[]
  }) => api<ApiOrder>('/api/orders', json('POST', body)),
  status: (id: string, status: string) =>
    api<ApiOrder>(`/api/orders/${encodeURIComponent(id)}/status`, json('PATCH', { status })),
}
export const paymentsApi = {
  create: (orderId: string, method: 'MOMO' | 'VIET_QR', amount: number) =>
    api<{ orderId: string; paymentUrl: string; expiredAt: string }>('/api/payments/create', json('POST', { orderId, method, amount })),
  confirm: (orderId: string, method: 'MOMO' | 'VIET_QR', amount: number) =>
    api<{ status: string; message: string; orderId: string }>('/api/payments/confirm', json('POST', { orderId, method, amount })),
}
export const staffApi = {
  list: () => api<ApiUser[]>('/api/admin/staff'),
  create: (body: Record<string, unknown>) => api<ApiUser>('/api/admin/staff', json('POST', body)),
  update: (id: string, body: Record<string, unknown>) => api<ApiUser>(`/api/admin/staff/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: string) => api<void>(`/api/admin/staff/${encodeURIComponent(id)}`, json('DELETE')),
}
export const adminApi = {
  categories: () => api<ApiCategory[]>('/api/admin/categories'),
  toppings: () => api<ApiTopping[]>('/api/admin/toppings'),
  updateToppingAvailability: (id: string, isAvailable: boolean) =>
    api<ApiTopping>(`/api/admin/toppings/${encodeURIComponent(id)}/status`, json('PATCH', { isAvailable })),
  customers: () => api<ApiUser[]>('/api/admin/customers'),
  updateCustomer: (id: string, body: Record<string, unknown>) => api<ApiUser>(`/api/admin/customers/${encodeURIComponent(id)}`, json('PUT', body)),
  inventory: () => api<ApiIngredient[]>('/api/admin/inventory'),
  inventoryTransactions: () => api<ApiInventoryTransaction[]>('/api/admin/inventory/transactions'),
  createIngredient: (body: Record<string, unknown>) => api<ApiIngredient>('/api/admin/inventory', json('POST', body)),
  inventoryTransaction: (body: Record<string, unknown>) => api<{ message: string }>('/api/admin/inventory/transactions', json('POST', body)),
  promotions: () => api<ApiPromotion[]>('/api/admin/promotions'),
  createPromotion: (body: ApiPromotionWrite) => api<ApiPromotion>('/api/admin/promotions', json('POST', body)),
  updatePromotion: (id: string, body: ApiPromotionWrite) => api<ApiPromotion>(`/api/admin/promotions/${encodeURIComponent(id)}`, json('PUT', body)),
  deletePromotion: (id: string) => api<void>(`/api/admin/promotions/${encodeURIComponent(id)}`, json('DELETE')),
  revenue: (from?: string, to?: string) =>
    api<{ from: string; to: string; revenue: number; orders: number; hourly: boolean; series: { label: string; revenue: number }[] }>(`/api/admin/reports/revenue${from ? `?from=${from}&to=${to ?? from}` : ''}`),
}
