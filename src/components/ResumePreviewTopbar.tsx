import React from 'react'
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSignAndSave } from '../hooks/useSignAndSave'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'

interface ResumePreviewTopbarProps {
  isDraftSaving?: boolean
  isSigningSaving?: boolean
  setIsDraftSaving?: React.Dispatch<React.SetStateAction<boolean>>
  setIsSigningSaving?: React.Dispatch<React.SetStateAction<boolean>>
  resumeId?: string | null
}

const ResumePreviewTopbar: React.FC<ResumePreviewTopbarProps> = ({ resumeId }) => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))
  const resume = useSelector((state: RootState) => state?.resume.resume)

  const { isSigningSaving, showAuthError, setShowAuthError, onSignAndSave, handleLogout } =
    useSignAndSave(resumeId)

  const handleBackToEdit = () => {
    if (resumeId) {
      navigate(`/resume/new?id=${resumeId}`)
      return
    }
    const urlResumeId = new URLSearchParams(window.location.search).get('id')
    navigate(urlResumeId ? `/resume/new?id=${urlResumeId}` : '/resume/new')
  }

  const getButtonSx = (baseWidth: string) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: { xs: '100%', sm: isSm ? baseWidth : '100%' },
    height: { xs: '36px', sm: '40px', md: '35px' },
    padding: { xs: '10px 15px', sm: '15px 20px', md: '10px 15px' },
    borderRadius: '100px',
    borderWidth: '3px',
    borderColor: '#3a35a2',
    color: '#3a35a2',
    fontFamily: '"Nunito Sans", sans-serif',
    fontSize: { xs: '14px', sm: '16px', md: '18px' },
    fontWeight: 700,
    lineHeight: '24px',
    textAlign: 'center',
    whiteSpace: { xs: 'normal', sm: 'nowrap' },
    textTransform: 'none'
  })

  const handleExportJSON = () => {
    if (!resume) return
    const blob = new Blob([JSON.stringify(resume, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `resume-${resumeId || 'draft'}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <>
      <Box sx={{ width: 'calc(100% - 5vw)', m: 'auto', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: { xs: '2px', sm: '5px' }, padding: { xs: '0 15px', sm: '0 20px', md: '0 10px 0 50px' }, width: '100%', margin: 0 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: { xs: '10px', sm: '15px' }, width: '100%', padding: { xs: '15px 0 10px 20px', sm: '20px 0 12px 22px', md: '30px 0 15px 0' }, m: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'flex-start', md: 'flex-end' }, justifyContent: { xs: 'flex-start', md: 'flex-end' }, gap: { xs: '15px', sm: '17px' }, width: '100%', zIndex: 1, m: 0 }}>
              {/* Left: title + description */}
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', flexGrow: 1, gap: { xs: '10px', sm: '17px' }, zIndex: 2, width: { xs: '100%', md: 'auto' }, m: 0 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', alignSelf: 'stretch', gap: '17px', zIndex: 3, m: 0 }}>
                  <Typography
                    variant='h1'
                    sx={{
                      color: '#000000',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: { xs: '28px', sm: '36px', md: '42px' },
                      fontWeight: 600,
                      lineHeight: { xs: '36px', sm: '46px', md: '56px' },
                      whiteSpace: 'nowrap',
                      m: 0
                    }}
                  >
                    Preview
                  </Typography>
                </Box>
                <Typography
                  variant='body1'
                  sx={{
                    color: '#2d2d47',
                    fontFamily: '"Nunito Sans", sans-serif',
                    fontSize: { xs: '14px', sm: '16px', md: '18px' },
                    fontWeight: 500,
                    lineHeight: { xs: '20px', sm: '22px', md: '24.552px' },
                    letterSpacing: '0.18px'
                  }}
                >
                  If everything looks good, you can select Sign and Save to create a
                  verifiable presentation of your resume.
                </Typography>
              </Box>

              {/* Right: action buttons */}
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={{ xs: 1, sm: 1, md: 2 }}
                sx={{ width: { xs: '100%', md: 'auto' }, mt: { xs: 2, md: 0 }, zIndex: 7 }}
              >
                <Button variant='outlined' onClick={handleBackToEdit} sx={getButtonSx('163px')}>
                  Back to Edit
                </Button>
                <Button
                  variant='contained'
                  onClick={onSignAndSave}
                  disabled={isSigningSaving}
                  startIcon={isSigningSaving ? <CircularProgress size={isXs ? 16 : 20} color='inherit' /> : null}
                  sx={{ ...getButtonSx('181px'), backgroundColor: '#3a35a2', color: '#ffffff' }}
                >
                  {isSigningSaving ? 'Saving...' : 'Sign and Save'}
                </Button>
                <Button
                  variant='contained'
                  onClick={handleExportJSON}
                  sx={{ ...getButtonSx('181px'), backgroundColor: '#3a35a2', color: '#ffffff' }}
                >
                  Export to JSON
                </Button>
              </Stack>
            </Box>
          </Box>

          {/* Progress bar placeholder */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', gap: { xs: '10px', sm: '20px' }, width: '100%', padding: { xs: '0 15px', sm: '0 20px', md: '0 10px' }, zIndex: 16, m: 0 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', alignSelf: 'stretch', gap: '5px', minWidth: 0, height: { xs: '14px', sm: '18px', md: '15px' }, background: '#614bc4', zIndex: 17, borderRadius: '4px', m: '0 20px 20px 0' }} />
          </Box>
        </Box>
      </Box>

      {/* Auth Error Dialog */}
      <Dialog open={showAuthError} onClose={() => setShowAuthError(false)} aria-labelledby='auth-error-dialog-title'>
        <DialogTitle id='auth-error-dialog-title'>Authentication Required</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Your session has expired. Please log out and log in again to continue signing your resume.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAuthError(false)}>Cancel</Button>
          <Button onClick={handleLogout} variant='contained' autoFocus>Log Out</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResumePreviewTopbar
