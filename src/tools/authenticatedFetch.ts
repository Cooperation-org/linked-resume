import { authService } from '../services/authService'

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  // Get valid access token (will refresh if needed)
  const accessToken = await authService.getValidAccessToken()

  if (!accessToken) {
    throw new Error('No access token available. Please log in again.')
  }

  // Make request with Authorization header
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${accessToken}`
  }

  let response = await fetch(url, { ...options, headers })

  // If 401, try refreshing token once and retry
  if (response.status === 401) {
    const newAccessToken = await authService.refreshAccessToken()

    if (!newAccessToken) {
      throw new Error('Authentication failed. Please log in again.')
    }

    // Retry request with new token
    const newHeaders = {
      ...options.headers,
      Authorization: `Bearer ${newAccessToken}`
    }

    response = await fetch(url, { ...options, headers: newHeaders })

    // If still 401 after refresh, authentication failed
    if (response.status === 401) {
      throw new Error('Authentication failed. Please log in again.')
    }
  }

  return response
}
