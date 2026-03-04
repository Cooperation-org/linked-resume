import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { AppDispatch, RootState } from '../redux/store'
import { fetchUserResumes } from '../redux/slices/myresumes'
import { clearAuth } from '../redux/slices/auth'
import { logout } from '../tools/auth'
import useDraftResume from './useDraftResume'

interface UseMyResumesReturn {
  signed: any[]
  unsigned: any[]
  status: string
  draftResumes: any[]
  friendlyError: string | null
  localDrafts: Record<string, any>
  hasLocalDraft: (resumeId: string) => boolean
  handleLogout: () => void
}

/**
 * Manages resume fetching, error handling, and auth state for the MyResumes page.
 */
export function useMyResumes(): UseMyResumesReturn {
  const dispatch = useDispatch<AppDispatch>()
  const navigate = useNavigate()

  const { signed, unsigned, status, error } = useSelector(
    (state: RootState) => state.myresumes
  )
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)

  const [friendlyError, setFriendlyError] = useState<string | null>(null)
  const hasFetchedResumes = useRef(false)

  const { getAllDrafts } = useDraftResume(null)
  const localDrafts = getAllDrafts()

  // Fetch on first authenticated mount
  useEffect(() => {
    if (isAuthenticated && !hasFetchedResumes.current && status === 'idle') {
      dispatch(fetchUserResumes())
      hasFetchedResumes.current = true
    }
  }, [isAuthenticated, status, dispatch])

  const handleLogout = useCallback(() => {
    logout()
    dispatch(clearAuth())
    navigate('/')
  }, [navigate, dispatch])

  // Translate Redux error codes into friendly messages + side-effects
  useEffect(() => {
    if (status === 'loading') {
      setFriendlyError(null)
      return
    }
    if (status === 'failed') {
      if (
        error?.includes('No authentication token found') ||
        error?.includes('Authentication expired') ||
        error?.includes('Session expired')
      ) {
        setFriendlyError(error)
        if (isAuthenticated) handleLogout()
      } else if (error?.includes('Please refresh the page')) {
        setFriendlyError('Refreshing authentication...')
        setTimeout(() => window.location.reload(), 1500)
      } else if (error?.includes('Error refreshing access token')) {
        setFriendlyError('You need to sign in to view your resumes.')
        if (isAuthenticated) handleLogout()
      } else if (error?.includes('Access token not found') && !isAuthenticated) {
        setFriendlyError('Please log in to view your resumes.')
      } else {
        setFriendlyError(error || 'An error occurred while loading your resumes.')
      }
    } else if (status === 'succeeded') {
      setFriendlyError(null)
    }
  }, [status, error, isAuthenticated, handleLogout])

  const isCompletedUnsigned = (resume: any) => resume?.content?.isComplete === true
  const draftResumes = unsigned.filter(resume => !isCompletedUnsigned(resume))
  const hasLocalDraft = (resumeId: string) => Boolean(localDrafts[resumeId])

  return {
    signed,
    unsigned,
    status,
    draftResumes,
    friendlyError,
    localDrafts,
    hasLocalDraft,
    handleLogout
  }
}
