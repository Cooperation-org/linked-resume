import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { getLocalStorage } from '../tools/cookie'
import { storeFileTokens } from '../firebase/storage'
import { prepareResumeForVC } from '../tools/resumeAdapter'
import useGoogleDrive from './useGoogleDrive'

interface UseSignAndSaveReturn {
  isDraftSaving: boolean
  isSigningSaving: boolean
  showAuthError: boolean
  setShowAuthError: React.Dispatch<React.SetStateAction<boolean>>
  onSaveDraft: () => Promise<void>
  onSignAndSave: () => Promise<void>
  handleLogout: () => void
}

/**
 * Encapsulates the sign-and-save / save-draft flow for ResumePreviewTopbar.
 * Manages loading states and auth-error detection.
 */
export function useSignAndSave(resumeId?: string | null): UseSignAndSaveReturn {
  const navigate = useNavigate()
  const resume = useSelector((state: RootState) => state?.resume.resume)
  const { instances } = useGoogleDrive()
  const accessToken = getLocalStorage('auth')
  const refreshToken = getLocalStorage('refresh_token')

  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isSigningSaving, setIsSigningSaving] = useState(false)
  const [showAuthError, setShowAuthError] = useState(false)

  const handleBackToEdit = useCallback(() => {
    if (resumeId) {
      navigate(`/resume/new?id=${resumeId}`)
      return
    }
    const urlResumeId = new URLSearchParams(window.location.search).get('id')
    navigate(urlResumeId ? `/resume/new?id=${urlResumeId}` : '/resume/new')
  }, [navigate, resumeId])

  const saveDraft = useCallback(async () => {
    if (!instances?.resumeManager) {
      console.error('Resume manager not available')
      return
    }
    try {
      await instances.resumeManager.saveResume({ resume, type: 'unsigned' })
    } catch (err) {
      console.error('Error saving draft:', err)
    }
  }, [instances, resume])

  const onSaveDraft = useCallback(async () => {
    setIsDraftSaving(true)
    await saveDraft()
    setIsDraftSaving(false)
  }, [saveDraft])

  const signAndSave = useCallback(async () => {
    if (!instances?.resumeVC || !instances?.resumeManager) {
      throw new Error('Required services not available')
    }
    if (!resume) throw new Error('Resume is null, cannot prepare for VC')

    try {
      const keyPair = await instances.resumeVC.generateKeyPair()
      if (!keyPair) throw new Error('Failed to generate key pair')

      const didDoc = await instances.resumeVC.createDID({ keyPair })
      if (!didDoc) throw new Error('Failed to create DID document')

      const preparedResume = await prepareResumeForVC(resume, {})

      // Ensure processed employmentHistory is used in credentialSubject
      if (
        preparedResume.credentialSubject &&
        preparedResume.employmentHistory &&
        Array.isArray(preparedResume.employmentHistory)
      ) {
        preparedResume.credentialSubject.employmentHistory = preparedResume.employmentHistory
      }

      const signedResume = await instances.resumeVC.sign({
        formData: preparedResume,
        issuerDid: didDoc.id,
        keyPair
      })
      if (!signedResume) throw new Error('Failed to sign resume')

      const file = await instances.resumeManager.saveResume({ resume: signedResume, type: 'sign' })
      if (!file?.id) throw new Error('Failed to save resume')

      // Also save a completed unsigned copy with the isComplete flag
      if (resume) {
        await instances.resumeManager.saveResume({
          resume: { ...resume, isComplete: true },
          type: 'unsigned'
        })
      }

      await storeFileTokens({
        googleFileId: file.id,
        tokens: { accessToken: accessToken ?? '', refreshToken: refreshToken ?? '' }
      })

      return file
    } catch (error: any) {
      console.error('Error signing and saving:', error)
      const isAuthError =
        error.message?.includes('401') ||
        error.message?.includes('403') ||
        error.message?.toLowerCase().includes('auth') ||
        error.message?.includes('token') ||
        error.response?.status === 401 ||
        error.response?.status === 403
      if (isAuthError) {
        const authError = new Error(
          'Authentication expired. Please log out and log in again to continue.'
        )
        ;(authError as any).isAuthError = true
        throw authError
      }
      throw error
    }
  }, [instances, resume, accessToken, refreshToken])

  const onSignAndSave = useCallback(async () => {
    if (!resume) {
      console.error('No resume data available to sign')
      handleBackToEdit()
      return
    }
    setIsSigningSaving(true)
    try {
      const file = await signAndSave()
      if (file?.id) {
        navigate(`/resume/view/${file.id}`)
      } else {
        console.error('No file ID returned from sign and save')
      }
    } catch (error) {
      console.error('Error in onSignAndSave:', error)
      if ((error as any).isAuthError) setShowAuthError(true)
    } finally {
      setIsSigningSaving(false)
    }
  }, [resume, signAndSave, navigate, handleBackToEdit])

  const handleLogout = useCallback(() => {
    localStorage.removeItem('auth')
    localStorage.removeItem('refresh_token')
    navigate('/login')
  }, [navigate])

  return {
    isDraftSaving,
    isSigningSaving,
    showAuthError,
    setShowAuthError,
    onSaveDraft,
    onSignAndSave,
    handleLogout
  }
}
