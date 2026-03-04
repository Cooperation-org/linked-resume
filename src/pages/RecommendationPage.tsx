import React, { useEffect } from 'react'
import {
  Alert, Box, Button, Chip, CircularProgress,
  Divider, Paper, Snackbar, Stack, TextField, Typography
} from '@mui/material'
import { useParams } from 'react-router-dom'
import ResumePreview from '../components/resumePreview'
import { usePublicResume } from '../hooks/usePublicResume'
import { useRecommendationForm } from '../hooks/useRecommendationForm'

const RecommendationPage: React.FC = () => {
  const { id: resumeId } = useParams<{ id: string }>()
  const { resumeData, recommendations: initialRecommendations, loading: loadingResume, error: loadingError } = usePublicResume(resumeId)

  const {
    formState, setFormState,
    submitting, snackbar, setSnackbar,
    recommendations, setRecommendations,
    handleSubmit, addSkill, removeSkill, handleSkillsKeyDown
  } = useRecommendationForm(resumeId, [])

  // Sync recommendations from hook once they arrive from usePublicResume
  useEffect(() => {
    if (initialRecommendations.length > 0) {
      setRecommendations(initialRecommendations)
    }
  }, [initialRecommendations, setRecommendations])

  return (
    <Box sx={{ width: { xs: '90%', md: '100%' }, minHeight: '100vh', bgcolor: 'background.default', py: { xs: 3, md: 4 }, px: { xs: 0, md: 4 } }}>
      <Box sx={{ maxWidth: 1280, mx: 'auto', px: { xs: 0, sm: 2, md: 4 } }}>
        <Stack spacing={1} sx={{ mb: 3 }}>
          <Typography variant='h4' sx={{ fontWeight: 700 }}>Share a Recommendation</Typography>
          <Typography variant='body1' color='text.secondary'>
            Add your recommendation to help strengthen this resume. Your comments will be visible to the resume owner and included when they print their resume.
          </Typography>
        </Stack>

        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={3} alignItems='flex-start' sx={{ width: '100%' }}>
          {/* Form panel */}
          <Paper elevation={1} sx={{ flex: { xs: '1 1 auto', lg: '0 0 420px' }, maxWidth: { xs: '100%', md: 520 }, p: { xs: 2.5, md: 3 }, width: '100%' }}>
            <form onSubmit={handleSubmit}>
              <Stack spacing={2}>
                <Typography variant='h6' sx={{ fontWeight: 700 }}>Recommendation form</Typography>
                <TextField label='Your name' required value={formState.author} onChange={e => setFormState(prev => ({ ...prev, author: e.target.value }))} fullWidth />
                <TextField label='Relationship (e.g., Manager, Colleague)' value={formState.relationship} onChange={e => setFormState(prev => ({ ...prev, relationship: e.target.value }))} fullWidth />
                <TextField label='Email (optional)' type='email' value={formState.email} onChange={e => setFormState(prev => ({ ...prev, email: e.target.value }))} fullWidth />
                <Box>
                  <TextField
                    label='Skills to highlight' placeholder='Type a skill and press Enter'
                    value={formState.skillsInput}
                    onChange={e => setFormState(prev => ({ ...prev, skillsInput: e.target.value }))}
                    onKeyDown={handleSkillsKeyDown}
                    fullWidth
                  />
                  <Box sx={{ mt: 1, display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(formState.skills ?? []).map(skill => <Chip key={skill} label={skill} onDelete={() => removeSkill(skill)} />)}
                  </Box>
                </Box>
                <TextField label='Recommendation' required multiline minRows={4} value={formState.message} onChange={e => setFormState(prev => ({ ...prev, message: e.target.value }))} fullWidth />
                <TextField label='Video testimonial URL (YouTube, Loom, etc.)' placeholder='https://www.youtube.com/watch?v=...' value={formState.videoUrl} onChange={e => setFormState(prev => ({ ...prev, videoUrl: e.target.value }))} fullWidth helperText='Optional: Add a video testimonial for more credibility' />
                <TextField label='Your LinkedIn profile URL' placeholder='https://linkedin.com/in/your-profile' value={formState.linkedinUrl} onChange={e => setFormState(prev => ({ ...prev, linkedinUrl: e.target.value }))} fullWidth helperText='Optional: Help verify your identity' />
                <Button
                  variant='contained' type='submit'
                  disabled={submitting || !resumeId}
                  startIcon={submitting ? <CircularProgress size={18} /> : null}
                  sx={{ textTransform: 'none', fontWeight: 700, borderRadius: '100px', px: 2.5, py: 1.1, backgroundColor: '#3a35a2', '&:hover': { backgroundColor: '#2f2e8c' } }}
                >
                  {submitting ? 'Submitting...' : 'Submit Recommendation'}
                </Button>
                <Divider />
                <Typography variant='subtitle2' sx={{ fontWeight: 700 }}>Recent recommendations</Typography>
                {recommendations.length === 0 && <Typography variant='body2' color='text.secondary'>No recommendations yet. Be the first!</Typography>}
                <Stack spacing={1}>
                  {recommendations.map(entry => (
                    <Box key={entry.id} sx={{ p: 1, border: '1px solid #E5E7EB', borderRadius: 1, background: '#F9FAFB' }}>
                      <Typography sx={{ fontWeight: 700, fontSize: '14px' }}>{entry.author}{entry.relationship ? ` • ${entry.relationship}` : ''}</Typography>
                      <Typography sx={{ fontSize: '13px', whiteSpace: 'pre-line' }}>{entry.message}</Typography>
                    </Box>
                  ))}
                </Stack>
              </Stack>
            </form>
          </Paper>

          {/* Resume preview panel */}
          <Box sx={{ flex: 1, width: '100%', overflowX: 'auto', px: { xs: 0, sm: 1 } }}>
            {loadingResume ? (
              <Box sx={{ width: '100%', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><CircularProgress /></Box>
            ) : loadingError ? (
              <Alert severity='error'>{loadingError}</Alert>
            ) : resumeData ? (
              <Box sx={{ transform: { xs: 'scale(1)', md: 'scale(0.95)' }, transformOrigin: 'top left', minWidth: { xs: '320px', sm: '360px', md: '720px' } }}>
                <ResumePreview data={resumeData} forcedId={resumeId} recommendations={recommendations} />
              </Box>
            ) : (
              <Alert severity='warning'>Resume not found.</Alert>
            )}
          </Box>
        </Stack>
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2200} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default RecommendationPage
