// Simplified toast hook compatible with shadcn/ui pattern
import { useState, useCallback } from 'react'

type ToastVariant = 'default' | 'destructive'

interface Toast {
  id: string
  title?: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactNode
  open?: boolean
}

interface ToastOptions {
  title?: string
  description?: string
  variant?: ToastVariant
  action?: React.ReactNode
  duration?: number
}

let toastCount = 0

// Singleton state lifted outside component for global access
let listeners: Array<(toasts: Toast[]) => void> = []
let memoryState: Toast[] = []

function dispatch(toasts: Toast[]) {
  memoryState = toasts
  listeners.forEach(l => l(toasts))
}

export function toast(options: ToastOptions) {
  const id = String(++toastCount)
  const newToast: Toast = { id, open: true, ...options }
  dispatch([...memoryState, newToast])

  // Auto-dismiss
  setTimeout(() => {
    dispatch(memoryState.filter(t => t.id !== id))
  }, options.duration ?? 5000)

  return id
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>(memoryState)

  const subscribe = useCallback((listener: (toasts: Toast[]) => void) => {
    listeners.push(listener)
    return () => {
      listeners = listeners.filter(l => l !== listener)
    }
  }, [])

  useState(() => {
    const unsubscribe = subscribe(setToasts)
    return unsubscribe
  })

  return { toasts, toast }
}
