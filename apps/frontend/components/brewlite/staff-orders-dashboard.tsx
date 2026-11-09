'use client'

import { useEffect, useMemo, useState } from 'react'
import { Activity, Archive, ArrowRight, Clock3, Coffee, MapPin, Search, ShoppingBag } from 'lucide-react'
import { CATEGORY_LABELS, type CategoryId } from '@/lib/menu'
import { advanceOrder, archiveCompletedOrders, migrateOrderStatuses, orderStore, PAYMENT_LABEL, refreshOrders, type Order, type OrderStatus } from '@/lib/orders'
import { DashboardHeader, RoleGuard } from './role-shell'
import { Modal } from './modal'

const COLUMNS: { statuses: OrderStatus[]; title: string; tone: string; action?: string }[] = [
  { statuses: ['PENDING', 'CONFIRMED'], title: 'Đơn mới', tone: 'bg-[#eef3fb] text-[#52709e]', action: 'Bắt đầu chuẩn bị' },
  { statuses: ['PREPARING'], title: 'Đang chuẩn bị', tone: 'bg-[#fbf2e7] text-[#a97b40]', action: 'Hoàn tất đơn' },
  { statuses: ['COMPLETED'], title: 'Hoàn tất', tone: 'bg-[#edf5ef] text-[#4f805e]' },
]

const categoryOptions: { value: CategoryId; label: string }[] = [
  { value: 'all', label: 'Tất cả thức uống' },
  { value: 'coffee', label: CATEGORY_LABELS.coffee },
  { value: 'milk-tea', label: CATEGORY_LABELS['milk-tea'] },
  { value: 'juice', label: CATEGORY_LABELS.juice },
]

