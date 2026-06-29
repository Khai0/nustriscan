import { cn } from '@lib/utils'
import { Button } from '@components/ui/button'
import type { LucideIcon } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  action?: {
    label: string
    icon?: LucideIcon
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
  }
  className?: string
  children?: React.ReactNode
}

export function PageHeader({ title, description, action, className, children }: PageHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-6', className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {children}
        {action && (
          <Button
            onClick={action.onClick}
            variant={action.variant ?? 'default'}
            size="sm"
            className="gap-2"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        )}
      </div>
    </div>
  )
}
