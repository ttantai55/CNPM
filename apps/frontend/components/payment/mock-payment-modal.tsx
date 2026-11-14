'use client'

import { useEffect, useRef, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  FlaskConical,
  Loader2,
  QrCode,
  RotateCcw,
  Smartphone,
  XCircle,
} from 'lucide-react'
import { formatPrice } from '@/lib/menu'
import { paymentsApi } from '@/lib/api'
import type { Order, PaymentMethod } from '@/lib/orders'
import { BANK_ACCOUNT, transferContent } from '@/lib/payment'
import { cn } from '@/lib/utils'
import { Modal } from '@/components/brewlite/modal'
import { MomoLogo, VietQrLogo } from './brand-logos'

type Phase = 'waiting' | 'processing' | 'success' | 'failed' | 'expired'

const HOLD_SECONDS = 10 * 60 - 1

type MockPaymentModalProps = {
  order: Order
  onClose: () => void
  onFailure: (order: Order) => Promise<Order>
  onRetry: (order: Order) => Promise<Order>
  onSuccess: (method: PaymentMethod) => void
}

export function MockPaymentModal({ order, onClose, onFailure, onRetry, onSuccess }: MockPaymentModalProps) {
  const [activeOrder, setActiveOrder] = useState(order)
  const [method, setMethod] = useState<PaymentMethod | null>(null)
  const [phase, setPhase] = useState<Phase>('waiting')
  const [remaining, setRemaining] = useState(HOLD_SECONDS)
  const [paymentUrl, setPaymentUrl] = useState('')
  const [paymentError, setPaymentError] = useState('')
  const [creatingPayment, setCreatingPayment] = useState(false)
  const [handlingFailure, setHandlingFailure] = useState(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    if (phase === 'success' || phase === 'expired') return
    const id = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          setPhase('expired')
          return 0
        }
        return r - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [phase])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach(clearTimeout)
  }, [])

  function simulateSuccess() {
    if (!method || !paymentUrl) return
    setPhase('processing')
    timers.current.push(
      setTimeout(() => {
        setPhase('success')
        timers.current.push(setTimeout(() => onSuccess(method), 1300))
      }, 1500),
    )
  }

  async function simulateFailure() {
    setPhase('failed')
    setPaymentError('')
    setHandlingFailure(true)
    try {
      setActiveOrder(await onFailure(activeOrder))
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : 'Không thể cập nhật trạng thái thanh toán.')
    } finally {
      setHandlingFailure(false)
    }
  }

  async function retry() {
    setPaymentError('')
    if (activeOrder.status === 'CANCELLED') {
      setCreatingPayment(true)
      try {
        const resumedOrder = await onRetry(activeOrder)
        setActiveOrder(resumedOrder)
        setPhase('waiting')
        setRemaining(HOLD_SECONDS)
        setPaymentUrl('')
        if (method) await selectMethod(method, resumedOrder)
      } catch (cause) {
        setPaymentError(cause instanceof Error ? cause.message : 'Không thể tạo lại đơn để thanh toán.')
      } finally {
        setCreatingPayment(false)
      }
      return
    }
    setPhase('waiting')
    if (remaining === 0) setRemaining(HOLD_SECONDS)
    if (method) void selectMethod(method)
  }

  async function selectMethod(nextMethod: PaymentMethod, forOrder = activeOrder) {
    setCreatingPayment(true)
    setPaymentError('')
    try {
      const result = await paymentsApi.create(forOrder.code, nextMethod, forOrder.total)
      setPaymentUrl(result.paymentUrl)
      setMethod(nextMethod)
    } catch (cause) {
      setPaymentError(cause instanceof Error ? cause.message : 'Không thể tạo thông tin thanh toán.')
    } finally {
      setCreatingPayment(false)
    }
  }

  const busy = phase === 'processing' || phase === 'success'

  return (
    <Modal
      open
      onClose={busy ? () => {} : onClose}
      title="Thanh toán đơn hàng"
      description="Chọn phương thức và quét mã QR để hoàn tất"
      className="sm:max-w-4xl"
    >
      {phase === 'success' ? (
        <SuccessView total={activeOrder.total} code={activeOrder.code} />
      ) : (
        <>
          <div className="grid min-h-0 flex-1 gap-5 overflow-y-auto p-5 md:grid-cols-[300px_minmax(0,1fr)]">
            <div className="flex flex-col gap-4">
              <OrderSummary order={activeOrder} />
              <MethodPicker value={method} onChange={(value) => void selectMethod(value)} disabled={busy || creatingPayment} />
            </div>

            <section
              aria-label="Chi tiết thanh toán"
              className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-muted/40 p-5"
            >
              {phase === 'failed' && (
                <div
                  role="alert"
                  className="mb-4 flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
                >
                  <XCircle className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="font-semibold">Giao dịch không thành công hoặc đã bị hủy</p>
                    <p className="mt-0.5 text-destructive/80">
                      {handlingFailure
                        ? 'Đang cập nhật trạng thái đơn hàng...'
                        : 'Món đã được giữ trong giỏ; bạn có thể tạo lại đơn để thanh toán.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={retry}
                    disabled={handlingFailure || creatingPayment}
                    className="flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-destructive px-3 text-xs font-semibold text-white hover:bg-destructive/90"
                  >
                    <RotateCcw className="size-3.5" aria-hidden="true" />
                    Thử lại
                  </button>
                </div>
              )}

              {phase === 'expired' && (
                <div
                  role="alert"
                  className="mb-4 flex items-center gap-3 rounded-xl border border-border bg-card p-3 text-sm"
                >
                  <Clock className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <p className="flex-1 text-foreground">Mã QR đã hết hạn giữ đơn.</p>
                  <button
                    type="button"
                    onClick={retry}
                    className="h-8 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
                  >
                    Tạo mã mới
                  </button>
                </div>
              )}

              {paymentError && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-700">{paymentError}</p>}
              {creatingPayment ? (
                <div className="flex flex-1 items-center justify-center"><Loader2 className="size-6 animate-spin text-caramel" /></div>
              ) : method === null || !paymentUrl ? (
                <EmptyMethod />
              ) : method === 'MOMO' ? (
                <MomoPanel order={activeOrder} phase={phase} remaining={remaining} paymentUrl={paymentUrl} />
              ) : (
                <VietQrPanel order={activeOrder} phase={phase} remaining={remaining} paymentUrl={paymentUrl} />
              )}
            </section>
          </div>

          <SandboxControls
            disabled={!method || !paymentUrl || phase !== 'waiting'}
            processing={phase === 'processing'}
            onSuccess={simulateSuccess}
            onFailure={simulateFailure}
          />
        </>
      )}
    </Modal>
  )
}

function OrderSummary({ order }: { order: Order }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <dl className="flex flex-col gap-2.5 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Mã đơn hàng</dt>
          <dd className="font-mono font-semibold text-foreground">#{order.code}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Khách nhận</dt>
          <dd className="truncate font-semibold text-foreground">{order.customerName}</dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Số món</dt>
          <dd className="font-semibold text-foreground">
            {order.lines.reduce((sum, l) => sum + l.quantity, 0)} ly
          </dd>
        </div>
        {order.promotionCode && (
          <div className="flex items-center justify-between gap-2">
            <dt className="text-muted-foreground">Mã ưu đãi · {order.promotionCode}</dt>
            <dd className="font-semibold text-success">−{formatPrice(order.discountAmount ?? 0)}</dd>
          </div>
        )}
      </dl>
      <div className="mt-4 border-t border-dashed border-border pt-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tổng thanh toán</p>
        <p className="mt-1 text-3xl font-bold tracking-tight text-success">{formatPrice(order.total)}</p>
      </div>
    </div>
  )
}

