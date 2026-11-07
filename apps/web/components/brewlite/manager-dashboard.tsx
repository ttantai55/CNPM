'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Boxes,
  Check,
  ChevronRight,
  CircleDollarSign,
  Coffee,
  LayoutDashboard,
  PackageCheck,
  Percent,
  Plus,
  Pencil,
  Trash2,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  TrendingUp,
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
  CATEGORY_LABELS,
  deleteProduct,
  formatPrice,
  menuProductStore,
  normalizeMenuProducts,
  updateProduct,
  type CategoryId,
  type Product,
} from '@/lib/menu'
import { inventoryStore, isLowStock, orderStore, setAvailability } from '@/lib/orders'
import { RawMaterialInventory } from './raw-material-inventory'
import { DashboardHeader, RoleGuard } from './role-shell'

const HOURLY_REVENUE = [
  { hour: '08:00', revenue: 420000 },
  { hour: '09:00', revenue: 610000 },
  { hour: '10:00', revenue: 480000 },
  { hour: '11:00', revenue: 920000 },
  { hour: '12:00', revenue: 1280000 },
  { hour: '13:00', revenue: 1040000 },
  { hour: '14:00', revenue: 790000 },
  { hour: '15:00', revenue: 1160000 },
  { hour: '16:00', revenue: 1480000 },
  { hour: '17:00', revenue: 1310000 },
  { hour: '18:00', revenue: 1820000 },
  { hour: '19:00', revenue: 1540000 },
]

const NAV_ITEMS = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'inventory', label: 'Quản lý Menu', icon: Boxes },
  { id: 'raw-materials', label: 'Quản lý kho nguyên liệu', icon: PackageCheck },
  { id: 'revenue', label: 'Báo cáo Doanh thu', icon: BarChart3 },
  { id: 'promotions', label: 'Cấu hình Khuyến mãi', icon: Percent },
] as const

const categoryNames: Record<CategoryId, string> = CATEGORY_LABELS

