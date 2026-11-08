'use client'

import { useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2 } from 'lucide-react'
import {
  createManagedCustomer,
  customerAccountStore,
  deleteCustomerAccount,
  updateCustomerAccount,
  type CustomerAccount,
} from '@/lib/auth'
import { customerProfileStore } from '@/lib/customer-profile'
import { Modal } from './modal'

type CustomerForm = Pick<CustomerAccount, 'username' | 'email' | 'name' | 'phone' | 'gender' | 'dateOfBirth' | 'address'>

const EMPTY_FORM: CustomerForm = {
  username: '',
  email: '',
  name: '',
  phone: '',
  gender: false,
  dateOfBirth: '',
  address: '',
}

export function CustomerManagement() {
  const customers = customerAccountStore.useStore()
  const profiles = customerProfileStore.useStore()
  const [query, setQuery] = useState('')
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<CustomerAccount | null>(null)
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<CustomerAccount | null>(null)

  const visibleCustomers = useMemo(() => {
    const text = query.trim().toLocaleLowerCase()
    return customers.filter((customer) => {
      const profile = profiles[customer.contact]
      return [
        customer.name || profile?.name,
        customer.username,
        customer.phone || profile?.phone,
      ].some((value) => value?.toLocaleLowerCase().includes(text))
    })
  }, [customers, profiles, query])

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setError('')
    setFormOpen(true)
  }

  function openEdit(customer: CustomerAccount) {
    const profile = profiles[customer.contact]
    setEditing(customer)
    setForm({
      username: customer.username,
      email: customer.email ?? (customer.contact.includes('@') ? customer.contact : ''),
      name: customer.name || profile?.name || customer.username,
      phone: customer.phone || profile?.phone || (customer.contact.includes('@') ? '' : customer.contact),
      gender: customer.gender ?? profile?.gender ?? false,
      dateOfBirth: customer.dateOfBirth || profile?.dateOfBirth || '',
      address: customer.address || profile?.address || '',
    })
    setError('')
    setFormOpen(true)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const value = {
      ...form,
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      address: form.address.trim(),
    }
    if (!value.username || !value.name || (!value.email && !value.phone)) {
      setError('Vui lòng nhập username, họ tên và email hoặc số điện thoại.')
      return
    }
    const duplicate = customers.some(
      (customer) =>
        customer.id !== editing?.id &&
        (customer.username.toLowerCase() === value.username.toLowerCase() ||
          (value.email && customer.email?.toLowerCase() === value.email) ||
          (value.phone && customer.phone === value.phone)),
    )
    if (duplicate) {
      setError('Username, email hoặc số điện thoại đã tồn tại.')
      return
    }
    const previousContact = editing?.contact
    const updated = editing
      ? { ...editing, ...value, contact: value.email || value.phone }
      : await createManagedCustomer(value)
    if (editing) updateCustomerAccount(editing.id, { ...value, contact: value.email || value.phone })
    if (previousContact && previousContact !== updated.contact) {
      customerProfileStore.set((current) => {
        const next = { ...current }
        delete next[previousContact]
        next[updated.contact] = {
          name: value.name,
          phone: value.phone,
          gender: value.gender,
          dateOfBirth: value.dateOfBirth,
          address: value.address,
          avatarUrl: current[previousContact]?.avatarUrl ?? '',
        }
        return next
      })
    } else {
      customerProfileStore.set((current) => ({
        ...current,
        [updated.contact]: {
          name: value.name,
          phone: value.phone,
          gender: value.gender,
          dateOfBirth: value.dateOfBirth,
          address: value.address,
          avatarUrl: current[updated.contact]?.avatarUrl ?? '',
        },
      }))
    }
    setFormOpen(false)
  }

  function remove() {
    if (!deleting) return
    const contact = deleting.contact
    deleteCustomerAccount(deleting.id)
    customerProfileStore.set((current) => {
      const next = { ...current }
      delete next[contact]
      return next
    })
    setDeleting(null)
  }

  return (
    <>
      <section id="customers" className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#354a3c]">Quản lý khách hàng</h2>
            <p className="mt-1 text-[11px] text-[#99a39c]">Thông tin tài khoản và hồ sơ khách hàng</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="relative">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-[#9ba69e]" />
              <input value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Tìm khách theo tên, username hoặc số điện thoại" placeholder="Tìm khách hàng..." className="h-9 w-40 rounded-lg border border-[#e8ede8] pl-8 pr-3 text-[11px] outline-none focus:border-[#548565]" />
            </label>
            <button type="button" onClick={openAdd} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#548565] px-3 text-xs font-semibold text-white hover:bg-[#436b51]"><Plus className="size-3.5" /> Thêm khách hàng</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left">
            <thead><tr className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wide text-[#9aa49c]">
              <th className="px-3 py-3">ID</th><th className="px-3 py-3">Username</th><th className="px-3 py-3">Email</th>
              <th className="px-3 py-3">Họ tên</th><th className="px-3 py-3">Điện thoại</th><th className="px-3 py-3">Giới tính</th>
              <th className="px-3 py-3">Ngày sinh</th><th className="px-3 py-3">Địa chỉ</th><th className="px-3 py-3">Ngày tạo</th><th className="px-3 py-3 text-right">Thao tác</th>
            </tr></thead>
            <tbody className="divide-y divide-[#f0f2f0]">
              {visibleCustomers.map((customer) => {
                const profile = profiles[customer.contact]
                return <tr key={customer.id} className="text-[11px] text-[#56645a]">
                  <td className="px-3 py-3 font-mono">{customer.id}</td><td className="px-3 py-3 font-semibold">{customer.username}</td>
                  <td className="px-3 py-3">{customer.email || '—'}</td><td className="px-3 py-3">{customer.name || profile?.name || customer.username}</td>
                  <td className="px-3 py-3">{customer.phone || profile?.phone || '—'}</td><td className="px-3 py-3">{(customer.gender ?? profile?.gender) ? 'Nam' : 'Nữ'}</td>
                  <td className="px-3 py-3">{customer.dateOfBirth || profile?.dateOfBirth || '—'}</td><td className="max-w-40 truncate px-3 py-3">{customer.address || profile?.address || '—'}</td>
                  <td className="px-3 py-3">{new Intl.DateTimeFormat('vi-VN').format(customer.createdAt)}</td>
                  <td className="px-3 py-3"><div className="flex justify-end gap-1">
                    <button type="button" onClick={() => openEdit(customer)} aria-label={`Sửa ${customer.username}`} className="rounded-md p-2 text-[#587362] hover:bg-[#edf4ef]"><Pencil className="size-3.5" /></button>
                    <button type="button" onClick={() => setDeleting(customer)} aria-label={`Xóa ${customer.username}`} className="rounded-md p-2 text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                  </div></td>
                </tr>
              })}
              {visibleCustomers.length === 0 && <tr><td colSpan={10} className="px-4 py-9 text-center text-xs text-[#9aa49c]">Không tìm thấy khách hàng.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng'} description="Nhập thông tin hồ sơ khách hàng">
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="grid gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
            {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700 sm:col-span-2">{error}</p>}
            <label className="text-xs font-medium">Username<input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Email<input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Họ tên<input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Số điện thoại<input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Giới tính<select value={form.gender ? 'male' : 'female'} onChange={(e) => setForm({ ...form, gender: e.target.value === 'male' })} className="mt-1.5 w-full rounded-lg border px-3 py-2"><option value="male">Nam</option><option value="female">Nữ</option></select></label>
            <label className="text-xs font-medium">Ngày sinh<input type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium sm:col-span-2">Địa chỉ<textarea rows={2} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
          </div>
          <div className="flex justify-end gap-2 border-t px-5 py-3">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border px-4 py-2 text-xs">Hủy</button>
            <button type="submit" className="rounded-lg bg-[#548565] px-4 py-2 text-xs font-semibold text-white">Lưu khách hàng</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Xóa khách hàng?" description={`Bạn có chắc muốn xóa ${deleting?.name || deleting?.username}?`}>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button type="button" onClick={() => setDeleting(null)} className="rounded-lg border px-4 py-2 text-xs">Hủy</button>
          <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white">Xác nhận xóa</button>
        </div>
      </Modal>
    </>
  )
}
