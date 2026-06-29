export type Theme = 'light' | 'dark' | 'system'

export type ToastVariant = 'default' | 'destructive' | 'success'

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface NavItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
  badge?: string | number
  children?: NavItem[]
}

export interface TableColumn<T> {
  key: keyof T | string
  header: string
  cell?: (row: T) => React.ReactNode
  sortable?: boolean
  className?: string
}
