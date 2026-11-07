'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import {
  formatPrice,
  getUnitPrice,
  menuProductStore,
  normalizeMenuProducts,
  type CategoryId,
  type Product,
} from '@/lib/menu'
import { AppHeader, type User } from './app-header'
import { CategoryChips, CategorySidebar } from './category-nav'
import { ProductSection, type SortOption } from './product-section'
import { CartPanel } from './cart-panel'
import { CustomizeDialog } from './customize-dialog'
import { CheckoutDialog } from './checkout-dialog'
import { Modal } from './modal'
import { authStore } from '@/lib/session'
import { cartStore, dispatchCart } from '@/lib/cart'
import { useHydrated } from '@/lib/persistent-store'
import { MockPaymentModal } from '@/components/payment/mock-payment-modal'
import { inventoryStore, placeOrder, type OrderDraft, type PaymentMethod } from '@/lib/orders'

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()
}

export function BrewLiteApp() {
  const router = useRouter()
  const hydrated = useHydrated()
  const session = authStore.useStore()
  const cart = cartStore.useStore()
  const inventory = inventoryStore.useStore()
  const products = menuProductStore.useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId>('juice')
  const [sort, setSort] = useState<SortOption>('popular')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const [customizing, setCustomizing] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<OrderDraft | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const user: User | null = session ? { name: session.name, email: session.email } : null

  useEffect(() => {
    if (!hydrated) return
    if (session && session.role !== 'CUSTOMER') {
      router.replace(session.role === 'STAFF' ? '/staff/orders' : '/admin/dashboard')
      return
    }
    if (session?.role === 'CUSTOMER' && window.sessionStorage.getItem('brewlite.checkout-after-login') === 'true') {
      window.sessionStorage.removeItem('brewlite.checkout-after-login')
      setCheckoutOpen(true)
    }
  }, [hydrated, router, session])

  const availableProducts = useMemo(
    () =>
      normalizeMenuProducts(products).map((product) => ({
        ...product,
        inStock: inventory[product.id]?.available ?? product.inStock,
      })),
    [inventory, products],
  )

  const searched = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return availableProducts
    return availableProducts.filter((p) => normalize(`${p.name} ${p.description}`).includes(q))
  }, [availableProducts, query])

  const counts = useMemo(
    () => ({
      all: searched.length,
      coffee: searched.filter((p) => p.category === 'coffee').length,
      'milk-tea': searched.filter((p) => p.category === 'milk-tea').length,
      juice: searched.filter((p) => p.category === 'juice').length,
    }),
    [searched],
  )

  const visibleProducts = useMemo(() => {
    const list = category === 'all' ? searched : searched.filter((p) => p.category === category)
    const sorted = [...list]
    switch (sort) {
      case 'popular':
        sorted.sort((a, b) => Number(b.popular ?? false) - Number(a.popular ?? false) || b.rating - a.rating)
        break
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating)
        break
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price)
        break
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price)
        break
    }
    return sorted.sort((a, b) => Number(b.inStock) - Number(a.inStock))
  }, [searched, category, sort])

  const cartTotal = cart.reduce((sum, i) => sum + getUnitPrice(i) * i.quantity, 0)

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2200)
  }

  function toggleFavorite(id: string) {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    if (value.trim()) setCategory('all')
  }

  function openCheckout() {
    setCartOpen(false)
    if (!user) {
      router.push('/login?next=checkout')
      return
    }
    setCheckoutOpen(true)
  }

  const cartPanelProps = {
    items: cart,
    onQuantityChange: (key: string, quantity: number) => dispatchCart({ type: 'setQuantity', key, quantity }),
    onRemove: (key: string) => dispatchCart({ type: 'remove', key }),
    onCheckout: openCheckout,
  }

  if (hydrated && session && session.role !== 'CUSTOMER') {
    return <div className="min-h-dvh bg-[#f7f8f6]" />
  }

  return (
    <div className="min-h-dvh">
      <AppHeader
        query={query}
        onQueryChange={handleQueryChange}
        user={user}
        onOpenAuth={() => router.push('/login')}
        onLogout={() => {
          authStore.set(null)
          router.replace('/login')
          showToast('Bạn đã đăng xuất')
        }}
        cartCount={cart.reduce((count, item) => count + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
      />

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 pb-28 pt-4 md:px-6 md:pt-5 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_300px] xl:pb-8">
        <CategorySidebar active={category} counts={counts} onChange={setCategory} />

        <main className="flex min-w-0 flex-col gap-4">
          <CategoryChips active={category} counts={counts} onChange={setCategory} />
          <ProductSection
            products={visibleProducts}
            sort={sort}
            onSortChange={setSort}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAdd={setCustomizing}
            query={query.trim()}
            onResetFilters={() => {
              setQuery('')
              setCategory('all')
            }}
          />
        </main>

        <aside className="hidden xl:block" aria-label="Giỏ hàng">
          <div className="sticky top-[84px] flex h-[calc(100dvh-100px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <CartPanel {...cartPanelProps} className="flex-1" />
          </div>
        </aside>
      </div>

      {cart.length > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 p-3 backdrop-blur xl:hidden">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="mx-auto flex h-12 w-full max-w-xl items-center gap-3 rounded-xl bg-primary px-4 text-primary-foreground shadow-lg"
          >
            <span className="relative">
              <ShoppingBag className="size-5" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 flex min-w-4 items-center justify-center rounded-full bg-caramel-soft px-1 text-[10px] font-bold text-primary">
                {cart.length}
              </span>
            </span>
            <span className="flex-1 text-left text-sm font-semibold">Xem giỏ hàng</span>
            <span className="text-sm font-bold">{formatPrice(cartTotal)}</span>
          </button>
        </div>
      )}

      <Modal
        open={cartOpen}
        onClose={() => setCartOpen(false)}
        title="Giỏ hàng của bạn"
        description={`${cart.length} món đã chọn`}
        variant="drawer"
      >
        <CartPanel {...cartPanelProps} showHeader={false} className="flex-1" />
      </Modal>

      <CustomizeDialog
        product={customizing}
        onClose={() => setCustomizing(null)}
        onConfirm={(item) => {
          dispatchCart({ type: 'add', item })
          setCustomizing(null)
          showToast('Đã thêm vào giỏ hàng')
        }}
      />

      <CheckoutDialog
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      items={cart}
      defaultName={user?.name}
      onPlaced={() => dispatchCart({ type: 'clear' })}
      onProceedToPayment={(orderData) => {
        setCheckoutOpen(false)
        setPaymentOrder(orderData)
      }}
    />
    {paymentOrder && (
      <MockPaymentModal
        order={paymentOrder}
        onClose={() => setPaymentOrder(null)}
        onSuccess={(method: PaymentMethod) => {
          const order = placeOrder(paymentOrder, method)
          dispatchCart({ type: 'clear' })
          setPaymentOrder(null)
          router.push(`/orders/${encodeURIComponent(order.code)}`)
        }}
      />
    )}

      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[60] flex justify-center px-4 xl:bottom-6">
        {toast && (
          <p className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-2">
            {toast}
          </p>
        )}
      </div>
    </div>
  )
}