function OrderCard({ order, action }: { order: Order; action?: string }) {
  const age = Math.max(0, Math.floor((Date.now() - order.createdAt) / 60_000))
  const isUrgent = age >= 15 && order.status !== 'COMPLETED'

  return (
    <article className="rounded-xl border border-[#e9ede9] bg-white p-4 shadow-[0_2px_8px_rgba(27,52,39,0.03)]">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-bold tracking-wide text-[#2c4639]">#{order.code}</p>
          <p className="mt-1 text-[11px] text-[#8b978f]">{order.customerName}</p>
        </div>
        <span className={`flex items-center gap-1 rounded-full px-2 py-1 text-[10px] font-semibold ${isUrgent ? 'bg-[#fff0ed] text-[#bd5c4c]' : 'bg-[#f3f5f3] text-[#718078]'}`}>
          <Clock3 className="size-3" /> {age} phút
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between border-y border-dashed border-[#edf0ed] py-2.5">
        <span className="flex items-center gap-1.5 text-[10px] font-medium text-[#78867d]">
          <ShoppingBag className="size-3.5" /> {order.paymentMethod ? PAYMENT_LABEL[order.paymentMethod] : 'Chưa thanh toán'}
        </span>
        <span className="flex items-center gap-1 text-[10px] font-medium text-[#78867d]">
          <MapPin className="size-3.5" /> Nhận tại quầy
        </span>
      </div>

      <ul className="mt-3 space-y-3">
        {order.lines.map((line, index) => (
          <li key={`${line.productId}-${index}`} className="flex gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-[#f3f6f3] text-[10px] font-bold text-[#557963]">{line.quantity}×</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-[#3d5045]">{line.name}</p>
              <p className="mt-1 text-[10px] leading-[1.65] text-[#8a958e]">
                Size {line.size} · {line.sugar} đường · {line.ice}
                {line.toppings.length > 0 && <> · {line.toppings.join(', ')}</>}
              </p>
            </div>
          </li>
        ))}
      </ul>

      {order.note && <p className="mt-3 rounded-lg bg-[#fbf8f2] px-2.5 py-2 text-[10px] text-[#9b764e]">Ghi chú: {order.note}</p>}
      {action ? (
        <button
          onClick={() => void advanceOrder(order.code).catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'Không thể cập nhật đơn.'))}
          className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#285b4b] text-[11px] font-semibold text-white transition hover:bg-[#204d3f]"
        >
          {action} <ArrowRight className="size-3.5" />
        </button>
      ) : (
        <p className="mt-4 rounded-lg bg-[#f3f7f3] px-3 py-2 text-center text-[11px] font-semibold text-[#53785d]">
          {order.status === 'PENDING' ? 'Chờ thanh toán' : 'Mời khách nhận món tại quầy'}
        </p>
      )}
    </article>
  )
}

function OrdersBoard() {
  const orders = orderStore.useStore()
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<CategoryId>('all')
  const [historyOpen, setHistoryOpen] = useState(false)
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  useEffect(() => {
    void refreshOrders().catch((error: unknown) => window.alert(error instanceof Error ? error.message : 'Không thể tải đơn hàng.'))
    migrateOrderStatuses()
    archiveCompletedOrders()
    const timer = window.setInterval(archiveCompletedOrders, 15_000)
    return () => window.clearInterval(timer)
  }, [])
  const filteredOrders = useMemo(() => {
    const text = query.trim().toLowerCase().replace(/^#/, '')
    return orders.filter((order) => {
      const matchesQuery = !text || order.code.toLowerCase().includes(text) || order.customerName.toLowerCase().includes(text)
      const matchesCategory = category === 'all' || order.lines.some((line) => line.category === category)
      return matchesQuery && matchesCategory && !order.isArchived
    })
  }, [category, orders, query])
  const completedOrders = useMemo(() => {
    const from = dateFrom ? new Date(`${dateFrom}T00:00:00`).getTime() : 0
    const to = dateTo ? new Date(`${dateTo}T23:59:59.999`).getTime() : Number.POSITIVE_INFINITY
    return orders
      .filter(
        (order) =>
          order.status === 'COMPLETED' &&
          order.completedAt >= from &&
          order.completedAt <= to,
      )
      .sort((a, b) => b.completedAt - a.completedAt)
  }, [dateFrom, dateTo, orders])
  const activeOrders = orders.filter((order) => ['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status)).length

  return (
    <RoleGuard role="STAFF">
      <div className="min-h-dvh bg-[#f7f8f6]">
        <DashboardHeader role="STAFF" title="Order management" />
        <main className="mx-auto max-w-[1580px] px-8 py-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-[#96a198]">
                {new Intl.DateTimeFormat('vi-VN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' }).format(new Date())}
              </p>
              <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight text-[#263d32]">Bảng điều khiển quầy</h1>
              <p className="mt-1 text-xs text-[#8a968e]">Theo dõi và cập nhật trạng thái các đơn đang hoạt động.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setHistoryOpen(true)}
                className="flex h-10 items-center gap-2 rounded-xl border border-[#e1e9e2] bg-white px-3 text-xs font-semibold text-[#45634d] transition hover:bg-[#f3f7f3]"
              >
                <Archive className="size-4" /> Lịch sử đơn hoàn tất
              </button>
              <div className="flex items-center gap-2 rounded-full border border-[#dce9df] bg-white px-3 py-2 text-[11px] font-medium text-[#578263]">
                <Activity className="size-3.5" /> <span className="size-1.5 animate-pulse rounded-full bg-[#63a676]" /> Đang đồng bộ
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#e8ede8] bg-white p-3.5">
            <label className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#98a49c]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Tìm mã đơn #ORD-... hoặc tên khách hàng"
                className="h-10 w-full rounded-lg border border-[#e8ede8] bg-[#fbfcfb] pl-9 pr-3 text-xs outline-none focus:border-[#8eaf98]"
              />
            </label>
            <select
              value={category}
              onChange={(event) => setCategory(event.target.value as CategoryId)}
              className="h-10 min-w-48 rounded-lg border border-[#e8ede8] bg-white px-3 text-xs text-[#56665c] outline-none focus:border-[#8eaf98]"
              aria-label="Lọc theo thức uống"
            >
              {categoryOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
            <div className="flex h-10 items-center gap-2 rounded-lg bg-[#f3f7f3] px-3 text-xs font-semibold text-[#53785d]">
              <Coffee className="size-4" /> {activeOrders} đơn đang xử lý
            </div>
          </div>

          <div className="mt-5 grid items-start gap-4 xl:grid-cols-3">
            {COLUMNS.map((column) => {
              const columnOrders = filteredOrders
                .filter((order) => column.statuses.includes(order.status))
                .sort((a, b) => a.createdAt - b.createdAt)
              return (
                <section key={column.title} className="min-w-0 rounded-2xl border border-[#e8ece8] bg-[#f0f3f0] p-3.5">
                  <header className="mb-3 flex items-center justify-between px-1">
                    <span className="flex items-center gap-2 text-xs font-semibold text-[#405349]">
                      <span className={`size-2 rounded-full ${column.statuses.includes('PENDING') ? 'bg-[#7798c4]' : column.statuses.includes('PREPARING') ? 'bg-[#d5a35b]' : 'bg-[#72a27b]'}`} />
                      {column.title}
                    </span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-bold ${column.tone}`}>{columnOrders.length}</span>
                  </header>
                  <div className="space-y-3">
                    {columnOrders.map((order) => (
                      <OrderCard
                        key={order.code}
                        order={order}
                        action={order.status === 'PENDING' || order.status === 'COMPLETED' ? undefined : column.action}
                      />
                    ))}
                    {columnOrders.length === 0 && (
                      <div className="rounded-xl border border-dashed border-[#dce4dd] py-10 text-center text-xs text-[#9ca69f]">Không có đơn hàng</div>
                    )}
                  </div>
                </section>
              )
            })}
          </div>
          <p className="mt-5 text-center text-[10px] text-[#a0aaa3]">Đơn hàng được đồng bộ tức thì trên trình duyệt này và các tab đang mở.</p>
        </main>
      </div>
      <Modal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        title="Lịch sử đơn hoàn tất"
        description="Tra cứu đơn đã hoàn tất và thời gian pha chế"
        className="max-h-[88dvh]"
      >
        <div className="flex flex-wrap gap-3 border-b border-[#e8ede8] px-5 py-3">
          <label className="flex items-center gap-2 text-xs text-[#56665c]">
            Từ ngày
            <input
              type="date"
              value={dateFrom}
              onChange={(event) => setDateFrom(event.target.value)}
              className="h-9 rounded-lg border border-[#e8ede8] px-2"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-[#56665c]">
            Đến ngày
            <input
              type="date"
              value={dateTo}
              onChange={(event) => setDateTo(event.target.value)}
              className="h-9 rounded-lg border border-[#e8ede8] px-2"
            />
          </label>
        </div>
        <div className="min-h-0 overflow-y-auto px-5 py-3">
          {completedOrders.length === 0 ? (
            <p className="py-10 text-center text-sm text-[#8a968e]">Không có đơn hoàn tất trong khoảng ngày đã chọn.</p>
          ) : (
            <ul className="space-y-2">
              {completedOrders.map((order) => (
                <li key={order.code} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e8ede8] p-3">
                  <div>
                    <p className="text-xs font-bold text-[#354a3c]">#{order.code} · {order.customerName}</p>
                    <p className="mt-1 text-[10px] text-[#89948c]">
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(order.completedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-[#53785d]">Pha chế: {order.preparationTime} phút</p>
                    <p className="mt-1 text-[10px] text-[#89948c]">{order.isArchived ? 'Đã lưu trữ' : 'Mới hoàn tất'}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Modal>
    </RoleGuard>
  )
}

export default function StaffOrdersDashboard() {
  return <OrdersBoard />
}
