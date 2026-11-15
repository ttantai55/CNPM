'use client'

import { useEffect, useState } from 'react'
import { authApi } from '@/lib/api'
import { Modal } from './modal'

type ChangePasswordDialogProps = {
  open: boolean
  onClose: () => void
  userId: string
}

type FieldErrors = Partial<Record<'currentPassword' | 'newPassword' | 'confirmNewPassword', string>>

const fieldClass =
  'h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground outline-none focus:border-caramel focus:ring-2 focus:ring-caramel/30'

export function ChangePasswordDialog({ open, onClose, userId }: ChangePasswordDialogProps) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmNewPassword, setConfirmNewPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setCurrentPassword('')
    setNewPassword('')
    setConfirmNewPassword('')
    setFieldErrors({})
    setError('')
    setSuccess('')
  }, [open, userId])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const errors: FieldErrors = {
      currentPassword: currentPassword.trim() ? '' : 'Vui lòng nhập mật khẩu hiện tại.',
      newPassword: newPassword.trim().length < 8 ? 'Mật khẩu mới cần có ít nhất 8 ký tự.' : '',
      confirmNewPassword: confirmNewPassword !== newPassword ? 'Mật khẩu xác nhận không khớp.' : '',
    }
    setFieldErrors(errors)
    if (Object.values(errors).some(Boolean)) return

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await authApi.changePassword(userId, { currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmNewPassword('')
      setSuccess('Đổi mật khẩu thành công.')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể đổi mật khẩu.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Đổi mật khẩu"
      description="Tạo mật khẩu mới để bảo vệ tài khoản của bạn."
    >
      <form noValidate onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <label className="block text-xs font-medium text-muted-foreground">
            Mật khẩu hiện tại
            <input
              type="password"
              autoComplete="current-password"
              required
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.currentPassword)}
              className={`${fieldClass} mt-1.5 ${fieldErrors.currentPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}`}
            />
            {fieldErrors.currentPassword && <span className="mt-1 block text-xs text-red-600">{fieldErrors.currentPassword}</span>}
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.newPassword)}
              className={`${fieldClass} mt-1.5 ${fieldErrors.newPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}`}
            />
            {fieldErrors.newPassword && <span className="mt-1 block text-xs text-red-600">{fieldErrors.newPassword}</span>}
          </label>
          <label className="block text-xs font-medium text-muted-foreground">
            Xác nhận mật khẩu mới
            <input
              type="password"
              autoComplete="new-password"
              required
              value={confirmNewPassword}
              onChange={(event) => setConfirmNewPassword(event.target.value)}
              aria-invalid={Boolean(fieldErrors.confirmNewPassword)}
              className={`${fieldClass} mt-1.5 ${fieldErrors.confirmNewPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/25' : ''}`}
            />
            {fieldErrors.confirmNewPassword && <span className="mt-1 block text-xs text-red-600">{fieldErrors.confirmNewPassword}</span>}
          </label>
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          {success && <p role="status" className="text-xs text-emerald-700">{success}</p>}
        </div>
        <div className="border-t border-border bg-muted/50 px-5 py-4">
          <button
            type="submit"
            disabled={saving}
            className="h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {saving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
