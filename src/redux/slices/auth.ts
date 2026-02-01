import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { getLocalStorage } from '../../tools/cookie'

interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
}

// Initialize from localStorage synchronously (existence check only, no validation)
// Validation happens async in App.tsx
const storedToken = getLocalStorage('auth')
const token = storedToken && storedToken !== 'undefined' ? storedToken : null

const initialState: AuthState = {
  isAuthenticated: !!token,
  accessToken: token
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action: PayloadAction<{ accessToken: string | null }>) => {
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = !!action.payload.accessToken
    },
    clearAuth: state => {
      state.accessToken = null
      state.isAuthenticated = false
    }
  }
})

export const { setAuth, clearAuth } = authSlice.actions
export default authSlice.reducer
