import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react'
import clsx from 'clsx'

type ToastVariant = 'success' | 'warning' | 'danger' | 'info'

interface Toast {
  id: string
  variant: ToastVariant
  title: string
  description?: string
}

interface ToastContextValue {
  push: (toast: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const variantStyles: Record<ToastVariant, { icon: typeof CheckCircle2; className: string }> = {
  success: { icon: CheckCircle2, className: 'border-success/40 text-success' },
  warning: { icon: AlertTriangle, className: 'border-warning/40 text-warning' },
  danger: { icon: XCircle, className: 'border-danger/40 text-danger' },
  info: { icon: Info, className: 'border-accent/40 text-accent' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const push = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = crypto.randomUUID()
    setToasts((prev) => [...prev, { ...toast, id }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id))

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
        {toasts.map((t) => {
          const { icon: Icon, className } = variantStyles[t.variant]
          return (
            <div
              key={t.id}
              role="status"
              className={clsx(
                'card border px-3 py-2.5 flex items-start gap-2.5 shadow-lg animate-in',
                className
              )}
            >
              <Icon size={18} className="shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary">{t.title}</p>
                {t.description && (
                  <p className="text-xs text-text-secondary mt-0.5">{t.description}</p>
                )}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="text-text-muted hover:text-text-primary focus-ring rounded"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
