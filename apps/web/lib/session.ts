'use client'

import { createPersistentStore } from './persistent-store'

export type Role = 'CUSTOMER' | 'STAFF' | 'MANAGER'

export type AuthSession = {
  token: string
  role: Role
  name: string
  email: string
  id: string
  username: string
  createdAt: number
}

export const authStore = createPersistentStore<AuthSession | null>('brewlite.session', null)

export function dashboardForRole(role: Role) {
  switch (role) {
    case 'STAFF':
      return '/staff/orders'
    case 'MANAGER':
      return '/admin/dashboard'
    default:
      return '/'
  }
}

export function createDemoSession(identifier: string, selectedRole?: Role): AuthSession {
  const demoUsers: Record<Role, { name: string; email: string }> = {
    CUSTOMER: { name: 'Minh Anh', email: 'user@brewlite.vn' },
    STAFF: { name: 'Nguyễn Hải Nam', email: 'staff@brewlite.vn' },
    MANAGER: { name: 'Linh Nguyễn', email: 'manager@brewlite.vn' },
  }
  const demoMatch = (Object.entries(demoUsers) as [Role, (typeof demoUsers)[Role]][]).find(
    ([, user]) => user.email === identifier.toLowerCase(),
  )
  const role = selectedRole ?? demoMatch?.[0] ?? 'CUSTOMER'
  const user = demoMatch && !selectedRole
    ? demoMatch[1]
    : selectedRole && demoUsers[selectedRole]
      ? demoUsers[selectedRole]
    : { name: identifier.includes('@') ? identifier.split('@')[0] : identifier, email: identifier }
  const payload = btoa(JSON.stringify({ sub: user.email, role, iat: Date.now() }))

  return {
    token: `mock.${payload}.brewlite-demo`,
    role,
    id: `usr_${user.email.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    username: user.email.split('@')[0],
    createdAt: Date.now(),
    ...user,
  }
}
