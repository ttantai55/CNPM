import { createPersistentStore, createStore } from './persistent-store'
import { menuApi, type ApiCategory, type ApiProduct, type ApiTopping } from './api'

export type CategoryId = string
export type BuiltInCategoryId = 'all' | 'coffee' | 'milk-tea' | 'juice'

export type MenuCategory = {
  id: string
  name: string
  slug: string
  isActive: boolean
}

export type Product = {
  id: string
  name: string
  description: string
  category: string
  price: number
  rating: number
  weeklySalesCount: number
  popular?: boolean
  status: boolean
  imageUrl: string
  categoryName?: string
}

export type SizeOption = 'M' | 'L'
export type SugarOption = '0%' | '25%' | '50%' | '75%' | '100%'
export type IceOption = 'Không đá' | 'Ít đá' | 'Đá vừa' | 'Nhiều đá'

export type Topping = { id: string; name: string; price: number }

export type CartItem = {
  key: string
  productId: string
  size: SizeOption
  sugar: SugarOption
  ice: IceOption
  toppingIds: string[]
  note: string
  quantity: number
}

export const CATEGORY_LABELS: Record<BuiltInCategoryId, string> = {
  all: 'Tất cả',
  coffee: 'Cà phê',
  'milk-tea': 'Trà sữa',
  juice: 'Nước ép',
}

export const categoryStore = createStore<MenuCategory[]>([])

export const SIZE_SURCHARGE: Record<SizeOption, number> = { M: 0, L: 6000 }
export const SUGAR_OPTIONS: SugarOption[] = ['0%', '25%', '50%', '75%', '100%']
export const ICE_OPTIONS: IceOption[] = ['Không đá', 'Ít đá', 'Đá vừa', 'Nhiều đá']

export const menuProductStore = createStore<Product[]>([])
export const toppingStore = createStore<Topping[]>([])
export const favoriteProductStore = createPersistentStore<string[]>('brewlite.favorite-products', [])

export function normalizeMenuProducts(products: Product[]) {
  return products.map((product) => {
    return {
      ...product,
      description: product.description ?? '',
      status: product.status ?? true,
      rating: product.rating ?? 5,
      weeklySalesCount: product.weeklySalesCount ?? 0,
      imageUrl: product.imageUrl || '/images/cold-brew.png',
    }
  })
}

export function fromApiProducts(items: ApiProduct[]): Product[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    description: item.description ?? '',
    category: item.categoryId,
    categoryName: item.categoryName,
    price: item.price,
    rating: item.rating ?? 5,
    weeklySalesCount: item.weeklySalesCount ?? 0,
    status: item.status,
    imageUrl: item.imageUrl || '/images/cold-brew.png',
  }))
}

export function fromApiCategories(items: ApiCategory[]): MenuCategory[] {
  return items.map((item) => ({
    id: item.id,
    name: item.name,
    slug: item.slug,
    isActive: item.isActive ?? true,
  }))
}

export function fromApiToppings(items: ApiTopping[]): Topping[] {
  return items.filter((item) => item.isAvailable).map(({ id, name, price }) => ({ id, name, price }))
}

export const MAX_ITEM_QUANTITY = 20

export function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`
}

export function getProduct(id: string) {
  return menuProductStore.get().find((p) => p.id === id)
}

export function getTopping(id: string) {
  return toppingStore.get().find((topping) => topping.id === id)
}

export function getUnitPrice(item: Pick<CartItem, 'productId' | 'size' | 'toppingIds'>) {
  const product = getProduct(item.productId)
  if (!product) return 0
  const toppingTotal = item.toppingIds.reduce(
    (sum, id) => sum + (getTopping(id)?.price ?? 0),
    0,
  )
  return product.price + SIZE_SURCHARGE[item.size] + toppingTotal
}

export function buildCartKey(item: Omit<CartItem, 'key' | 'quantity'>) {
  return [
    item.productId,
    item.size,
    item.sugar,
    item.ice,
    [...item.toppingIds].sort().join(','),
    item.note.trim(),
  ].join('|')
}

export async function addProduct(newProduct: Omit<Product, 'id'>) {
  const created = await menuApi.createProduct({
    name: newProduct.name,
    description: newProduct.description,
    categoryId: newProduct.category,
    price: newProduct.price,
    status: newProduct.status,
    imageUrl: newProduct.imageUrl,
    rating: newProduct.rating,
    weeklySalesCount: newProduct.weeklySalesCount,
  })
  const product = fromApiProducts([created])[0]
  menuProductStore.set((products) => [product, ...products])
  return product
}

export async function updateProduct(id: string, data: Partial<Product>) {
  const updated = await menuApi.updateProduct(id, {
    name: data.name,
    description: data.description,
    categoryId: data.category,
    price: data.price,
    status: data.status,
    imageUrl: data.imageUrl,
    rating: data.rating,
    weeklySalesCount: data.weeklySalesCount,
  })
  const product = fromApiProducts([updated])[0]
  menuProductStore.set((products) =>
    products.map((entry) => (entry.id === id ? product : entry)),
  )
}

export async function deleteProduct(id: string) {
  await menuApi.deleteProduct(id)
  menuProductStore.set((products) => products.filter((product) => product.id !== id))
}