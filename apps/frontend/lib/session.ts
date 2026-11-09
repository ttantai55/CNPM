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
