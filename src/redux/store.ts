// redux/store.ts
import { configureStore } from '@reduxjs/toolkit'
import resumeEditorReducer from './slices/resume'
import vcReducer from './slices/vc'
import resumeLibraryReducer from './slices/myresumes'
import authReducer from './slices/auth'

export const store = configureStore({
  reducer: {
    resumeEditor: resumeEditorReducer,
    vc: vcReducer,
    resumeLibrary: resumeLibraryReducer,
    auth: authReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
