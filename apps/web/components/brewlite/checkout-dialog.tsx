'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { formatPrice, getUnitPrice, type CartItem } from '@/lib/menu'
import { cartItemToLine, generateOrderCode, type OrderDraft } from '@/lib/orders'
import { getDiscountAmount, getEligiblePromotions, type Promotion } from '@/lib/promotions'
import { cn } from '@/lib/utils'
import { Modal } from './modal'
import { FormField, inputClass } from './form-field'

type FormValues = { name: string; phone: string; note: string }
type FormErrors = Partial<Record<keyof FormValues, string>>

const PHONE_PATTERN = /^(0|\+84)(3|5|7|8|9)\d{8}$/

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  if (values.name.trim().length < 2) errors.name = 'Vui lòng nhập họ tên (tối thiểu 2 ký tự).'
  if (!PHONE_PATTERN.test(values.phone.replace(/\s/g, '')))
    errors.phone = 'Số điện thoại không hợp lệ (VD: 0901234567).'
  return errors
}

type CheckoutDialogProps = {
  open: boolean
  onClose: () => void
  items: CartItem[]
  defaultName?: string
  defaultPhone?: string
  customerId?: string
  customerEmail?: string
  promotions: Promotion[]
  selectedPromotionId: string
  onSelectPromotion: (id: string) => void
  onProceedToPayment: (draft: OrderDraft) => void
}

export function CheckoutDialog({
  open,
  onClose,
  items,
  defaultName,
  defaultPhone,
  customerId,
  customerEmail,
  promotions,
  selectedPromotionId,
  onSelectPromotion,
  onProceedToPayment,
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
        open={open}
        defaultName={defaultName}
        defaultPhone={defaultPhone}
        customerId={customerId}
        customerEmail={customerEmail}
        promotions={promotions}
        selectedPromotionId={selectedPromotionId}
        onSelectPromotion={onSelectPromotion}
        onSubmit={onProceedToPayment}
      />
    </Modal>
  )
}

function CheckoutForm({
  items,
  open,
  defaultName,
  defaultPhone,
  customerId,
  customerEmail,
  promotions,
  selectedPromotionId,
  onSelectPromotion,
  onSubmit,
}: {
  items: CartItem[]
  open: boolean
  defaultName?: string
  defaultPhone?: string
  customerId?: string
  customerEmail?: string
  promotions: Promotion[]
  selectedPromotionId: string
  onSelectPromotion: (id: string) => void
  onSubmit: (draft: OrderDraft) => void
}) {
  const [values, setValues] = useState<FormValues>({
    name: defaultName ?? '',
    phone: defaultPhone ?? '',
    note: '',
  })
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setValues({ name: defaultName ?? '', phone: defaultPhone ?? '', note: '' })
    setTouched({})
  }, [open, defaultName, defaultPhone])

  const errors = validate(values)
  const subtotal = items.reduce((sum, item) => sum + getUnitPrice(item) * item.quantity, 0)
  const eligiblePromotions = getEligiblePromotions(promotions, subtotal)
  const selectedPromotion = eligiblePromotions.find((promotion) => promotion.id === selectedPromotionId)
  const discountAmount = getDiscountAmount(selectedPromotion, subtotal)
  const total = subtotal - discountAmount

  function update(field: keyof FormValues) {
    return (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((v) => ({ ...v, [field]: event.target.value }))
  }

  function markTouched(field: keyof FormValues) {
    return () => setTouched((t) => ({ ...t, [field]: true }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setTouched({ name: true, phone: true })
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
      customerId,
      customerEmail,
      customerName: values.name.trim(),
      phone: values.phone.replace(/\s/g, ''),
      fulfillment: 'pickup',
      note: values.note.trim() || undefined,
      lines: items.map(cartItemToLine),
      subtotal,
      discountAmount,
      promotionCode: selectedPromotion?.voucherCode,
      deliveryFee: 0,
      total,
    })
  }

  const errorFor = (field: keyof FormValues) => (touched[field] ? errors[field] : undefined)

  return (
    <form onSubmit={handleSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
      <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4">
        <div className="flex items-center justify-between rounded-xl bg-secondary px-3 py-2.5 text-sm">
          <span className="font-semibold text-foreground">Nhận tại quán</span>
          <span className="text-xs text-muted-foreground">Miễn phí</span>
        </div>
        <section aria-label="Tóm tắt món đặt" className="rounded-xl border border-border px-3 py-2.5">
          <h3 className="text-xs font-semibold text-foreground">Tóm tắt món đặt</h3>
          <ul className="mt-2 space-y-2">
            {items.map((item) => {
              const line = cartItemToLine(item)
              return (
                <li key={item.key} className="flex justify-between gap-3 text-xs">
                  <span className="min-w-0 text-muted-foreground">
                    {item.quantity}× {line.name} · Size {item.size}
                  </span>
                  <span className="shrink-0 font-semibold text-foreground">
                    {formatPrice(getUnitPrice(item) * item.quantity)}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>

        <label className="text-xs font-medium text-foreground" htmlFor="checkout-promotion">
          Chọn mã khuyến mãi
          <select
            id="checkout-promotion"
            value={selectedPromotion?.id ?? ''}
            onChange={(event) => onSelectPromotion(event.target.value)}
            disabled={eligiblePromotions.length === 0}
            className="mt-1.5 h-10 w-full rounded-lg border border-border bg-card px-3 text-xs disabled:text-muted-foreground"
          >
            <option value="">Không áp dụng</option>
            {eligiblePromotions.map((promotion) => (
              <option key={promotion.id} value={promotion.id}>
                {promotion.voucherCode} · {promotion.discountType === 'PERCENTAGE' ? `${promotion.discountValue}%` : formatPrice(promotion.discountValue)}
              </option>
            ))}
          </select>
        </label>

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

        <FormField id="checkout-note" label="Ghi chú đơn hàng (nếu có)">
          {(props) => (
            <textarea
              {...props}
              rows={2}
              value={values.note}
              onChange={update('note')}
              placeholder="Yêu cầu thêm cho món đặt"
              className={cn(inputClass(false), 'h-auto resize-none py-2')}
            />
          )}
        </FormField>

      </div>

      <div className="border-t border-border bg-muted/50 px-5 py-4">
        <dl className="flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tạm tính</dt>
            <dd className="font-semibold text-foreground">{formatPrice(subtotal)}</dd>
          </div>
          {selectedPromotion && (
            <div className="flex justify-between">
              <dt className="text-success">Ưu đãi · {selectedPromotion.voucherCode}</dt>
              <dd className="font-semibold text-success">−{formatPrice(discountAmount)}</dd>
            </div>
          )}
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
