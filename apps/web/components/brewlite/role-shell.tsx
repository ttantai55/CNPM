'use client'

import type { ReactNode } from 'react'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Coffee, LogOut, UserRound } from 'lucide-react'
import { authStore, dashboardForRole, type Role } from '@/lib/session'
import { useHydrated } from '@/lib/persistent-store'

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
      <div className="flex min-h-dvh items-center justify-center bg-[#f7f8f6]">
        <span className="size-8 animate-spin rounded-full border-[3px] border-[#d6e2d9] border-t-[#285b4b]" />
      </div>
    )
  }
  return children
}

export function DashboardHeader({ role, title }: { role: Role; title: string }) {
  const router = useRouter()
  const session = authStore.useStore()
  const roleTitle = {
    CUSTOMER: 'Khách hàng',
    STAFF: 'Nhân viên quầy',
    MANAGER: 'Quản lý cửa hàng',
  }[role]

  function signOut() {
    authStore.set(null)
    router.replace('/login')
  }

  return (
    <header className="flex h-[76px] items-center justify-between border-b border-[#e9ede9] bg-white px-8">
      <div className="flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-xl bg-[#285b4b] text-white"><Coffee className="size-5" /></span>
        <div>
          <p className="text-[17px] font-bold tracking-tight text-[#23372f]">BrewLite</p>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#9aa59e]">{title}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="rounded-full bg-[#edf4ef] px-3 py-1.5 text-[11px] font-semibold text-[#47765c]">{roleTitle}</span>
        <span className="h-8 w-px bg-[#e8ece8]" />
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-full bg-[#e9f1eb] text-[#49745b]"><UserRound className="size-4" /></span>
          <div className="leading-tight">
            <p className="text-xs font-semibold text-[#34473d]">{session?.name}</p>
            <p className="mt-1 text-[10px] text-[#97a19a]">{session?.email}</p>
          </div>
        </div>
        <button onClick={signOut} className="ml-1 flex items-center gap-2 rounded-lg border border-[#e4e9e5] px-3 py-2 text-xs font-semibold text-[#65736a] transition hover:border-[#d3aaa4] hover:bg-[#fff7f6] hover:text-[#aa5348]">
          <LogOut className="size-3.5" /> Đăng xuất
        </button>
      </div>
    </header>
  )
}