function OrderCountdown({ remaining }: { remaining: number }) {
  const minutes = String(Math.floor(remaining / 60)).padStart(2, '0')
  const seconds = String(remaining % 60).padStart(2, '0')
  const urgent = remaining < 60

  return (
    <div
      className={cn(
        'mt-4 flex w-full max-w-[272px] items-center justify-between rounded-xl px-3 py-2.5',
        urgent ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground',
      )}
    >
      <span className="flex items-center gap-2 text-xs font-medium">
        <Clock className="size-4" aria-hidden="true" />
        Thời gian giữ đơn
      </span>
      <span className="font-mono text-lg font-bold tabular-nums" aria-label={`Còn ${minutes} phút ${seconds} giây`}>
        {minutes}:{seconds}
      </span>
    </div>
  )
}

const METHODS = [
  {
    id: 'MOMO' as const,
    title: 'Ví MoMo',
    hint: 'Quét mã MoMo QR để thanh toán tức thì',
    logo: <MomoLogo />,
    activeClass: 'border-[#a50064] bg-[#a50064]/[0.06] ring-2 ring-[#a50064]/20',
    dotClass: 'border-[#a50064] bg-[#a50064]',
  },
  {
    id: 'VIETQR' as const,
    title: 'Chuyển khoản Ngân hàng (VietQR)',
    hint: 'Quét mã VietQR hoặc chuyển khoản',
    logo: <VietQrLogo />,
    activeClass: 'border-[#005baa] bg-[#005baa]/[0.06] ring-2 ring-[#005baa]/20',
    dotClass: 'border-[#005baa] bg-[#005baa]',
  },
]

