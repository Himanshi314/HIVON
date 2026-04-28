// src/components/ui/Badge.tsx
import { cn } from '@/lib/utils'
import type { UserRole } from '@/types'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive' | 'outline'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  const variants = {
    default: 'bg-muted text-muted-foreground',
    primary: 'bg-primary/10 text-primary',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    destructive: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    outline: 'border border-border text-foreground',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

// Role badge with appropriate color per role
export function RoleBadge({ role }: { role: UserRole }) {
  const config = {
    admin: { label: 'Admin', variant: 'destructive' as const },
    author: { label: 'Author', variant: 'primary' as const },
    viewer: { label: 'Viewer', variant: 'default' as const },
  }

  const { label, variant } = config[role]
  return <Badge variant={variant}>{label}</Badge>
}
