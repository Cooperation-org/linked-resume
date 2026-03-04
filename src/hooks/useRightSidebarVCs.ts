import { useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchVCs } from '../redux/slices/vc'
import { AppDispatch, RootState } from '../redux/store'
import { getCredentialName } from '../utils/credentialUtils'

// getCredentialName is re-exported from credentialUtils for backwards-compatibility
export { getCredentialName }

/** Filters out VCs with no resolvable display name */
export function getValidVCs(vcs: any[]): any[] {
  if (!Array.isArray(vcs)) return []
  return vcs.filter(vc => {
    try {
      if (!vc || typeof vc !== 'object') return false
      if (!vc.credentialSubject || typeof vc.credentialSubject !== 'object') return false
      return getCredentialName(vc).trim() !== ''
    } catch {
      return false
    }
  })
}

/** Sections of the resume that can carry credentials */
const CREDENTIALED_SECTIONS = [
  'experience',
  'education',
  'skills',
  'certifications',
  'projects',
  'professionalAffiliations',
  'volunteerWork'
] as const

interface UseRightSidebarVCsReturn {
  vcs: any[]
  isLoading: boolean
  handleRefresh: () => void
  isCredentialInUse: (vcId: string) => boolean
}

/**
 * Manages VC loading, refresh, and usage-tracking for the RightSidebar.
 */
export function useRightSidebarVCs(): UseRightSidebarVCsReturn {
  const dispatch: AppDispatch = useDispatch()
  const { vcs } = useSelector((state: any) => state.vcReducer)
  const resume = useSelector((state: RootState) => state.resume?.resume)
  const [isLoading, setIsLoading] = useState(true)

  // Initial load on mount
  useEffect(() => {
    setIsLoading(true)
    dispatch(fetchVCs())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }, [dispatch])

  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    dispatch(fetchVCs())
      .then(() => setIsLoading(false))
      .catch(() => setIsLoading(false))
  }, [dispatch])

  const isCredentialInUse = useCallback(
    (vcId: string): boolean => {
      if (!resume || !vcId) return false

      for (const sectionName of CREDENTIALED_SECTIONS) {
        const section = resume[sectionName as keyof typeof resume]
        if (
          section &&
          typeof section === 'object' &&
          'items' in section &&
          Array.isArray(section.items)
        ) {
          for (const item of section.items) {
            const candidate = item as any
            const selectedCredentials = candidate?.selectedCredentials
            if (
              Array.isArray(selectedCredentials) &&
              selectedCredentials.some(
                (cred: any) => cred?.id === vcId || cred?.fileId === vcId
              )
            ) {
              return true
            }
            const credentialLink = candidate?.credentialLink
            if (typeof credentialLink === 'string' && credentialLink.includes(vcId)) {
              return true
            }
          }
        }
      }
      return false
    },
    [resume]
  )

  return { vcs, isLoading, handleRefresh, isCredentialInUse }
}
