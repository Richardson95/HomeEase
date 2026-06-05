import { Navigate, useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useStore } from '@/lib/store'
import type { Role } from '@/types'

/** Requires an authenticated session; otherwise redirects to login (remembering origin). */
export function RequireAuth({ children }: { children: ReactNode }) {
  const user = useStore((s) => s.currentUser())
  const location = useLocation()
  if (!user) return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  return <>{children}</>
}

/** Restricts a route to specific roles (e.g. admin dashboard). */
export function RequireRole({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const user = useStore((s) => s.currentUser())
  const location = useLocation()
  if (!user) return <Navigate to="/auth/login" state={{ from: location.pathname }} replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />
  return <>{children}</>
}
