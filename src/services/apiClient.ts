import { authenticatedFetch } from '../tools/auth'

type JsonOptions = RequestInit & { skipAuth?: boolean }

export const fetchJsonWithAuth = async <T>(url: string, options: JsonOptions = {}) => {
  const { skipAuth, ...requestOptions } = options
  const response = skipAuth
    ? await fetch(url, requestOptions)
    : await authenticatedFetch(url, requestOptions)

  if (!response.ok) {
    const message = `Request failed with ${response.status}`
    throw new Error(message)
  }

  return (await response.json()) as T
}

export const refreshGoogleToken = async (refreshToken: string) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID ?? ''
  const clientSecret = process.env.REACT_APP_GOOGLE_CLIENT_SECRET ?? ''

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token'
    })
  })

  if (!response.ok) {
    throw new Error('Failed to refresh Google access token')
  }

  const data = await response.json()
  return data.access_token as string
}

