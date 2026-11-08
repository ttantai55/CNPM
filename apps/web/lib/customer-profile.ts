'use client'

import { createPersistentStore } from './persistent-store'

export type CustomerProfile = {
  name: string
  phone: string
  address: string
  gender: boolean
  dateOfBirth: string
  avatarUrl: string
}

export const customerProfileStore = createPersistentStore<Record<string, CustomerProfile>>(
  'brewlite.customer-profiles',
  {},
)
