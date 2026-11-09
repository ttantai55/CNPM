import { cn } from '@/lib/utils'

type ControlProps = {
  id: string
  'aria-invalid'?: true
  'aria-describedby'?: string
}

export function inputClass(invalid: boolean) {
  return cn(
    'h-11 w-full rounded-xl border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2',
    invalid
      ? 'border-destructive focus:ring-destructive/25'
      : 'border-input focus:border-caramel focus:ring-caramel/30',
  )
}

export function FormField({
  id,
  label,
  error,
  children,
}: {
  id: string
  label: string
  error?: string
  children: (props: ControlProps) => React.ReactNode
}) {
  const errorId = `${id}-error`
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-foreground">
        {label}
      </label>
      <div className="mt-1.5">
        {children({
          id,
          'aria-invalid': error ? true : undefined,
          'aria-describedby': error ? errorId : undefined,
        })}
      </div>
      {error && (
        <p id={errorId} className="mt-1 text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}
