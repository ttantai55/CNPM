import { cn } from '@/lib/utils'

export function MomoLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-[#a50064] text-[11px] font-extrabold leading-[0.85] tracking-tight text-white',
        className,
      )}
    >
      <span>mo</span>
      <span>mo</span>
    </span>
  )
}

export function VietQrLogo({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex h-10 shrink-0 items-center justify-center rounded-lg border border-[#d7e3f4] bg-white px-2 text-sm font-extrabold tracking-tight',
        className,
      )}
    >
      <span className="text-[#da251d]">VIET</span>
      <span className="text-[#005baa]">QR</span>
    </span>
  )
}
