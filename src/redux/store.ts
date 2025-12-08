// redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import resumeReducer from './slices/resume'
import vcSlice from './slices/vc'
import resumesReducer from './slices/myresumes'
import authReducer from './slices/auth'

export const store = configureStore({
  reducer: {
    resume: resumeReducer,
    vcReducer: vcSlice,
    resumeReducer: resumeReducer,
    myresumes: resumesReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
