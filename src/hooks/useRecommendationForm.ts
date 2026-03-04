import { useState } from 'react'
import {
  RecommendationEntry,
  RecommendationInput,
  submitRecommendation
} from '../services/recommendationService'

type RecommendationFormState = RecommendationInput & { skillsInput?: string }

const EMPTY_FORM: RecommendationFormState = {
  author: '',
  message: '',
  relationship: '',
  email: '',
  skills: [],
  skillsInput: '',
  videoUrl: '',
  linkedinUrl: ''
}

interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'info' | 'error'
}

interface UseRecommendationFormReturn {
  formState: RecommendationFormState
  setFormState: React.Dispatch<React.SetStateAction<RecommendationFormState>>
  submitting: boolean
  snackbar: SnackbarState
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>
  recommendations: RecommendationEntry[]
  setRecommendations: React.Dispatch<React.SetStateAction<RecommendationEntry[]>>
  handleSubmit: (e: React.FormEvent) => Promise<void>
  addSkill: () => void
  removeSkill: (skill: string) => void
  handleSkillsKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
}

/**
 * Manages the recommendation submission form state and actions.
 * Seeds the initial recommendations list from the parent via setRecommendations.
 */
export function useRecommendationForm(
  resumeId: string | undefined,
  initialRecommendations: RecommendationEntry[] = []
): UseRecommendationFormReturn {
  const [formState, setFormState] = useState<RecommendationFormState>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  })
  const [recommendations, setRecommendations] =
    useState<RecommendationEntry[]>(initialRecommendations)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!resumeId) return
    if (!formState.author.trim() || !formState.message.trim()) {
      setSnackbar({
        open: true,
        message: 'Please add your name and recommendation details.',
        severity: 'error'
      })
      return
    }
    setSubmitting(true)
    try {
      const payload: RecommendationInput = {
        author: formState.author.trim(),
        message: formState.message.trim(),
        relationship: formState.relationship?.trim(),
        email: formState.email?.trim(),
        skills: formState.skills ?? [],
        videoUrl: formState.videoUrl?.trim(),
        linkedinUrl: formState.linkedinUrl?.trim()
      }
      const created = await submitRecommendation(resumeId, payload)
      if (created) {
        setRecommendations(prev => [{ ...created, createdAt: new Date().toISOString() }, ...prev])
        setFormState(EMPTY_FORM)
        setSnackbar({ open: true, message: 'Recommendation submitted. Thank you!', severity: 'success' })
      } else {
        setSnackbar({ open: true, message: 'Could not submit recommendation, please try again.', severity: 'error' })
      }
    } catch (err) {
      console.error('Failed to submit recommendation', err)
      setSnackbar({ open: true, message: 'Could not submit recommendation, please try again.', severity: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const addSkill = () => {
    const value = formState.skillsInput?.trim()
    if (!value) return
    setFormState(prev => ({ ...prev, skills: [...(prev.skills ?? []), value], skillsInput: '' }))
  }

  const removeSkill = (skill: string) => {
    setFormState(prev => ({ ...prev, skills: (prev.skills ?? []).filter(s => s !== skill) }))
  }

  const handleSkillsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill() }
  }

  return {
    formState, setFormState,
    submitting,
    snackbar, setSnackbar,
    recommendations, setRecommendations,
    handleSubmit, addSkill, removeSkill, handleSkillsKeyDown
  }
}
