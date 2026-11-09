import { createStore } from './persistent-store'

export type StaffPosition = 'PHUC_VU' | 'PHA_CHE'

export type StaffAccount = {
  id: string
  username: string
  passwordSalt: string
  passwordHash: string
  fullName: string
  email: string
  phone: string
  position: StaffPosition
  createdAt: number
  isActive: boolean
}

export type CustomerAccount = {
  id: string
  username: string
  contact: string
  email: string
  name: string
  phone: string
  gender: boolean
  dateOfBirth: string
  address: string
  passwordSalt: string
  passwordHash: string
  createdAt: number
}

export const staffAccountStore = createStore<StaffAccount[]>([])
export const customerAccountStore = createStore<CustomerAccount[]>([])

export function updateCustomerAccount(
  id: string,
  updates: Partial<Omit<CustomerAccount, 'id' | 'passwordSalt' | 'passwordHash'>>,
) {
  customerAccountStore.set((current) =>
    current.map((customer) =>
      customer.id === id
        ? { ...customer, ...updates, contact: updates.email || updates.phone || customer.contact }
        : customer,
    ),
  )
}
