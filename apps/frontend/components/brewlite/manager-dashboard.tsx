'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  CalendarDays,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  LayoutDashboard,
  ListTree,
  UsersRound,
  UserRound,
  PackageCheck,
  Percent,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  addProduct,
  categoryStore,
  deleteProduct,
  formatPrice,
  menuProductStore,
  normalizeMenuProducts,
  updateProduct,
  type Product,
  fromApiCategories,
  fromApiProducts,
} from '@/lib/menu'
import { orderStore } from '@/lib/orders'
import { RawMaterialInventory } from './raw-material-inventory'
import { OrdersBoardContent } from './staff-orders-dashboard'
import { PromotionManagement } from './promotion-management'
import { CategoryManagement } from './category-management'
import { StaffManagement } from './staff-management'
import { CustomerManagement } from './customer-management'
import { DashboardHeader, RoleGuard } from './role-shell'
import { publishBatchNotification } from '@/lib/notifications'
import { adminApi, menuApi } from '@/lib/api'
import { FieldError, fieldErrorClass } from './form-field'

function dateInputValue(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getDateRange(preset: 'today' | 'yesterday' | 'last7' | 'custom', customDate: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const start = new Date(today)
  if (preset === 'yesterday') start.setDate(start.getDate() - 1)
  if (preset === 'last7') start.setDate(start.getDate() - 6)
  if (preset === 'custom') {
    const parsed = new Date(`${customDate}T00:00:00`)
    if (customDate && !Number.isNaN(parsed.getTime())) start.setTime(parsed.getTime())
  }
  const end = new Date(start)
  end.setHours(23, 59, 59, 999)
  if (preset === 'last7') end.setTime(today.getTime() + 24 * 60 * 60 * 1000 - 1)
  return { start: start.getTime(), end: end.getTime() }
}

const NAV_ITEMS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'orders', label: 'Quản lý đơn hàng', icon: ShoppingBag },
  { id: 'inventory', label: 'Quản lý Menu', icon: Boxes },
  { id: 'categories', label: 'Quản lý danh mục', icon: ListTree },
  { id: 'staff', label: 'Quản lý nhân viên', icon: UsersRound },
  { id: 'customers', label: 'Quản lý khách hàng', icon: UserRound },
  { id: 'raw-materials', label: 'Quản lý kho nguyên liệu', icon: PackageCheck },
  { id: 'revenue', label: 'Báo cáo Doanh thu', icon: BarChart3 },
  { id: 'promotions', label: 'Cấu hình Khuyến mãi', icon: Percent },
] as const

