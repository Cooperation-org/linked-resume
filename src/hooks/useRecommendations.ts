import { useCallback, useEffect, useState } from 'react'
import {
  fetchRecommendations,
  RecommendationEntry,
  RecommendationInput,
  submitRecommendation
} from '../services/recommendationService'

type RecommendationFormState = RecommendationInput & { skillsInput?: string }

export const useRecommendations = (resumeId?: string) => {
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([])
  const [formState, setFormState] = useState<RecommendationFormState>({
    author: '',
    message: '',
    relationship: '',
    email: '',
    skills: [],
    skillsInput: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'error'
  }>({ open: false, message: '', severity: 'success' })

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!resumeId) return
      const entries = await fetchRecommendations(resumeId)
      setRecommendations(entries)
    }
    loadRecommendations()
  }, [resumeId])

  const addSkill = useCallback(() => {
    const value = formState.skillsInput?.trim()
    if (!value) return
    setFormState(prev => ({
      ...prev,
      skills: [...(prev.skills ?? []), value],
      skillsInput: ''
    }))
  }, [formState.skillsInput])

  const removeSkill = useCallback((skill: string) => {
    setFormState(prev => ({
      ...prev,
      skills: (prev.skills ?? []).filter(s => s !== skill)
    }))
  }, [])

  const handleSkillsKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        addSkill()
      }
    },
    [addSkill]
  )

  const handleSubmit = useCallback(
    async (resumeIdToUse: string) => {
      if (!formState.author.trim() || !formState.message.trim()) {
        setSnackbar({
          open: true,
          message: 'Please add your name and recommendation details.',
          severity: 'error'
        })
        return null
      }
      setSubmitting(true)
      try {
        const payload: RecommendationInput = {
          author: formState.author.trim(),
          message: formState.message.trim(),
          relationship: formState.relationship?.trim(),
          email: formState.email?.trim(),
          skills: formState.skills ?? []
        }
        const created = await submitRecommendation(resumeIdToUse, payload)
        if (created) {
          setRecommendations(prev => [
            { ...created, createdAt: new Date().toISOString() },
            ...prev
          ])
          setFormState({
            author: '',
            message: '',
            relationship: '',
            email: '',
            skills: [],
            skillsInput: ''
          })
          setSnackbar({
            open: true,
            message: 'Recommendation submitted. Thank you!',
            severity: 'success'
          })
          return created
        }
        setSnackbar({
          open: true,
          message: 'Could not submit recommendation, please try again.',
          severity: 'error'
        })
        return null
      } catch (err) {
        console.error('Failed to submit recommendation', err)
        setSnackbar({
          open: true,
          message: 'Could not submit recommendation, please try again.',
          severity: 'error'
        })
        return null
      } finally {
        setSubmitting(false)
      }
    },
    [formState]
  )

  const resetSnackbar = useCallback(
    () => setSnackbar(prev => ({ ...prev, open: false })),
    []
  )

  return {
    recommendations,
    formState,
    setFormState,
    submitting,
    snackbar,
    setSnackbar,
    addSkill,
    removeSkill,
    handleSkillsKeyDown,
    handleSubmit,
    resetSnackbar
  }
}