function ManagerContent() {
  const orders = orderStore.useStore()
  const inventory = inventoryStore.useStore()
  const [activeNav, setActiveNav] = useState<(typeof NAV_ITEMS)[number]['id']>('overview')
  const [search, setSearch] = useState('')
  const [promotionEnabled, setPromotionEnabled] = useState(true)
  const [promotionNotice, setPromotionNotice] = useState('')

  const productsList = menuProductStore.useStore()

  useEffect(() => {
    const normalized = normalizeMenuProducts(productsList)
    if (JSON.stringify(normalized) !== JSON.stringify(productsList)) {
      menuProductStore.set(normalized)
    }
  }, [productsList])

  // State cho Modal Thêm / Chỉnh sửa món
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState<{
    name: string
    description: string
    category: Exclude<CategoryId, 'all'>
    price: number
  }>({
    name: '',
    description: '',
    category: 'coffee',
    price: 45000,
  })
  const [formError, setFormError] = useState('')

  // State cho Modal Xác nhận xóa
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)
  const todaysOrders = orders.filter((order) => order.createdAt >= todayStart.getTime())
  const revenueToday = todaysOrders
    .filter((order) => order.status !== 'CANCELLED')
    .reduce((sum, order) => sum + order.total, 0)
  const completedCount = todaysOrders.filter((order) => order.status === 'COMPLETED').length
  const cancelledCount = todaysOrders.filter((order) => order.status === 'CANCELLED').length
  const lowStockCount = productsList.filter((product) => isLowStock(inventory[product.id])).length

  const visibleProducts = useMemo(
    () =>
      productsList.filter((product) =>
        `${product.name} ${categoryNames[product.category] ?? ''}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [productsList, search],
  )

  function navigateTo(id: (typeof NAV_ITEMS)[number]['id']) {
    setActiveNav(id)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  // Mở form thêm món mới
  const handleOpenAdd = () => {
    setEditingProduct(null)
    setFormData({ name: '', description: '', category: 'coffee', price: 45000 })
    setFormError('')
    setIsFormOpen(true)
  }

  // Mở form chỉnh sửa món
  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description ?? '',
      category: product.category,
      price: product.price,
    })
    setFormError('')
    setIsFormOpen(true)
  }

  // Lưu món (Thêm hoặc Sửa)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault()
    const name = formData.name.trim()
    const description = formData.description.trim()
    const price = Number(formData.price)
    if (!name || !description || !Number.isFinite(price) || price < 1000) {
      setFormError('Vui lòng nhập tên, mô tả và giá bán hợp lệ (tối thiểu 1.000 đ).')
      return
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, { name, description, category: formData.category, price })
    } else {
      const newId = addProduct({
        name,
        description,
        category: formData.category,
        price,
        inStock: true,
        popular: false,
        rating: 5,
        image: '/images/cold-brew.png',
      })
      setAvailability(newId, true)
    }

    setIsFormOpen(false)
    setFormError('')
  }

  // Xác nhận xóa món
  const handleConfirmDelete = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id)
      setDeletingProduct(null)
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
            <div id="overview" className="scroll-mt-5 flex items-end justify-between">
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
              <button className="flex h-9 items-center gap-2 rounded-lg border border-[#e5eae5] bg-white px-3 text-[11px] font-medium text-[#68766d]">
                <SlidersHorizontal className="size-3.5" /> Hôm nay{' '}
                <ChevronRight className="size-3 rotate-90" />
              </button>
            </div>

            <section className="mt-6 grid grid-cols-2 gap-3 xl:grid-cols-4">
              <KpiCard
                label="Doanh thu hôm nay"
                value={formatPrice(revenueToday)}
                note="+12,8% so với hôm qua"
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
                label="Món cần lưu ý"
                value={String(lowStockCount)}
                note="Số món đang tạm tắt bán"
                icon={AlertTriangle}
                trend="down"
                tone="amber"
              />
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
                      HÔM NAY
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-[#99a39c]">
                    Doanh thu trong ngày · cập nhật tự động
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-semibold text-[#5b8b68]">
                  <TrendingUp className="size-3.5" /> +12,8%
                </span>
              </div>
              <div className="mt-5 h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={HOURLY_REVENUE}
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
                      const stock = inventory[product.id] ?? { stock: 0, available: false }
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
                                  stock.available ? 'text-[#5f8a68]' : 'text-[#9b7771]'
                                }`}
                              >
                                {stock.available ? 'Đang bán' : 'Tạm tắt'}
                              </span>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={stock.available}
                                aria-label={`${
                                  stock.available ? 'Tắt bán món' : 'Mở bán món'
                                }: ${product.name}`}
                                onClick={() => setAvailability(product.id, !stock.available)}
                                className={`relative h-[21px] w-[38px] rounded-full transition-colors ${
                                  stock.available ? 'bg-[#548565]' : 'bg-[#c6ceca]'
                                }`}
                              >
                                <span
                                  className={`absolute top-[3px] size-[15px] rounded-full bg-white shadow-sm transition-all ${
                                    stock.available ? 'left-[20px]' : 'left-[3px]'
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

            <section
              id="promotions"
              className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-[#f7f1e7] text-[#ad7b44]">
                    <Percent className="size-5" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-[#354a3c]">Cấu hình Khuyến mãi</h2>
                    <p className="mt-1 text-[11px] text-[#99a39c]">
                      Ưu đãi đang áp dụng cho khách hàng BrewLite
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setPromotionEnabled((enabled) => !enabled)}
                  className={`rounded-lg px-3 py-2 text-[10px] font-semibold ${
                    promotionEnabled
                      ? 'bg-[#edf4ef] text-[#4c7b5d]'
                      : 'bg-[#f3f4f3] text-[#79847c]'
                  }`}
                >
                  {promotionEnabled ? 'Đang bật' : 'Đang tắt'}
                </button>
              </div>
              <div className="mt-4 flex items-center justify-between rounded-xl border border-[#f0eee8] bg-[#fcfbf8] px-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-[#5e584d]">
                    Ưu đãi giờ vàng · Giảm 20%
                  </p>
                  <p className="mt-1 text-[10px] text-[#9b9589]">
                    Áp dụng cho đơn từ 2 thức uống, đến hết hôm nay
                  </p>
                </div>
                <button
                  onClick={() => setPromotionNotice('Đã lưu cấu hình khuyến mãi demo.')}
                  className="rounded-lg border border-[#e8e3d8] bg-white px-3 py-2 text-[10px] font-semibold text-[#857352] hover:bg-[#faf8f3]"
                >
                  Lưu cấu hình
                </button>
              </div>
              {promotionNotice && (
                <p role="status" className="mt-2 text-[10px] text-[#578263]">
                  {promotionNotice}
                </p>
              )}
            </section>

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

              <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]"
                  />
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
                    className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]"
                  />
                </div>

                <div>
                  <label htmlFor="product-category" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Danh mục
                  </label>
                  <select
                    id="product-category"
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value as Exclude<CategoryId, 'all'> })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]"
                  >
                    <option value="coffee">Cà phê</option>
                    <option value="milk-tea">Trà sữa</option>
                    <option value="juice">Nước ép</option>
                  </select>
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
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none transition focus:border-[#548565]"
                  />
                </div>

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