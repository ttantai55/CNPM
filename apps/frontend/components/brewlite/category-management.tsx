'use client'

import { useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { categoryStore, type MenuCategory } from '@/lib/menu'
import { Modal } from './modal'
import { menuApi } from '@/lib/api'

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/gi, 'd')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function CategoryManagement() {
  const categories = categoryStore.useStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<MenuCategory | null>(null)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [error, setError] = useState('')

  function startAdd() {
    setEditing(null)
    setName('')
    setSlug('')
    setError('')
    setOpen(true)
  }

  function startEdit(category: MenuCategory) {
    setEditing(category)
    setName(category.name)
    setSlug(category.slug)
    setError('')
    setOpen(true)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    const normalizedSlug = toSlug(slug || trimmedName)
    const duplicate = categories.some(
      (category) =>
        category.id !== editing?.id &&
        (category.id.toLowerCase() === normalizedSlug.toLowerCase() ||
          category.slug.toLowerCase() === normalizedSlug.toLowerCase()),
    )
    if (!trimmedName || !normalizedSlug || ['all', 'favorites'].includes(normalizedSlug)) {
      setError('Vui lòng nhập tên và slug danh mục hợp lệ.')
      return
    }
    if (duplicate) {
      setError('Slug danh mục đã tồn tại.')
      return
    }
    try {
      const request = { name: trimmedName, slug: normalizedSlug }
      const saved = editing
        ? await menuApi.updateCategory(editing.id, request)
        : await menuApi.createCategory(request)
      const next = { id: saved.id, name: saved.name, slug: saved.slug, isActive: saved.isActive }
      categoryStore.set((current) => editing
        ? current.map((category) => category.id === editing.id ? next : category)
        : [...current, next])
      setOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể lưu danh mục.')
    }
  }

  async function toggle(category: MenuCategory) {
    try {
      const updated = await menuApi.toggleCategory(category.id)
      categoryStore.set((current) => current.map((item) =>
        item.id === category.id ? { ...item, isActive: updated.isActive } : item,
      ))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật danh mục.')
    }
  }

  return (
    <>
      <section
        id="categories"
        className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white"
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#354a3c]">Quản lý danh mục</h2>
            <p className="mt-1 text-[11px] text-[#99a39c]">Danh mục đang bật sẽ hiển thị với khách hàng</p>
          </div>
          <button
            type="button"
            onClick={startAdd}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-[#548565] px-3 text-xs font-semibold text-white hover:bg-[#436b51]"
          >
            <Plus className="size-3.5" /> Thêm danh mục
          </button>
        </div>
        <ul className="divide-y divide-[#f0f2f0]">
          {categories.map((category) => (
            <li key={category.id} className="flex items-center gap-3 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#46574c]">{category.name}</p>
                <p className="mt-1 text-[10px] text-[#89948c]">/{category.slug}</p>
              </div>
              <button
                type="button"
                onClick={() => startEdit(category)}
                aria-label={`Sửa danh mục ${category.name}`}
                className="rounded-md p-2 text-[#587362] hover:bg-[#edf4ef]"
              >
                <Pencil className="size-3.5" />
              </button>
              <button
                type="button"
                role="switch"
                aria-checked={category.isActive}
                aria-label={`${category.isActive ? 'Tắt' : 'Bật'} danh mục ${category.name}`}
                onClick={() => toggle(category)}
                className={`relative h-6 w-11 rounded-full transition ${category.isActive ? 'bg-[#548565]' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${category.isActive ? 'left-5' : 'left-0.5'}`} />
              </button>
              <span className="w-12 text-right text-[10px] text-[#89948c]">
                {category.isActive ? 'Đang bật' : 'Đang tắt'}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? 'Chỉnh sửa danh mục' : 'Thêm danh mục'}
        description="Tên và slug dùng để nhận diện danh mục"
      >
        <form onSubmit={save} className="space-y-4 px-5 py-4">
          {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}
          <label className="block text-xs font-medium text-[#536257]">
            Tên danh mục
            <input
              autoFocus
              required
              value={name}
              onChange={(event) => {
                setName(event.target.value)
                if (!editing) setSlug(toSlug(event.target.value))
              }}
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#548565]"
            />
          </label>
          <label className="block text-xs font-medium text-[#536257]">
            Icon / slug
            <input
              required
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              className="mt-1.5 w-full rounded-lg border border-gray-200 px-3 py-2 outline-none focus:border-[#548565]"
            />
          </label>
          <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
            <button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-gray-200 px-4 py-2 text-xs">Hủy</button>
            <button type="submit" className="rounded-lg bg-[#548565] px-4 py-2 text-xs font-semibold text-white">Lưu danh mục</button>
          </div>
        </form>
      </Modal>
    </>
  )
}
