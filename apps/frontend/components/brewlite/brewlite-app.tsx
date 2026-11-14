'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import {
  categoryStore,
  favoriteProductStore,
  formatPrice,
  getUnitPrice,
  menuProductStore,
  normalizeMenuProducts,
  toppingStore,
  type CartItem,
  type Product,
} from '@/lib/menu'
import {
  getDiscountAmount,
  getEligiblePromotions,
  promotionStore,
} from '@/lib/promotions'
import { AppHeader, type User } from './app-header'
import { CategoryChips, CategorySidebar, type CategoryFilter } from './category-nav'
import { ProductSection, type SortOption } from './product-section'
import { CartPanel } from './cart-panel'
import { BestsellerPanel } from './bestseller-panel'
import { HomeHeroCarousel } from './home-hero-carousel'
import { HotDealsSlider } from './hot-deals-slider'
import { CustomizeDialog } from './customize-dialog'
import { CheckoutDialog } from './checkout-dialog'
import { Modal } from './modal'
import { authStore } from '@/lib/session'
import { cartContainsItems, cartStore, dispatchCart, removeCartItems, restoreCartItems } from '@/lib/cart'
import { useHydrated } from '@/lib/persistent-store'
import { MockPaymentModal } from '@/components/payment/mock-payment-modal'
import type { CustomerProfile } from '@/lib/customer-profile'
import {
  confirmOrderPayment,
  cancelOrderPayment,
  migrateOrderStatuses,
  orderStore,
  orderToCartItems,
  placeOrder,
  resumeOrderPayment,
  type Order,
  type PaymentMethod,
} from '@/lib/orders'
import { ProfileDialog } from './profile-dialog'
import { adminApi, authApi, menuApi } from '@/lib/api'
import { fromApiCategories, fromApiProducts, fromApiToppings } from '@/lib/menu'

function normalize(text: string) {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase()
}

