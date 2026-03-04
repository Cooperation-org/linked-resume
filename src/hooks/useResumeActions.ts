import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { setSelectedResume } from '../redux/slices/resume'
import { fetchUserResumes } from '../redux/slices/myresumes'
import { storeFileTokens } from '../firebase/storage'
import { prepareResumeForVC } from '../tools/resumeAdapter'
import { computeResumeHash, forceCredentialJsonString, ensureAbsoluteIds } from '../utils/resumeEditorUtils'

export interface UseResumeActionsProps {
  resume: any
  resumeId: string | null
  instances: any
  sectionEvidence: Record<string, string[][]>
  allFiles: any[]
  originalResumeRef: React.MutableRefObject<string | null>
  setIsDirty: (isDirty: boolean) => void
  accessToken: string | null
  refreshToken: string | null
}

export const useResumeActions = ({
  resume,
  resumeId,
  instances,
  sectionEvidence,
  allFiles,
  originalResumeRef,
  setIsDirty,
  accessToken,
  refreshToken
}: UseResumeActionsProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isSigningSaving, setIsSigningSaving] = useState(false)

  const handleSaveDraft = useCallback(async () => {
    if (!instances?.resumeManager) {
      console.error('Resume manager not available')
      return
    }

    try {
      setIsDraftSaving(true)
      const preparedResume = await prepareResumeForVC(resume, sectionEvidence, allFiles)
      console.log('Saving draft with evidence:', {
        sectionEvidence,
        evidenceInPreparedResume: preparedResume?.evidence
      })

      const resumeToSave = preparedResume || resume

      const saveData: any = {
        resume: resumeToSave,
        type: 'unsigned',
        ...(resumeId && !resumeId.startsWith('temp-') ? { id: resumeId } : {})
      }

      const savedResume = await instances.resumeManager.saveResume(saveData)

      console.log('Save result:', {
        requestedId: resumeId,
        savedId: savedResume?.id,
        isNewFile: savedResume?.id !== resumeId
      })

      if (savedResume) {
        const resumeDataToStore = savedResume.data || resumeToSave
        dispatch(setSelectedResume(resumeDataToStore))

        const newHash = computeResumeHash(resumeDataToStore)
        console.log('Updating resume hash after save', {
          oldHash: originalResumeRef.current?.substring(0, 20),
          newHash: newHash.substring(0, 20)
        })
        originalResumeRef.current = newHash
        setIsDirty(false)

        if (
          (resumeId && resumeId.startsWith('temp-')) ||
          (savedResume.id && savedResume.id !== resumeId)
        ) {
          if (resumeId && resumeId.startsWith('temp-')) {
            const draftKey = `resume_draft_${resumeId}`
            localStorage.removeItem(draftKey)
          }

          if (savedResume.id) {
            const newUrl = `/resume/new?id=${savedResume.id}`
            window.history.replaceState({}, '', newUrl)
            console.log('Updated URL to use correct resume ID:', savedResume.id)
          }
        }
      }
      dispatch(fetchUserResumes() as any)
    } catch (error) {
      console.error('Error saving draft:', error)
    } finally {
      setIsDraftSaving(false)
    }
  }, [
    resume,
    resumeId,
    instances,
    sectionEvidence,
    allFiles,
    dispatch,
    originalResumeRef,
    setIsDirty
  ])

  const handleSignAndSave = useCallback(async () => {
    if (!instances?.resumeVC || !instances?.resumeManager) {
      console.error('Required services not available')
      return
    }

    setIsSigningSaving(true)
    const loadingTimer = setTimeout(() => {
      setIsSigningSaving(false)
    }, 3000)

    try {
      const keyPair = await instances.resumeVC.generateKeyPair()
      if (!keyPair) {
        throw new Error('Failed to generate key pair')
      }

      const didDoc = await instances.resumeVC.createDID({ keyPair })
      if (!didDoc) {
        throw new Error('Failed to create DID document')
      }

      if (!resume) {
        console.error('Resume is null, cannot prepare for VC')
        return
      }

      const preparedResume = await prepareResumeForVC(resume, sectionEvidence, allFiles)

      if (
        preparedResume.credentialSubject &&
        preparedResume.employmentHistory &&
        Array.isArray(preparedResume.employmentHistory)
      ) {
        preparedResume.credentialSubject.employmentHistory =
          preparedResume.employmentHistory
      }

      if (preparedResume.credentialSubject) {
        // Guarantee credentialLink is a JSON string
        preparedResume.credentialSubject.employmentHistory = forceCredentialJsonString(
          preparedResume.credentialSubject.employmentHistory
        )
        preparedResume.credentialSubject.educationAndLearning = forceCredentialJsonString(
          preparedResume.credentialSubject.educationAndLearning
        )
        preparedResume.credentialSubject.certifications = forceCredentialJsonString(
          preparedResume.credentialSubject.certifications
        )
        preparedResume.credentialSubject.skills = forceCredentialJsonString(
          preparedResume.credentialSubject.skills
        )
        preparedResume.credentialSubject.projects = forceCredentialJsonString(
          preparedResume.credentialSubject.projects
        )
        preparedResume.credentialSubject.professionalAffiliations = forceCredentialJsonString(
          preparedResume.credentialSubject.professionalAffiliations
        )
        preparedResume.credentialSubject.volunteerWork = forceCredentialJsonString(
          preparedResume.credentialSubject.volunteerWork
        )
      }

      ensureAbsoluteIds(preparedResume)

      const signedResume = await instances.resumeVC.sign({
        formData: preparedResume,
        issuerDid: didDoc.id,
        keyPair
      })
      if (!signedResume) {
        throw new Error('Failed to sign resume')
      }

      if (
        signedResume.credentialSubject &&
        Array.isArray(signedResume.credentialSubject.employmentHistory)
      ) {
        signedResume.credentialSubject.employmentHistory =
          signedResume.credentialSubject.employmentHistory.map((exp: any) => {
            if (
              exp.credentialLink &&
              (typeof exp.credentialLink !== 'string' ||
                (typeof exp.credentialLink === 'string' &&
                  !exp.credentialLink.startsWith('{')))
            ) {
              if (exp.fullCredential) {
                return {
                  ...exp,
                  credentialLink: JSON.stringify(exp.fullCredential)
                }
              }
            }
            return exp
          })
      }

      if (signedResume.credentialSubject) {
        signedResume.credentialSubject.employmentHistory = forceCredentialJsonString(
          signedResume.credentialSubject.employmentHistory
        )
        signedResume.credentialSubject.educationAndLearning = forceCredentialJsonString(
          signedResume.credentialSubject.educationAndLearning
        )
        signedResume.credentialSubject.certifications = forceCredentialJsonString(
          signedResume.credentialSubject.certifications
        )
        signedResume.credentialSubject.skills = forceCredentialJsonString(
          signedResume.credentialSubject.skills
        )
        signedResume.credentialSubject.projects = forceCredentialJsonString(
          signedResume.credentialSubject.projects
        )
        signedResume.credentialSubject.professionalAffiliations = forceCredentialJsonString(
          signedResume.credentialSubject.professionalAffiliations
        )
        signedResume.credentialSubject.volunteerWork = forceCredentialJsonString(
          signedResume.credentialSubject.volunteerWork
        )
      }

      const file = await instances.resumeManager.saveResume({
        resume: signedResume,
        type: 'sign'
      })
      if (!file?.id) {
        throw new Error('Failed to save resume')
      }

      await storeFileTokens({
        googleFileId: file.id,
        tokens: {
          accessToken: accessToken ?? '',
          refreshToken: refreshToken ?? ''
        }
      })

      originalResumeRef.current = computeResumeHash(resume)
      setIsDirty(false)

      if (resumeId && resumeId.startsWith('temp-')) {
        const draftKey = `resume_draft_${resumeId}`
        localStorage.removeItem(draftKey)

        if (file.id) {
          const newUrl = `/resume/new?id=${file.id}`
          window.history.replaceState({}, '', newUrl)
        }
      }
      dispatch(fetchUserResumes() as any)

      navigate(`/resume/view/${file.id}`)
    } catch (error) {
      console.error('Error signing and saving:', error)
    } finally {
      if (loadingTimer) {
        clearTimeout(loadingTimer)
        setIsSigningSaving(false)
      }
    }
  }, [
    resume,
    resumeId,
    instances,
    sectionEvidence,
    allFiles,
    dispatch,
    accessToken,
    refreshToken,
    originalResumeRef,
    setIsDirty,
    navigate
  ])

  return {
    isDraftSaving,
    setIsDraftSaving,
    isSigningSaving,
    setIsSigningSaving,
    handleSaveDraft,
    handleSignAndSave
  }
}
