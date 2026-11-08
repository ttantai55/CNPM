import { createPersistentStore } from './persistent-store'

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
  inStock: boolean
  image: string
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

export const categoryStore = createPersistentStore<MenuCategory[]>('brewlite.menu-categories', [
  { id: 'coffee', name: 'Cà phê', slug: 'coffee', isActive: true },
  { id: 'milk-tea', name: 'Trà sữa', slug: 'milk-tea', isActive: true },
  { id: 'juice', name: 'Nước ép', slug: 'juice', isActive: true },
])

export const SIZE_SURCHARGE: Record<SizeOption, number> = { M: 0, L: 6000 }
export const SUGAR_OPTIONS: SugarOption[] = ['0%', '25%', '50%', '75%', '100%']
export const ICE_OPTIONS: IceOption[] = ['Không đá', 'Ít đá', 'Đá vừa', 'Nhiều đá']

export const TOPPINGS: Topping[] = [
  { id: 'tran-chau-duong-den', name: 'Trân châu đường đen', price: 10000 },
  { id: 'suong-sao', name: 'Sương sáo', price: 6000 },
  { id: 'kem-pho-mai-bien', name: 'Kem phô mai biển', price: 12000 },
  { id: 'thach-ca-phe', name: 'Thạch cà phê', price: 8000 },
  { id: 'nha-dam', name: 'Nha đam', price: 6000 },
]

export const PRODUCTS: Product[] = [
  {
    id: 'latte-kem-sua',
    name: 'Latte Kem Sữa Tây Ban Nha',
    description: 'Espresso đậm vị, sữa đặc và lớp kem sữa béo mịn',
    category: 'coffee',
    price: 56000,
    rating: 4.9,
    weeklySalesCount: 128,
    popular: true,
    inStock: true,
    image: '/images/latte-kem-sua.png',
  },
  {
    id: 'cold-brew',
    name: 'Cold Brew Đường Nâu',
    description: 'Ủ lạnh 18 giờ, ngọt dịu đường nâu và hậu vị caramel',
    category: 'coffee',
    price: 58000,
    rating: 4.8,
    weeklySalesCount: 112,
    inStock: true,
    image: '/images/cold-brew.png',
  },
  {
    id: 'mocha-caramel',
    name: 'Mocha Caramel Nướng',
    description: 'Cacao đậm, caramel nướng thơm và espresso rang vừa',
    category: 'coffee',
    price: 62000,
    rating: 4.7,
    weeklySalesCount: 96,
    popular: true,
    inStock: true,
    image: '/images/mocha-caramel.png',
  },
  {
    id: 'tra-sua-tran-chau',
    name: 'Trà Sữa Trân Châu Đường Đen',
    description: 'Hồng trà đậm, sữa tươi và trân châu đường đen dẻo',
    category: 'milk-tea',
    price: 45000,
    rating: 4.9,
    weeklySalesCount: 184,
    popular: true,
    inStock: true,
    image: '/images/tra-sua-tran-chau.png',
  },
  {
    id: 'tra-sua-matcha',
    name: 'Matcha Latte Kem Muối',
    description: 'Matcha Uji thanh mát, sữa tươi và kem muối mằn mặn',
    category: 'milk-tea',
    price: 49000,
    rating: 4.6,
    weeklySalesCount: 103,
    inStock: true,
    image: '/images/tra-sua-matcha.png',
  },
  {
    id: 'tra-sua-khoai-mon',
    name: 'Trà Sữa Khoai Môn',
    description: 'Khoai môn nghiền bùi béo cùng lớp kem phô mai',
    category: 'milk-tea',
    price: 47000,
    rating: 4.5,
    weeklySalesCount: 72,
    inStock: false,
    image: '/images/tra-sua-khoai-mon.png',
  },
  {
    id: 'thanh-long-xoai',
    name: 'Thanh Long Xoài Lấp Lánh',
    description: 'Thanh long ép lạnh, xoài chín và nước khoáng có ga',
    category: 'juice',
    price: 56000,
    rating: 4.9,
    weeklySalesCount: 156,
    popular: true,
    inStock: true,
    image: '/images/thanh-long-xoai.png',
  },
  {
    id: 'buoi-hong',
    name: 'Bưởi Hồng Ép Lạnh',
    description: 'Bưởi hồng, mật ong hoa tự nhiên và hạt chia',
    category: 'juice',
    price: 52000,
    rating: 4.7,
    weeklySalesCount: 91,
    inStock: true,
    image: '/images/buoi-hong.png',
  },
  {
    id: 'dua-hau',
    name: 'Dưa Hấu Chanh Bạc Hà',
    description: 'Dưa hấu tươi, chanh xanh và bạc hà nghiền mát lạnh',
    category: 'juice',
    price: 50000,
    rating: 4.9,
    weeklySalesCount: 142,
    popular: true,
    inStock: true,
    image: '/images/dua-hau.png',
  },
  {
    id: 'chanh-day',
    name: 'Chanh Dây Gừng Nghệ',
    description: 'Chanh dây, gừng tươi, chanh vàng và nghệ nguyên chất',
    category: 'juice',
    price: 48000,
    rating: 4.8,
    weeklySalesCount: 87,
    inStock: true,
    image: '/images/chanh-day.png',
  },
  {
    id: 'xanh-thanh-loc',
    name: 'Nước Ép Xanh Thanh Lọc',
    description: 'Táo xanh, dưa leo, cải bó xôi, cần tây và táo xoắn',
    category: 'juice',
    price: 54000,
    rating: 4.6,
    weeklySalesCount: 65,
    inStock: true,
    image: '/images/xanh-thanh-loc.png',
  },
]

