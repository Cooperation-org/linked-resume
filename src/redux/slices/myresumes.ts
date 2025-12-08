import { refreshAccessToken } from './../../tools/auth'
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GoogleDriveStorage, Resume as ResumeManager } from '@cooperation/vc-storage' //NOSONAR
import { getLocalStorage } from '../../tools/cookie'
import StorageService from '../../storage-singlton'

// Define Resume Types
export interface IssuerInfo {
  id: string
  name: string
  type: 'organization' | 'institution' | 'individual'
  verificationURL?: string
  logo?: string
}

export interface VerificationCredential {
  vcId?: string
  vcDid?: string
  issuer: IssuerInfo
  dateVerified: string
  expiryDate?: string
  status: 'valid' | 'expired' | 'revoked'
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface VerifiableItem {
  id: string
  verificationStatus: 'unverified' | 'pending' | 'verified'
  verifiedCredentials?: VerificationCredential[]
  isVisible?: boolean
}

export interface Contact {
  fullName: string
  email: string
  phone?: string
  location?: {
    city: string
    state?: string
    country: string
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    portfolio?: string
    instagram?: string
  }
}

export interface Resume {
  fullName: string
  id: string
  lastUpdated: string
  name: string
  version?: number
  contact: Contact
  summary: string
  content: {
    issuanceDate: string | number | Date
    credentialSubject: any
    contact: any
    resume: any
  }
}

// Define State
interface ResumeState {
  signed: Resume[]
  unsigned: Resume[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string | null
}

const initialState: ResumeState = {
  signed: [],
  unsigned: [],
  status: 'idle',
  error: null
}

export const fetchUserResumes = createAsyncThunk('resume/fetchUserResumes', async () => {
  try {
    const accessToken = getLocalStorage('auth')
    const refreshToken = getLocalStorage('refresh_token')

    if (!accessToken || !refreshToken) {
      throw new Error(
        'No authentication token found. Please sign in to view your resumes.'
      )
    }

    // Get singleton instance and initialize it
    const storageService = StorageService.getInstance()
    storageService.initialize(accessToken)

    // Get the resume manager from the service
    const resumeManager = storageService.getResumeManager()

    // Fetch resumes
    const resumeVCs = await resumeManager.getSignedResumes()
    const resumeSessions = await resumeManager.getNonSignedResumes()

    return {
      signed: resumeVCs,
      unsigned: resumeSessions
    }
  } catch (error) {
    console.error('Error fetching resumes:', error)

    // Check for authentication errors
    if (error instanceof Error) {
      // Google Drive authentication errors
      if (
        error.message.includes('401') ||
        error.message.includes('authentication') ||
        error.message.includes('OAuth') ||
        error.message.includes('credential')
      ) {
        throw new Error(
          'Authentication expired. Please sign in again to access your resumes.'
        )
      }

      // Check for refresh token errors
      if (/auth|token|credential|OAuth|authentication/i.test(error.message)) {
        try {
          await refreshAccessToken(getLocalStorage('refresh_token') as string)
          // If refresh succeeds, throw a more user-friendly error
          throw new Error('Please refresh the page to continue.')
        } catch (refreshError) {
          console.error('Failed to refresh token:', refreshError)
          throw new Error('Session expired. Please sign in again.')
        }
      }
    }

    // For any other errors, throw a generic message
    throw new Error('Unable to load resumes. Please try again later.')
  }
})

// Redux Slice
const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    // ✅ Add a new resume
    addResume: (
      state,
      action: PayloadAction<{ resume: Resume; type: 'signed' | 'unsigned' }>
    ) => {
      state[action.payload.type].push(action.payload.resume)
    },

    // ✅ Update Resume Title (Root + Nested)
    updateTitle: (
      state,
      action: PayloadAction<{ id: string; newTitle: string; type: 'signed' | 'unsigned' }>
    ) => {
      const { id, newTitle, type } = action.payload
      state[type] = state[type].map(resume =>
        resume.id === id
          ? {
              ...resume,
              name: `${newTitle}.json`, // ✅ Rename Google Drive File
              content: {
                ...resume.content,
                resume: {
                  ...resume.content.resume,
                  title: undefined // ❌ Remove Title from JSON
                }
              }
            }
          : resume
      )
    },
    // ✅ Duplicate Resume (with new ID and updated title)
    duplicateResume: (
      state,
      action: PayloadAction<{
        id: string
        type: 'signed' | 'unsigned'
        resume: Resume
      }>
    ) => {
      const { type, resume } = action.payload
      state[type].push(resume)
    },

    // ✅ Delete Resume
    deleteResume: (
      state,
      action: PayloadAction<{ id: string; type: 'signed' | 'unsigned' }>
    ) => {
      const { id, type } = action.payload
      state[type] = state[type].filter(resume => resume.id !== id)
    }
  },

  extraReducers: builder => {
    builder
      .addCase(fetchUserResumes.pending, state => {
        state.status = 'loading'
      })
      .addCase(fetchUserResumes.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.signed = action.payload.signed
        state.unsigned = action.payload.unsigned
      })
      .addCase(fetchUserResumes.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message || 'Failed to fetch resumes'
      })
  }
})

// Export actions
export const { addResume, updateTitle, duplicateResume, deleteResume } =
  resumeSlice.actions

// Export reducer
export default resumeSlice.reducer
