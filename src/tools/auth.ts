import { NavigateFunction } from 'react-router-dom'
import { setLocalStorage, removeLocalStorage, getLocalStorage } from './cookie'

const ACCESS_TOKEN_KEY = 'auth'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

const saveItem = (key: string, value: string | null | undefined) => {
  if (value && value !== 'undefined') {
    setLocalStorage(key, value)
  } else {
    removeLocalStorage(key)
  }
}

// Track if we're currently refreshing to avoid multiple simultaneous refresh attempts
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

export const login = async (from?: string) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
  const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI
  const scope =
    'openid profile email https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/drive.appdata'

  if (!clientId || !redirectUri) {
    throw new Error('Missing environment variables for Google login')
  }

  const state = from ? encodeURIComponent(from) : ''
  const authUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${encodeURIComponent(scope)}` +
    `&prompt=consent&access_type=offline&state=${state}`

  window.location.href = authUrl
}

export const handleRedirect = async ({
  navigate,
  onAuthSuccess
}: {
  navigate: NavigateFunction
  onAuthSuccess?: (accessToken: string) => void
}) => {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('code')
  const state = params.get('state')
  const returnPath = state ? decodeURIComponent(state) : '/'

  if (!code) {
    console.error('No authorization code found')
    navigate('/')
    return
  }

  try {
    const { access_token, refresh_token } = await exchangeCodeForTokens(code)

    if (!access_token || !refresh_token) {
      throw new Error('Failed to retrieve access token or refresh token')
    }

    saveItem(ACCESS_TOKEN_KEY, access_token)
    saveItem(REFRESH_TOKEN_KEY, refresh_token)
    onAuthSuccess?.(access_token)

    await fetchUserInfo(access_token)

    setTimeout(() => navigate(returnPath, { replace: true }), 100)
  } catch (err) {
    console.error('Error during token exchange or user‑info fetch:', err)
    navigate('/')
  }
}

const exchangeCodeForTokens = async (code: string) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
  const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET
  const redirectUri = process.env.REACT_APP_GOOGLE_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Missing environment variables for token exchange')
  }

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    })
  })

  if (!res.ok) throw new Error('Failed to exchange code for tokens')
  return res.json() as Promise<{ access_token?: string; refresh_token?: string }>
}

export const refreshAccessToken = async (
  refreshToken?: string,
  onTokenUpdate?: (token: string) => void
) => {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }

  const tokenToUse = refreshToken || getLocalStorage(REFRESH_TOKEN_KEY)
  if (!tokenToUse) {
    throw new Error('No refresh token available')
  }

  isRefreshing = true

  refreshPromise = (async () => {
    try {
      const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''
      const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET ?? ''

      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          refresh_token: tokenToUse,
          grant_type: 'refresh_token'
        })
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        console.error('Token refresh failed:', errorData)
        throw new Error('Error refreshing access token')
      }

      const { access_token } = await res.json()
      if (!access_token) throw new Error('No new access token returned')

      saveItem(ACCESS_TOKEN_KEY, access_token)

      onTokenUpdate?.(access_token)

      return access_token
    } finally {
      isRefreshing = false
      refreshPromise = null
    }
  })()

  return refreshPromise
}

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
  onTokenUpdate?: (token: string) => void
) => {
  const accessToken = getLocalStorage(ACCESS_TOKEN_KEY)

  if (!accessToken) {
    throw new Error('No access token available')
  }

  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`
  }

  let response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    try {
      const newAccessToken = await refreshAccessToken(undefined, onTokenUpdate)

      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newAccessToken}`
      }

      response = await fetch(url, { ...options, headers: newHeaders })

      if (response.status === 401) {
        console.error(
          'Still receiving 401 after token refresh. Refresh token might be invalid.'
        )
        logout()
        throw new Error('Authentication failed. Please log in again.')
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw new Error('Authentication failed. Please log in again.')
    }
  }

  return response
}

const fetchUserInfo = async (token: string) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) throw new Error('Failed to fetch user info')
  const profile = await res.json()

  saveItem(USER_INFO_KEY, JSON.stringify(profile))
}

export const logout = () => {
  removeLocalStorage(ACCESS_TOKEN_KEY)
  removeLocalStorage(REFRESH_TOKEN_KEY)
  removeLocalStorage(USER_INFO_KEY)
}
