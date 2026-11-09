'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Minus, Plus } from 'lucide-react'
import {
  ICE_OPTIONS,
  MAX_ITEM_QUANTITY,
  SIZE_SURCHARGE,
  SUGAR_OPTIONS,
  formatPrice,
  getUnitPrice,
  toppingStore,
  type CartItem,
  type IceOption,
  type Product,
  type SizeOption,
  type SugarOption,
} from '@/lib/menu'
import { cn } from '@/lib/utils'
import { Modal } from './modal'

type CustomizeDialogProps = {
  product: Product | null
  onClose: () => void
  onConfirm: (item: Omit<CartItem, 'key'>) => void
}

export function CustomizeDialog({ product, onClose, onConfirm }: CustomizeDialogProps) {
  return (
    <Modal
      open={product !== null}
      onClose={onClose}
      title="Tùy chỉnh thức uống"
      description="Chọn size, độ ngọt, lượng đá và topping"
    >
      {product && <CustomizeForm key={product.id} product={product} onConfirm={onConfirm} />}
    </Modal>
  )
}

function OptionChip({
  name,
  value,
  checked,
  onChange,
  children,
}: {
  name: string
  value: string
  checked: boolean
  onChange: () => void
  children: React.ReactNode
}) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-caramel/40',
        checked
          ? 'border-primary bg-primary text-primary-foreground'
          : 'border-border bg-card text-foreground/80 hover:bg-secondary',
      )}
    >
      <input type="radio" name={name} value={value} checked={checked} onChange={onChange} className="sr-only" />
      {children}
    </label>
  )
}

function CustomizeForm({
  product,
  onConfirm,
}: {
  product: Product
  onConfirm: (item: Omit<CartItem, 'key'>) => void
}) {
  const [size, setSize] = useState<SizeOption>('M')
  const [sugar, setSugar] = useState<SugarOption>('50%')
  const [ice, setIce] = useState<IceOption>('Đá vừa')
  const [toppingIds, setToppingIds] = useState<string[]>([])
  const [note, setNote] = useState('')
  const [quantity, setQuantity] = useState(1)
  const toppings = toppingStore.useStore()

  const unitPrice = getUnitPrice({ productId: product.id, size, toppingIds })
  const total = unitPrice * quantity

  function toggleTopping(id: string) {
    setToppingIds((current) => {
      if (current.includes(id)) return current.filter((t) => t !== id)
      if (current.length >= 3) return current
      return [...current, id]
    })
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onConfirm({ productId: product.id, size, sugar, ice, toppingIds, note: note.trim(), quantity })
  }

  return (
    <form onSubmit={handleSubmit} className="flex min-h-0 flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="relative size-20 shrink-0 overflow-hidden rounded-2xl bg-muted">
            <Image src={product.imageUrl || '/placeholder.svg'} alt="" fill sizes="80px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-foreground">{product.name}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{product.description}</p>
            <p className="mt-1.5 text-sm font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
        </div>

        <fieldset className="mt-6">
          <legend className="text-sm font-semibold text-foreground">Size</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(Object.keys(SIZE_SURCHARGE) as SizeOption[]).map((s) => (
              <OptionChip key={s} name="size" value={s} checked={size === s} onChange={() => setSize(s)}>
                Size {s}
                {SIZE_SURCHARGE[s] > 0 && (
                  <span className="ml-1 font-normal opacity-80">+{formatPrice(SIZE_SURCHARGE[s])}</span>
                )}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-foreground">Độ ngọt</legend>
          <div className="mt-2 grid grid-cols-5 gap-2">
            {SUGAR_OPTIONS.map((s) => (
              <OptionChip key={s} name="sugar" value={s} checked={sugar === s} onChange={() => setSugar(s)}>
                {s}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="text-sm font-semibold text-foreground">Lượng đá</legend>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {ICE_OPTIONS.map((i) => (
              <OptionChip key={i} name="ice" value={i} checked={ice === i} onChange={() => setIce(i)}>
                {i}
              </OptionChip>
            ))}
          </div>
        </fieldset>

        <fieldset className="mt-5">
          <legend className="flex w-full items-center justify-between text-sm font-semibold text-foreground">
            Topping
          </legend>
          <p className="text-xs text-muted-foreground">Chọn tối đa 3 loại ({toppingIds.length}/3)</p>
          <div className="mt-2 flex flex-col gap-2">
            {toppings.map((t) => {
              const checked = toppingIds.includes(t.id)
              const disabled = !checked && toppingIds.length >= 3
              return (
                <label
                  key={t.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors',
                    checked ? 'border-caramel bg-caramel-soft/40' : 'border-border hover:bg-muted',
                    disabled && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={disabled}
                    onChange={() => toggleTopping(t.id)}
                    className="size-4 accent-[var(--primary)]"
                  />
                  <span className="flex-1 text-foreground">{t.name}</span>
                  <span className="text-xs font-semibold text-muted-foreground">+{formatPrice(t.price)}</span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <div className="mt-5">
          <label htmlFor="item-note" className="text-sm font-semibold text-foreground">
            Ghi chú cho quán
          </label>
          <textarea
            id="item-note"
            value={note}
            onChange={(event) => setNote(event.target.value.slice(0, 100))}
            rows={2}
            placeholder="Ví dụ: ít ngọt hơn, tách đá riêng..."
            className="mt-2 w-full resize-none rounded-xl border border-input bg-card px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-caramel focus:outline-none focus:ring-2 focus:ring-caramel/30"
          />
          <p className="text-right text-[11px] text-muted-foreground">{note.length}/100</p>
        </div>
      </div>

      <div className="flex items-center gap-3 border-t border-border px-5 py-4">
        <QuantityStepper
          value={quantity}
          onChange={setQuantity}
          label={product.name}
          size="lg"
        />
        <button
          type="submit"
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Thêm vào giỏ · {formatPrice(total)}
        </button>
      </div>
    </form>
  )
}

export function QuantityStepper({
  value,
  onChange,
  label,
  min = 1,
  size = 'sm',
}: {
  value: number
  onChange: (value: number) => void
  label: string
  min?: number
  size?: 'sm' | 'lg'
}) {
  const btn = cn(
    'flex items-center justify-center text-foreground/70 transition-colors hover:text-foreground disabled:opacity-40',
    size === 'lg' ? 'size-10' : 'size-7',
  )
  return (
    <div
      className={cn(
        'flex items-center rounded-lg border border-border bg-card',
        size === 'lg' && 'rounded-xl',
      )}
    >
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        className={btn}
      >
        <Minus className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Giảm số lượng {label}</span>
      </button>
      <span className="min-w-7 text-center text-sm font-semibold tabular-nums text-foreground" aria-live="polite">
        <span className="sr-only">Số lượng </span>
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_ITEM_QUANTITY}
        className={btn}
      >
        <Plus className="size-3.5" aria-hidden="true" />
        <span className="sr-only">Tăng số lượng {label}</span>
      </button>
    </div>
  )
}
