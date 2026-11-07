'use client'

import Image from 'next/image'
import { ShoppingBag, Trash2 } from 'lucide-react'
import { TOPPINGS, formatPrice, getProduct, getUnitPrice, type CartItem } from '@/lib/menu'
import { cn } from '@/lib/utils'
import { QuantityStepper } from './customize-dialog'

type CartPanelProps = {
  items: CartItem[]
  onQuantityChange: (key: string, quantity: number) => void
  onRemove: (key: string) => void
  onCheckout: () => void
  showHeader?: boolean
  className?: string
}

export function CartPanel({
  items,
  onQuantityChange,
  onRemove,
  onCheckout,
  showHeader = true,
  className,
}: CartPanelProps) {
  const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)
  const lineCount = items.length

  return (
    <div className={cn('flex min-h-0 flex-col', className)}>
      {showHeader && (
        <div className="flex items-center gap-3 border-b border-border px-4 py-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
            <ShoppingBag className="size-[18px]" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <h2 className="text-[15px] font-semibold text-foreground">Giỏ hàng của bạn</h2>
            <p className="text-xs text-muted-foreground">{lineCount} món đã chọn</p>
          </div>
          <span className="flex size-7 items-center justify-center rounded-full bg-secondary text-xs font-bold text-primary">
            {lineCount}
          </span>
        </div>
      )}

      {items.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-primary">
            <ShoppingBag className="size-6" aria-hidden="true" />
          </span>
          <p className="mt-4 text-sm font-semibold text-foreground">Giỏ hàng đang trống</p>
          <p className="mt-1 text-xs text-muted-foreground">Chọn một thức uống để bắt đầu nhé.</p>
        </div>
      ) : (
        <ul className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
          {items.map((item) => {
            const product = getProduct(item.productId)
            if (!product) return null
            const toppingNames = item.toppingIds
              .map((id) => TOPPINGS.find((t) => t.id === id)?.name)
              .filter(Boolean)
            return (
              <li key={item.key} className="rounded-2xl border border-border bg-card p-3">
                <div className="flex gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={product.image || '/placeholder.svg'} alt="" fill sizes="48px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold leading-snug text-foreground">{product.name}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Size {item.size} · Đường {item.sugar} · {item.ice}
                    </p>
                    {toppingNames.map((name) => (
                      <p key={name} className="text-[11px] text-muted-foreground">
                        + {name}
                      </p>
                    ))}
                    {item.note && (
                      <p className="mt-0.5 text-[11px] italic text-muted-foreground">
                        {'"'}
                        {item.note}
                        {'"'}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.key)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                    <span className="sr-only">Xóa {product.name}</span>
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                  <QuantityStepper
                    value={item.quantity}
                    onChange={(q) => onQuantityChange(item.key, q)}
                    label={product.name}
                  />
                  <p className="text-sm font-bold text-foreground">
                    {formatPrice(getUnitPrice(item) * item.quantity)}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="border-t border-border bg-muted/50 px-4 pb-4 pt-4">
        <dl className="flex flex-col gap-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tạm tính</dt>
            <dd className="font-semibold text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phí giao hàng</dt>
            <dd className="font-semibold text-success">Tính khi thanh toán</dd>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-border pt-3">
            <dt className="font-semibold text-foreground">Tổng cộng</dt>
            <dd className="text-xl font-bold text-foreground">{formatPrice(subtotal)}</dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onCheckout}
          disabled={items.length === 0}
          className="mt-4 h-11 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Tiến hành thanh toán
        </button>
      </div>
    </div>
  )
}
