import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

interface ProtectedRouteProps {
  redirectTo?: string
}

const ProtectedRoute = ({ redirectTo = '/login' }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const location = useLocation()

  if (isAuthenticated) {
    return <Outlet />
  }

  return <Navigate to={redirectTo} replace state={{ from: location }} />
}

export default ProtectedRoute
