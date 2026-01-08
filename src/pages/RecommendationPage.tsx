import React, { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Paper,
  Snackbar,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { useParams } from 'react-router-dom'
import ResumePreview from '../components/resumePreview'
import { getFileViaFirebase } from '../firebase/storage'
import { mapDriveResume } from '../utils/driveResumeMapper'
import {
  fetchRecommendations,
  RecommendationEntry,
  RecommendationInput,
  submitRecommendation
} from '../services/recommendationService'

type RecommendationFormState = RecommendationInput & { skillsInput?: string }

const RecommendationPage: React.FC = () => {
  const { id: resumeId } = useParams<{ id: string }>()
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [loadingResume, setLoadingResume] = useState(true)
  const [loadingError, setLoadingError] = useState<string | null>(null)
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

  const loadResume = useMemo(
    () => async () => {
      if (!resumeId) {
        setLoadingError('Missing resume id')
        setLoadingResume(false)
        return
      }
      try {
        const fileData = await getFileViaFirebase(resumeId)
        const normalized = mapDriveResume(fileData, resumeId)
        if (!normalized) {
          setLoadingError('Could not load the resume details.')
        } else {
          setResumeData(normalized)
        }
      } catch (err) {
        console.error('Failed to load resume for recommendations', err)
        setLoadingError('Failed to load the resume. Please try again later.')
      } finally {
        setLoadingResume(false)
      }
    },
    [resumeId]
  )

  useEffect(() => {
    loadResume()
  }, [loadResume])

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!resumeId) return
      const entries = await fetchRecommendations(resumeId)
      setRecommendations(entries)
    }
    loadRecommendations()
  }, [resumeId])

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
        skills: formState.skills ?? []
      }
      const created = await submitRecommendation(resumeId, payload)
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
      } else {
        setSnackbar({
          open: true,
          message: 'Could not submit recommendation, please try again.',
          severity: 'error'
        })
      }
    } catch (err) {
      console.error('Failed to submit recommendation', err)
      setSnackbar({
        open: true,
        message: 'Could not submit recommendation, please try again.',
        severity: 'error'
      })
    } finally {
      setSubmitting(false)
    }
  }

  const addSkill = () => {
    const value = formState.skillsInput?.trim()
    if (!value) return
    setFormState(prev => ({
      ...prev,
      skills: [...(prev.skills ?? []), value],
      skillsInput: ''
    }))
  }

  const removeSkill = (skill: string) => {
    setFormState(prev => ({
      ...prev,
      skills: (prev.skills ?? []).filter(s => s !== skill)
    }))
  }

  const handleSkillsKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addSkill()
    }
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: 2 }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>
            Share a Recommendation
          </Typography>
          <Typography variant='body1' color='text.secondary'>
            Add your recommendation to help strengthen this resume. Your comments will be
            visible to the resume owner and included when they print their resume.
          </Typography>
        </Stack>

        <Stack
          direction={{ xs: 'column', lg: 'row' }}
          spacing={3}
          alignItems='flex-start'
          sx={{ width: '100%' }}
        >
          <Paper
            elevation={1}
            sx={{
              flex: { xs: '1 1 auto', lg: '0 0 420px' },
              p: 3,
              width: '100%'
            }}
          >
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>
                  Recommendation form
                </Typography>
                <TextField
                  label='Your name'
                  required
                  value={formState.author}
                  onChange={e => setFormState(prev => ({ ...prev, author: e.target.value }))}
                  fullWidth
                />
                <TextField
                  label='Relationship (e.g., Manager, Colleague)'
                  value={formState.relationship}
                  onChange={e =>
                    setFormState(prev => ({ ...prev, relationship: e.target.value }))
                  }
                  fullWidth
                />
                <TextField
                  label='Email (optional)'
                  type='email'
                  value={formState.email}
                  onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))}
                  fullWidth
                />
                <Box>
                  <TextField
                    label='Skills to highlight'
                    placeholder='Type a skill and press Enter'
                    value={formState.skillsInput}
                    onChange={e =>
                      setFormState(prev => ({ ...prev, skillsInput: e.target.value }))
                    }
                    onKeyDown={handleSkillsKeyDown}
                    fullWidth
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(formState.skills ?? []).map(skill => (
                      <Chip key={skill} label={skill} onDelete={() => removeSkill(skill)} />
                    ))}
                  </Box>
                </Box>
                <TextField
                  label='Recommendation'
                  required
                  multiline
                  minRows={4}
                  value={formState.message}
                  onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))}
                  fullWidth
                />
                <Button
                  variant='contained'
                  type='submit'
                  disabled={submitting || !resumeId}
                  startIcon={submitting ? <CircularProgress size={18} /> : null}
                >
                  {submitting ? 'Submitting...' : 'Submit Recommendation'}
                </Button>
                <Divider />
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>
                  Recent recommendations
                </Typography>
                {recommendations.length === 0 && (
                  <Typography variant='body2' color='text.secondary'>
                    No recommendations yet. Be the first!
                  </Typography>
                )}
                <Stack spacing={1}>
                  {recommendations.map(entry => (
                    <Box
                      key={entry.id}
                      sx={{
                        p: 1,
                        border: '1px solid #E5E7EB',
                        borderRadius: 1,
                        background: '#F9FAFB'
                      }}
                    >
                      <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>
                        {entry.author}
                        {entry.relationship ? ` • ${entry.relationship}` : ''}
                      </Typography>
                      <Typography sx={{ fontSize: '13px', whiteSpace: 'pre-line' }}>
                        {entry.message}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </form>
          </Paper>

          <Box sx={{ flex: 1, width: '100%', overflowX: 'auto' }}>
            {loadingResume ? (
              <Box
                sx={{
                  width: '100%',
                  minHeight: '300px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CircularProgress />
              </Box>
            ) : loadingError ? (
              <Alert severity='error'>{loadingError}</Alert>
            ) : resumeData ? (
              <Box sx={{ transform: 'scale(0.9)', transformOrigin: 'top left' }}>
                <ResumePreview
                  data={resumeData}
                  forcedId={resumeId}
                  recommendations={recommendations}
                />
              </Box>
            ) : (
              <Alert severity='warning'>Resume not found.</Alert>
            )}
          </Box>
        </Stack>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={2200}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default RecommendationPage

