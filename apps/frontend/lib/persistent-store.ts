'use client'

import { useSyncExternalStore } from 'react'

type Updater<T> = T | ((previous: T) => T)

export function createStore<T>(initial: T) {
  let state = initial
  const listeners = new Set<() => void>()

  function get() {
    return state
  }

  function set(next: Updater<T>) {
    state = typeof next === 'function' ? (next as (previous: T) => T)(state) : next
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    return () => listeners.delete(listener)
  }

  function useStore() {
    return useSyncExternalStore(subscribe, get, () => initial)
  }

  return { get, set, subscribe, useStore }
}

/**
 * Tiny localStorage-backed store shared across components, routes and browser tabs.
 * The server snapshot is always `initial`, so hydration never mismatches; the client
 * snapshot is read lazily from storage (or produced by `seed` on first visit).
 */
export function createPersistentStore<T>(key: string, initial: T, seed?: () => T) {
  let state = initial
  let hydrated = false
  const listeners = new Set<() => void>()

  function hydrate() {
    if (hydrated || typeof window === 'undefined') return
    hydrated = true
    try {
      const raw = window.localStorage.getItem(key)
      if (raw !== null) {
        state = JSON.parse(raw) as T
        return
      }
    } catch {
      // Corrupted or unavailable storage: fall back to the seed below.
    }
    if (seed) {
      state = seed()
      persist()
    }
  }

  function persist() {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch {
      // Storage may be full or blocked (private mode); keep the in-memory state.
    }
  }

  function get() {
    hydrate()
    return state
  }

  function set(next: Updater<T>) {
    hydrate()
    state = typeof next === 'function' ? (next as (previous: T) => T)(state) : next
    persist()
    listeners.forEach((listener) => listener())
  }

  function subscribe(listener: () => void) {
    listeners.add(listener)
    function onStorage(event: StorageEvent) {
      if (event.key !== key) return
      try {
        state = event.newValue === null ? initial : (JSON.parse(event.newValue) as T)
      } catch {
        state = initial
      }
      listener()
    }
    window.addEventListener('storage', onStorage)
    return () => {
      listeners.delete(listener)
      window.removeEventListener('storage', onStorage)
    }
  }

  const getServerSnapshot = () => initial

  function useStore() {
    return useSyncExternalStore(subscribe, get, getServerSnapshot)
  }

  return { get, set, subscribe, useStore }
}

const noopSubscribe = () => () => {}

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  )
}
