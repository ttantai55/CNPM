'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Bell, ChevronDown, Clock3, Coffee, History, LogOut, Search, ShoppingBag, UserRound, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatPrice } from '@/lib/menu'
import { fromApiOrder, orderStore, STATUS_LABEL, type Order } from '@/lib/orders'
import { notificationStore } from '@/lib/notifications'
import { ordersApi } from '@/lib/api'
import { Modal } from './modal'

export type User = { name: string; displayName?: string; email: string; avatarUrl?: string }

type AppHeaderProps = {
  query: string
  onQueryChange: (value: string) => void
  user: User | null
  onOpenAuth: () => void
  onOpenProfile: () => void
  latestOrderCode?: string
  activeOrderCount: number
  customerOrders: Order[]
  onResumePayment: (order: Order) => void
  onLogout: () => void
  cartCount: number
  onOpenCart: () => void
}

export function AppHeader({
  query,
  onQueryChange,
  user,
  onOpenAuth,
  onOpenProfile,
  latestOrderCode,
  activeOrderCount,
  customerOrders,
  onResumePayment,
  onLogout,
  cartCount,
  onOpenCart,
}: AppHeaderProps) {
  const router = useRouter()
  const notifications = notificationStore.useStore()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const unread = notifications.filter((notification) => !notification.isRead).length
  const [accountMenuOpen, setAccountMenuOpen] = useState(false)
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false)
  const [detailOrder, setDetailOrder] = useState<Order | null>(null)
  const [detailError, setDetailError] = useState('')
  const displayName = user?.displayName?.trim() || user?.name || 'Khách hàng'

  async function openNotificationOrder(orderCode?: string) {
    if (!orderCode) return
    setNotificationsOpen(false)
    setDetailError('')
    const storedOrder = customerOrders.find((order) => order.code === orderCode)
      ?? orderStore.get().find((order) => order.code === orderCode)
    if (storedOrder) {
      setDetailOrder(storedOrder)
      return
    }
    try {
      const order = fromApiOrder(await ordersApi.get(orderCode))
      orderStore.set((orders) => [order, ...orders.filter((entry) => entry.code !== order.code)])
      setDetailOrder(order)
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : 'Không thể tải chi tiết đơn hàng.')
    }
  }

  function toggleNotifications() {
    const opening = !notificationsOpen
    setNotificationsOpen(opening)
    if (opening) notificationStore.set((items) => items.map((item) => ({ ...item, isRead: true })))
    setAccountMenuOpen(false)
  }

  function handleAccountClick() {
    setNotificationsOpen(false)
    if (!user) {
      onOpenAuth()
      return
    }
    setAccountMenuOpen((open) => !open)
  }

  const searchField = (id: string, className?: string) => (
    <form
      role="search"
      onSubmit={(event) => event.preventDefault()}
      className={cn('relative', className)}
    >
      <label htmlFor={id} className="sr-only">
        Tìm kiếm thức uống
      </label>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        placeholder="Tìm kiếm cà phê, trà sữa, nước ép..."
        className="h-10 w-full rounded-xl border border-input bg-muted/60 pl-10 pr-9 text-sm text-foreground placeholder:text-muted-foreground focus:border-caramel focus:bg-card focus:outline-none focus:ring-2 focus:ring-caramel/30 [&::-webkit-search-cancel-button]:hidden"
      />
      {query && (
        <button
          type="button"
          onClick={() => onQueryChange('')}
          className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-muted"
        >
          <X className="size-3.5" aria-hidden="true" />
          <span className="sr-only">Xóa từ khóa</span>
        </button>
      )}
    </form>
  )

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 md:h-[68px] md:gap-6 md:px-6">
        <a href="/" className="flex shrink-0 items-center gap-2.5" aria-label="BrewLite trang chủ">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Coffee className="size-5" aria-hidden="true" />
          </span>
          <span className="hidden flex-col leading-none sm:flex">
            <span className="text-lg font-bold tracking-tight text-primary">
              Brew<span className="text-caramel">Lite</span>
            </span>
            <span className="mt-1 text-[9px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Mỗi ngày một vị ngon
            </span>
          </span>
        </a>

        {searchField('search-desktop', 'hidden max-w-md flex-1 md:block')}

        <div className="ml-auto flex items-center gap-2">
          <div className="relative">
            <button
              type="button"
              onClick={toggleNotifications}
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              className="relative flex size-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
            >
              <Bell className="size-[18px]" aria-hidden="true" />
              {unread > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
              )}
              <span className="sr-only">
                Thông báo{unread > 0 ? `, ${unread} chưa đọc` : ''}
              </span>
            </button>
            {notificationsOpen && (
              <div className="absolute right-0 top-12 w-72 rounded-2xl border border-border bg-popover p-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  THÔNG BÁO
                </p>
                <ul className="flex flex-col">
                  {notifications.slice(0, 5).map((notification) => (
                    <li key={notification.id}>
                      <button
                        type="button"
                        onClick={() => void openNotificationOrder(notification.orderCode)}
                        disabled={!notification.orderCode}
                        className="w-full rounded-xl px-3 py-2.5 text-left transition hover:bg-muted disabled:cursor-default"
                      >
                        <p className="text-sm font-semibold text-foreground">{notification.title}</p>
                        <p className="text-xs leading-relaxed text-muted-foreground">{notification.body}</p>
                        <time className="mt-1 block text-[10px] text-muted-foreground">
                          {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(notification.createdAt)}
                        </time>
                      </button>
                    </li>
                  ))}
                  {notifications.length === 0 && (
                    <li className="px-3 py-5 text-center text-xs text-muted-foreground">Chưa có thông báo mới.</li>
                  )}
                </ul>
              </div>
            )}
          </div>

          <button
            type="button"
            disabled={!latestOrderCode}
            onClick={() => latestOrderCode && router.push(`/orders/${encodeURIComponent(latestOrderCode)}`)}
            aria-label={`Theo dõi đơn hàng${activeOrderCount ? `, ${activeOrderCount} đơn đang xử lý` : ''}`}
            className="relative flex size-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clock3 className="size-[18px]" aria-hidden="true" />
            {activeOrderCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white ring-2 ring-card">
                {activeOrderCount}
              </span>
            )}
            <span className="sr-only">Theo dõi đơn hàng</span>
          </button>

          <button
            type="button"
            onClick={onOpenCart}
            className="relative flex size-10 items-center justify-center rounded-xl border border-border text-foreground transition-colors hover:bg-muted"
          >
            <ShoppingBag className="size-[18px]" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground ring-2 ring-card">
                {cartCount}
              </span>
            )}
            <span className="sr-only">Mở giỏ hàng, {cartCount} món</span>
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={handleAccountClick}
              aria-expanded={user ? accountMenuOpen : undefined}
              className="flex h-10 items-center gap-2.5 rounded-xl border border-border px-1.5 transition-colors hover:bg-muted sm:pr-3"
            >
              <span className="flex size-7 items-center justify-center overflow-hidden rounded-full border-2 border-foreground/70 text-foreground">
                {user?.avatarUrl ? (
                  <Image src={user.avatarUrl} alt="" width={28} height={28} unoptimized className="size-full object-cover" />
                ) : (
                  <UserRound className="size-4" aria-hidden="true" />
                )}
              </span>
              <span className="hidden flex-col text-left leading-tight sm:flex">
                <span className="max-w-32 truncate text-xs font-semibold text-foreground">
                  {displayName}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {user ? 'Thành viên BrewLite' : 'Đăng nhập / Đăng ký'}
                </span>
              </span>
              <ChevronDown className="hidden size-4 text-muted-foreground sm:block" aria-hidden="true" />
              <span className="sr-only sm:hidden">{user ? 'Tài khoản' : 'Đăng nhập hoặc đăng ký'}</span>
            </button>
            {user && accountMenuOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl border border-border bg-popover p-2 shadow-lg animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2">
                  <p className="truncate text-sm font-semibold text-foreground">{displayName}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false)
                    onOpenProfile()
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <UserRound className="size-4" aria-hidden="true" />
                  Hồ sơ của tôi
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false)
                    setOrderHistoryOpen(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-foreground hover:bg-muted"
                >
                  <History className="size-4" aria-hidden="true" />
                  Lịch sử đơn hàng
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAccountMenuOpen(false)
                    setLogoutConfirmOpen(true)
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm text-destructive hover:bg-muted"
                >
                  <LogOut className="size-4" aria-hidden="true" />
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">{searchField('search-mobile')}</div>
    </header>
    <Modal
      open={logoutConfirmOpen}
      onClose={() => setLogoutConfirmOpen(false)}
      title="Xác nhận đăng xuất"
      description="Bạn có chắc muốn đăng xuất không ?"
      className="p-5"
    >
      <div className="flex justify-end gap-2 px-5 pb-5">
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(false)}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold text-foreground transition hover:bg-muted"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={() => {
            setLogoutConfirmOpen(false)
            onLogout()
          }}
          className="rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-destructive/90"
        >
          Xác nhận đăng xuất
        </button>
      </div>
    </Modal>
    <Modal
      open={detailOrder !== null}
      onClose={() => setDetailOrder(null)}
      title={`Chi tiết đơn hàng #${detailOrder?.code ?? ''}`}
      description="Thông tin món đã đặt và thanh toán"
      className="max-h-[85dvh]"
    >
      {detailOrder && (
        <div className="overflow-y-auto px-5 py-4">
          <ul className="divide-y divide-border">
            {detailOrder.lines.map((line, index) => (
              <li key={`${line.productId}-${index}`} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm font-semibold text-foreground">{line.quantity}× {line.name}</p>
                  <span className="shrink-0 text-sm font-semibold text-primary">
                    {formatPrice(line.unitPrice * line.quantity)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Đơn giá {formatPrice(line.unitPrice)} · Size {line.size} · {line.sugar} đường · {line.ice}
                  {line.toppings.length > 0 ? ` · ${line.toppings.join(', ')}` : ''}
                </p>
                {line.note && <p className="mt-1 text-xs text-muted-foreground">Ghi chú: {line.note}</p>}
              </li>
            ))}
          </ul>
          <div className="mt-2 flex justify-between border-t border-border pt-4 text-sm">
            <span className="font-semibold text-foreground">Tổng thanh toán</span>
            <span className="text-lg font-bold text-primary">{formatPrice(detailOrder.total)}</span>
          </div>
        </div>
      )}
    </Modal>
    {detailError && (
      <p role="alert" className="fixed bottom-5 left-1/2 z-[70] -translate-x-1/2 rounded-xl bg-destructive px-4 py-3 text-sm text-white shadow-lg">
        {detailError}
      </p>
    )}
    <Modal
      open={orderHistoryOpen}
      onClose={() => setOrderHistoryOpen(false)}
      title="Lịch sử đơn hàng"
      description="Các đơn hàng bạn đã đặt tại BrewLite"
      className="max-h-[85dvh]"
    >
      <div className="overflow-y-auto px-5 py-4">
        {customerOrders.length === 0 ? (
          <div className="py-10 text-center">
            <ShoppingBag className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 text-sm font-semibold text-foreground">Bạn chưa có đơn hàng nào</p>
            <p className="mt-1 text-xs text-muted-foreground">Đơn hàng đã đặt sẽ xuất hiện tại đây.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {customerOrders.map((order) => (
              <li key={order.code} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-bold text-foreground">#{order.code}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(order.createdAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-secondary px-2.5 py-1 text-[10px] font-semibold text-primary">
                    {STATUS_LABEL[order.status]}
                  </span>
                </div>
                <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                  {order.lines.map((line) => `${line.quantity}× ${line.name}`).join(', ')}
                </p>
                <div className="mt-3 flex items-center justify-between gap-3 border-t border-border pt-3">
                  <span className="text-sm font-bold text-foreground">{formatPrice(order.total)}</span>
                  <div className="flex flex-wrap justify-end gap-2">
                    {order.status === 'PENDING' && (
                      <button
                        type="button"
                        onClick={() => {
                          setOrderHistoryOpen(false)
                          onResumePayment(order)
                        }}
                        className="rounded-lg bg-[#c0793d] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#a96834]"
                      >
                        Tiếp tục thanh toán
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setOrderHistoryOpen(false)
                        router.push(`/orders/${encodeURIComponent(order.code)}`)
                      }}
                      className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90"
                    >
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Modal>
    </>
  )
}
