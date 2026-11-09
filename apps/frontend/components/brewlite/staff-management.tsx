'use client'

import { useEffect, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  staffAccountStore,
  type StaffAccount,
  type StaffPosition,
} from '@/lib/auth'
import { authStore } from '@/lib/session'
import { Modal } from './modal'
import { staffApi } from '@/lib/api'

type StaffForm = {
  username: string
  password: string
  fullName: string
  email: string
  phone: string
  position: StaffPosition
}

const EMPTY_FORM: StaffForm = {
  username: '',
  password: '',
  fullName: '',
  email: '',
  phone: '',
  position: 'PHUC_VU',
}

export function StaffManagement() {
  const staff = staffAccountStore.useStore()
  const session = authStore.useStore()
  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<StaffAccount | null>(null)
  const [form, setForm] = useState<StaffForm>(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<StaffAccount | null>(null)

  useEffect(() => {
    staffApi.list().then((users) => {
      staffAccountStore.set(users.map((user) => ({
        id: user.id,
        username: user.username,
        passwordSalt: '',
        passwordHash: '',
        fullName: user.fullName || user.username,
        email: user.email,
        phone: user.phone ?? '',
        position: 'position' in user && user.position === 'PHA_CHE' ? 'PHA_CHE' : 'PHUC_VU',
        createdAt: Date.now(),
        isActive: true,
      })))
    }).catch((cause: unknown) => setError(cause instanceof Error ? cause.message : 'Không tải được nhân viên.'))
  }, [])

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY_FORM })
    setError('')
    setFormOpen(true)
  }

  function openEdit(account: StaffAccount) {
    setEditing(account)
    setForm({
      username: account.username,
      password: '',
      fullName: account.fullName,
      email: account.email,
      phone: account.phone,
      position: account.position,
    })
    setError('')
    setFormOpen(true)
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const username = form.username.trim()
    const fullName = form.fullName.trim()
    const email = form.email.trim().toLowerCase()
    const phone = form.phone.trim()
    if (!username || !fullName || !email || !phone || (!editing && form.password.length < 1)) {
      setError('Vui lòng nhập đủ thông tin; mật khẩu cần ít nhất 1 ký tự.')
      return
    }
    if (staff.some((account) => account.id !== editing?.id && (
      account.username.toLowerCase() === username.toLowerCase() ||
      account.email.toLowerCase() === email ||
      account.phone === phone
    ))) {
      setError('Tên đăng nhập, email hoặc số điện thoại đã được sử dụng.')
      return
    }
    setSaving(true)
    try {
      const { password, ...details } = form
      if (editing) {
        const saved = await staffApi.update(editing.id, { ...details, username, fullName, email, phone, ...(password ? { password } : {}) })
        staffAccountStore.set((current) => current.map((item) => item.id === editing.id
          ? { ...item, id: saved.id, username: saved.username, fullName: saved.fullName, email: saved.email, phone: saved.phone ?? '', position: details.position }
          : item))
      } else {
        const saved = await staffApi.create({ ...details, username, fullName, email, phone, password })
        staffAccountStore.set((current) => [...current, {
          id: saved.id,
          username: saved.username,
          passwordSalt: '',
          passwordHash: '',
          fullName: saved.fullName || fullName,
          email: saved.email,
          phone: saved.phone ?? phone,
          position: details.position,
          createdAt: Date.now(),
          isActive: true,
        }])
      }
      setFormOpen(false)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể lưu tài khoản nhân viên.')
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!deleting) return
    try {
      await staffApi.delete(deleting.id)
      staffAccountStore.set((current) => current.filter((entry) => entry.id !== deleting.id))
      setDeleting(null)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể xóa nhân viên.')
    }
  }

  return (
    <>
      <section id="staff" className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0ed] px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-[#354a3c]">Quản lý nhân viên</h2>
            <p className="mt-1 text-[11px] text-[#99a39c]">Thông tin tài khoản được đồng bộ với cơ sở dữ liệu</p>
          </div>
          <button type="button" onClick={openAdd} className="flex h-9 items-center gap-1.5 rounded-lg bg-[#548565] px-3 text-xs font-semibold text-white hover:bg-[#436b51]">
            <Plus className="size-3.5" /> Thêm nhân viên
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[980px] text-left">
            <thead>
              <tr className="bg-[#fafbfa] text-[10px] font-semibold uppercase tracking-wide text-[#9aa49c]">
                <th className="px-4 py-3">Username</th><th className="px-4 py-3">Mật khẩu</th>
                <th className="px-4 py-3">Họ tên</th><th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Điện thoại</th><th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3">Chức vụ / trạng thái</th><th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f0f2f0]">
              {staff.map((account) => (
                <tr key={account.id} className="text-xs text-[#56645a]">
                  <td className="px-4 py-3 font-semibold">{account.username}</td>
                  <td className="px-4 py-3 font-mono" aria-label="Mật khẩu được bảo vệ">••••••••</td>
                  <td className="px-4 py-3">{account.fullName}</td><td className="px-4 py-3">{account.email}</td>
                  <td className="px-4 py-3">{account.phone}</td>
                  <td className="px-4 py-3">{new Intl.DateTimeFormat('vi-VN').format(account.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span>{account.position === 'PHUC_VU' ? 'Phục vụ' : 'Pha chế'} · </span>
                    <span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${session?.role === 'STAFF' && session.id === account.id ? 'bg-[#edf5ef] text-[#4e815d]' : 'bg-gray-100 text-gray-500'}`}>
                      {session?.role === 'STAFF' && session.id === account.id ? 'Đang hoạt động' : 'Ngoại tuyến'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button type="button" onClick={() => openEdit(account)} aria-label={`Sửa ${account.username}`} className="rounded-md p-2 text-[#587362] hover:bg-[#edf4ef]"><Pencil className="size-3.5" /></button>
                      <button type="button" onClick={() => setDeleting(account)} aria-label={`Xóa ${account.username}`} className="rounded-md p-2 text-red-500 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {staff.length === 0 && <tr><td colSpan={8} className="px-4 py-9 text-center text-xs text-[#9aa49c]">Chưa có nhân viên.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      <Modal open={formOpen} onClose={() => setFormOpen(false)} title={editing ? 'Sửa thông tin nhân viên' : 'Thêm nhân viên'} description="Mật khẩu được lưu dưới dạng băm, không thể xem lại.">
        <form onSubmit={save} className="flex min-h-0 flex-1 flex-col">
          <div className="grid gap-3 overflow-y-auto px-5 py-4 sm:grid-cols-2">
            {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs text-red-700 sm:col-span-2">{error}</p>}
            <label className="text-xs font-medium">Họ tên<input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Tên đăng nhập<input required autoComplete="username" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Mật khẩu{editing && ' mới (để trống nếu giữ nguyên)'}<input required={!editing} minLength={1} type="password" autoComplete="new-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Số điện thoại<input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="mt-1.5 w-full rounded-lg border px-3 py-2" /></label>
            <label className="text-xs font-medium">Chức vụ<select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as StaffPosition })} className="mt-1.5 w-full rounded-lg border px-3 py-2"><option value="PHUC_VU">Phục vụ</option><option value="PHA_CHE">Pha chế</option></select></label>
          </div>
          <div className="flex justify-end gap-2 border-t px-5 py-3">
            <button type="button" onClick={() => setFormOpen(false)} className="rounded-lg border px-4 py-2 text-xs">Hủy</button>
            <button type="submit" disabled={saving} className="rounded-lg bg-[#548565] px-4 py-2 text-xs font-semibold text-white disabled:opacity-60">{saving ? 'Đang lưu...' : 'Lưu nhân viên'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!deleting} onClose={() => setDeleting(null)} title="Xóa nhân viên?" description={`Bạn có chắc muốn xóa ${deleting?.fullName ?? 'nhân viên'}?`}>
        <div className="flex justify-end gap-2 px-5 py-4">
          <button type="button" onClick={() => setDeleting(null)} className="rounded-lg border px-4 py-2 text-xs">Hủy</button>
          <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white">Xác nhận xóa</button>
        </div>
      </Modal>
    </>
  )
}
