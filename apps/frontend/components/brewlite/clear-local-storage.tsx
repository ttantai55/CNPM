'use client'

import { useEffect } from 'react'

const RESET_KEY = 'brewlite.storage-reset.v1'

export function ClearLocalStorage() {
  useEffect(() => {
    if (window.localStorage.getItem(RESET_KEY) === 'done') return
    window.localStorage.clear()
    window.localStorage.setItem(RESET_KEY, 'done')
    window.location.reload()
  }, [])

  return null
}