function MethodPicker({
  value,
  onChange,
  disabled,
}: {
  value: PaymentMethod | null
  onChange: (method: PaymentMethod) => void
  disabled: boolean
}) {
  return (
    <fieldset disabled={disabled} className="flex flex-col gap-2.5">
      <legend className="mb-2.5 text-sm font-semibold text-foreground">Phương thức thanh toán</legend>
      {METHODS.map((m) => {
        const checked = value === m.id
        return (
          <label
            key={m.id}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-2xl border bg-card p-3 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-caramel/40 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-70',
              checked ? m.activeClass : 'border-border hover:border-foreground/20 hover:bg-muted/60',
            )}
          >
            <input
              type="radio"
              name="payment-method"
              value={m.id}
              checked={checked}
              onChange={() => onChange(m.id)}
              className="sr-only"
            />
            {m.logo}
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-sm font-semibold leading-snug text-foreground">{m.title}</span>
              <span className="text-xs leading-snug text-muted-foreground">{m.hint}</span>
            </span>
            <span
              aria-hidden="true"
              className={cn(
                'flex size-5 shrink-0 items-center justify-center rounded-full border-2',
                checked ? m.dotClass : 'border-input',
              )}
            >
              {checked && <Check className="size-3 text-white" strokeWidth={3} />}
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}

function EmptyMethod() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
      <span className="flex size-16 items-center justify-center rounded-2xl bg-card text-muted-foreground shadow-sm">
        <QrCode className="size-8" aria-hidden="true" />
      </span>
      <p className="text-sm font-semibold text-foreground">Chọn phương thức thanh toán</p>
      <p className="max-w-xs text-sm text-muted-foreground">
        Mã QR và thông tin chuyển khoản sẽ hiển thị tại đây sau khi bạn chọn MoMo hoặc VietQR.
      </p>
    </div>
  )
}

function QrFrame({ value, accent, label }: { value: string; accent: string; label: string }) {
  return (
    <div className="rounded-3xl border-4 bg-white p-4 shadow-sm" style={{ borderColor: accent }}>
      <QRCodeSVG value={value} size={208} level="M" marginSize={0} fgColor="#111111" bgColor="#ffffff" title={label} />
    </div>
  )
}

function WaitingStatus({ phase }: { phase: Phase }) {
  if (phase !== 'waiting' && phase !== 'processing') return null
  return (
    <p
      role="status"
      className="mt-4 flex items-center justify-center gap-2 rounded-full bg-card px-4 py-2 text-xs font-medium text-muted-foreground shadow-sm"
    >
      <Loader2 className="size-4 animate-spin text-caramel" aria-hidden="true" />
      {phase === 'processing' ? 'Đang xác nhận giao dịch...' : 'Đang chờ nhận tín hiệu thanh toán...'}
    </p>
  )
}

function MomoPanel({ order, phase, remaining, paymentUrl }: { order: Order; phase: Phase; remaining: number; paymentUrl: string }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <div className="flex w-full items-center gap-3 rounded-xl bg-[#a50064] px-4 py-2.5 text-white">
        <MomoLogo className="size-8 bg-white text-[#a50064]" />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-bold">Thanh toán qua Ví MoMo</span>
          <span className="text-xs text-white/80">Người nhận: {BANK_ACCOUNT.accountName}</span>
        </div>
      </div>
      <div className={cn('mt-5 transition-opacity', phase === 'expired' && 'opacity-30 blur-[2px]')}>
        <QrFrame value={paymentUrl} accent="#a50064" label="Mã QR MoMo" />
      </div>
      <p className="mt-4 flex items-center gap-2 text-sm text-foreground">
        <Smartphone className="size-4 text-[#a50064]" aria-hidden="true" />
        Mở ứng dụng <span className="font-semibold">MoMo</span>
        <span aria-hidden="true">{'→'}</span>
        Quét mã QR để thanh toán
      </p>
      <OrderCountdown remaining={remaining} />
      <WaitingStatus phase={phase} />
    </div>
  )
}

