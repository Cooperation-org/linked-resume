import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

const DRAFT_PREFIX = 'resume_draft_'

export const useDraftResume = (resumeId?: string | null) => {
  const resume = useSelector((state: RootState) => state.resume.resume)

  // Key for localStorage based on resumeId
  const draftKey = resumeId ? `${DRAFT_PREFIX}${resumeId}` : null

  // Load draft from localStorage if available
  const loadDraftFromStorage = useCallback(() => {
    if (!draftKey) return null

    try {
      const savedDraft = localStorage.getItem(draftKey)
      if (!savedDraft) return null

      return JSON.parse(savedDraft)
    } catch (error) {
      console.error('Error loading draft from localStorage:', error)
      return null
    }
  }, [draftKey])

  // Save current resume to localStorage
  const saveDraftToStorage = useCallback(() => {
    if (!draftKey || !resume) return

    try {
      // Add timestamp for tracking when the draft was last modified
      const draftWithTimestamp = {
        ...resume,
        localStorageLastUpdated: new Date().toISOString()
      }

      localStorage.setItem(draftKey, JSON.stringify(draftWithTimestamp))

    } catch (error) {
      console.error('Error saving draft to localStorage:', error)
    }
  }, [draftKey, resume])

  // Clear draft from localStorage
  const clearDraftFromStorage = useCallback(() => {
    if (!draftKey) return

    try {
      localStorage.removeItem(draftKey)

    } catch (error) {
      console.error('Error clearing draft from localStorage:', error)
    }
  }, [draftKey])

  // Get all drafts from localStorage
  const getAllDrafts = useCallback(() => {
    const drafts: { [key: string]: any } = {}

    try {
      // Loop through localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith(DRAFT_PREFIX)) {
          const draftId = key.replace(DRAFT_PREFIX, '')
          const draft = JSON.parse(localStorage.getItem(key) || '{}')
          drafts[draftId] = draft
        }
      }
    } catch (error) {
      console.error('Error retrieving all drafts:', error)
    }

    return drafts
  }, [])

  // Check if a draft exists for the current resumeId
  const hasDraft = useCallback(() => {
    if (!draftKey) return false
    return localStorage.getItem(draftKey) !== null
  }, [draftKey])

  return {
    loadDraftFromStorage,
    saveDraftToStorage,
    clearDraftFromStorage,
    getAllDrafts,
    hasDraft
  }
}

export default useDraftResume