export const menuProductStore = createPersistentStore<Product[]>(
  'brewlite_menu_products',
  PRODUCTS,
)
export const favoriteProductStore = createPersistentStore<string[]>('brewlite.favorite-products', [])

export function normalizeMenuProducts(products: Product[]) {
  return products.map((product) => {
    const category =
      (product.category as string) === 'milktea' ? 'milk-tea' : product.category
    return {
      ...product,
      category,
      description: product.description ?? '',
      inStock: product.inStock ?? true,
      rating: product.rating ?? 5,
      weeklySalesCount: product.weeklySalesCount ?? 0,
      image: product.image || '/images/cold-brew.png',
    }
  })
}

export const INITIAL_CART: CartItem[] = [
  {
    key: 'latte-kem-sua|M|50%|Đá vừa|tran-chau-duong-den|',
    productId: 'latte-kem-sua',
    size: 'M',
    sugar: '50%',
    ice: 'Đá vừa',
    toppingIds: ['tran-chau-duong-den'],
    note: '',
    quantity: 1,
  },
  {
    key: 'cold-brew|L|25%|Đá vừa|suong-sao|',
    productId: 'cold-brew',
    size: 'L',
    sugar: '25%',
    ice: 'Đá vừa',
    toppingIds: ['suong-sao'],
    note: '',
    quantity: 1,
  },
  {
    key: 'mocha-caramel|M|50%|Ít đá|kem-pho-mai-bien|',
    productId: 'mocha-caramel',
    size: 'M',
    sugar: '50%',
    ice: 'Ít đá',
    toppingIds: ['kem-pho-mai-bien'],
    note: '',
    quantity: 1,
  },
]

export const MAX_ITEM_QUANTITY = 20

export function formatPrice(value: number) {
  return `${value.toLocaleString('vi-VN')} đ`
}

export function getProduct(id: string) {
  return menuProductStore.get().find((p) => p.id === id)
}

export function getUnitPrice(item: Pick<CartItem, 'productId' | 'size' | 'toppingIds'>) {
  const product = getProduct(item.productId)
  if (!product) return 0
  const toppingTotal = item.toppingIds.reduce(
    (sum, id) => sum + (TOPPINGS.find((t) => t.id === id)?.price ?? 0),
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

export function addProduct(newProduct: Omit<Product, 'id'>) {
  const id = `product-${Date.now()}`
  menuProductStore.set((products) => [{ ...newProduct, id }, ...products])
  return id
}

export function updateProduct(id: string, data: Partial<Product>) {
  menuProductStore.set((products) =>
    products.map((product) => (product.id === id ? { ...product, ...data } : product)),
  )
}

export function deleteProduct(id: string) {
  menuProductStore.set((products) => products.filter((product) => product.id !== id))
}