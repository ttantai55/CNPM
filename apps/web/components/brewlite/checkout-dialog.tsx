'use client'

import { useState } from 'react'
import { Bike, Loader2, ShieldCheck, Store } from 'lucide-react'
import { formatPrice, getUnitPrice, type CartItem } from '@/lib/menu'
import { cartItemToLine, generateOrderCode, type Fulfillment, type OrderDraft } from '@/lib/orders'
import { cn } from '@/lib/utils'
import { Modal } from './modal'
import { FormField, inputClass } from './form-field'

const DELIVERY_FEE: Record<Fulfillment, number> = { delivery: 15000, pickup: 0 }

type FormValues = { name: string; phone: string; address: string; note: string }
type FormErrors = Partial<Record<keyof FormValues, string>>

const PHONE_PATTERN = /^(0|\+84)(3|5|7|8|9)\d{8}$/

function validate(values: FormValues, delivery: Fulfillment): FormErrors {
  const errors: FormErrors = {}
  if (values.name.trim().length < 2) errors.name = 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).'
  if (!PHONE_PATTERN.test(values.phone.replace(/\s/g, '')))
    errors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567).'
  if (delivery === 'delivery' && values.address.trim().length < 8)
    errors.address = 'Vui lòng nhập địa chỉ giao hàng chi tiết.'
  return errors
}

type CheckoutDialogProps = {
  open: boolean
  onClose: () => void
  items: CartItem[]
  defaultName?: string
  defaultPhone?: string
  onPlaced?: () => void;
  onProceedToPayment: (draft: OrderDraft) => void
}

export function CheckoutDialog({
  open,
  onClose,
  items,
  defaultName,
  defaultPhone,
  onProceedToPayment,
  onPlaced,
}: CheckoutDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Thông tin đặt hàng"
      description="Hoàn tất thông tin để BrewLite chuẩn bị đơn cho bạn"
    >
      <CheckoutForm
        items={items}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
        onSubmit={onProceedToPayment}
      />
    </Modal>
  )
}

function CheckoutForm({
  items,
  defaultName,
  defaultPhone,
  onSubmit,
}: {
  items: CartItem[]
  defaultName?: string
  defaultPhone?: string
  onSubmit: (draft: OrderDraft) => void
}) {
  const [values, setValues] = useState<FormValues>({
    name: defaultName ?? '',
    phone: defaultPhone ?? '',
    address: '',
    note: '',
  })
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [delivery, setDelivery] = useState<Fulfillment>('delivery')
  const [submitting, setSubmitting] = useState(false)

  const errors = validate(values, delivery)
  const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)
  const fee = DELIVERY_FEE[delivery]
  const total = subtotal + fee

  function update(field: keyof FormValues) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: event.target.value }))
  }

  function markTouched(field: keyof FormValues) {
    return () => setTouched((t) => ({ ...t, [field]: true }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ name: true, phone: true, address: true })
    if (items.length === 0) return
    if (Object.keys(errors).length > 0) {
      const firstInvalid = event.currentTarget.querySelector<HTMLElement>('[aria-invalid="true"]')
      firstInvalid?.focus()
      return
    }
    setSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 600))
    setSubmitting(false)
    onSubmit({
      code: generateOrderCode(),
      customerName: values.name.trim(),
      phone: values.phone.replace(/\s/g, ''),
      fulfillment: delivery,
      address: delivery === 'delivery' ? values.address.trim() : undefined,
      note: values.note.trim() || undefined,
      lines: items.map(cartItemToLine),
      subtotal,
      deliveryFee: fee,
      total,
    })
  }

  const errorFor = (field: keyof FormValues) => (touched[field] ? errors[field] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        <fieldset>
          <legend className="text-sm font-semibold text-foreground">Hình thức nhận hàng</legend>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {(
              [
                { id: 'delivery', label: 'Giao tận nơi', sub: formatPrice(DELIVERY_FEE.delivery), icon: Bike },
                { id: 'pickup', label: 'Nhận tại quán', sub: 'Miễn phí', icon: Store },
              ] as const
            ).map((opt) => (
              <label
                key={opt.id}
                className={cn(
                  'flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-caramel/40',
                  delivery === opt.id ? 'border-primary bg-secondary' : 'border-border hover:bg-muted',
                )}
              >
                <input
                  type="radio"
                  name="delivery"
                  value={opt.id}
                  checked={delivery === opt.id}
                  onChange={() => setDelivery(opt.id)}
                  className="sr-only"
                />
                <opt.icon className="size-5 text-primary" aria-hidden="true" />
                <span className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground">{opt.label}</span>
                  <span className="text-xs text-muted-foreground">{opt.sub}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <FormField id="checkout-name" label="Họ và tên" error={errorFor('name')}>
          {(props) => (
            <input
              {...props}
              type="text"
              autoComplete="name"
              value={values.name}
              onChange={update('name')}
              onBlur={markTouched('name')}
              placeholder="Nguyễn Văn A"
              className={inputClass(!!props['aria-invalid'])}
            />
          )}
        </FormField>

        <FormField id="checkout-phone" label="Số điện thoại" error={errorFor('phone')}>
          {(props) => (
            <input
              {...props}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={update('phone')}
              onBlur={markTouched('phone')}
              placeholder="0901 234 567"
              className={inputClass(!!props['aria-invalid'])}
            />
          )}
        </FormField>

        {delivery === 'delivery' && (
          <FormField id="checkout-address" label="Địa chỉ giao hàng" error={errorFor('address')}>
            {(props) => (
              <input
                {...props}
                type="text"
                autoComplete="street-address"
                value={values.address}
                onChange={update('address')}
                onBlur={markTouched('address')}
                placeholder="Số nhà, tên đường, phường, quận"
                className={inputClass(!!props['aria-invalid'])}
              />
            )}
          </FormField>
        )}

        <FormField id="checkout-note" label="Ghi chú đơn hàng (không bắt buộc)">
          {(props) => (
            <textarea
              {...props}
              rows={2}
              value={values.note}
              onChange={update('note')}
              placeholder="Ví dụ: gọi trước khi giao"
              className={cn(inputClass(false), 'h-auto resize-none py-2')}
            />
          )}
        </FormField>

        <p className="flex items-start gap-2 rounded-xl bg-success-soft px-3 py-2.5 text-xs leading-relaxed text-success">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          Thanh toán trực tuyến an toàn qua Ví MoMo hoặc chuyển khoản VietQR ở bước tiếp theo.
        </p>
      </div>

      <div className="border-t border-border bg-muted/50 px-5 py-4">
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tạm tính</dt>
            <dd className="font-semibold text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Phí giao hàng</dt>
            <dd className="font-semibold text-foreground">{fee === 0 ? 'Miễn phí' : formatPrice(fee)}</dd>
          </div>
          <div className="flex justify-between pt-1">
            <dt className="font-semibold text-foreground">Tổng thanh toán</dt>
            <dd className="text-lg font-bold text-foreground">{formatPrice(total)}</dd>
          </div>
        </dl>
        <button
          type="submit"
          disabled={submitting || items.length === 0}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-70"
        >
          {submitting && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
          {submitting ? 'Đang tạo đơn...' : `Xác nhận đặt hàng · ${formatPrice(total)}`}
        </button>
      </div>
    </form>
  )
}
