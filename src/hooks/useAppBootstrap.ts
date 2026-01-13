import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'
import { fetchVCs } from '../redux/slices/vc'
import { setAuth } from '../redux/slices/auth'
import { refreshAccessToken } from '../tools/auth'
import { getLocalStorage } from '../tools/cookie'
import StorageService from '../storage-singlton'
import { getOrCreateAppInstanceDid } from '@cooperation/vc-storage'

export const useAppBootstrap = () => {
  const dispatch = useAppDispatch()
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth)

  // Initialize DID once
  useEffect(() => {
    ;(async () => {
      try {
        await getOrCreateAppInstanceDid()
      } catch (e) {
        console.error('Failed to initialize app DID:', e)
      }
    })()
  }, [])

  // Configure storage token updates and refresh auth on startup
  useEffect(() => {
    const storageService = StorageService.getInstance()
    storageService.setTokenUpdateCallback((accessToken: string) => {
      dispatch(setAuth({ accessToken }))
    })

    const initializeAuth = async () => {
      const accessToken = getLocalStorage('auth')
      const refreshToken = getLocalStorage('refresh_token')
      if (refreshToken && !accessToken) {
        try {
          const token = await refreshAccessToken(refreshToken, (newToken: string) => {
            dispatch(setAuth({ accessToken: newToken }))
          })
          dispatch(setAuth({ accessToken: token }))
        } catch (error) {
          console.error('Failed to refresh token on app startup:', error)
        }
      }
    }

    initializeAuth()
  }, [dispatch])

  // Fetch credentials once authenticated
  useEffect(() => {
    if (!isAuthenticated) return
    dispatch(fetchVCs())
  }, [dispatch, isAuthenticated])
}

export default useAppBootstrap