export function BrewLiteApp() {
  const router = useRouter()
  const hydrated = useHydrated()
  const session = authStore.useStore()
  const cart = cartStore.useStore()
  const orders = orderStore.useStore()
  const products = menuProductStore.useStore()
  const categories = categoryStore.useStore()
  const promotions = promotionStore.useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryFilter>('all')
  const [sort, setSort] = useState<SortOption>('popular')
  const favoriteProductIds = favoriteProductStore.useStore()
  const favorites = useMemo(() => new Set(favoriteProductIds), [favoriteProductIds])
  const [customizing, setCustomizing] = useState<Product | null>(null)
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const [selectedPromotionId, setSelectedPromotionId] = useState('')
  const [profileOpen, setProfileOpen] = useState(false)
  const [paymentOrder, setPaymentOrder] = useState<Order | null>(null)
  const [editingCartItem, setEditingCartItem] = useState<CartItem | null>(null)
  const paymentCartItems = useRef<CartItem[]>([])
  const preserveCartOnPayment = useRef(false)
  const paymentItemsRestored = useRef(false)
  const [toast, setToast] = useState<string | null>(null)
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const user: User | null = session && profile
    ? {
        name: profile.name || session.username || session.name,
        displayName: profile.name.trim() || session.username || session.name,
        email: session.email,
        avatarUrl: profile.avatarUrl,
      }
    : null
  const availablePromotions = promotions

  useEffect(() => {
    if (!hydrated) return
    let active = true
    Promise.all([menuApi.products(), menuApi.categories(), menuApi.toppings(), adminApi.promotions()])
      .then(([remoteProducts, remoteCategories, remoteToppings, remotePromotions]) => {
        if (!active) return
        menuProductStore.set(fromApiProducts(remoteProducts))
        categoryStore.set(fromApiCategories(remoteCategories))
        toppingStore.set(fromApiToppings(remoteToppings))
        promotionStore.set(remotePromotions)
      })
      .catch((error: unknown) => {
        if (active) showToast(error instanceof Error ? error.message : 'Không tải được thực đơn.')
      })
    return () => { active = false }
  }, [hydrated])

  useEffect(() => {
    if (!hydrated || !session || session.role !== 'CUSTOMER') {
      setProfile(null)
      return
    }
    let active = true
    authApi.profile(session.id)
      .then((user) => {
        if (active) setProfile({
          name: user.fullName || user.username,
          phone: user.phone ?? '',
          address: user.address ?? '',
          gender: user.gender ?? false,
          dateOfBirth: user.dateOfBirth ?? '',
          avatarUrl: user.avatarUrl ?? '',
        })
      })
      .catch((error: unknown) => {
        if (active) showToast(error instanceof Error ? error.message : 'Không tải được hồ sơ.')
      })
    return () => { active = false }
  }, [hydrated, session?.id, session?.role])

  useEffect(() => {
    if (!hydrated) return
    migrateOrderStatuses()
    if (session && session.role !== 'CUSTOMER') {
      router.replace(session.role === 'STAFF' ? '/staff/orders' : '/admin/dashboard')
      return
    }
    if (session?.role === 'CUSTOMER' && window.sessionStorage.getItem('brewlite.checkout-after-login') === 'true') {
      window.sessionStorage.removeItem('brewlite.checkout-after-login')
      setCheckoutOpen(true)
    }
  }, [hydrated, router, session])

  const activeOrders = useMemo(
    () => orders
      .filter((order) => order.customerEmail === session?.email && ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status))
      .sort((a, b) => b.createdAt - a.createdAt),
    [orders, session?.email],
  )
  const customerOrders = useMemo(() => {
    const phone = profile?.phone.replace(/\D/g, '')
    return orders
      .filter((order) =>
        order.customerId === session?.id ||
        order.customerEmail === session?.email ||
        (phone && order.phone.replace(/\D/g, '') === phone),
      )
      .sort((a, b) => b.createdAt - a.createdAt)
  }, [orders, profile?.phone, session?.email, session?.id])

  const allMenuProducts = useMemo(
    () => normalizeMenuProducts(products),
    [products],
  )
  const activeCategoryIds = useMemo(
    () => new Set(categories.filter((item) => item.isActive).map((item) => item.id)),
    [categories],
  )
  const availableProducts = useMemo(
    () => allMenuProducts.filter((product) => product.status && activeCategoryIds.has(product.category)),
    [activeCategoryIds, allMenuProducts],
  )
  useEffect(() => {
    if (category !== 'all' && category !== 'favorites' && !activeCategoryIds.has(category)) {
      setCategory('all')
    }
  }, [activeCategoryIds, category])

  const searched = useMemo(() => {
    const q = normalize(query.trim())
    if (!q) return availableProducts
    return availableProducts.filter((p) => normalize(`${p.name} ${p.description}`).includes(q))
  }, [availableProducts, query])
  const searchableFavorites = useMemo(() => {
    const q = normalize(query.trim())
    return allMenuProducts.filter((product) =>
      activeCategoryIds.has(product.category) &&
      favorites.has(product.id) && (!q || normalize(`${product.name} ${product.description}`).includes(q)),
    )
  }, [activeCategoryIds, allMenuProducts, favorites, query])

  const counts = useMemo(
    () => ({
      ...Object.fromEntries(
        categories.map((item) => [
          item.id,
          searched.filter((product) => product.category === item.id).length,
        ]),
      ),
      all: searched.length,
      favorites: searchableFavorites.length,
    }),
    [categories, searched, searchableFavorites],
  )

  const visibleProducts = useMemo(() => {
    const list = category === 'favorites'
      ? searchableFavorites
      : category === 'all'
        ? searched
        : searched.filter((p) => p.category === category)
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
    return sorted.sort((a, b) => Number(b.status) - Number(a.status))
  }, [searched, searchableFavorites, category, sort])

  const cartSubtotal = cart.reduce((sum, i) => sum + getUnitPrice(i) * i.quantity, 0)
  const eligiblePromotions = getEligiblePromotions(availablePromotions, cartSubtotal)
  const selectedPromotion = eligiblePromotions.find((promotion) => promotion.id === selectedPromotionId)
  const cartTotal = cartSubtotal - getDiscountAmount(selectedPromotion, cartSubtotal)

  function showToast(message: string) {
    setToast(message)
    setTimeout(() => setToast(null), 2200)
  }

  function toggleFavorite(id: string) {
    favoriteProductStore.set((current) =>
      current.includes(id) ? current.filter((favoriteId) => favoriteId !== id) : [...current, id],
    )
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

  function usePromotion(promotion: (typeof promotions)[number]) {
    setSelectedPromotionId(promotion.id)
    setCategory('all')
    requestAnimationFrame(() =>
      document.getElementById('menu-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
    )
    showToast(`Đã áp dụng mã ${promotion.voucherCode}`)
  }

  const cartPanelProps = {
    items: cart,
    onQuantityChange: (key: string, quantity: number) => dispatchCart({ type: 'setQuantity', key, quantity }),
    onEdit: (item: CartItem) => {
      const product = products.find((entry) => entry.id === item.productId)
      if (!product) {
        showToast('Không tìm thấy sản phẩm để chỉnh sửa.')
        return
      }
      setEditingCartItem(item)
      setCustomizing(product)
    },
    onRemove: (key: string) => dispatchCart({ type: 'remove', key }),
    onCheckout: openCheckout,
    promotions: availablePromotions,
    selectedPromotionId,
    onSelectPromotion: setSelectedPromotionId,
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
        onOpenProfile={() => setProfileOpen(true)}
        latestOrderCode={activeOrders[0]?.code}
        activeOrderCount={activeOrders.length}
        customerOrders={customerOrders}
        onResumePayment={(order) => {
          void resumeOrderPayment(order, session?.email, session?.id)
            .then((resumed) => {
              const items = orderToCartItems(order)
              paymentCartItems.current = items
              preserveCartOnPayment.current = true
              paymentItemsRestored.current =
                order.status === 'CANCELLED' && cartContainsItems(items)
              setPaymentOrder(resumed)
            })
            .catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Không thể tiếp tục thanh toán.'))
        }}
        cartCount={cart.reduce((count, item) => count + item.quantity, 0)}
        onOpenCart={() => setCartOpen(true)}
      />

      {session && profile && (
        <ProfileDialog
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          user={{
            id: session.id ?? `usr_${session.email.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
            username: session.username ?? session.email.split('@')[0],
            email: session.email,
            createdAt: session.createdAt ?? 0,
          }}
          profile={profile}
          onSave={async (nextProfile) => {
            const saved = await authApi.updateProfile(session.id, {
              fullName: nextProfile.name,
              phone: nextProfile.phone,
              address: nextProfile.address,
              gender: nextProfile.gender,
              dateOfBirth: nextProfile.dateOfBirth || undefined,
              avatarUrl: nextProfile.avatarUrl,
            })
            setProfile({
              name: saved.fullName || nextProfile.name,
              phone: saved.phone ?? '',
              address: saved.address ?? '',
              gender: saved.gender ?? false,
              dateOfBirth: saved.dateOfBirth ?? '',
              avatarUrl: saved.avatarUrl ?? '',
            })
            showToast('Đã lưu hồ sơ của bạn')
          }}
        />
      )}

      <div className="mx-auto max-w-[1600px] px-4 pt-4 md:px-6 md:pt-5">
        <HomeHeroCarousel />
      </div>

      <HotDealsSlider promotions={availablePromotions} onUse={usePromotion} />

      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 pb-28 md:px-6 lg:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[180px_minmax(0,1fr)_300px] xl:pb-8">
        <CategorySidebar active={category} counts={counts} onChange={setCategory} categories={categories} />

        <main id="menu-section" className="flex min-w-0 scroll-mt-24 flex-col gap-4">
          <CategoryChips active={category} counts={counts} onChange={setCategory} categories={categories} />
          <ProductSection
            products={visibleProducts}
            sort={sort}
            onSortChange={setSort}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onAdd={setCustomizing}
            query={query.trim()}
            noProductsMessage={
              category === 'favorites' &&
              allMenuProducts.every((product) => !favorites.has(product.id))
                ? 'Bạn chưa lưu món yêu thích nào. Hãy thả tim món bạn thích nhé!'
                : undefined
            }
            onResetFilters={() => {
              setQuery('')
              setCategory('all')
            }}
          />
        </main>

        <BestsellerPanel products={availableProducts} onCustomize={setCustomizing} />
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
        item={editingCartItem}
        onClose={() => {
          setCustomizing(null)
          setEditingCartItem(null)
        }}
        onConfirm={(item) => {
          if (editingCartItem) {
            dispatchCart({ type: 'edit', key: editingCartItem.key, item })
          } else {
            dispatchCart({ type: 'add', item })
          }
          setCustomizing(null)
          setEditingCartItem(null)
          showToast('Đã thêm vào giỏ hàng')
        }}
      />

      <CheckoutDialog
      open={checkoutOpen}
      onClose={() => setCheckoutOpen(false)}
      items={cart}
      defaultName={profile?.name}
      defaultPhone={profile?.phone}
      customerId={session?.id}
      customerEmail={session?.email}
      promotions={availablePromotions}
      selectedPromotionId={selectedPromotionId}
      onSelectPromotion={setSelectedPromotionId}
      onEditCart={() => setCartOpen(true)}
      onProceedToPayment={async (orderData) => {
        setCheckoutOpen(false)
        try {
        const order = await placeOrder(orderData)
        paymentCartItems.current = cart
        preserveCartOnPayment.current = false
        paymentItemsRestored.current = false
        if (selectedPromotion) {
          void adminApi.promotions()
            .then((remotePromotions) => promotionStore.set(remotePromotions))
            .catch((error: unknown) => showToast(error instanceof Error ? error.message : 'Không cập nhật được lượt dùng mã.'))
        }
        setSelectedPromotionId('')
        dispatchCart({ type: 'clear' })
        setPaymentOrder(order)
        } catch (error) {
          showToast(error instanceof Error ? error.message : 'Không thể tạo đơn hàng.')
        }
      }}
    />
    {paymentOrder && (
      <MockPaymentModal
        order={paymentOrder}
        onClose={() => {
          router.push(`/orders/${encodeURIComponent(paymentOrder.code)}`)
          setPaymentOrder(null)
        }}
        onFailure={async (order) => {
          const items = paymentCartItems.current.length > 0
            ? paymentCartItems.current
            : orderToCartItems(order)
          if (preserveCartOnPayment.current) {
            if (!paymentItemsRestored.current) restoreCartItems(items)
          } else {
            dispatchCart({ type: 'replace', items })
          }
          paymentItemsRestored.current = true
          paymentCartItems.current = items
          const cancelled = await cancelOrderPayment(order)
          setPaymentOrder(cancelled)
          showToast('Thanh toán thất bại. Món đã được giữ lại trong giỏ hàng.')
          return cancelled
        }}
        onRetry={async (order) => {
          const items = paymentCartItems.current.length > 0
            ? paymentCartItems.current
            : orderToCartItems(order)
          const resumed = await resumeOrderPayment(order, session?.email, session?.id)
          paymentCartItems.current = items
          setPaymentOrder(resumed)
          return resumed
        }}
        onSuccess={async (method: PaymentMethod) => {
          try {
            const order = await confirmOrderPayment(paymentOrder.code, method, paymentOrder.total)
            if (paymentItemsRestored.current) removeCartItems(paymentCartItems.current)
            paymentCartItems.current = []
            preserveCartOnPayment.current = false
            paymentItemsRestored.current = false
            setPaymentOrder(null)
            if (order) router.push(`/orders/${encodeURIComponent(order.code)}`)
          } catch (error) {
            showToast(error instanceof Error ? error.message : 'Không thể xác nhận thanh toán.')
          }
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
