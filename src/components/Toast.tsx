import { createContext, useCallback, useContext, useState, type ReactNode } from 'react'
import { CheckIcon, AlertIcon, XIcon } from './icons'
import { classNames, uid } from '@/lib/utils'

type ToastKind = 'success' | 'error' | 'info'
interface Toast { id: string; kind: ToastKind; message: string }

const ToastCtx = createContext<(message: string, kind?: ToastKind) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const push = useCallback((message: string, kind: ToastKind = 'success') => {
    const id = uid('toast')
    setToasts((t) => [...t, { id, kind, message }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3500)
  }, [])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[60] flex flex-col items-center gap-2 px-4 sm:bottom-8">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={classNames(
              'pointer-events-auto flex w-full max-w-sm items-start gap-2.5 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg animate-scale-in',
              t.kind === 'success' && 'bg-brand-600',
              t.kind === 'error' && 'bg-red-600',
              t.kind === 'info' && 'bg-ink-700',
            )}
          >
            {t.kind === 'error' ? <AlertIcon className="h-5 w-5 shrink-0" /> : <CheckIcon className="h-5 w-5 shrink-0" />}
            <span className="flex-1">{t.message}</span>
            <button onClick={() => setToasts((x) => x.filter((y) => y.id !== t.id))} aria-label="Dismiss"><XIcon className="h-4 w-4" /></button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
