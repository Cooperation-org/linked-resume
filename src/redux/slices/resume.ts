import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { initialState } from '../../initialResumeState'

export interface ResumeState {
  resume: Resume | null
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
  activeSection: string | null // tracks the section currently being edited.
  highlightedText: string | null // tracks the text highlighted by the user.
  pendingVerifications: string[] // tracks the credentials pending verification.
  selectedCredentials: string[] // tracks the credentials selected for linking to a section.
  isDirty: boolean // tracks whether the resume has unsaved changes.
  sectionVisibility: { [key: string]: boolean } // tracks the visibility of each section.
  claims: any[]
}

export const fetchResume = createAsyncThunk(
  'resume/fetchResume',
  async (resumeId: string) => {
    // get the resume from Google drive if it exists
  }
)

export const saveResume = createAsyncThunk(
  'resume/saveResume',
  async (resume: Resume) => {
    // save the resume to Google drive
  }
)

export const linkCredential = createAsyncThunk(
  'resume/linkCredential',
  async ({
    resumeId,
    sectionId,
    credential
  }: {
    resumeId: string
    sectionId: string
    credential: VerificationCredential
  }) => {
    // link the credential to the resume section
  }
)

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    setActiveSection: (state, action) => {
      state.activeSection = action.payload as string
    },
    setVCs: (state, action) => {
      state.claims = action.payload
    },
    setHighlightedText: (state, action) => {
      state.highlightedText = action.payload
    },
    updateSection: (state, action) => {
      if (!state.resume) return

      const { sectionId, content } = action.payload

      if (sectionId in state.resume) {
        const section = state.resume[sectionId as keyof Resume]

        if (section && typeof section === 'object' && 'items' in section) {
          // If the content has an 'items' property, update it properly
          ;(section as any).items = content.items || []
        } else {
          // Otherwise, directly update the section
          ;(state.resume as any)[sectionId] = content
        }
        state.isDirty = true
      }
    },
    removeSection: (state, action) => {
      if (!state.resume) return
      const sectionId = action.payload
      if (sectionId in state.resume) {
        delete state.resume[sectionId as keyof Resume]
        state.isDirty = true
      }
    },
    setSectionVisibility: (state, action) => {
      state.sectionVisibility[action.payload] = !state.sectionVisibility[action.payload]
    },
    toggleSectionVisibility: (state, action) => {
      if (!state.resume) return
      const section = state.resume[action.payload as keyof Resume] as any
      if (section && 'isVisible' in section) {
        section.isVisible = !section.isVisible
        state.isDirty = true
      }
    },
    selectCredential: (state, action) => {
      state.selectedCredentials.push(action.payload)
    },
    unselectCredential: (state, action) => {
      state.selectedCredentials = state.selectedCredentials.filter(
        id => id !== action.payload
      )
    },
    addPendingVerification: (state, action) => {
      state.pendingVerifications.push(action.payload)
    },
    removePendingVerification: (state, action) => {
      state.pendingVerifications = state.pendingVerifications.filter(
        id => id !== action.payload
      )
    },
    resetDirtyState: state => {
      state.isDirty = false
    },
    setSelectedResume: (state, action) => {
      state.resume = action.payload // Set the selected resume as the current resume
      state.isDirty = false // Reset the dirty state
    },
    resetToInitialState: () => {
      // Reset the entire state to initial state with a fresh timestamp
      return {
        ...initialState,
        resume: initialState.resume
          ? {
              ...initialState.resume,
              lastUpdated: new Date().toISOString()
            }
          : null
      }
    }
  }
})

export const {
  setActiveSection,
  setHighlightedText,
  updateSection,
  removeSection,
  setSectionVisibility,
  toggleSectionVisibility,
  selectCredential,
  unselectCredential,
  addPendingVerification,
  removePendingVerification,
  resetDirtyState,
  setVCs,
  setSelectedResume, // Exported here
  resetToInitialState
} = resumeSlice.actions

export default resumeSlice.reducer
