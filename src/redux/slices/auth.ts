import { createSlice, PayloadAction } from '@reduxjs/toolkit'
interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null
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
