'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, UserRound } from 'lucide-react'
import type { CustomerProfile } from '@/lib/customer-profile'
import { Modal } from './modal'

type ProfileUser = {
  id: string
  username: string
  email: string
  createdAt: number
}

type ProfileDialogProps = {
  open: boolean
  onClose: () => void
  user: ProfileUser
  profile: CustomerProfile
  onSave: (profile: CustomerProfile) => void
}

const fieldClass =
  'h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/30'
const readonlyClass = `${fieldClass} bg-muted text-muted-foreground`

export function ProfileDialog({ open, onClose, user, profile: initialProfile, onSave }: ProfileDialogProps) {
  const [profile, setProfile] = useState(initialProfile)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setProfile(initialProfile)
    setError('')
  }, [open, initialProfile.name, initialProfile.phone, initialProfile.address, initialProfile.gender, initialProfile.dateOfBirth, initialProfile.avatarUrl])

  function update(field: keyof CustomerProfile, value: string | boolean) {
    setProfile((current) => ({ ...current, [field]: value }))
  }

  function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setError('Vui lòng chọn tệp hình ảnh hợp lệ.')
      return
    }
    if (file.size > 1024 * 1024) {
      setError('Ảnh đại diện cần có dung lượng tối đa 1 MB.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        update('avatarUrl', reader.result)
        setError('')
      }
    }
    reader.onerror = () => setError('Không thể đọc tệp ảnh. Vui lòng thử lại.')
    reader.readAsDataURL(file)
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (profile.name.trim().length < 2) {
      setError('Vui lòng nhập họ tên có ít nhất 2 ký tự.')
      return
    }
    onSave({ ...profile, name: profile.name.trim() })
    onClose()
  }

  const createdAt = user.createdAt
    ? new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium' }).format(user.createdAt)
    : 'Chưa có dữ liệu'

  return (
    <Modal open={open} onClose={onClose} title="Hồ sơ của tôi" description="Quản lý thông tin tài khoản và khách hàng">
      <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-4">
          <section className="space-y-3" aria-label="Tài khoản">
            <h3 className="text-sm font-semibold text-foreground">Tài khoản</h3>
            <div className="grid gap-3 sm:grid-cols-3">
            {[
              ['ID', user.id],
              ['Username', user.username],
              ['Email', user.email],
              ['Ngày tạo tài khoản', createdAt],
            ].map(([label, value]) => (
              <label key={label} className="block text-xs font-medium text-muted-foreground">
                {label}
                <input value={value} readOnly className={`${readonlyClass} mt-1.5`} />
              </label>
            ))}
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-4" aria-label="Thông tin khách hàng">
            <h3 className="text-sm font-semibold text-foreground">Thông tin cá nhân</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="block text-xs font-medium text-muted-foreground">
                Họ tên
                <input
                  required
                  minLength={2}
                  value={profile.name}
                  onChange={(event) => update('name', event.target.value)}
                  className={`${fieldClass} mt-1.5`}
                />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Số điện thoại
                <input
                  type="tel"
                  autoComplete="tel"
                  value={profile.phone}
                  onChange={(event) => update('phone', event.target.value)}
                  className={`${fieldClass} mt-1.5`}
                />
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Giới tính
                <select
                  value={profile.gender ? 'male' : 'female'}
                  onChange={(event) => update('gender', event.target.value === 'male')}
                  className={`${fieldClass} mt-1.5`}
                >
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                </select>
              </label>
              <label className="block text-xs font-medium text-muted-foreground">
                Ngày sinh
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(event) => update('dateOfBirth', event.target.value)}
                  className={`${fieldClass} mt-1.5`}
                />
              </label>
              <label className="block text-xs font-medium text-muted-foreground sm:col-span-2">
                Địa chỉ
                <input
                  autoComplete="street-address"
                  value={profile.address}
                  onChange={(event) => update('address', event.target.value)}
                  className={`${fieldClass} mt-1.5`}
                />
              </label>
            </div>
          </section>

          <section className="space-y-3 border-t border-border pt-4" aria-label="Ảnh đại diện">
            <h3 className="text-sm font-semibold text-foreground">Ảnh đại diện</h3>
            <div>
              <div className="mt-1.5 flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-muted-foreground">
                  {profile.avatarUrl ? (
                    <Image src={profile.avatarUrl} alt="Xem trước ảnh đại diện" width={48} height={48} unoptimized className="size-full object-cover" />
                  ) : (
                    <UserRound className="size-6" aria-hidden="true" />
                  )}
                </span>
                <input
                  aria-label="URL ảnh đại diện"
                  value={profile.avatarUrl.startsWith('data:') ? '' : profile.avatarUrl}
                  onChange={(event) => update('avatarUrl', event.target.value)}
                  placeholder="Dán URL ảnh"
                  className={fieldClass}
                />
                <label className="flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl border border-border px-3 text-xs font-semibold text-foreground hover:bg-muted">
                  <ImagePlus className="size-4" aria-hidden="true" />
                  Tải ảnh
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="sr-only" />
                </label>
              </div>
            </div>
          </section>
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
        </div>
        <div className="border-t border-border bg-muted/50 px-5 py-4">
          <button type="submit" className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Lưu thay đổi
          </button>
        </div>
      </form>
    </Modal>
  )
}
