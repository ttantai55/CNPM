'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Modal } from './modal'
import { FormField, inputClass } from './form-field'
import type { User } from './app-header'

type Mode = 'login' | 'register'
type Values = { name: string; email: string; password: string; confirm: string }
type Errors = Partial<Record<keyof Values, string>>

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function validate(values: Values, mode: Mode): Errors {
  const errors: Errors = {}
  if (mode === 'register' && values.name.trim().length < 2) errors.name = 'Vui lòng nhập họ tên.'
  if (!EMAIL_PATTERN.test(values.email.trim())) errors.email = 'Email không hợp lệ.'
  if (values.password.length < 8) errors.password = 'Mật khẩu tối thiểu 8 ký tự.'
  if (mode === 'register' && values.confirm !== values.password)
    errors.confirm = 'Mật khẩu xác nhận không khớp.'
  return errors
}

type AuthDialogProps = {
  open: boolean
  onClose: () => void
  onAuthenticated: (user: User) => void
}

export function AuthDialog({ open, onClose, onAuthenticated }: AuthDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title="Chào mừng đến BrewLite" description="Đăng nhập để tích điểm và lưu món yêu thích">
      {open && <AuthForm onAuthenticated={onAuthenticated} />}
    </Modal>
  )
}

function AuthForm({ onAuthenticated }: { onAuthenticated: (user: User) => void }) {
  const [mode, setMode] = useState<Mode>('login')
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirm: '' })
  const [submitted, setSubmitted] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(values, mode)
  const errorFor = (field: keyof Values) => (submitted ? errors[field] : undefined)

  function update(field: keyof Values) {
    return (event: React.ChangeEvent<HTMLInputElement>) =>
      setValues((v) => ({ ...v, [field]: event.target.value }))
  }

  function switchMode(next: Mode) {
    setMode(next)
    setSubmitted(false)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) {
      event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 800))
    setSubmitting(false)
    const email = values.email.trim()
    onAuthenticated({ name: mode === 'register' ? values.name.trim() : email.split('@')[0], email })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4 overflow-y-auto px-5 py-5">
      <div role="tablist" aria-label="Chế độ" className="grid grid-cols-2 rounded-xl bg-muted p-1">
        {(['login', 'register'] as const).map((m) => (
          <button
            key={m}
            type="button"
            role="tab"
            aria-selected={mode === m}
            onClick={() => switchMode(m)}
            className={cn(
              'rounded-lg py-2 text-sm font-semibold transition-colors',
              mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {m === 'login' ? 'Đăng nhập' : 'Đăng ký'}
          </button>
        ))}
      </div>

      {mode === 'register' && (
        <FormField id="auth-name" label="Họ và tên" error={errorFor('name')}>
          {(props) => (
            <input {...props} type="text" autoComplete="name" value={values.name} onChange={update('name')} className={inputClass(!!props['aria-invalid'])} />
          )}
        </FormField>
      )}

      <FormField id="auth-email" label="Email" error={errorFor('email')}>
        {(props) => (
          <input
            {...props}
            type="email"
            autoComplete="email"
            value={values.email}
            onChange={update('email')}
            placeholder="ban@email.com"
            className={inputClass(!!props['aria-invalid'])}
          />
        )}
      </FormField>

      <FormField id="auth-password" label="Mật khẩu" error={errorFor('password')}>
        {(props) => (
          <div className="relative">
            <input
              {...props}
              type={showPassword ? 'text' : 'password'}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              value={values.password}
              onChange={update('password')}
              className={cn(inputClass(!!props['aria-invalid']), 'pr-11')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-pressed={showPassword}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted"
            >
              {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
              <span className="sr-only">{showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}</span>
            </button>
          </div>
        )}
      </FormField>

      {mode === 'register' && (
        <FormField id="auth-confirm" label="Xác nhận mật khẩu" error={errorFor('confirm')}>
          {(props) => (
            <input
              {...props}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              value={values.confirm}
              onChange={update('confirm')}
              className={inputClass(!!props['aria-invalid'])}
            />
          )}
        </FormField>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-1 flex h-11 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
      >
        {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
        {mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản'}
      </button>
    </form>
  )
}
