'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Clock3, Coffee, MapPin, PackageCheck, ReceiptText } from 'lucide-react'
import { formatPrice } from '@/lib/menu'
import { fromApiOrder, migrateOrderStatuses, orderStore, PAYMENT_LABEL, STATUS_LABEL, type Order, type OrderStatus } from '@/lib/orders'
import { ordersApi } from '@/lib/api'
import { DashboardHeader, RoleGuard } from './role-shell'

const STEPS: { status: OrderStatus; title: string; description: string }[] = [
  { status: 'PENDING', title: 'Chờ thanh toán', description: 'Đơn đang chờ thanh toán hoặc xác nhận.' },
  { status: 'CONFIRMED', title: 'Đã nhận đơn', description: 'BrewLite đã tiếp nhận đơn hàng của bạn.' },
  { status: 'PREPARING', title: 'Đang pha chế', description: 'Thức uống đang được chuẩn bị.' },
  { status: 'COMPLETED', title: 'Mời nhận món', description: 'Đơn đã sẵn sàng tại quầy BrewLite.' },
]

const STATUS_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 1,
  PREPARING: 2,
  COMPLETED: 3,
  CANCELLED: -1,
}

function estimatedPickup(order: Order) {
  if (order.status === 'COMPLETED') return 'Đơn đã sẵn sàng để nhận'
  const minutes = order.status === 'PREPARING' ? 8 : order.status === 'CONFIRMED' ? 15 : 20
  const eta = new Date(order.createdAt + minutes * 60_000)
  return `Khoảng ${new Intl.DateTimeFormat('vi-VN', { hour: '2-digit', minute: '2-digit' }).format(eta)}`
}

