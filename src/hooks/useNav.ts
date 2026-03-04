import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { getLocalStorage } from '../tools/cookie'
import { clearAuth, setAuth } from '../redux/slices/auth'
import { RootState } from '../redux/store'
import { login, logout } from '../tools/auth'

interface NavItem {
  label: string
  action: () => void
}

interface UseNavReturn {
  isLogged: boolean
  mobileMenuOpen: boolean
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>
  navItems: NavItem[]
  handleLogout: () => void
  handleLogin: () => void
}

/**
 * Encapsulates Nav state: auth restore, handlers, and navItems list.
 */
export function useNav(): UseNavReturn {
  const dispatch = useDispatch()
  const isLogged = useSelector((state: RootState) => state.auth.isAuthenticated)
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Restore session token from localStorage on mount
  useEffect(() => {
    const token = getLocalStorage('auth')
    if (token) dispatch(setAuth({ accessToken: token }))
  }, [dispatch])

  const handleLogout = useCallback(() => {
    logout()
    dispatch(clearAuth())
    setMobileMenuOpen(false)
    navigate('/')
  }, [dispatch, navigate])

  const handleLogin = useCallback(() => {
    if (!isLogged) {
      login('/resume/import')
    } else {
      navigate('/resume/import')
    }
  }, [isLogged, navigate])

  const navItems = useMemo<NavItem[]>(
    () => [
      { label: 'Why Resume Author?', action: () => setMobileMenuOpen(false) },
      { label: 'How it works', action: () => setMobileMenuOpen(false) },
      { label: 'Benefits', action: () => setMobileMenuOpen(false) },
      {
        label: 'Help & FAQ',
        action: () => {
          navigate('/faq')
          setMobileMenuOpen(false)
        }
      },
      { label: 'Learn More', action: () => setMobileMenuOpen(false) }
    ],
    [navigate]
  )

  return { isLogged, mobileMenuOpen, setMobileMenuOpen, navItems, handleLogout, handleLogin }
}
