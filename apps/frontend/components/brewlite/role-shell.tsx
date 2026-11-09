'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, LogOut, UserRound } from 'lucide-react'
import { authStore, dashboardForRole, type Role } from '@/lib/session'
import { useHydrated } from '@/lib/persistent-store'
import { useState } from 'react'
import { Modal } from './modal'

export function RoleGuard({ role, children }: { role: Role; children: ReactNode }) {
  const router = useRouter()
  const hydrated = useHydrated()
  const session = authStore.useStore()

  useEffect(() => {
    if (!hydrated) return
    if (!session) router.replace('/login')
    else if (session.role !== role) router.replace(dashboardForRole(session.role))
  }, [hydrated, router, role, session])

  if (!hydrated || !session || session.role !== role) {
    return (
      <div className={`flex min-h-dvh items-center justify-center ${role === 'CUSTOMER' ? 'bg-[#fcfbf7]' : 'bg-[#f7f8f6]'}`}>
        <span className={`size-8 animate-spin rounded-full border-[3px] ${role === 'CUSTOMER' ? 'border-[#ede8e1] border-t-[#5c4033]' : 'border-[#d6e2d9] border-t-[#285b4b]'}`} />
      </div>
    )
  }
  return children
}

export function DashboardHeader({ role, title }: { role: Role; title: string }) {
  const router = useRouter()
  const session = authStore.useStore()
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false)
  const roleTitle = {
    CUSTOMER: 'Khách hàng',
    STAFF: 'Nhân viên quầy',
    MANAGER: 'Quản lý cửa hàng',
  }[role]
  const isCustomer = role === 'CUSTOMER'

  function signOut() {
    authStore.set(null)
    router.replace('/login')
  }

  return (
    <>
    <header className={`flex h-[76px] items-center justify-between border-b px-8 ${isCustomer ? 'border-[#ede8e1] bg-[#fcfbf7]' : 'border-[#e9ede9] bg-white'}`}>
      <div className="flex items-center gap-3">
        <span className={`flex size-10 items-center justify-center rounded-xl text-white ${isCustomer ? 'bg-[#5c4033]' : 'bg-[#285b4b]'}`}><Coffee className="size-5" /></span>
        <div>
          <p className={`text-[17px] font-bold tracking-tight ${isCustomer ? 'text-[#2e2520]' : 'text-[#23372f]'}`}>BrewLite</p>
          <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${isCustomer ? 'text-[#81766d]' : 'text-[#9aa59e]'}`}>{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className={`rounded-full px-3 py-1.5 text-[11px] font-semibold ${isCustomer ? 'bg-[#f3eee7] text-[#5c4033]' : 'bg-[#edf4ef] text-[#47765c]'}`}>{roleTitle}</span>
        <span className={`h-8 w-px ${isCustomer ? 'bg-[#ede8e1]' : 'bg-[#e8ece8]'}`} />
        <div className="flex items-center gap-2.5">
          <span className={`flex size-9 items-center justify-center rounded-full ${isCustomer ? 'bg-[#f3eee7] text-[#5c4033]' : 'bg-[#e9f1eb] text-[#49745b]'}`}><UserRound className="size-4" /></span>
          <div className="leading-tight">
            <p className={`text-xs font-semibold ${isCustomer ? 'text-[#2e2520]' : 'text-[#34473d]'}`}>{session?.name}</p>
            <p className={`mt-1 text-[10px] ${isCustomer ? 'text-[#81766d]' : 'text-[#97a19a]'}`}>{session?.email}</p>
          </div>
        </div>
        <button type="button" onClick={() => setLogoutConfirmOpen(true)} className={`ml-1 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold transition ${isCustomer ? 'border-[#ede8e1] text-[#81766d] hover:border-[#d8c8bc] hover:bg-[#f3eee7] hover:text-[#5c4033]' : 'border-[#e4e9e5] text-[#65736a] hover:border-[#d3aaa4] hover:bg-[#fff7f6] hover:text-[#aa5348]'}`}>
          <LogOut className="size-3.5" /> Đăng xuất
        </button>
      </div>
    </header>
    <Modal
      open={logoutConfirmOpen}
      onClose={() => setLogoutConfirmOpen(false)}
      title="Xác nhận đăng xuất"
      description="Bạn có chắc muốn đăng xuất không ?"
      className="p-5"
    >
      <div className="flex justify-end gap-2 px-5 pb-5">
        <button
          type="button"
          onClick={() => setLogoutConfirmOpen(false)}
          className="rounded-xl border border-[#e4e9e5] px-4 py-2.5 text-sm font-semibold text-[#65736a] transition hover:bg-[#f3f5f3]"
        >
          Hủy
        </button>
        <button
          type="button"
          onClick={signOut}
          className="rounded-xl bg-[#aa5348] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#91443a]"
        >
          Xác nhận đăng xuất
        </button>
      </div>
    </Modal>
    </>
  )
}
