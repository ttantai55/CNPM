'use client'

import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Check, Clock3, Coffee, MapPin, PackageCheck, ReceiptText } from 'lucide-react'
import { formatPrice } from '@/lib/menu'
import { orderStore, PAYMENT_LABEL, STATUS_LABEL, type OrderStatus } from '@/lib/orders'
import { DashboardHeader, RoleGuard } from './role-shell'

const STEPS: { status: OrderStatus; title: string; description: string }[] = [
  { status: 'NEW', title: 'Đã nhận đơn', description: 'Thanh toán đã xác nhận, BrewLite đã nhận đơn.' },
  { status: 'PREPARING', title: 'Đang pha chế', description: 'Nhân viên đang chuẩn bị thức uống của bạn.' },
  { status: 'READY', title: 'Sẵn sàng giao', description: 'Đơn hàng đã sẵn sàng để bạn nhận.' },
  { status: 'COMPLETED', title: 'Đã hoàn tất', description: 'Chúc bạn thưởng thức thật ngon miệng!' },
]

const STATUS_INDEX: Partial<Record<OrderStatus, number>> = {
  NEW: 0,
  PREPARING: 1,
  READY: 2,
  COMPLETED: 3,
}

function OrderTrackingContent() {
  const params = useParams<{ code: string }>()
  const router = useRouter()
  const orders = orderStore.useStore()
  const code = decodeURIComponent(params.code)
  const order = orders.find((item) => item.code === code)

  return (
    <RoleGuard role="CUSTOMER">
      <div className="min-h-dvh bg-[#f7f8f6]">
        <DashboardHeader role="CUSTOMER" title="Order tracking" />
        <main className="mx-auto max-w-[980px] px-6 py-10">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-semibold text-[#62806c] hover:text-[#285b4b]">
            <ArrowLeft className="size-4" /> Trở về menu
          </Link>

          {!order ? (
            <section className="mt-8 rounded-2xl border border-[#e7ece7] bg-white px-8 py-14 text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-[#f1f5f1] text-[#66846e]"><ReceiptText className="size-6" /></span>
              <h1 className="mt-4 text-xl font-semibold text-[#304539]">Không tìm thấy đơn hàng</h1>
              <p className="mt-2 text-sm text-[#8b978f]">Kiểm tra lại mã đơn hoặc quay về menu để tiếp tục đặt món.</p>
              <button onClick={() => router.push('/')} className="mt-5 rounded-xl bg-[#285b4b] px-4 py-2.5 text-xs font-semibold text-white hover:bg-[#204d3f]">Về trang menu</button>
            </section>
          ) : (
            <>
              <div className="mt-7 flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-xs font-medium text-[#95a198]">Theo dõi đơn hàng</p>
                  <h1 className="mt-1 text-[28px] font-semibold tracking-tight text-[#263d32]">Đơn hàng #{order.code}</h1>
                  <p className="mt-1.5 text-xs text-[#8a968e]">
                    Đặt lúc {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' }).format(order.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-[#eaf4ed] px-3.5 py-2 text-xs font-semibold text-[#4c805a]">{STATUS_LABEL[order.status]}</span>
              </div>

              {order.status === 'CANCELLED' ? (
                <div role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  Đơn hàng này đã bị hủy. Vui lòng liên hệ cửa hàng nếu bạn cần hỗ trợ.
                </div>
              ) : (
                <section className="mt-6 rounded-2xl border border-[#e7ece7] bg-white p-6">
                  <h2 className="text-sm font-semibold text-[#394d40]">Trạng thái đơn</h2>
                  <ol className="mt-6 grid gap-0 sm:grid-cols-4">
                    {STEPS.map((step, index) => {
                      const activeIndex = STATUS_INDEX[order.status] ?? -1
                      const complete = index <= activeIndex
                      const current = index === activeIndex
                      return (
                        <li key={step.status} className="relative flex gap-3 pb-5 sm:flex-col sm:pb-0">
                          {index < STEPS.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-14px)] w-px sm:left-7 sm:top-[13px] sm:h-px sm:w-[calc(100%-14px)] ${index < activeIndex ? 'bg-[#77a384]' : 'bg-[#e6ebe6]'}`} />}
                          <span className={`relative z-10 flex size-7 shrink-0 items-center justify-center rounded-full border ${complete ? 'border-[#548265] bg-[#548265] text-white' : 'border-[#dce4dd] bg-white text-[#abb5ad]'}`}>
                            {complete ? <Check className="size-3.5" strokeWidth={3} /> : <span className="size-2 rounded-full bg-current" />}
                          </span>
                          <span className="relative z-10 sm:mt-3">
                            <span className={`block text-xs font-semibold ${current ? 'text-[#3f7550]' : complete ? 'text-[#506557]' : 'text-[#9ca69f]'}`}>{step.title}</span>
                            <span className="mt-1 block max-w-[180px] text-[10px] leading-4 text-[#98a29b]">{step.description}</span>
                          </span>
                        </li>
                      )
                    })}
                  </ol>
                </section>
              )}

              <div className="mt-5 grid gap-5 md:grid-cols-[minmax(0,1fr)_300px]">
                <section className="rounded-2xl border border-[#e7ece7] bg-white p-5">
                  <h2 className="flex items-center gap-2 text-sm font-semibold text-[#394d40]"><Coffee className="size-4 text-[#61836a]" /> Món đã đặt</h2>
                  <ul className="mt-4 divide-y divide-[#eff2ef]">
                    {order.lines.map((line, index) => (
                      <li key={`${line.productId}-${index}`} className="flex items-start justify-between gap-4 py-3">
                        <div>
                          <p className="text-xs font-semibold text-[#48594e]">{line.quantity}× {line.name}</p>
                          <p className="mt-1 text-[10px] text-[#929d95]">Size {line.size} · {line.sugar} đường · {line.ice}{line.toppings.length > 0 ? ` · ${line.toppings.join(', ')}` : ''}</p>
                        </div>
                        <span className="shrink-0 text-xs font-semibold text-[#59695e]">{formatPrice(line.unitPrice * line.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-3 flex items-center justify-between border-t border-[#edf0ed] pt-4 text-xs">
                    <span className="text-[#829087]">Tổng thanh toán</span>
                    <span className="text-lg font-bold text-[#3d7951]">{formatPrice(order.total)}</span>
                  </div>
                </section>

                <aside className="flex flex-col gap-4">
                  <section className="rounded-2xl border border-[#e7ece7] bg-white p-5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-[#394d40]"><PackageCheck className="size-4 text-[#61836a]" /> Thông tin nhận hàng</h2>
                    <p className="mt-4 text-xs font-semibold text-[#526258]">{order.customerName}</p>
                    <p className="mt-1 text-[11px] text-[#89958d]">{order.phone}</p>
                    <p className="mt-3 flex items-start gap-2 text-[11px] leading-5 text-[#78867d]">
                      <MapPin className="mt-0.5 size-3.5 shrink-0" />
                      {order.fulfillment === 'pickup' ? 'Nhận tại quầy BrewLite' : order.address}
                    </p>
                  </section>
                  <section className="rounded-2xl border border-[#e7ece7] bg-white p-5">
                    <h2 className="flex items-center gap-2 text-sm font-semibold text-[#394d40]"><Clock3 className="size-4 text-[#61836a]" /> Thanh toán</h2>
                    <div className="mt-4 flex justify-between text-[11px]">
                      <span className="text-[#89958d]">Phương thức</span><span className="font-semibold text-[#536258]">{PAYMENT_LABEL[order.paymentMethod]}</span>
                    </div>
                    <div className="mt-2 flex justify-between text-[11px]">
                      <span className="text-[#89958d]">Trạng thái</span><span className="font-semibold text-[#548265]">Đã thanh toán</span>
                    </div>
                  </section>
                </aside>
              </div>
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
