'use client'

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  AlertTriangle,
  ClipboardList,
  PackagePlus,
  Plus,
  Search,
  X,
} from 'lucide-react'
import {
  ingredientStore,
  inventoryTransactionStore,
  TRANSACTION_TYPE_LABELS,
  UNIT_LABELS,
  type Ingredient,
  type InventoryTransaction,
  type InventoryTransactionType,
  type UnitType,
} from '@/lib/raw-material-inventory'
import { authStore } from '@/lib/session'
import { adminApi } from '@/lib/api'

type InventoryTab = 'ingredients' | 'transactions'
type IngredientMode = 'EXISTING' | 'NEW'
type TransactionFilter = 'ALL' | InventoryTransactionType

type TransactionForm = {
  mode: IngredientMode
  ingredientId: string
  name: string
  unit: UnitType
  minAlertThreshold: string
  type: InventoryTransactionType
  quantity: string
  price: string
  note: string
  staffName: string
}

const EMPTY_FORM: TransactionForm = {
  mode: 'EXISTING',
  ingredientId: '',
  name: '',
  unit: 'PACK',
  minAlertThreshold: '0',
  type: 'IMPORT',
  quantity: '',
  price: '',
  note: '',
  staffName: '',
}

const UNIT_OPTIONS = Object.entries(UNIT_LABELS) as [UnitType, string][]
const TRANSACTION_TYPES = Object.keys(TRANSACTION_TYPE_LABELS) as InventoryTransactionType[]
const formatVnd = new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0,
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function RawMaterialInventory() {
  const session = authStore.useStore()
  const ingredients = ingredientStore.useStore()
  const transactions = inventoryTransactionStore.useStore()
  const [activeTab, setActiveTab] = useState<InventoryTab>('ingredients')
  const [ingredientSearch, setIngredientSearch] = useState('')
  const [transactionSearch, setTransactionSearch] = useState('')
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>('ALL')
  const [historyIngredientId, setHistoryIngredientId] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState<TransactionForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')

  useEffect(() => {
    Promise.all([adminApi.inventory(), adminApi.inventoryTransactions()])
      .then(([remoteIngredients, remoteTransactions]) => {
        ingredientStore.set(remoteIngredients)
        inventoryTransactionStore.set(remoteTransactions.map((transaction) => ({
          id: transaction.id,
          type: transaction.type,
          createAt: transaction.createAt,
          note: transaction.note,
          staffName: transaction.baristaName,
          details: {
            id: transaction.id,
            ingredientId: transaction.ingredientId,
            quantity: transaction.quantity,
            price: transaction.price,
          },
        })))
      })
      .catch((cause: unknown) => setFormError(cause instanceof Error ? cause.message : 'Không tải được dữ liệu kho.'))
  }, [])

  const lowStockIngredients = ingredients.filter(
    (ingredient) => ingredient.currentStock <= ingredient.minAlertThreshold,
  )
  const importTotal = transactions
    .filter((transaction) => transaction.type === 'IMPORT')
    .reduce((total, transaction) => total + transaction.details.price, 0)

  const filteredIngredients = useMemo(() => {
    const query = ingredientSearch.trim().toLocaleLowerCase('vi')
    return ingredients.filter((ingredient) =>
      ingredient.name.toLocaleLowerCase('vi').includes(query),
    )
  }, [ingredients, ingredientSearch])

  const filteredTransactions = useMemo(() => {
    const query = transactionSearch.trim().toLocaleLowerCase('vi')
    return [...transactions]
      .filter((transaction) => transactionFilter === 'ALL' || transaction.type === transactionFilter)
      .filter(
        (transaction) =>
          !historyIngredientId || transaction.details.ingredientId === historyIngredientId,
      )
      .filter((transaction) => {
        const ingredientName =
          ingredients.find((item) => item.id === transaction.details.ingredientId)?.name ?? ''
        return [
          transaction.id,
          ingredientName,
          transaction.note,
          transaction.staffName,
        ].some((value) => value.toLocaleLowerCase('vi').includes(query))
      })
      .sort((a, b) => b.createAt.localeCompare(a.createAt))
  }, [ingredients, transactionFilter, transactionSearch, transactions, historyIngredientId])

  function openNewIngredientDialog() {
    setForm({ ...EMPTY_FORM, mode: 'NEW', type: 'IMPORT', staffName: session?.name ?? '' })
    setFormError('')
    setDialogOpen(true)
  }

  function openExistingTransaction(ingredient: Ingredient) {
    setForm({
      ...EMPTY_FORM,
      mode: 'EXISTING',
      ingredientId: ingredient.id,
      staffName: session?.name ?? '',
    })
    setFormError('')
    setDialogOpen(true)
  }

  function showIngredientHistory(ingredient: Ingredient) {
    setHistoryIngredientId(ingredient.id)
    setTransactionSearch('')
    setTransactionFilter('ALL')
    setActiveTab('transactions')
  }

  async function saveTransaction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const name = form.name.trim()
    const quantity = Number(form.quantity)
    const price = Number(form.price)
    const minAlertThreshold = Number(form.minAlertThreshold)
    const note = form.note.trim()
    const staffName = form.staffName.trim()
    const currentIngredient = ingredients.find((item) => item.id === form.ingredientId)

    if (
      (form.mode === 'NEW' && (!name || form.type !== 'IMPORT')) ||
      (form.mode === 'EXISTING' && !currentIngredient) ||
      !Number.isInteger(quantity) ||
      quantity <= 0 ||
      !form.price.trim() ||
      !Number.isSafeInteger(price) ||
      price < 0 ||
      !note ||
      !staffName ||
      (form.mode === 'NEW' &&
        (!Number.isFinite(minAlertThreshold) || minAlertThreshold < 0))
    ) {
      setFormError('Vui lòng nhập đầy đủ thông tin hợp lệ. Số lượng phải là số nguyên lớn hơn 0.')
      return
    }

    let ingredient: Ingredient | undefined = currentIngredient
    if (form.mode === 'NEW') {
      try {
        ingredient = await adminApi.createIngredient({
          name,
          unit: form.unit,
          currentStock: 0,
          minAlertThreshold,
        })
      } catch (cause) {
        setFormError(cause instanceof Error ? cause.message : 'Không thể tạo nguyên liệu.')
        return
      }
    }
    if (!ingredient) {
      setFormError('Không tìm thấy nguyên liệu đã chọn. Vui lòng tải lại và thử lại.')
      return
    }

    const updatedStock = form.type === 'IMPORT'
      ? ingredient.currentStock + quantity
      : form.type === 'EXPORT'
        ? Math.max(0, ingredient.currentStock - quantity)
        : quantity

    if (
      (form.type === 'EXPORT' && quantity > ingredient.currentStock) ||
      !Number.isSafeInteger(updatedStock)
    ) {
      setFormError(
        quantity > ingredient.currentStock && form.type === 'EXPORT'
          ? 'Số lượng xuất vượt quá tồn kho hiện tại.'
          : 'Tồn kho sau giao dịch vượt quá giới hạn cho phép.',
      )
      return
    }

    try {
      await adminApi.inventoryTransaction({
        type: form.type,
        ingredientId: ingredient.id,
        quantity,
        price,
        note,
        baristaId: session?.id ?? '',
      })
      const [remoteIngredients, remoteTransactions] = await Promise.all([
        adminApi.inventory(),
        adminApi.inventoryTransactions(),
      ])
      ingredientStore.set(remoteIngredients)
      inventoryTransactionStore.set(remoteTransactions.map((entry) => ({
        id: entry.id,
        type: entry.type,
        createAt: entry.createAt,
        note: entry.note,
        staffName: entry.baristaName,
        details: { id: entry.id, ingredientId: entry.ingredientId, quantity: entry.quantity, price: entry.price },
      })))
      setDialogOpen(false)
      setFormError('')
    } catch (cause) {
      setFormError(cause instanceof Error ? cause.message : 'Không thể lưu giao dịch kho.')
    }
  }

  return (
    <>
      <section
        id="raw-materials"
        className="mt-5 scroll-mt-5 space-y-5 rounded-2xl border border-[#e8ede8] bg-white p-5 xl:p-6"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#edf4ef] text-[#548565]">
              <ClipboardList className="size-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-[#263d32]">Quản lý kho nguyên liệu</h2>
              <p className="mt-1 text-xs text-[#8a958d]">
                Theo dõi tồn kho, cảnh báo và sổ giao dịch nguyên liệu
              </p>
            </div>
          </div>
          {activeTab === 'ingredients' && (
            <button
              type="button"
              onClick={openNewIngredientDialog}
              className="flex h-9 items-center gap-1.5 rounded-lg bg-[#548565] px-3 text-xs font-semibold text-white transition hover:bg-[#436b51]"
            >
              <Plus className="size-4" />
              Thêm nguyên liệu &amp; Nhập kho
            </button>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Loại nguyên liệu" value={String(ingredients.length)} />
          <KpiCard
            label="Cần nhập thêm"
            value={String(lowStockIngredients.length)}
            warning={lowStockIngredients.length > 0}
          />
          <KpiCard label="Tổng chi phí nhập" value={formatVnd.format(importTotal)} />
          <KpiCard label="Giao dịch kho" value={String(transactions.length)} />
        </div>

        {lowStockIngredients.length > 0 && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900"
          >
            <AlertTriangle className="mt-0.5 size-4 shrink-0" />
            <p>
              Cần nhập thêm:{' '}
              {lowStockIngredients.map((ingredient) => ingredient.name).join(', ')}.
            </p>
          </div>
        )}

        <div className="flex gap-1 border-b border-[#e8ede8]" role="tablist" aria-label="Phân hệ kho nguyên liệu">
          <button
            type="button"
            role="tab"
            id="ingredients-tab"
            aria-selected={activeTab === 'ingredients'}
            aria-controls="ingredients-panel"
            onClick={() => {
              setActiveTab('ingredients')
              setHistoryIngredientId('')
            }}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'ingredients'
                ? 'border-[#548565] text-[#285b4b]'
                : 'border-transparent text-[#89948c] hover:text-[#46574c]'
            }`}
          >
            Danh sách nguyên liệu
          </button>
          <button
            type="button"
            role="tab"
            id="transactions-tab"
            aria-selected={activeTab === 'transactions'}
            aria-controls="transactions-panel"
            onClick={() => {
              setActiveTab('transactions')
              setHistoryIngredientId('')
            }}
            className={`border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
              activeTab === 'transactions'
                ? 'border-[#548565] text-[#285b4b]'
                : 'border-transparent text-[#89948c] hover:text-[#46574c]'
            }`}
          >
            Sổ giao dịch kho
          </button>
        </div>

        {activeTab === 'ingredients' ? (
          <div id="ingredients-panel" role="tabpanel" aria-labelledby="ingredients-tab">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[#354a3c]">Danh sách nguyên liệu</h3>
              <SearchInput
                value={ingredientSearch}
                onChange={setIngredientSearch}
                label="Tìm nguyên liệu"
                placeholder="Tìm nguyên liệu..."
              />
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#edf0ed]">
              <table className="w-full min-w-[700px] text-left">
                <thead>
                  <tr className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wide text-[#9aa49c]">
                    <th className="px-4 py-3">Tên nguyên liệu</th>
                    <th className="px-4 py-3">Đơn vị tính</th>
                    <th className="px-4 py-3 text-right">Tồn kho hiện tại</th>
                    <th className="px-4 py-3 text-right">Ngưỡng cảnh báo</th>
                    <th className="px-4 py-3">Trạng thái</th>
                    <th className="px-4 py-3 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredIngredients.map((ingredient) => {
                    const isLow = ingredient.currentStock <= ingredient.minAlertThreshold
                    return (
                      <tr key={ingredient.id} className="border-t border-[#f0f2f0]">
                        <td className="px-4 py-3 text-xs font-semibold text-[#46574c]">
                          {ingredient.name}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#78857c]">
                          {UNIT_LABELS[ingredient.unit]}
                        </td>
                        <td className="px-4 py-3 text-right text-xs font-semibold text-[#46574c]">
                          {ingredient.currentStock}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-[#78857c]">
                          {ingredient.minAlertThreshold}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                              isLow
                                ? 'border border-amber-200 bg-amber-50 text-amber-800'
                                : 'bg-emerald-50 text-emerald-800'
                            }`}
                          >
                            {isLow ? 'Cần nhập thêm' : 'Đủ hàng'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => openExistingTransaction(ingredient)}
                              className="rounded-md px-2 py-1.5 text-[10px] font-semibold text-[#548565] hover:bg-[#edf4ef]"
                            >
                              Tạo giao dịch
                            </button>
                            <button
                              type="button"
                              onClick={() => showIngredientHistory(ingredient)}
                              className="rounded-md px-2 py-1.5 text-[10px] font-medium text-[#78857c] hover:bg-[#f3f5f2]"
                            >
                              Xem lịch sử
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                  {filteredIngredients.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-xs text-[#9aa49c]">
                        {ingredients.length
                          ? 'Không tìm thấy nguyên liệu phù hợp.'
                          : 'Chưa có nguyên liệu. Thêm mới để tạo phiếu nhập đầu tiên.'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div id="transactions-panel" role="tabpanel" aria-labelledby="transactions-tab">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-[#354a3c]">Sổ giao dịch kho</h3>
                {historyIngredientId && (
                  <button
                    type="button"
                    onClick={() => setHistoryIngredientId('')}
                    className="mt-1 text-[10px] font-medium text-[#548565] hover:underline"
                  >
                    Xóa lọc nguyên liệu
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <label>
                  <span className="sr-only">Lọc theo loại giao dịch</span>
                  <select
                    value={transactionFilter}
                    onChange={(event) =>
                      setTransactionFilter(event.target.value as TransactionFilter)
                    }
                    className="h-9 rounded-lg border border-[#e8ede8] bg-white px-3 text-[11px] outline-none focus:border-[#548565]"
                  >
                    <option value="ALL">Tất cả giao dịch</option>
                    {TRANSACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {TRANSACTION_TYPE_LABELS[type].label}
                      </option>
                    ))}
                  </select>
                </label>
                <SearchInput
                  value={transactionSearch}
                  onChange={setTransactionSearch}
                  label="Tìm giao dịch"
                  placeholder="Mã phiếu, nguyên liệu..."
                />
              </div>
            </div>
            <div className="overflow-x-auto rounded-xl border border-[#edf0ed]">
              <table className="w-full min-w-[1050px] text-left">
                <thead>
                  <tr className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wide text-[#9aa49c]">
                    <th className="px-3 py-3">Mã phiếu</th>
                    <th className="px-3 py-3">Thời gian</th>
                    <th className="px-3 py-3">Nguyên liệu</th>
                    <th className="px-3 py-3">Loại giao dịch</th>
                    <th className="px-3 py-3 text-right">Số lượng thay đổi</th>
                    <th className="px-3 py-3 text-right">Giá trị</th>
                    <th className="px-3 py-3">Ghi chú</th>
                    <th className="px-3 py-3">Người thực hiện</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => {
                    const ingredient = ingredients.find(
                      (item) => item.id === transaction.details.ingredientId,
                    )
                    const type = TRANSACTION_TYPE_LABELS[transaction.type]
                    const quantity =
                      transaction.type === 'IMPORT'
                        ? `+${transaction.details.quantity}`
                        : transaction.type === 'EXPORT'
                          ? `-${transaction.details.quantity}`
                          : `=${transaction.details.quantity}`
                    return (
                      <tr key={transaction.id} className="border-t border-[#f0f2f0] text-xs">
                        <td className="whitespace-nowrap px-3 py-3 font-semibold text-[#46574c]">
                          {transaction.id}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#78857c]">
                          {formatDate(transaction.createAt)}
                        </td>
                        <td className="px-3 py-3 font-medium text-[#46574c]">
                          {ingredient?.name ?? 'Nguyên liệu không còn tồn tại'}
                        </td>
                        <td className="px-3 py-3">
                          <span
                            className={`whitespace-nowrap rounded-full border px-2 py-1 text-[10px] font-semibold ${type.color}`}
                          >
                            {type.label}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right font-semibold text-[#46574c]">
                          {quantity} {ingredient ? UNIT_LABELS[ingredient.unit] : ''}
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-right text-[#78857c]">
                          {formatVnd.format(transaction.details.price)}
                        </td>
                        <td className="max-w-48 px-3 py-3 text-[#78857c]">{transaction.note}</td>
                        <td className="whitespace-nowrap px-3 py-3 text-[#46574c]">
                          {transaction.staffName}
                        </td>
                      </tr>
                    )
                  })}
                  {filteredTransactions.length === 0 && (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-xs text-[#9aa49c]">
                        Không có giao dịch phù hợp.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {dialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/40 p-4 backdrop-blur-sm">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-transaction-title"
            className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-gray-100 pb-3.5">
              <div>
                <h3 id="inventory-transaction-title" className="text-sm font-bold text-[#263d32]">
                  Tạo giao dịch kho
                </h3>
                <p className="mt-1 text-[10px] text-[#89948c]">
                  Mọi thay đổi tồn kho đều được lưu vào sổ giao dịch.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                aria-label="Đóng biểu mẫu"
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100"
              >
                <X className="size-4" />
              </button>
            </div>

            <form onSubmit={saveTransaction} className="mt-4 space-y-4">
              {formError && (
                <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {formError}
                </p>
              )}
              <fieldset>
                <legend className="mb-2 text-xs font-semibold text-[#46574c]">
                  Nguyên liệu giao dịch
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-[11px] ${
                      form.mode === 'NEW'
                        ? 'border-[#548565] bg-[#edf4ef] text-[#285b4b]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ingredient-mode"
                      checked={form.mode === 'NEW'}
                      onChange={() =>
                        setForm({ ...form, mode: 'NEW', type: 'IMPORT', ingredientId: '' })
                      }
                    />
                    Tạo nguyên liệu mới
                  </label>
                  <label
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-[11px] ${
                      form.mode === 'EXISTING'
                        ? 'border-[#548565] bg-[#edf4ef] text-[#285b4b]'
                        : 'border-gray-200 text-gray-600'
                    }`}
                  >
                    <input
                      type="radio"
                      name="ingredient-mode"
                      checked={form.mode === 'EXISTING'}
                      disabled={ingredients.length === 0}
                      onChange={() => setForm({ ...form, mode: 'EXISTING' })}
                    />
                    Nguyên liệu có sẵn
                  </label>
                </div>
              </fieldset>

              {form.mode === 'NEW' ? (
                <>
                  <div>
                    <label htmlFor="new-ingredient-name" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                      Tên nguyên liệu
                    </label>
                    <input
                      id="new-ingredient-name"
                      required
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      placeholder="Ví dụ: Cà phê hạt"
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="new-ingredient-unit" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                        Đơn vị tính
                      </label>
                      <select
                        id="new-ingredient-unit"
                        value={form.unit}
                        onChange={(event) =>
                          setForm({ ...form, unit: event.target.value as UnitType })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                      >
                        {UNIT_OPTIONS.map(([unit, label]) => (
                          <option key={unit} value={unit}>
                            {label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="new-ingredient-threshold" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                        Ngưỡng cảnh báo
                      </label>
                      <input
                        id="new-ingredient-threshold"
                        type="number"
                        min="0"
                        step="any"
                        required
                        value={form.minAlertThreshold}
                        onChange={(event) =>
                          setForm({ ...form, minAlertThreshold: event.target.value })
                        }
                        className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                      />
                    </div>
                  </div>
                  <p className="rounded-lg bg-[#f7f8f6] px-3 py-2 text-[10px] text-[#68766d]">
                    Nguyên liệu mới được khởi tạo bằng giao dịch nhập kho; tồn ban đầu không thể sửa tay.
                  </p>
                </>
              ) : (
                <div>
                  <label htmlFor="transaction-ingredient" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Chọn nguyên liệu
                  </label>
                  <select
                    id="transaction-ingredient"
                    required
                    value={form.ingredientId}
                    onChange={(event) => setForm({ ...form, ingredientId: event.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                  >
                    {ingredients.map((ingredient) => (
                      <option key={ingredient.id} value={ingredient.id}>
                        {ingredient.name} · Tồn {ingredient.currentStock} {UNIT_LABELS[ingredient.unit]}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="transaction-type" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    Loại giao dịch
                  </label>
                  <select
                    id="transaction-type"
                    value={form.type}
                    disabled={form.mode === 'NEW'}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        type: event.target.value as InventoryTransactionType,
                      })
                    }
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565] disabled:bg-gray-50"
                  >
                    {TRANSACTION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {TRANSACTION_TYPE_LABELS[type].label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="transaction-quantity" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                    {form.type === 'ADJUSTMENT' ? 'Tồn thực tế sau kiểm kê' : 'Số lượng'}
                  </label>
                  <input
                    id="transaction-quantity"
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={form.quantity}
                    onChange={(event) => setForm({ ...form, quantity: event.target.value })}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="transaction-price" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                  Giá trị giao dịch (VNĐ)
                </label>
                <input
                  id="transaction-price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={form.price}
                  onChange={(event) => setForm({ ...form, price: event.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                />
              </div>
              <div>
                <label htmlFor="transaction-note" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                  Lý do / Ghi chú
                </label>
                <textarea
                  id="transaction-note"
                  required
                  rows={2}
                  value={form.note}
                  onChange={(event) => setForm({ ...form, note: event.target.value })}
                  placeholder="Nhập lý do nhập, xuất hoặc điều chỉnh"
                  className="w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                />
              </div>
              <div>
                <label htmlFor="transaction-staff" className="mb-1.5 block text-xs font-semibold text-[#46574c]">
                  Nhân sự thực hiện
                </label>
                <input
                  id="transaction-staff"
                  required
                  value={form.staffName}
                  onChange={(event) => setForm({ ...form, staffName: event.target.value })}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-xs outline-none focus:border-[#548565]"
                />
              </div>
              <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="rounded-lg border border-gray-200 px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-lg bg-[#548565] px-4 py-2 text-xs font-semibold text-white hover:bg-[#436b51]"
                >
                  <PackagePlus className="size-3.5" />
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

function KpiCard({
  label,
  value,
  warning = false,
}: {
  label: string
  value: string
  warning?: boolean
}) {
  return (
    <article
      className={`rounded-xl border p-4 ${
        warning ? 'border-amber-200 bg-amber-50/70' : 'border-[#edf0ed] bg-[#fafbfa]'
      }`}
    >
      <p className="text-[11px] font-medium text-[#89948c]">{label}</p>
      <p className="mt-1 text-xl font-semibold text-[#304539]">{value}</p>
    </article>
  )
}

function SearchInput({
  value,
  onChange,
  label,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
}) {
  return (
    <label className="relative">
      <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9ba69e]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={label}
        placeholder={placeholder}
        className="h-9 w-48 rounded-lg border border-[#e8ede8] pl-8 pr-3 text-[11px] outline-none focus:border-[#548565]"
      />
    </label>
  )
}
