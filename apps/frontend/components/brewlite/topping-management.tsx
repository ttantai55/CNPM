'use client'

import { useEffect, useState } from 'react'
import { adminApi, type ApiTopping } from '@/lib/api'

export function ToppingManagement() {
  const [toppings, setToppings] = useState<ApiTopping[]>([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    adminApi.toppings()
      .then((items) => { if (active) setToppings(items) })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Không tải được topping.')
      })
    return () => { active = false }
  }, [])

  async function toggle(topping: ApiTopping) {
    setBusyId(topping.id)
    setError('')
    try {
      const updated = await adminApi.updateToppingAvailability(topping.id, !topping.isAvailable)
      setToppings((items) => items.map((item) => item.id === updated.id ? updated : item))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể cập nhật topping.')
    } finally {
      setBusyId(null)
    }
  }

  return (
    <section id="toppings" className="mt-5 scroll-mt-5 rounded-2xl border border-[#e8ede8] bg-white">
      <div className="border-b border-[#edf0ed] px-5 py-4">
        <h2 className="text-sm font-semibold text-[#354a3c]">Quản lý Topping</h2>
        <p className="mt-1 text-[11px] text-[#99a39c]">Bật topping có sẵn hoặc đánh dấu hết hàng</p>
      </div>
      {error && <p role="alert" className="px-5 pt-3 text-xs text-red-700">{error}</p>}
      <ul className="divide-y divide-[#f0f2f0]">
        {toppings.map((topping) => (
          <li key={topping.id} className="flex items-center gap-3 px-5 py-3">
            <span className="min-w-0 flex-1 text-xs font-semibold text-[#46574c]">{topping.name}</span>
            <span className={`text-[10px] ${topping.isAvailable ? 'text-[#5f8a68]' : 'text-red-600'}`}>
              {topping.isAvailable ? 'Có sẵn' : 'Hết hàng'}
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={topping.isAvailable}
              aria-label={`${topping.isAvailable ? 'Đánh dấu hết hàng' : 'Đánh dấu có sẵn'}: ${topping.name}`}
              disabled={busyId === topping.id}
              onClick={() => void toggle(topping)}
              className={`relative h-6 w-11 rounded-full transition disabled:opacity-50 ${topping.isAvailable ? 'bg-[#548565]' : 'bg-gray-300'}`}
            >
              <span className={`absolute top-0.5 size-5 rounded-full bg-white transition ${topping.isAvailable ? 'left-5' : 'left-0.5'}`} />
            </button>
          </li>
        ))}
        {toppings.length === 0 && !error && (
          <li className="px-5 py-6 text-center text-xs text-[#99a39c]">Chưa có topping.</li>
        )}
      </ul>
    </section>
  )
}
