import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  resetToInitialState,
  setSelectedResume
} from '../redux/slices/resume'
import { AppDispatch } from '../redux/store'
import { computeResumeHash } from '../utils/resumeHash'

type ResumeLifecycleParams = {
  resumeId: string | null
  isInitialized: boolean
  storage: { retrieve?: (id: string) => Promise<any> } | null | undefined
  dispatch: AppDispatch
  navigate: ReturnType<typeof useNavigate>
  setResumeName: (name: string) => void
  setIsDirty: (dirty: boolean) => void
  setIsLoading: (loading: boolean) => void
  originalResumeRef: React.MutableRefObject<string | null>
  resume: Resume | null
  currentResumeHash: string
}

export const useResumeLifecycle = ({
  resumeId,
  isInitialized,
  storage,
  dispatch,
  navigate,
  setResumeName,
  setIsDirty,
  setIsLoading,
  originalResumeRef,
  resume,
  currentResumeHash
}: ResumeLifecycleParams) => {
  // Reset Redux + local transient state for brand new resume
  useEffect(() => {
    if (!resumeId && isInitialized) {
      dispatch(resetToInitialState())
      sessionStorage.removeItem('lastEditedResumeId')
      const keys = Object.keys(localStorage).filter(key => key.startsWith('resume_draft_'))
      keys.forEach(key => localStorage.removeItem(key))
      originalResumeRef.current = null
      setIsDirty(false)
      setResumeName('Untitled')
    }
  }, [resumeId, isInitialized, dispatch, setIsDirty, setResumeName, originalResumeRef])

  // Load an existing resume (Drive or temp import)
  useEffect(() => {
    if (!resumeId || !isInitialized) return

    const fetchResumeData = async () => {
      setIsLoading(true)
      try {
        if (resumeId.startsWith('temp-')) {
          const draftKey = `resume_draft_${resumeId}`
          const savedDraft = localStorage.getItem(draftKey)
          if (savedDraft) {
            const resumeData = JSON.parse(savedDraft)
            dispatch(setSelectedResume(resumeData))
            originalResumeRef.current = computeResumeHash(resumeData)
            const name = resumeData.contact?.fullName ?? resumeData.name ?? 'Imported Resume'
            setResumeName(name)
          } else {
            navigate('/resume/upload')
          }
          return
        }

        const fileData = await storage?.retrieve?.(resumeId)
        if (fileData) {
          const resumeData = fileData.data ?? fileData
          dispatch(setSelectedResume(resumeData))
          originalResumeRef.current = computeResumeHash(resumeData)
          const name = resumeData.contact?.fullName ?? resumeData.name ?? 'Untitled Resume'
          setResumeName(name)
        } else {
          console.error('Retrieved resume data is empty')
        }
      } catch (error) {
        console.error('Error retrieving resume data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResumeData()
  }, [
    resumeId,
    isInitialized,
    storage,
    dispatch,
    navigate,
    setIsLoading,
    setResumeName,
    originalResumeRef
  ])

  // Dirty state detection using memoized hash
  useEffect(() => {
    if (resume && originalResumeRef.current) {
      const newDirtyState = currentResumeHash !== originalResumeRef.current
      setIsDirty(newDirtyState)
    }
  }, [currentResumeHash, resume, setIsDirty, originalResumeRef])
}

