const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8081'

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = typeof window === 'undefined'
    ? null
    : (() => {
        try {
          return JSON.parse(window.localStorage.getItem('brewlite.session') ?? 'null')?.token as string | undefined
        } catch {
          return undefined
        }
      })()
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  })
  if (!response.ok) {
    const body = await response.json().catch(() => null) as { message?: string; error?: string } | null
    throw new Error(body?.message ?? body?.error ?? `API request failed (${response.status})`)
  }
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
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
  customerName: string
  customerPhone: string
  totalAmount: number
  discountAmount: number
  finalAmount: number
  status: string
  createdAt: string
  voucherCode?: string | null
  paymentMethod?: 'MOMO' | 'VIETQR' | null
  items: Array<ApiOrderItem & { productName: string; unitPrice: number; subtotal: number }>
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
export type ApiIngredient = {
  id: string
  name: string
  unit: 'PACK' | 'CAN' | 'BOX' | 'PIECE'
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
  register: (body: { username: string; password: string; email: string; phone: string; fullName: string }) =>
    api<AuthResult>('/api/auth/register', json('POST', body)),
  profile: (id: string) => api<ApiUser>(`/api/users/${encodeURIComponent(id)}`),
  updateProfile: (id: string, body: Partial<ApiUser>) =>
    api<ApiUser>(`/api/users/${encodeURIComponent(id)}`, json('PATCH', body)),
}
export const menuApi = {
  products: () => api<ApiProduct[]>('/api/products'),
  categories: () => api<ApiCategory[]>('/api/categories'),
  toppings: () => api<ApiTopping[]>('/api/toppings'),
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
export const ordersApi = {
  list: (query = '') => api<ApiOrder[]>(`/api/orders${query}`),
  get: (id: string) => api<ApiOrder>(`/api/orders/${encodeURIComponent(id)}`),
  create: (body: {
    customerId?: string
    customerName: string
    phone: string
    voucherCode?: string
    items: ApiOrderItem[]
  }) => api<ApiOrder>('/api/orders', json('POST', body)),
  status: (id: string, status: string) =>
    api<ApiOrder>(`/api/orders/${encodeURIComponent(id)}/status`, json('PATCH', { status })),
}
export const paymentsApi = {
  create: (orderId: string, method: 'MOMO' | 'VIETQR', amount: number) =>
    api<{ orderId: string; paymentUrl: string; expiredAt: string }>('/api/payments/create', json('POST', { orderId, method, amount })),
  confirm: (orderId: string, method: 'MOMO' | 'VIETQR', amount: number) =>
    api<{ status: string; message: string; orderId: string }>('/api/payments/confirm', json('POST', { orderId, method, amount })),
}
export const staffApi = {
  list: () => api<ApiUser[]>('/api/admin/staff'),
  create: (body: Record<string, unknown>) => api<ApiUser>('/api/admin/staff', json('POST', body)),
  update: (id: string, body: Record<string, unknown>) => api<ApiUser>(`/api/admin/staff/${encodeURIComponent(id)}`, json('PUT', body)),
  delete: (id: string) => api<void>(`/api/admin/staff/${encodeURIComponent(id)}`, json('DELETE')),
}
export const adminApi = {
  customers: () => api<ApiUser[]>('/api/admin/customers'),
  updateCustomer: (id: string, body: Record<string, unknown>) => api<ApiUser>(`/api/admin/customers/${encodeURIComponent(id)}`, json('PUT', body)),
  inventory: () => api<ApiIngredient[]>('/api/admin/inventory'),
  inventoryTransactions: () => api<ApiInventoryTransaction[]>('/api/admin/inventory/transactions'),
  createIngredient: (body: Record<string, unknown>) => api<ApiIngredient>('/api/admin/inventory', json('POST', body)),
  inventoryTransaction: (body: Record<string, unknown>) => api<void>('/api/admin/inventory/transactions', json('POST', body)),
  promotions: () => api<ApiPromotion[]>('/api/admin/promotions'),
  createPromotion: (body: Partial<ApiPromotion>) => api<ApiPromotion>('/api/admin/promotions', json('POST', body)),
  updatePromotion: (id: string, body: Partial<ApiPromotion>) => api<ApiPromotion>(`/api/admin/promotions/${encodeURIComponent(id)}`, json('PUT', body)),
  deletePromotion: (id: string) => api<void>(`/api/admin/promotions/${encodeURIComponent(id)}`, json('DELETE')),
  revenue: (from?: string, to?: string) =>
    api<{ from: string; to: string; revenue: number; orders: number }>(`/api/admin/reports/revenue${from ? `?from=${from}&to=${to ?? from}` : ''}`),
}