function ManagerContent() {
  const orders = orderStore.useStore()
  const categories = categoryStore.useStore()
  const [activeNav, setActiveNav] = useState<(typeof NAV_ITEMS)[number]['id']>('overview')
  const [search, setSearch] = useState('')
  const [datePreset, setDatePreset] = useState<'today' | 'yesterday' | 'last7' | 'custom'>('today')
  const [customDate, setCustomDate] = useState(() => dateInputValue(new Date()))
  const [revenueReport, setRevenueReport] = useState<{ revenue: number; orders: number } | null>(null)
  const [revenueError, setRevenueError] = useState('')

  const productsList = menuProductStore.useStore()
  const dateBounds = getDateRange(datePreset, customDate)

  useEffect(() => {
    const normalized = normalizeMenuProducts(productsList)
    if (JSON.stringify(normalized) !== JSON.stringify(productsList)) {
      menuProductStore.set(normalized)
    }
  }, [productsList])

  useEffect(() => {
    let active = true
    Promise.all([menuApi.products(), menuApi.categories()])
      .then(([products, remoteCategories]) => {
        if (!active) return
        menuProductStore.set(fromApiProducts(products))
        categoryStore.set(fromApiCategories(remoteCategories))
      })
      .catch((cause: unknown) => console.error('Unable to load menu data', cause))
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    const from = dateInputValue(new Date(dateBounds.start))
    const to = dateInputValue(new Date(dateBounds.end))
    setRevenueError('')
    adminApi.revenue(from, to)
      .then((report) => {
        if (active) setRevenueReport(report)
      })
      .catch((cause: unknown) => {
        if (active) setRevenueError(cause instanceof Error ? cause.message : 'Không tải được báo cáo doanh thu.')
      })
    return () => { active = false }
  }, [dateBounds.end, dateBounds.start])

  // State cho Modal Thêm / Chỉnh sửa món
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    category: string
    price: number
    image: string
  }>({
    name: '',
    description: '',
    category: 'coffee',
    price: 45000,
    image: '',
  })
  const [formError, setFormError] = useState('')
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; description?: string; category?: string; price?: string }>({})
  const [notifyCustomers, setNotifyCustomers] = useState(false)

  // State cho Modal Xác nhận xóa
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const selectedOrders = useMemo(
    () => orders.filter((order) => order.createdAt >= dateBounds.start && order.createdAt <= dateBounds.end),
    [dateBounds.end, dateBounds.start, orders],
  )
  const revenueSelected = revenueReport?.revenue ?? 0
  const completedCount = selectedOrders.filter((order) => order.status === 'COMPLETED').length
  const cancelledCount = selectedOrders.filter((order) => order.status === 'CANCELLED').length
  const hourlyRevenue = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        hour: `${String(hour).padStart(2, '0')}:00`,
        revenue: selectedOrders
          .filter(
            (order) =>
              order.createdAt >= dateBounds.start &&
              order.createdAt <= dateBounds.end &&
              new Date(order.createdAt).getHours() === hour &&
              order.status === 'COMPLETED',
          )
          .reduce((sum, order) => sum + order.total, 0),
      })),
    [dateBounds.end, dateBounds.start, selectedOrders],
  )
  const selectedDateLabel =
    datePreset === 'today' ? 'Hôm nay'
      : datePreset === 'yesterday' ? 'Hôm qua'
        : datePreset === 'last7' ? '7 ngày qua'
          : new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(new Date(`${customDate}T00:00:00`))
  const disabledProductCount = productsList.filter((product) => !product.status).length

  const categoryNames = useMemo(
    () => Object.fromEntries(categories.map((category) => [category.id, category.name])),
    [categories],
  )
  const visibleProducts = useMemo(
    () =>
      productsList.filter((product) =>
        `${product.name} ${categoryNames[product.category] ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [categories, productsList, search],
  )

  function navigateTo(id: (typeof NAV_ITEMS)[number]['id']) {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Mở form thêm món mới
  const handleOpenAdd = () => {
    setEditingProduct(null)
    setNotifyCustomers(false)
    setFormData({ name: '', description: '', category: categories[0]?.id ?? '', price: 45000, image: '' })
    setFormError('')
    setFieldErrors({})
    setIsFormOpen(true)
  }

  // Mở form chỉnh sửa món
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setNotifyCustomers(false)
    setFormData({
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      price: product.price,
      image: product.imageUrl,
    })
    setFormError('')
    setFieldErrors({})
    setIsFormOpen(true)
  }

  // Lưu món (Thêm hoặc Sửa)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const description = formData.description.trim()
    const price = Number(formData.price)
    const errors = {
      name: name ? '' : 'Vui lòng nhập tên thức uống.',
      description: description ? '' : 'Vui lòng nhập mô tả.',
      category: formData.category ? '' : 'Vui lòng chọn danh mục.',
      price: Number.isFinite(price) && price >= 1000 ? '' : 'Giá bán phải từ 1.000 đ trở lên.',
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) {
      return
    }

    try {
      const isNewProduct = !editingProduct
      if (editingProduct) {
      const image = formData.image.trim()
      await updateProduct(editingProduct.id, {
        name,
        description,
        category: formData.category,
        price,
        ...(image ? { imageUrl: image } : {}),
      })
      } else {
        await addProduct({
        name,
        description,
        category: formData.category,
        price,
        status: true,
        popular: false,
        rating: 5,
        weeklySalesCount: 0,
        imageUrl: formData.image.trim() || '/images/cold-brew.png',
      })
      }

      if (isNewProduct && notifyCustomers) publishBatchNotification('món', 1)
      setIsFormOpen(false)
      setFormError('')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Không thể lưu sản phẩm.')
    }
  }

  // Xác nhận xóa món
  const handleConfirmDelete = () => {
    if (deletingProduct) {
      void deleteProduct(deletingProduct.id)
        .then(() => setDeletingProduct(null))
        .catch((error: unknown) => setFormError(error instanceof Error ? error.message : 'Không thể xóa sản phẩm.'))
    }
  }

  return (
    <RoleGuard role="MANAGER">
      <div className="min-h-dvh bg-[#f7f8f6]">
        <DashboardHeader role="MANAGER" title="Management dashboard" />
        <div className="mx-auto flex max-w-[1600px]">
          <aside className="sticky top-0 hidden h-[calc(100dvh-76px)] w-[248px] shrink-0 flex-col border-r border-[#e7ece7] bg-white px-4 py-6 lg:flex">
            <p className="px-3 text-[10px] font-bold uppercase tracking-[0.17em] text-[#a2aba5]">
              Quản lý cửa hàng
            </p>
            <nav className="mt-4 space-y-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-medium transition ${
                      activeNav === item.id
                        ? 'bg-[#edf4ef] text-[#285b4b]'
                        : 'text-[#758179] hover:bg-[#f6f8f6] hover:text-[#3e5848]'
                    }`}
                  >
                    <Icon className="size-[17px]" />
                    {item.label}
                    {activeNav === item.id && <ChevronRight className="ml-auto size-3.5" />}
                  </button>
                )
              })}
            </nav>
            <div className="mt-auto rounded-2xl bg-[#f5f7f3] p-4">
              <div className="flex items-center gap-2 text-[#47785b]">
                <PackageCheck className="size-4" />
                <span className="text-[11px] font-semibold">Cửa hàng đang hoạt động</span>
              </div>
              <p className="mt-2 text-[10px] leading-5 text-[#8a958d]">
                Dữ liệu đơn hàng và thực đơn được cập nhật theo thời gian thực.
              </p>
            </div>
          </aside>

          <main className="min-w-0 flex-1 px-6 py-7 xl:px-9">
            <div id="overview" className="scroll-mt-5 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs text-[#99a39c]">
                  {new Intl.DateTimeFormat('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                  }).format(new Date())}{' '}
                  · Cửa hàng Quận 1
                </p>
                <h1 className="mt-1.5 text-[26px] font-semibold tracking-tight text-[#263d32]">
                  Tổng quan cửa hàng
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="size-4 text-[#718078]" />
                <select
                  aria-label="Khoảng thời gian tổng quan"
                  value={datePreset}
                  onChange={(event) => setDatePreset(event.target.value as typeof datePreset)}
                  className="h-9 rounded-lg border border-[#e5eae5] bg-white px-3 text-[11px] font-medium text-[#68766d]"
                >
                  <option value="today">Hôm nay</option>
                  <option value="yesterday">Hôm qua</option>
                  <option value="last7">7 ngày qua</option>
                  <option value="custom">Ngày tùy chọn</option>
                </select>
                {datePreset === 'custom' && (
                  <input
                    type="date"
                    aria-label="Chọn ngày"
                    value={customDate}
                    onChange={(event) => setCustomDate(event.target.value)}
                    className="h-9 rounded-lg border border-[#e5eae5] bg-white px-2 text-[11px] text-[#68766d]"
                  />
                )}
              </div>
            </div>

            <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <KpiCard
                label={`Doanh thu · ${selectedDateLabel}`}
                value={revenueReport ? formatPrice(revenueSelected) : '—'}
                note={revenueError || `${revenueReport?.orders ?? 0} đơn hoàn tất trong khoảng đã chọn`}
                icon={CircleDollarSign}
                trend="up"
                tone="green"
              />
              <KpiCard
                label="Đơn hoàn tất"
                value={String(completedCount)}
                note="Đơn đã giao thành công"
                icon={ShoppingBag}
                trend="up"
                tone="blue"
              />
              <KpiCard
                label="Đơn bị hủy"
                value={String(cancelledCount)}
                note="Trong ngày hôm nay"
                icon={X}
                trend="down"
                tone="red"
              />
              <KpiCard
                label="Món đang tạm tắt"
                value={String(disabledProductCount)}
                note="Số món đang tạm tắt bán"
                icon={AlertTriangle}
                trend="down"
                tone="amber"
              />
            </section>

            <section id="orders" className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white p-4">
              <OrdersBoardContent embedded />
            </section>

            <section
              id="revenue"
              className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white p-5 xl:p-6"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-semibold text-[#354a3c]">Doanh thu theo khung giờ</h2>
                    <span className="rounded-full bg-[#edf4ef] px-2 py-0.5 text-[9px] font-semibold text-[#528161]">
                      {selectedDateLabel.toLocaleUpperCase('vi-VN')}
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#99a39c]">
                    Doanh thu theo giờ tạo đơn trong khoảng đã chọn
                  </p>
                </div>
                <span className="text-[11px] font-semibold text-[#5b8b68]">{formatPrice(revenueSelected)}</span>
              </div>
              <div className="mt-5 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={hourlyRevenue}
                    margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="revenueFill" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor="#73a582" stopOpacity={0.22} />
                        <stop offset="95%" stopColor="#73a582" stopOpacity={0.01} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#eef1ee" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#9aa49c' }}
                      dy={8}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tick={{ fontSize: 10, fill: '#9aa49c' }}
                      tickFormatter={(value: number) =>
                        `${(value / 1000000).toFixed(value >= 1000000 ? 1 : 0)}tr`
                      }
                      width={35}
                    />
                    <Tooltip
                      formatter={(value) => [formatPrice(Number(value)), 'Doanh thu']}
                      contentStyle={{ borderRadius: 12, borderColor: '#e5ebe5', fontSize: 11 }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#548367"
                      strokeWidth={2.5}
                      fill="url(#revenueFill)"
                      activeDot={{ r: 4, fill: '#548367' }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>

            {/* PHẦN QUẢN LÝ MENU */}
            <section
              id="inventory"
              className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white"
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4">
                <div>
                  <h2 className="text-base font-bold text-[#263d32]">Quản lý Menu</h2>
                  <p className="text-xs text-[#8a958d]">
                    Cập nhật danh sách thức uống, giá niêm yết và trạng thái mở bán
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <label className="relative">
                    <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9ba69e]" />
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      aria-label="Tìm kiếm món trong menu"
                      placeholder="Tìm kiếm món..."
                      className="h-9 w-36 rounded-lg border border-[#e8ede8] pl-8 pr-3 text-[11px] outline-none transition focus:border-[#548565] sm:w-44"
                    />
                  </label>
                  <button
                    onClick={handleOpenAdd}
                    className="flex h-9 items-center gap-1.5 rounded-lg bg-[#548565] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#436b51]"
                  >
                    <Plus className="size-3.5" />
                    <span>Thêm món</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left">
                  <thead>
                    <tr className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wide text-[#9aa49c]">
                      <th className="px-5 py-3">Tên món</th>
                      <th className="px-4 py-3">Danh mục</th>
                      <th className="px-4 py-3">Giá bán</th>
                      <th className="px-4 py-3 text-center">Trạng thái</th>
                      <th className="px-5 py-3 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleProducts.map((product) => {
                      const isSelling = product.status
                      return (
                        <tr
                          key={product.id}
                          className="border-t border-[#f0f2f0] transition-colors hover:bg-[#fafbfa]/60"
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <span className="flex size-9 items-center justify-center rounded-lg bg-[#f3f5f2] text-[#63806b]">
                                <Coffee className="size-4" />
                              </span>
                              <span className="text-xs font-semibold text-[#46574c]">
                                {product.name}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-[11px] text-[#78857c]">
                            {categoryNames[product.category] ?? product.category}
                          </td>
                          <td className="px-4 py-3.5 text-xs font-medium text-[#46574c]">
                            {formatPrice(product.price)}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center justify-center gap-2">
                              <span
                                className={`text-[10px] font-medium ${
                                  isSelling ? 'text-[#5f8a68]' : 'text-[#9b7771]'
                                }`}
                              >
                                {isSelling ? 'Đang bán' : 'Tạm tắt'}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={isSelling}
                                aria-label={`${isSelling ? 'Tắt bán món' : 'Mở bán món'}: ${product.name}`}
                                onClick={() => void updateProduct(product.id, { ...product, status: !isSelling }).catch((cause: unknown) =>
                                  window.alert(cause instanceof Error ? cause.message : 'Không thể cập nhật trạng thái món.'))}
                                className={`relative h-[21px] w-[38px] rounded-full transition-colors ${
                                  isSelling ? 'bg-[#548565]' : 'bg-[#c6ceca]'
                                }`}
                              >
                                <span
                                  className={`absolute top-[3px] size-[15px] rounded-full bg-white shadow-sm transition-all ${
                                    isSelling ? 'left-[20px]' : 'left-[3px]'
                                  }`}
                                />
                              </button>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(product)}
                                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium text-[#78857c] transition-colors hover:bg-[#edf4ef] hover:text-[#285b4b]"
                                aria-label={`Chỉnh sửa ${product.name}`}
                              >
                                <Pencil className="size-3.5" />
                                <span>Sửa</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeletingProduct(product)}
                                className="flex items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium text-[#9b7771] transition-colors hover:bg-red-50 hover:text-red-600"
                                aria-label={`Xóa ${product.name}`}
                              >
                                <Trash2 className="size-3.5" />
                                <span>Xóa</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                    {visibleProducts.length === 0 && (
                      <tr>
                        <td
                          colSpan={5}
                          className="px-5 py-10 text-center text-xs text-[#9aa49c]"
                        >
                          Không tìm thấy món phù hợp.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <RawMaterialInventory />

            <CategoryManagement />

            <StaffManagement />

            <CustomerManagement />

            <PromotionManagement />

            <footer className="flex items-center justify-between py-6 text-[10px] text-[#a0aaa3]">
              <span>BrewLite Management · Bản demo</span>
              <span className="flex items-center gap-1">
                <Check className="size-3" /> Dữ liệu đã đồng bộ
              </span>
            </footer>
          </main>
        </div>

        {/* 1. MODAL THÊM / CHỈNH SỬA MÓN */}
        {isFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="product-form-title"
              className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
                <h3 id="product-form-title" className="text-sm font-bold text-[#263d32]">
                  {editingProduct ? 'Chỉnh sửa thức uống' : 'Thêm thức uống mới'}
                </h3>
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  aria-label="Đóng biểu mẫu"
                  className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="size-4" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} noValidate className="mt-4 space-y-4">
                {formError && (
                  <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
                    {formError}
                  </p>
                )}
                <div>
                  <label htmlFor="product-name" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Tên thức uống
                  </label>
                  <input
                    id="product-name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="vd: Cà phê muối, Trà lài thanh long..."
                    aria-invalid={Boolean(fieldErrors.name)}
                    className={fieldErrorClass('w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]', fieldErrors.name)}
                  />
                  <FieldError error={fieldErrors.name} />
                </div>

                <div>
                  <label htmlFor="product-description" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Mô tả
                  </label>
                  <textarea
                    id="product-description"
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Mô tả ngắn về thành phần hoặc hương vị"
                    aria-invalid={Boolean(fieldErrors.description)}
                    className={fieldErrorClass('w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]', fieldErrors.description)}
                  />
                  <FieldError error={fieldErrors.description} />
                </div>

                <div>
                  <label htmlFor="product-category" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Danh mục
                  </label>
                  <select
                    id="product-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    aria-invalid={Boolean(fieldErrors.category)}
                    className={fieldErrorClass('w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]', fieldErrors.category)}
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <FieldError error={fieldErrors.category} />
                </div>

                <div>
                  <label htmlFor="product-price" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Giá bán (VNĐ)
                  </label>
                  <input
                    id="product-price"
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: Number(e.target.value) })
                    }
                    aria-invalid={Boolean(fieldErrors.price)}
                    className={fieldErrorClass('w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]', fieldErrors.price)}
                  />
                  <FieldError error={fieldErrors.price} />
                </div>

                <div>
                  <label htmlFor="product-image" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Đường dẫn ảnh (URL hoặc đường dẫn nội bộ)
                  </label>
                  <input
                    id="product-image"
                    type="text"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="/images/ten-mon.png hoặc https://..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]"
                  />
                </div>

                {!editingProduct && (
                  <label className="flex items-center gap-2 text-xs font-medium text-[#536257]">
                    <input
                      type="checkbox"
                      checked={notifyCustomers}
                      onChange={(event) => setNotifyCustomers(event.target.checked)}
                    />
                    Gửi thông báo đến khách hàng
                  </label>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="rounded-lg bg-[#548565] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#436b51]"
                  >
                    {editingProduct ? 'Lưu cập nhật' : 'Thêm vào Menu'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* 2. MODAL XÁC NHẬN XÓA MÓN */}
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
            <div
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="delete-product-title"
              aria-describedby="delete-product-description"
              className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex items-center gap-3 text-red-600">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-50">
                  <AlertTriangle className="size-5" />
                </div>
                <div>
                  <h3 id="delete-product-title" className="text-sm font-bold text-gray-900">Xóa thức uống này?</h3>
                  <p className="text-[11px] text-gray-500">Thao tác này sẽ gỡ món khỏi thực đơn.</p>
                </div>
              </div>

              <p id="delete-product-description" className="mt-3 text-xs leading-relaxed text-gray-600">
                Bạn có chắc chắn muốn xóa món{' '}
                <span className="font-semibold text-gray-900">
                  "{deletingProduct.name}"
                </span>{' '}
                khỏi danh sách?
              </p>

              <div className="mt-5 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDeletingProduct(null)}
                  className="rounded-lg border border-gray-200 px-3.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  className="rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-red-700"
                >
                  Xác nhận xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </RoleGuard>
  )
}

function KpiCard({
  label,
  value,
  note,
  icon: Icon,
  trend,
  tone,
}: {
  label: string
  value: string
  note: string
  icon: typeof CircleDollarSign
  trend: 'up' | 'down'
  tone: 'green' | 'blue' | 'red' | 'amber'
}) {
  const tones = {
    green: 'bg-[#edf5ef] text-[#4e815d]',
    blue: 'bg-[#edf2f8] text-[#587ca6]',
    red: 'bg-[#fbefed] text-[#b46659]',
    amber: 'bg-[#faf3e9] text-[#ad8146]',
  }
  const Trend = trend === 'up' ? ArrowUpRight : ArrowDownRight
  return (
    <article className="rounded-2xl border border-[#e8ede8] bg-white p-4 xl:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-medium text-[#839087]">{label}</span>
        <span className={`flex size-8 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 text-[22px] font-semibold tracking-tight text-[#304539]">{value}</p>
      <p className="mt-2 flex items-center gap-1 text-[10px] text-[#9aa49c]">
        <Trend className={`size-3 ${trend === 'up' ? 'text-[#68a276]' : 'text-[#c58a65]'}`} />
        {note}
      </p>
    </article>
  )
}

export default function ManagerDashboard() {
  return <ManagerContent />
}