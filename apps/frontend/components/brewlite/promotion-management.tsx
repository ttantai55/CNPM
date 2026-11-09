'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertTriangle, Pencil, Plus, Search, Trash2 } from 'lucide-react'
import { formatPrice } from '@/lib/menu'
import { promotionStore, type Promotion } from '@/lib/promotions'
import { publishBatchNotification } from '@/lib/notifications'
import { Modal } from './modal'
import { adminApi } from '@/lib/api'

function emptyPromotion(): Promotion {
  const today = new Date()
  const end = new Date(today)
  end.setDate(end.getDate() + 30)
  const formatDate = (date: Date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  return {
    id: '',
    voucherCode: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 10,
    startDate: formatDate(today),
    endDate: formatDate(end),
    usageLimit: 100,
    usedCount: 0,
    isActive: true,
  }
}

export function PromotionManagement() {
  const promotions = promotionStore.useStore()
  const [search, setSearch] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [form, setForm] = useState<Promotion>(emptyPromotion)
  const [error, setError] = useState('')
  const [notifyCustomers, setNotifyCustomers] = useState(false)
  const [deleting, setDeleting] = useState<Promotion | null>(null)
  useEffect(() => {
    adminApi.promotions().then((items) => promotionStore.set(items))
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Không tải được khuyến mãi.'))
  }, [])
  const visiblePromotions = useMemo(() => {
    const query = search.trim().toLocaleLowerCase()
    return promotions.filter((promotion) =>
      `${promotion.voucherCode} ${promotion.description}`.toLocaleLowerCase().includes(query),
    )
  }, [promotions, search])

  function openAdd() {
    setEditing(null)
    setForm(emptyPromotion())
    setError('')
    setIsFormOpen(true)
    setNotifyCustomers(false)
  }

  function openEdit(promotion: Promotion) {
    setEditing(promotion)
    setForm({ ...promotion })
    setError('')
    setIsFormOpen(true)
    setNotifyCustomers(false)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const voucherCode = form.voucherCode.trim().toUpperCase()
    const duplicate = promotions.some(
      (promotion) =>
        promotion.id !== editing?.id && promotion.voucherCode.toUpperCase() === voucherCode,
    )
    if (!voucherCode || !form.description.trim()) {
      setError('Vui lòng nhập mã và mô tả khuyến mãi.')
      return
    }
    if (duplicate) {
      setError('Mã khuyến mãi đã tồn tại.')
      return
    }
    if (
      !form.startDate ||
      !form.endDate ||
      form.startDate > form.endDate ||
      !Number.isFinite(form.discountValue) ||
      form.discountValue <= 0 ||
      (form.discountType === 'PERCENTAGE' && form.discountValue > 100) ||
      !Number.isInteger(form.usageLimit) ||
      form.usageLimit < 1 ||
      !Number.isInteger(form.usedCount) ||
      form.usedCount < 0 ||
      form.usedCount > form.usageLimit
    ) {
      setError('Vui lòng kiểm tra mức giảm, thời hạn và giới hạn lượt dùng.')
      return
    }
    const value = { ...form, voucherCode, description: form.description.trim() }
    try {
      const saved = editing
        ? await adminApi.updatePromotion(editing.id, value)
        : await adminApi.createPromotion(value)
      promotionStore.set((current) => editing
        ? current.map((promotion) => promotion.id === editing.id ? saved : promotion)
        : [...current, saved])
      if (!editing && notifyCustomers) publishBatchNotification('khuyến mãi', 1)
      setEditing(null)
      setIsFormOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể lưu khuyến mãi.')
    }
  }

  async function toggle(promotion: Promotion) {
    try {
      const saved = await adminApi.updatePromotion(promotion.id, {
        ...promotion,
        isActive: !promotion.isActive,
      })
      promotionStore.set((current) => current.map((item) => item.id === promotion.id ? saved : item))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật khuyến mãi.')
    }
  }

  async function remove() {
    if (!deleting) return
    try {
      await adminApi.deletePromotion(deleting.id)
      promotionStore.set((current) => current.filter((item) => item.id !== deleting.id))
      setDeleting(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể xóa khuyến mãi.')
    }
  }

  const discountLabel = (promotion: Promotion) =>
    promotion.discountType === 'PERCENTAGE'
      ? `${promotion.discountValue}%`
      : formatPrice(promotion.discountValue)

  return (
    <>
      <section
        id="promotions"
        className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#354a3c]">Quản lý Khuyến mãi</h2>
            <p className="mt-1 text-[11px] text-[#99a39c]">Tạo và quản lý mã ưu đãi khách hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9ba69e]" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                aria-label="Tìm mã hoặc mô tả khuyến mãi"
                placeholder="Tìm khuyến mãi..."
                className="h-9 w-40 rounded-lg border border-[#e8ede8] pl-8 pr-3 text-[11px] outline-none focus:border-[#548565]"
              />
            </label>
            <button
              type="button"
              onClick={openAdd}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#548565] px-3 text-xs font-semibold text-white hover:bg-[#436b51]"
            >
              <Plus className="size-3.5" /> Thêm khuyến mãi mới
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wide text-[#9aa49c]">
                <th className="px-5 py-3">Mã / mô tả</th>
                <th className="px-4 py-3">Mức giảm</th>
                <th className="px-4 py-3">Thời hạn</th>
                <th className="px-4 py-3">Lượt dùng</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-5 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f0]">
              {visiblePromotions.map((promotion) => (
                <tr key={promotion.id} className="text-xs text-[#56645a]">
                  <td className="px-5 py-3">
                    <p className="font-bold text-[#354a3c]">{promotion.voucherCode}</p>
                    <p className="mt-1 max-w-xs text-[10px] text-[#89948c]">{promotion.description}</p>
                  </td>
                  <td className="px-4 py-3 font-semibold">{discountLabel(promotion)}</td>
                  <td className="px-4 py-3 text-[10px]">
                    {promotion.startDate} – {promotion.endDate}
                  </td>
                  <td className="px-4 py-3">{promotion.usedCount}/{promotion.usageLimit}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={promotion.isActive}
                      aria-label={`${promotion.isActive ? 'Tắt' : 'Bật'} ${promotion.voucherCode}`}
                      onClick={() => toggle(promotion)}
                      className={`relative h-6 w-11 rounded-full transition ${promotion.isActive ? 'bg-[#548565]' : 'bg-gray-300'}`}
                    >
                      <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${promotion.isActive ? 'left-5' : 'left-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(promotion)}
                        aria-label={`Sửa ${promotion.voucherCode}`}
                        className="rounded-md p-2 text-[#587362] hover:bg-[#edf4ef]"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(promotion)}
                        aria-label={`Xóa ${promotion.voucherCode}`}
                        className="rounded-md p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {visiblePromotions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-xs text-[#9aa49c]">
                    Chưa có khuyến mãi phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={isFormOpen}
        onClose={() => {
          setEditing(null)
          setError('')
          setIsFormOpen(false)
        }}
        title={editing ? 'Sửa khuyến mãi' : 'Thêm khuyến mãi mới'}
        description="Nhập đầy đủ thông tin chương trình ưu đãi"
      >
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="grid gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
            {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700 sm:col-span-2">{error}</p>}
            <label className="text-xs font-medium text-[#536257]">Mã khuyến mãi
              <input required value={form.voucherCode} onChange={(event) => setForm({ ...form, voucherCode: event.target.value.toUpperCase() })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#548565]" />
            </label>
            <label className="text-xs font-medium text-[#536257]">Loại giảm giá
              <select value={form.discountType} onChange={(event) => setForm({ ...form, discountType: event.target.value as Promotion['discountType'] })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2">
                <option value="PERCENTAGE">Phần trăm (%)</option>
                <option value="FIX_AMOUNT">Số tiền cố định (VNĐ)</option>
              </select>
            </label>
            <label className="text-xs font-medium text-[#536257]">Mô tả
              <textarea required rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#548565]" />
            </label>
            <label className="text-xs font-medium text-[#536257]">Giá trị giảm
              <input required type="number" min="1" max={form.discountType === 'PERCENTAGE' ? 100 : undefined} value={form.discountValue} onChange={(event) => setForm({ ...form, discountValue: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2" />
            </label>
            <label className="text-xs font-medium text-[#536257]">Ngày bắt đầu
              <input required type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2" />
            </label>
            <label className="text-xs font-medium text-[#536257]">Ngày kết thúc
              <input required type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2" />
            </label>
            <label className="text-xs font-medium text-[#536257]">Giới hạn lượt dùng
              <input required type="number" min="1" value={form.usageLimit} onChange={(event) => setForm({ ...form, usageLimit: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2" />
            </label>
            <label className="text-xs font-medium text-[#536257]">Số lượt đã dùng
              <input required type="number" min="0" value={form.usedCount} onChange={(event) => setForm({ ...form, usedCount: Number(event.target.value) })} className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2" />
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-[#536257] sm:col-span-2">
              <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
              Kích hoạt khuyến mãi
            </label>
            {!editing && (
              <label className="flex items-center gap-2 text-xs font-medium text-[#536257] sm:col-span-2">
                <input type="checkbox" checked={notifyCustomers} onChange={(event) => setNotifyCustomers(event.target.checked)} />
                Gửi thông báo đến khách hàng
              </label>
            )}
          </div>
          <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
            <button type="button" onClick={() => { setEditing(null); setError(''); setIsFormOpen(false) }} className="rounded-lg border border-gray-200 px-4 py-2 text-xs">Hủy</button>
            <button type="submit" className="rounded-lg bg-[#548565] px-4 py-2 text-xs font-semibold text-white">Lưu khuyến mãi</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Xóa khuyến mãi?" description="Thao tác này không thể hoàn tác.">
        <div className="flex items-center gap-3 px-5 py-4 text-sm">
          <AlertTriangle className="size-5 shrink-0 text-red-500" />
          <p>Bạn chắc chắn muốn xóa mã <strong>{deleting?.voucherCode}</strong>?</p>
        </div>
        <div className="flex justify-end gap-2 border-t border-gray-100 px-5 py-3">
          <button type="button" onClick={() => setDeleting(null)} className="rounded-lg border border-gray-200 px-4 py-2 text-xs">Hủy</button>
          <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white">Xóa khuyến mãi</button>
        </div>
      </Modal>
    </>
  )
}