function OrderTrackingContent() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const orders = orderStore.useStore()
  const code = decodeURIComponent(params.code)
  const order = orders.find((item) => item.code === code)

  useEffect(() => {
    migrateOrderStatuses()
    void ordersApi.get(code)
      .then((remote) => {
        const mapped = fromApiOrder(remote)
        orderStore.set((current) => [mapped, ...current.filter((entry) => entry.code !== mapped.code)])
      })
      .catch((error: unknown) => console.error('Unable to load order', error))
  }, [code])

  return (
    <RoleGuard role="CUSTOMER">
      <div className="min-h-dvh bg-[#fcfbf7]">
        <DashboardHeader role="CUSTOMER" title="Theo dõi đơn hàng" />
        <main className="mx-auto max-w-[1080px] px-4 py-8 sm:px-6">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#5c4033] hover:text-[#2e2520]">
            <ArrowLeft className="size-4" /> Trở về menu
          </Link>

          {!order ? (
            <section className="mt-8 rounded-3xl border border-[#ede8e1] bg-white px-8 py-14 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f3eee7] text-[#5c4033]">
                <ReceiptText className="size-6" />
              </span>
              <h1 className="mt-4 text-xl font-semibold text-[#2e2520]">Không tìm thấy đơn hàng</h1>
              <p className="mt-2 text-sm text-[#81766d]">Kiểm tra lại mã đơn hoặc quay về menu để tiếp tục đặt món.</p>
              <button onClick={() => router.push('/')} className="mt-5 rounded-xl bg-[#5c4033] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#493228]">
                Về trang menu
              </button>
            </section>
          ) : (
            <>
              <header className="mt-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#81766d]">Theo dõi đơn hàng</p>
                  <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#2e2520]">Đơn hàng #{order.code}</h1>
                  <p className="mt-1.5 text-xs text-[#81766d]">
                    Đặt lúc {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(order.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-[#f3eee7] px-3.5 py-2 text-xs font-semibold text-[#5c4033]">
                  {STATUS_LABEL[order.status]}
                </span>
              </header>

              {order.status === 'CANCELLED' ? (
                <div role="alert" className="mt-6 rounded-2xl border border-[#ead2ca] bg-[#f8efec] px-4 py-3 text-sm text-[#8d4c3b]">
                  Đơn hàng này đã bị hủy. Vui lòng liên hệ cửa hàng nếu bạn cần hỗ trợ.
                </div>
              ) : (
                <>
                  <section className="mt-6 rounded-3xl border border-[#ede8e1] bg-white p-5 shadow-[0_8px_30px_rgba(46,37,32,0.04)] sm:p-7">
                    <h2 className="text-sm font-semibold text-[#2e2520]">Tiến trình đơn hàng</h2>
                    <ol className="mt-6 grid gap-5 sm:grid-cols-4 sm:gap-3">
                      {STEPS.map((step, index) => {
                        const activeIndex = STATUS_INDEX[order.status]
                        const complete = index <= activeIndex
                        const current = index === activeIndex
                        const glowing = current && (step.status === 'PREPARING' || step.status === 'COMPLETED')
                        return (
                          <li key={step.status} className="relative flex items-start gap-3 sm:flex-col">
                            {index < STEPS.length - 1 && (
                              <span className={`absolute left-3 top-7 h-[calc(100%+1rem)] w-0.5 sm:left-7 sm:top-3.5 sm:h-0.5 sm:w-[calc(100%-1rem)] ${index < activeIndex ? 'bg-[#5c4033]' : 'bg-[#ede8e1]'}`} />
                            )}
                            <span className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold transition ${complete ? 'border-[#5c4033] bg-[#5c4033] text-white' : 'border-[#ede8e1] bg-white text-[#a69a90]'} ${glowing ? 'animate-pulse shadow-[0_0_0_6px_rgba(92,64,51,0.12),0_0_20px_rgba(92,64,51,0.22)]' : ''}`}>
                              {complete ? <Check className="size-3.5" strokeWidth={3} /> : index + 1}
                            </span>
                            <span className="relative z-10 sm:mt-3">
                              <span className={`block text-xs font-semibold ${current ? 'text-[#2e2520]' : complete ? 'text-[#5c4033]' : 'text-[#81766d]'}`}>
                                {step.title}
                              </span>
                              <span className="mt-1 block max-w-[190px] text-[10px] leading-4 text-[#81766d]">{step.description}</span>
                            </span>
                          </li>
                        )
                      })}
                    </ol>
                  </section>

                  <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_320px]">
                    <section className="rounded-3xl border border-[#ede8e1] bg-white p-5 sm:p-6">
                      <h2 className="flex items-center gap-2 text-sm font-semibold text-[#2e2520]">
                        <Coffee className="size-4 text-[#5c4033]" /> Món đã đặt
                      </h2>
                      <ul className="mt-4 divide-y divide-[#ede8e1]">
                        {order.lines.map((line, index) => (
                          <li key={`${line.productId}-${index}`} className="flex items-start justify-between gap-4 py-3.5">
                            <div>
                              <p className="text-xs font-semibold text-[#2e2520]">{line.quantity}× {line.name}</p>
                              <p className="mt-1 text-[10px] text-[#81766d]">
                                Size {line.size} · {line.sugar} đường · {line.ice}
                                {line.toppings.length > 0 ? ` · ${line.toppings.join(', ')}` : ''}
                              </p>
                              {line.note && <p className="mt-1 text-[10px] text-[#8a6855]">Ghi chú: {line.note}</p>}
                            </div>
                            <span className="shrink-0 text-xs font-semibold text-[#5c4033]">{formatPrice(line.unitPrice * line.quantity)}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="mt-3 flex items-center justify-between border-t border-[#ede8e1] pt-4 text-xs">
                        <span className="text-[#81766d]">Tổng thanh toán</span>
                        <span className="text-lg font-bold text-[#2e2520]">{formatPrice(order.total)}</span>
                      </div>
                    </section>

                    <aside className="flex flex-col gap-4">
                      <section className="rounded-3xl border border-[#ede8e1] bg-white p-6 text-center">
                        <h2 className="flex items-center justify-center gap-2 text-sm font-semibold text-[#2e2520]">
                          <PackageCheck className="size-4 text-[#5c4033]" /> Mã lấy món tại quầy
                        </h2>
                        <p className="mt-5 font-mono text-5xl font-bold tracking-[0.12em] text-[#2e2520]">
                          {order.code.replace(/^ORD-/, '')}
                        </p>
                        <p className="mt-2 text-[10px] text-[#81766d]">Đọc mã này với nhân viên khi đến nhận món</p>
                        <div className="mt-5 rounded-2xl bg-[#fcfbf7] px-4 py-3">
                          <p className="flex items-center justify-center gap-2 text-[10px] font-medium text-[#81766d]">
                            <Clock3 className="size-3.5" /> Thời gian dự kiến nhận
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#5c4033]">{estimatedPickup(order)}</p>
                        </div>
                      </section>

                      <section className="rounded-3xl border border-[#ede8e1] bg-white p-5">
                        <h2 className="flex items-center gap-2 text-sm font-semibold text-[#2e2520]">
                          <MapPin className="size-4 text-[#5c4033]" /> Thông tin đơn hàng
                        </h2>
                        <p className="mt-4 text-xs font-semibold text-[#2e2520]">{order.customerName}</p>
                        <p className="mt-1 text-[11px] text-[#81766d]">{order.phone}</p>
                        <p className="mt-3 text-[11px] text-[#81766d]">Nhận tại quầy BrewLite</p>
                        <div className="mt-3 flex justify-between border-t border-[#ede8e1] pt-3 text-[11px]">
                          <span className="text-[#81766d]">Thanh toán</span>
                          <span className="font-semibold text-[#5c4033]">{order.paymentMethod ? PAYMENT_LABEL[order.paymentMethod] : 'Chưa chọn'}</span>
                        </div>
                      </section>
                    </aside>
                  </div>
                </>
              )}
            </>
          )}
        </main>
      </div>
    </RoleGuard>
  )
}

export default function OrderTrackingPage() {
  return <OrderTrackingContent />
}