function VietQrPanel({ order, phase, remaining, paymentUrl }: { order: Order; phase: Phase; remaining: number; paymentUrl: string }) {
  const content = transferContent(order.code)
  const rows: { label: string; value: string; display?: string; copy?: boolean; mono?: boolean }[] = [
    { label: 'Ngân hàng', value: BANK_ACCOUNT.bankName },
    { label: 'Số tài khoản', value: BANK_ACCOUNT.accountNumber, copy: true, mono: true },
    { label: 'Tên thụ hưởng', value: BANK_ACCOUNT.accountName },
    { label: 'Số tiền', value: String(order.total), display: formatPrice(order.total), copy: true },
    { label: 'Nội dung CK', value: content, copy: true, mono: true },
  ]

  return (
    <div className="flex flex-1 flex-col gap-5 lg:flex-row lg:items-start">
      <div className="flex flex-col items-center">
        <div className={cn('transition-opacity', phase === 'expired' && 'opacity-30 blur-[2px]')}>
          <QrFrame value={paymentUrl} accent="#005baa" label="Mã VietQR" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <VietQrLogo className="h-7 text-xs" />
          <span className="text-xs text-muted-foreground">napas 247</span>
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <dl className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
          {rows.map((row) => (
            <div key={row.label} className="flex items-center gap-3 px-3.5 py-2.5">
              <dt className="w-24 shrink-0 text-xs text-muted-foreground">{row.label}</dt>
              <dd
                className={cn(
                  'min-w-0 flex-1 truncate text-sm font-semibold text-foreground',
                  row.mono && 'font-mono',
                  row.label === 'Số tiền' && 'text-success',
                )}
              >
                {row.display ?? row.value}
              </dd>
              {row.copy && <CopyButton value={row.value} label={row.label} />}
            </div>
          ))}
        </dl>
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-[#005baa]" aria-hidden="true" />
          Quét mã QR hoặc chuyển đúng số tiền và nội dung để hệ thống tự động xác nhận.
        </p>
        <OrderCountdown remaining={remaining} />
        <WaitingStatus phase={phase} />
      </div>
    </div>
  )
}

async function writeClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(timer.current), [])

  async function handleCopy() {
    if (!(await writeClipboard(value))) return
    setCopied(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <span className="relative shrink-0">
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'flex h-7 items-center gap-1 rounded-lg border px-2 text-xs font-semibold transition-colors',
          copied
            ? 'border-success/30 bg-success-soft text-success'
            : 'border-border text-[#005baa] hover:bg-[#005baa]/[0.06]',
        )}
      >
        {copied ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
        {copied ? 'Đã chép' : 'Sao chép'}
        <span className="sr-only"> {label}</span>
      </button>
      <span aria-live="polite" className="pointer-events-none absolute -top-9 right-0 z-10">
        {copied && (
          <span className="block whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-xs font-medium text-background shadow-lg animate-in fade-in slide-in-from-bottom-1">
            Đã sao chép
          </span>
        )}
      </span>
    </span>
  )
}

function SandboxControls({
  disabled,
  processing,
  onSuccess,
  onFailure,
}: {
  disabled: boolean
  processing: boolean
  onSuccess: () => void
  onFailure: () => void
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-dashed border-border bg-muted/60 px-5 py-3.5 sm:flex-row sm:items-center">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <FlaskConical className="size-4" aria-hidden="true" />
        Demo Sandbox Controls
      </p>
      <div className="flex flex-1 flex-wrap gap-2 sm:justify-end">
        <button
          type="button"
          onClick={onSuccess}
          disabled={disabled}
          className="flex h-10 items-center gap-2 rounded-xl bg-success px-4 text-sm font-semibold text-white transition-colors hover:bg-success/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {processing ? (
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="size-4" aria-hidden="true" />
          )}
          Giả lập Thanh toán Thành công
        </button>
        <button
          type="button"
          onClick={onFailure}
          disabled={disabled}
          className="flex h-10 items-center gap-2 rounded-xl border border-destructive/30 bg-card px-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <XCircle className="size-4" aria-hidden="true" />
          Giả lập Lỗi / Hủy thanh toán
        </button>
      </div>
    </div>
  )
}

function SuccessView({ total, code }: { total: number; code: string }) {
  return (
    <div role="status" className="flex flex-col items-center px-6 py-14 text-center">
      <span className="flex size-20 items-center justify-center rounded-full bg-success-soft animate-in zoom-in-50">
        <CheckCircle2 className="size-12 text-success" aria-hidden="true" />
      </span>
      <p className="mt-5 text-2xl font-bold text-foreground">Thanh toán thành công!</p>
      <p className="mt-2 text-sm text-muted-foreground">
        Đơn <span className="font-mono font-semibold text-foreground">#{code}</span> ·{' '}
        <span className="font-semibold text-success">{formatPrice(total)}</span>
      </p>
      <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Đang chuyển đến trang theo dõi đơn hàng...
      </p>
    </div>
  )
}
