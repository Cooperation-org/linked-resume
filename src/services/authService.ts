import { getLocalStorage, setLocalStorage, removeLocalStorage } from '../tools/cookie'

const ACCESS_TOKEN_KEY = 'auth'
const REFRESH_TOKEN_KEY = 'refresh_token'
const TOKEN_EXPIRES_AT_KEY = 'auth_expires_at'
const USER_INFO_KEY = 'user_info'

type TokenUpdateCallback = (token: string | null) => void

class AuthService {
  private refreshPromise: Promise<string | null> | null = null
  private tokenUpdateCallbacks: Set<TokenUpdateCallback> = new Set()

  /**
   * Register a callback to be notified when token changes
   */
  onTokenUpdate(callback: TokenUpdateCallback): () => void {
    this.tokenUpdateCallbacks.add(callback)
    // Return unsubscribe function
    return () => {
      this.tokenUpdateCallbacks.delete(callback)
    }
  }

  /**
   * Notify all callbacks of token change
   */
  private notifyTokenUpdate(token: string | null): void {
    this.tokenUpdateCallbacks.forEach(callback => callback(token))
  }

  /**
   * Get access token from storage
   */
  getAccessToken(): string | null {
    const token = getLocalStorage(ACCESS_TOKEN_KEY)
    return token && token !== 'undefined' ? token : null
  }

  /**
   * Get refresh token from storage
   */
  getRefreshToken(): string | null {
    const token = getLocalStorage(REFRESH_TOKEN_KEY)
    return token && token !== 'undefined' ? token : null
  }

  /**
   * Check if access token exists and is not expired
   */
  isTokenValid(): boolean {
    const token = this.getAccessToken()
    if (!token) {
      return false
    }

    const expiresAt = getLocalStorage(TOKEN_EXPIRES_AT_KEY)
    if (!expiresAt) {
      return false
    }

    const expirationTime = parseInt(expiresAt, 10)
    if (isNaN(expirationTime)) {
      return false
    }

    // Add 60 second buffer to account for clock skew and network delays
    return expirationTime > Date.now() + 60000
  }

  /**
   * Save tokens to storage
   */
  saveTokens(
    accessToken: string,
    refreshToken?: string,
    expiresIn?: number
  ): void {
    setLocalStorage(ACCESS_TOKEN_KEY, accessToken)

    if (refreshToken) {
      setLocalStorage(REFRESH_TOKEN_KEY, refreshToken)
    }

    // Calculate expiration time from expires_in (in seconds) or default to 1 hour
    const expirationSeconds = expiresIn || 3600
    const expiresAt = Date.now() + expirationSeconds * 1000
    setLocalStorage(TOKEN_EXPIRES_AT_KEY, expiresAt.toString())

    this.notifyTokenUpdate(accessToken)
  }

  /**
   * Clear all tokens and auth data
   */
  clearTokens(): void {
    removeLocalStorage(ACCESS_TOKEN_KEY)
    removeLocalStorage(REFRESH_TOKEN_KEY)
    removeLocalStorage(TOKEN_EXPIRES_AT_KEY)
    removeLocalStorage(USER_INFO_KEY)
    this.notifyTokenUpdate(null)
  }

  /**
   * Refresh access token using refresh token
   * Prevents multiple simultaneous refresh requests
   */
  async refreshAccessToken(): Promise<string | null> {
    // If already refreshing, return the existing promise
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET

    if (!clientId || !clientSecret) {
      console.error('Missing Google OAuth credentials')
      return null
    }

    this.refreshPromise = (async () => {
      try {
        const response = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            refresh_token: refreshToken,
            grant_type: 'refresh_token'
          })
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('Token refresh failed:', errorData)
          this.clearTokens()
          return null
        }

        const data = await response.json()
        const { access_token, expires_in } = data

        if (!access_token) {
          console.error('No access token in refresh response')
          this.clearTokens()
          return null
        }

        // Save new token with actual expires_in from API
        this.saveTokens(access_token, undefined, expires_in)

        return access_token
      } catch (error) {
        console.error('Error refreshing token:', error)
        this.clearTokens()
        return null
      } finally {
        this.refreshPromise = null
      }
    })()

    return this.refreshPromise
  }

  /**
   * Get a valid access token, refreshing if necessary
   * This is the main method to use before making API calls
   */
  async getValidAccessToken(): Promise<string | null> {
    // If token is valid, return it
    if (this.isTokenValid()) {
      return this.getAccessToken()
    }

    // Token is missing or expired, try to refresh
    return await this.refreshAccessToken()
  }

  /**
   * Save user info
   */
  saveUserInfo(userInfo: any): void {
    setLocalStorage(USER_INFO_KEY, JSON.stringify(userInfo))
  }

  /**
   * Get user info
   */
  getUserInfo(): any | null {
    const userInfo = getLocalStorage(USER_INFO_KEY)
    if (!userInfo) {
      return null
    }
    try {
      return JSON.parse(userInfo)
    } catch {
      return null
    }
  }
}

// Export singleton instance
export const authService = new AuthService()
