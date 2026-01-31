import { NavigateFunction } from 'react-router-dom'
import { authService } from '../services/authService'

/**
 * OAuth login flow - redirects to Google OAuth
 */
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

/**
 * Handle OAuth redirect callback
 */
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
    const { access_token, refresh_token, expires_in } = await exchangeCodeForTokens(code)

    if (!access_token || !refresh_token) {
      throw new Error('Failed to retrieve access token or refresh token')
    }

    // Save tokens using AuthService
    authService.saveTokens(access_token, refresh_token, expires_in)
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
  return res.json() as Promise<{
    access_token?: string
    refresh_token?: string
    expires_in?: number
  }>
}


/**
 * Fetch user info from Google
 */
const fetchUserInfo = async (token: string) => {
  const res = await fetch('https://www.googleapis.com/oauth2/v1/userinfo?alt=json', {
    headers: { Authorization: `Bearer ${token}` }
  })

  if (!res.ok) throw new Error('Failed to fetch user info')
  const profile = await res.json()

  authService.saveUserInfo(profile)
}

/**
 * Logout - clears all auth data
 */
export const logout = () => {
  authService.clearTokens()
}
