import { useEffect, useState } from 'react'
import { getFileViaFirebase } from '../firebase/storage'
import { mapDriveResume } from '../utils/driveResumeMapper'
import {
  fetchRecommendations,
  RecommendationEntry
} from '../services/recommendationService'

interface UsePublicResumeReturn {
  resumeData: Resume | null
  recommendations: RecommendationEntry[]
  loading: boolean
  error: string | null
}

/**
 * Shared data-fetching hook for VerificationPage, RecommendationPage,
 * and PreviewPageFromDrive.
 *
 * Runs getFileViaFirebase + fetchRecommendations in parallel, maps the raw
 * file data through the existing mapDriveResume utility, and exposes
 * loading/error state.
 */
export function usePublicResume(resumeId: string | undefined): UsePublicResumeReturn {
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!resumeId) {
      setError('Missing resume ID')
      setLoading(false)
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch resume data and recommendations in parallel
        const [fileData, entries] = await Promise.all([
          getFileViaFirebase(resumeId),
          fetchRecommendations(resumeId)
        ])

        if (cancelled) return

        const normalized = mapDriveResume(fileData, resumeId)
        if (!normalized) {
          setError('Could not load the resume details.')
        } else {
          setResumeData(normalized)
        }
        setRecommendations(entries)
      } catch (err) {
        if (cancelled) return
        console.error('Failed to load public resume data', err)
        setError('Failed to load the resume. Please try again later.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [resumeId])

  return { resumeData, recommendations, loading, error }
}
