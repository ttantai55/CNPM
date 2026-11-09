'use client'

import { useEffect, useEffectEvent, useId, useRef } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

type ModalProps = {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  variant?: 'center' | 'drawer'
  className?: string
}

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  variant = 'center',
  className,
}: ModalProps) {
  const titleId = useId()
  const descId = useId()
  const panelRef = useRef<HTMLDivElement>(null)
  const handleEscape = useEffectEvent(() => onClose())

  useEffect(() => {
    if (!open) return
    const previouslyFocused = document.activeElement as HTMLElement | null
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleEscape()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
      previouslyFocused?.focus()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className={cn(
        'fixed inset-0 z-50 flex',
        variant === 'center' ? 'items-end justify-center sm:items-center sm:p-4' : 'justify-end',
      )}
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-foreground/40 backdrop-blur-[2px] animate-in fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn(
          'relative flex max-h-[92dvh] w-full flex-col bg-card shadow-xl outline-none',
          variant === 'center'
            ? 'rounded-t-3xl animate-in slide-in-from-bottom-8 sm:max-w-lg sm:rounded-3xl sm:zoom-in-95 sm:slide-in-from-bottom-0'
            : 'h-dvh max-h-dvh max-w-md animate-in slide-in-from-right',
          className,
        )}
      >
        <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
          <div>
            <h2 id={titleId} className="text-lg font-semibold text-foreground">
              {title}
            </h2>
            {description && (
              <p id={descId} className="mt-0.5 text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" aria-hidden="true" />
            <span className="sr-only">Đóng</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
