import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContextRenamed'

interface ProtectedRouteProps {
  children: ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" />
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" />
  }

  return <>{children}</>
}

export default ProtectedRoute