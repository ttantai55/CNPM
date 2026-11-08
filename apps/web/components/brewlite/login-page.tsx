'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  Check,
  Coffee,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react'
import { authStore, createDemoSession, dashboardForRole, type Role } from '@/lib/session'
import {
  createCustomerAccount,
  customerAccountStore,
  staffAccountStore,
  verifyPassword,
} from '@/lib/auth'
import { cartStore } from '@/lib/cart'

const DEMO_ACCOUNTS: { role: Role; label: string; email: string; initials: string }[] = [
  { role: 'CUSTOMER', label: 'Customer', email: 'user@brewlite.vn', initials: 'CU' },
  { role: 'STAFF', label: 'Staff · Nhân viên quầy', email: 'staff@brewlite.vn', initials: 'ST' },
  { role: 'MANAGER', label: 'Manager · Quản lý', email: 'manager@brewlite.vn', initials: 'MG' },
]

const identifierPattern = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?84|0)\d{9,10}|[\p{L}\d_.-]{3,40})$/u
const contactPattern = /^(?:[^\s@]+@[^\s@]+\.[^\s@]+|(?:\+?84|0)\d{9,10})$/u

export function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [notice, setNotice] = useState('')
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [registerName, setRegisterName] = useState('')
  const [registerContact, setRegisterContact] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [registerConfirm, setRegisterConfirm] = useState('')
  const [registrationComplete, setRegistrationComplete] = useState(false)

  const identifierError =
    mode === 'login' && submitted && !identifierPattern.test(identifier.trim())
      ? 'Vui lòng nhập email, số điện thoại hoặc tên đăng nhập hợp lệ.'
      : ''
  const passwordError = mode === 'login' && submitted && password.length < 6 ? 'Mật khẩu cần có ít nhất 6 ký tự.' : ''

  async function signIn(role?: Role, demoEmail?: string) {
    const loginAs = demoEmail ?? identifier.trim()
    if (!role) {
      setSubmitted(true)
      if (!identifierPattern.test(loginAs) || password.length < 6) return
    }

    setSubmitting(true)
    try {
      const normalized = loginAs.trim().toLowerCase()
      const staff = staffAccountStore.get().find(
        (account) =>
          [account.username, account.email, account.phone].some((value) => value.toLowerCase() === normalized),
      )
      const customer = customerAccountStore.get().find(
        (account) =>
          [account.username, account.contact].some((value) => value.toLowerCase() === normalized),
      )
      if (!role && staff) {
        if (!staff.isActive) {
          setNotice('Tài khoản nhân viên đã bị tạm khóa.')
          return
        }
        if (!(await verifyPassword(password, staff.passwordSalt, staff.passwordHash))) {
          setNotice('Tên đăng nhập hoặc mật khẩu không chính xác.')
          return
        }
        const session = {
          ...createDemoSession(staff.email, 'STAFF'),
          id: staff.id,
          name: staff.fullName,
          username: staff.username,
        }
        authStore.set(session)
        const checkoutRequested =
          new URLSearchParams(window.location.search).get('next') === 'checkout' &&
          cartStore.get().length > 0
        if (checkoutRequested) window.sessionStorage.setItem('brewlite.checkout-after-login', 'true')
        router.replace(dashboardForRole(session.role))
        return
      }
      if (!role && customer) {
        if (!(await verifyPassword(password, customer.passwordSalt, customer.passwordHash))) {
          setNotice('Tên đăng nhập hoặc mật khẩu không chính xác.')
          return
        }
        const session = {
          ...createDemoSession(customer.contact, 'CUSTOMER'),
          id: customer.id,
          email: customer.contact,
          name: customer.name?.trim() || customer.username,
          username: customer.username,
        }
        authStore.set(session)
        const checkoutRequested =
          new URLSearchParams(window.location.search).get('next') === 'checkout' &&
          cartStore.get().length > 0
        if (checkoutRequested) window.sessionStorage.setItem('brewlite.checkout-after-login', 'true')
        router.replace(dashboardForRole(session.role))
        return
      }
      if (customer || staff) {
        setNotice('Tài khoản không hoạt động hoặc thông tin đăng nhập không hợp lệ.')
        return
      }
      const session = createDemoSession(loginAs, role)
      authStore.set(session)
      const checkoutRequested =
        new URLSearchParams(window.location.search).get('next') === 'checkout' &&
        cartStore.get().length > 0
      if (session.role === 'CUSTOMER' && checkoutRequested) {
        window.sessionStorage.setItem('brewlite.checkout-after-login', 'true')
      }
      setSubmitting(false)
      router.replace(dashboardForRole(session.role))
    } catch {
      setNotice('Không thể xác thực tài khoản. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  async function register(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
    const username = registerName.trim()
    const contact = registerContact.trim()
    if (username.length < 3 || !contactPattern.test(contact) || registerPassword.length < 8 || registerPassword !== registerConfirm) {
      return
    }
    const duplicate = [...customerAccountStore.get(), ...staffAccountStore.get()].some((account) =>
      [account.username, 'contact' in account ? account.contact : account.email, 'phone' in account ? account.phone : '']
        .some((value) => value.toLowerCase() === contact.toLowerCase() || value.toLowerCase() === username.toLowerCase()),
    )
    if (duplicate) {
      setNotice('Tên đăng nhập, email hoặc số điện thoại đã được đăng ký.')
      return
    }
    setSubmitting(true)
    try {
      const account = await createCustomerAccount(username, contact, registerPassword)
      setRegisterName(account.username)
      setIdentifier(account.username)
      setRegisterPassword('')
      setRegisterConfirm('')
      setRegistrationComplete(true)
    } catch {
      setNotice('Không thể tạo tài khoản. Vui lòng thử lại.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh bg-white lg:grid-cols-[45%_55%]">
      <section className="relative hidden min-h-dvh overflow-hidden bg-[#173d34] px-12 py-10 text-white lg:flex lg:flex-col lg:justify-between xl:px-16">
        <div className="absolute -left-36 -top-32 size-[470px] rounded-full border border-white/10" />
        <div className="absolute -left-16 -top-12 size-[330px] rounded-full border border-white/10" />
        <div className="absolute -bottom-48 -right-36 size-[570px] rounded-full bg-[#285347]" />
        <div className="absolute bottom-12 right-10 size-64 rounded-full border border-white/10" />

        <a href="/" className="relative z-10 inline-flex w-fit items-center gap-3" aria-label="BrewLite trang chủ">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-[#e6b781] text-[#173d34] shadow-lg">
            <Coffee className="size-6" />
          </span>
          <span>
            <span className="block text-2xl font-bold tracking-tight">BrewLite</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-white/60">Brew your moment</span>
          </span>
        </a>

        <div className="relative z-10 -mt-6 max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-2 text-xs font-medium text-white/85">
            <Sparkles className="size-3.5 text-[#e6b781]" />
            Một chút tỉnh táo, thật nhiều cảm hứng
          </span>
          <h1 className="mt-7 text-5xl font-semibold leading-[1.14] tracking-tight xl:text-[60px]">
            Chậm lại một chút.
            <span className="mt-2 block font-normal italic text-[#e6b781]">Thưởng thức trọn vị.</span>
          </h1>
          <p className="mt-6 max-w-md text-[15px] leading-7 text-white/65">
            Cà phê rang mới, trà thơm mỗi ngày — chọn vị bạn yêu và để BrewLite chăm chút phần còn lại.
          </p>

          <div className="relative mt-11 flex h-[240px] max-w-[410px] items-center justify-center overflow-hidden rounded-[30px] border border-white/10 bg-gradient-to-br from-[#285b4c] via-[#1d4a3e] to-[#173d34]">
            <div className="absolute left-8 top-8 size-36 rounded-full bg-[#d49a62]/15 blur-2xl" />
            <div className="absolute bottom-0 right-5 size-48 rounded-full bg-[#e7b77d]/10 blur-3xl" />
            <div className="relative flex size-44 items-center justify-center rounded-full border border-white/10 bg-white/[0.04]">
              <div className="flex size-32 items-center justify-center rounded-[34px] bg-[#f3e8d8] shadow-[0_22px_45px_rgba(0,0,0,0.2)]">
                <Coffee className="size-[68px] stroke-[1.2] text-[#6b4935]" />
              </div>
              <span className="absolute -right-16 top-6 rounded-full bg-white px-3.5 py-2 text-xs font-semibold text-[#244b40] shadow-lg">
                Freshly brewed
              </span>
              <span className="absolute -left-14 bottom-5 flex items-center gap-1.5 rounded-full border border-white/10 bg-[#183e34]/90 px-3.5 py-2 text-xs font-medium text-white">
                <span className="size-1.5 rounded-full bg-[#9bd2a7]" />
                Pha chế mỗi ngày
              </span>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-5 text-xs text-white/55">
          <span>© 2025 BrewLite Coffee House</span>
          <span className="flex items-center gap-2"><ShieldCheck className="size-4" /> Đăng nhập an toàn</span>
        </div>
      </section>

      <section className="flex min-h-dvh items-center justify-center bg-[#faf9f7] px-5 py-10 sm:px-10 lg:bg-white">
        <div className="w-full max-w-[440px]">
          <a href="/" className="mb-9 inline-flex items-center gap-2.5 lg:hidden">
            <span className="flex size-10 items-center justify-center rounded-xl bg-[#173d34] text-white"><Coffee className="size-5" /></span>
            <span className="text-xl font-bold text-[#173d34]">BrewLite</span>
          </a>
          {registrationComplete ? (
            <div className="rounded-2xl border border-[#dce9df] bg-[#f5faf6] p-6 text-center">
              <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#e1f0e5] text-[#32735a]">
                <Check className="size-6" />
              </span>
              <h2 className="mt-4 text-2xl font-semibold text-[#23372f]">Đăng ký thành công!</h2>
              <p className="mt-2 text-sm text-[#7d8781]">Tài khoản đã được lưu. Đăng nhập để tiếp tục.</p>
              <button
                type="button"
                onClick={() => {
                  setRegistrationComplete(false)
                  setMode('login')
                  setSubmitted(false)
                  setNotice('')
                }}
                className="mt-5 h-11 w-full rounded-xl bg-[#285b4b] text-sm font-semibold text-white hover:bg-[#204d3f]"
              >
                Quay lại đăng nhập
              </button>
            </div>
          ) : <>
          <div className="mb-8">
            <p className="text-sm font-semibold text-[#b17b4c]">{mode === 'login' ? 'Chào mừng trở lại!' : 'Tham gia BrewLite'}</p>
            <h2 className="mt-2 text-[34px] font-semibold tracking-tight text-[#23372f]">{mode === 'login' ? 'Đăng nhập BrewLite' : 'Tạo tài khoản'}</h2>
            <p className="mt-2 text-sm text-[#7d8781]">{mode === 'login' ? 'Chọn tài khoản và tiếp tục hành trình vị giác của bạn.' : 'Đăng ký tài khoản khách hàng mới.'}</p>
          </div>

          {mode === 'login' ? <form
            noValidate
            onSubmit={(event) => {
              event.preventDefault()
              signIn()
            }}
            className="space-y-5"
          >
            <div>
              <label htmlFor="login-identifier" className="mb-2 block text-[13px] font-semibold text-[#35463e]">
                Tên đăng nhập / Email / Số điện thoại
              </label>
              <div className={`relative ${identifierError ? 'mb-1' : ''}`}>
                <UserRound className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-[#98a29c]" />
                <input
                  id="login-identifier"
                  autoComplete="username"
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Ví dụ: user@brewlite.vn"
                  aria-invalid={Boolean(identifierError)}
                  className={`h-[50px] w-full rounded-xl border bg-white pl-11 pr-4 text-sm text-[#263b32] outline-none transition focus:ring-4 ${identifierError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-[#e4e9e5] focus:border-[#4b806c] focus:ring-[#4b806c]/10'}`}
                />
              </div>
              {identifierError && <p className="mt-1.5 text-xs text-red-600">{identifierError}</p>}
            </div>

            <div>
              <label htmlFor="login-password" className="mb-2 block text-[13px] font-semibold text-[#35463e]">Mật khẩu</label>
              <div className="relative">
                <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-[17px] -translate-y-1/2 text-[#98a29c]" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Nhập mật khẩu"
                  aria-invalid={Boolean(passwordError)}
                  className={`h-[50px] w-full rounded-xl border bg-white pl-11 pr-12 text-sm text-[#263b32] outline-none transition focus:ring-4 ${passwordError ? 'border-red-400 focus:border-red-400 focus:ring-red-100' : 'border-[#e4e9e5] focus:border-[#4b806c] focus:ring-[#4b806c]/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#89948d] hover:bg-[#f2f5f2]"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? <EyeOff className="size-[18px]" /> : <Eye className="size-[18px]" />}
                </button>
              </div>
              {passwordError && <p className="mt-1.5 text-xs text-red-600">{passwordError}</p>}
            </div>

            <div className="flex items-center justify-between pt-0.5">
              <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-[#66736b]">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(event) => setRemember(event.target.checked)}
                  className="size-4 rounded border-[#cbd4ce] accent-[#285b4b]"
                />
                Ghi nhớ đăng nhập
              </label>
              <button
                type="button"
                onClick={() => setNotice('Vui lòng liên hệ cửa hàng để được hỗ trợ đặt lại mật khẩu.')}
                className="text-[13px] font-semibold text-[#32735a] hover:text-[#214d3d]"
              >
                Quên mật khẩu?
              </button>
            </div>

            {notice && <p role="status" className="rounded-lg bg-[#edf5f0] px-3 py-2 text-xs text-[#32735a]">{notice}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#285b4b] text-sm font-semibold text-white shadow-[0_8px_18px_rgba(40,91,75,0.18)] transition hover:bg-[#204d3f] hover:shadow-[0_10px_22px_rgba(40,91,75,0.24)] disabled:cursor-wait disabled:opacity-70"
            >
              {submitting ? (
                <span className="size-[18px] animate-spin rounded-full border-2 border-white/40 border-t-white" />
              ) : (
                <>Đăng nhập <ArrowRight className="size-4" /></>
              )}
            </button>
          </form> : (
            <form noValidate onSubmit={register} className="space-y-4">
              <div>
                <label htmlFor="register-username" className="mb-2 block text-[13px] font-semibold text-[#35463e]">Tên đăng nhập</label>
                <input id="register-username" required minLength={3} autoComplete="username" value={registerName} onChange={(event) => setRegisterName(event.target.value)} className="h-[50px] w-full rounded-xl border border-[#e4e9e5] bg-white px-4 text-sm outline-none focus:border-[#4b806c] focus:ring-4 focus:ring-[#4b806c]/10" />
                {submitted && registerName.trim().length < 3 && <p className="mt-1 text-xs text-red-600">Tên đăng nhập tối thiểu 3 ký tự.</p>}
              </div>
              <div>
                <label htmlFor="register-contact" className="mb-2 block text-[13px] font-semibold text-[#35463e]">Email hoặc số điện thoại</label>
                <input id="register-contact" required autoComplete="email" value={registerContact} onChange={(event) => setRegisterContact(event.target.value)} placeholder="ban@email.com hoặc 090..." className="h-[50px] w-full rounded-xl border border-[#e4e9e5] bg-white px-4 text-sm outline-none focus:border-[#4b806c] focus:ring-4 focus:ring-[#4b806c]/10" />
                {submitted && !identifierPattern.test(registerContact.trim()) && <p className="mt-1 text-xs text-red-600">Email, số điện thoại hoặc tên đăng nhập không hợp lệ.</p>}
              </div>
              <div>
                <label htmlFor="register-password" className="mb-2 block text-[13px] font-semibold text-[#35463e]">Mật khẩu</label>
                <input id="register-password" required minLength={8} type="password" autoComplete="new-password" value={registerPassword} onChange={(event) => setRegisterPassword(event.target.value)} className="h-[50px] w-full rounded-xl border border-[#e4e9e5] bg-white px-4 text-sm outline-none focus:border-[#4b806c] focus:ring-4 focus:ring-[#4b806c]/10" />
                {submitted && registerPassword.length < 8 && <p className="mt-1 text-xs text-red-600">Mật khẩu tối thiểu 8 ký tự.</p>}
              </div>
              <div>
                <label htmlFor="register-confirm" className="mb-2 block text-[13px] font-semibold text-[#35463e]">Nhập lại mật khẩu</label>
                <input id="register-confirm" required type="password" autoComplete="new-password" value={registerConfirm} onChange={(event) => setRegisterConfirm(event.target.value)} className="h-[50px] w-full rounded-xl border border-[#e4e9e5] bg-white px-4 text-sm outline-none focus:border-[#4b806c] focus:ring-4 focus:ring-[#4b806c]/10" />
                {submitted && registerConfirm !== registerPassword && <p className="mt-1 text-xs text-red-600">Mật khẩu xác nhận không khớp.</p>}
              </div>
              {notice && <p role="status" className="rounded-lg bg-[#edf5f0] px-3 py-2 text-xs text-[#32735a]">{notice}</p>}
              <button type="submit" disabled={submitting} className="flex h-[52px] w-full items-center justify-center gap-2 rounded-xl bg-[#285b4b] text-sm font-semibold text-white disabled:opacity-70">
                {submitting ? 'Đang tạo tài khoản...' : <>Đăng ký <ArrowRight className="size-4" /></>}
              </button>
            </form>
          )}

          <p className="mt-5 text-center text-sm text-[#66736b]">
            {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}{' '}
            <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setSubmitted(false); setNotice('') }} className="font-semibold text-[#32735a] hover:text-[#214d3d]">
              {mode === 'login' ? 'Đăng ký ngay' : 'Đăng nhập'}
            </button>
          </p>

          {mode === 'login' && <><div className="my-7 flex items-center gap-3">
            <span className="h-px flex-1 bg-[#e9ede9]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#a2aba5]">Tài khoản demo</span>
            <span className="h-px flex-1 bg-[#e9ede9]" />
          </div>

          <div className="space-y-2.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.role}
                type="button"
                onClick={() => signIn(account.role, account.email)}
                disabled={submitting}
                className="group flex w-full items-center gap-3 rounded-xl border border-[#e8ece8] bg-white px-3.5 py-3 text-left transition hover:border-[#9db8a8] hover:bg-[#f8fbf8] disabled:opacity-60"
              >
                <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg text-[11px] font-bold ${account.role === 'MANAGER' ? 'bg-[#f5efe5] text-[#9a6b3f]' : account.role === 'STAFF' ? 'bg-[#eaf2ed] text-[#34705a]' : 'bg-[#edf1f8] text-[#596e94]'}`}>
                  {account.initials}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[13px] font-semibold text-[#37483f]">Demo: {account.label}</span>
                  <span className="mt-0.5 block text-xs text-[#909a93]">{account.email}</span>
                </span>
                <ArrowRight className="size-4 text-[#a4afa8] transition group-hover:translate-x-0.5 group-hover:text-[#32735a]" />
              </button>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#a0a9a2]">
            <Check className="size-3.5 text-[#6e9a80]" /> {remember ? 'Phiên đăng nhập được lưu trên thiết bị này' : 'Phiên demo chỉ lưu trong trình duyệt'}
          </p>
          </>}
          </>}
        </div>
      </section>
    </main>
  )
}
