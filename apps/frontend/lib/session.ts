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

const AUTH_SESSION_STORAGE_KEY = 'brewlite.session'
export const authStore = createPersistentStore<AuthSession | null>(AUTH_SESSION_STORAGE_KEY, null)

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null

  const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY)
  if (!rawSession) return null

  const session = JSON.parse(rawSession) as Partial<AuthSession> | null
  return typeof session?.token === 'string' && session.token.trim()
    ? session.token.trim()
    : null
}

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
