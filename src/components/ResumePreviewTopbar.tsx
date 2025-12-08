import React, { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  createTheme,
  CircularProgress,
  useMediaQuery,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { prepareResumeForVC } from '../tools/resumeAdapter'
import { getLocalStorage } from '../tools/cookie'
import { storeFileTokens } from '../firebase/storage'
import useGoogleDrive from '../hooks/useGoogleDrive'

const theme = createTheme({
  typography: {
    fontFamily: [
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      'Ubuntu',
      '"Helvetica Neue"',
      'Helvetica',
      'Arial',
      '"PingFang SC"',
      '"Hiragino Sans GB"',
      '"Microsoft Yahei UI"',
      '"Microsoft Yahei"',
      '"Source Han Sans CN"',
      'sans-serif'
    ].join(','),
    h1: {
      fontFamily: '"Poppins", sans-serif',
      fontWeight: 600,
      fontSize: '42px',
      lineHeight: '56px'
    },
    body1: {
      fontFamily: '"Nunito Sans", sans-serif',
      fontWeight: 500,
      fontSize: '18px',
      lineHeight: '24.552px',
      letterSpacing: '0.18px'
    },
    button: {
      fontFamily: '"Nunito Sans", sans-serif',
      fontWeight: 700,
      fontSize: '18px',
      textTransform: 'none'
    }
  },
  palette: {
    primary: {
      main: '#3a35a2'
    },
    background: {
      default: '#ffffff'
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '100px',
          borderWidth: '3px',
          minWidth: 'unset'
        }
      }
    }
  }
})

interface ResumePreviewTopbarProps {
  isDraftSaving?: boolean
  isSigningSaving?: boolean
  setIsDraftSaving?: React.Dispatch<React.SetStateAction<boolean>>
  setIsSigningSaving?: React.Dispatch<React.SetStateAction<boolean>>
  resumeId?: string | null
}

const ResumePreviewTopbar: React.FC<ResumePreviewTopbarProps> = ({
  isDraftSaving = false,
  isSigningSaving = false,
  setIsDraftSaving,
  setIsSigningSaving,
  resumeId
}) => {
  const [showAuthError, setShowAuthError] = useState(false)
  const navigate = useNavigate()
  const resume = useSelector((state: RootState) => state?.resume.resume)
  const { instances } = useGoogleDrive()
  const accessToken = getLocalStorage('auth')
  const refreshToken = getLocalStorage('refresh_token')

  const isXs = useMediaQuery(theme.breakpoints.down('sm'))
  const isSm = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  const handleBackToEdit = () => {
    // Use the resumeId prop if available, otherwise check URL
    if (resumeId) {
      navigate(`/resume/new?id=${resumeId}`)
    } else {
      // Fallback to checking URL if prop not provided
      const queryParams = new URLSearchParams(window.location.search)
      const urlResumeId = queryParams.get('id')

      if (urlResumeId) {
        navigate(`/resume/new?id=${urlResumeId}`)
      } else {
        navigate('/resume/new')
      }
    }
  }

  const handleSaveDraft = async () => {
    if (!instances?.resumeManager) {
      console.error('Resume manager not available')
      return
    }

    try {
      await instances.resumeManager.saveResume({
        resume: resume,
        type: 'unsigned'
      })
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }

  const onSaveDraft = async () => {
    if (typeof setIsDraftSaving === 'function') {
      setIsDraftSaving(true)
    }

    await handleSaveDraft()

    if (typeof setIsDraftSaving === 'function') {
      setIsDraftSaving(false)
    }
  }

  const handleSignAndSave = async () => {
    if (!instances?.resumeVC || !instances?.resumeManager) {
      console.error('Required services not available')
      throw new Error('Required services not available')
    }

    try {
      const keyPair = await instances.resumeVC.generateKeyPair()
      if (!keyPair) {
        throw new Error('Failed to generate key pair')
      }

      const didDoc = await instances.resumeVC.createDID({
        keyPair
      })
      if (!didDoc) {
        throw new Error('Failed to create DID document')
      }

      if (!resume) {
        console.error('Resume is null, cannot prepare for VC')
        throw new Error('Resume is null, cannot prepare for VC')
      }
      const preparedResume = await prepareResumeForVC(resume, {})

      // PATCH: Ensure processed employmentHistory is used in credentialSubject
      if (
        preparedResume.credentialSubject &&
        preparedResume.employmentHistory &&
        Array.isArray(preparedResume.employmentHistory)
      ) {
        preparedResume.credentialSubject.employmentHistory =
          preparedResume.employmentHistory
      }

      const signedResume = await instances.resumeVC.sign({
        formData: preparedResume,
        issuerDid: didDoc.id,
        keyPair
      })
      if (!signedResume) {
        throw new Error('Failed to sign resume')
      }

      const file = await instances.resumeManager.saveResume({
        resume: signedResume,
        type: 'sign'
      })
      if (!file?.id) {
        throw new Error('Failed to save resume')
      }

      // Also save a completed unsigned version with isComplete flag
      if (resume) {
        // Add isComplete flag to the resume so we can identify it as a completed unsigned resume
        const completedResume = {
          ...resume,
          isComplete: true
        }

        // Save the completed unsigned version
        await instances.resumeManager.saveResume({
          resume: completedResume,
          type: 'unsigned'
        })
      }

      await storeFileTokens({
        googleFileId: file.id,
        tokens: {
          accessToken: accessToken ?? '',
          refreshToken: refreshToken ?? ''
        }
      })

      return file // Return the file object with the ID
    } catch (error: any) {
      console.error('Error signing and saving:', error)

      // Check for OAuth/authentication errors
      if (
        error.message?.includes('401') ||
        error.message?.includes('403') ||
        error.message?.includes('unauthorized') ||
        error.message?.toLowerCase().includes('auth') ||
        error.message?.includes('token') ||
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        // Create a more specific error for OAuth issues
        const authError = new Error(
          'Authentication expired. Please log out and log in again to continue.'
        )
        ;(authError as any).isAuthError = true
        throw authError
      }

      throw error // Re-throw other errors
    }
  }

  const onSignAndSave = async () => {
    // Check if resume exists before attempting to sign
    if (!resume) {
      console.error('No resume data available to sign')
      // Navigate back to edit page or show error
      handleBackToEdit()
      return
    }

    if (typeof setIsSigningSaving === 'function') {
      setIsSigningSaving(true)
    }

    try {
      const file = await handleSignAndSave()
      // Only navigate if sign and save was successful
      // Navigate to the saved resume view page
      if (file?.id) {
        // Navigate immediately to the correct route format
        navigate(`/resume/view/${file.id}`)
      } else {
        console.error('No file ID returned from sign and save')
      }
    } catch (error) {
      console.error('Error in onSignAndSave:', error)
      // Check if it's an authentication error
      if ((error as any).isAuthError) {
        setShowAuthError(true)
      }
      // Don't navigate on error
    } finally {
      if (typeof setIsSigningSaving === 'function') {
        setIsSigningSaving(false)
      }
    }
  }

  const getButtonSx = (baseWidth: string) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: {
      xs: '100%',
      sm: isSm ? baseWidth : '100%'
    },
    height: {
      xs: '36px',
      sm: '40px',
      md: '35px'
    },
    padding: {
      xs: '10px 15px',
      sm: '15px 20px',
      md: '10px 15px'
    },
    borderRadius: '100px',
    borderWidth: '3px',
    borderColor: '#3a35a2',
    color: '#3a35a2',
    fontFamily: '"Nunito Sans", sans-serif',
    fontSize: {
      xs: '14px',
      sm: '16px',
      md: '18px'
    },
    fontWeight: 700,
    lineHeight: '24px',
    textAlign: 'center',
    whiteSpace: {
      xs: 'normal',
      sm: 'nowrap'
    },
    textTransform: 'none'
  })

  const handleLogout = () => {
    // Clear local storage
    localStorage.removeItem('auth')
    localStorage.removeItem('refresh_token')
    // Navigate to login
    navigate('/login')
  }

  return (
    <>
      <Box
        sx={{
          width: 'calc(100% - 5vw)',
          m: 'auto',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: {
              xs: '2px',
              sm: '5px'
            },
            padding: {
              xs: '0 15px',
              sm: '0 20px',
              md: '0 10px 0 50px'
            },
            width: '100%',
            margin: 0
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: {
                xs: '10px',
                sm: '15px'
              },
              width: '100%',
              padding: {
                xs: '15px 0 10px 20px',
                sm: '20px 0 12px 22px',
                md: '30px 0 15px 0'
              },
              m: 0
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: {
                  xs: 'column',
                  md: 'row'
                },
                alignItems: {
                  xs: 'flex-start',
                  md: 'flex-end'
                },
                justifyContent: {
                  xs: 'flex-start',
                  md: 'flex-end'
                },
                gap: {
                  xs: '15px',
                  sm: '17px'
                },
                width: '100%',
                zIndex: 1,
                m: 0
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  flexGrow: 1,
                  gap: {
                    xs: '10px',
                    sm: '17px'
                  },
                  zIndex: 2,
                  width: {
                    xs: '100%',
                    md: 'auto'
                  },
                  m: 0
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    alignSelf: 'stretch',
                    gap: '17px',
                    zIndex: 3,
                    m: 0
                  }}
                >
                  <Typography
                    variant='h1'
                    sx={{
                      color: '#000000',
                      fontFamily: '"Poppins", sans-serif',
                      fontSize: {
                        xs: '28px',
                        sm: '36px',
                        md: '42px'
                      },
                      fontWeight: 600,
                      lineHeight: {
                        xs: '36px',
                        sm: '46px',
                        md: '56px'
                      },
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
                    fontSize: {
                      xs: '14px',
                      sm: '16px',
                      md: '18px'
                    },
                    fontWeight: 500,
                    lineHeight: {
                      xs: '20px',
                      sm: '22px',
                      md: '24.552px'
                    },
                    letterSpacing: '0.18px',
                    whiteSpace: 'normal',
                    maxWidth: {
                      xs: '100%',
                      md: '100%'
                    }
                  }}
                >
                  If everything looks good, you can select Sign and Save to create a
                  verifiable presentation of your resume.
                </Typography>
              </Box>

              <Stack
                direction={{
                  xs: 'column',
                  sm: 'row'
                }}
                spacing={{
                  xs: 1,
                  sm: 1,
                  md: 2
                }}
                sx={{
                  width: {
                    xs: '100%',
                    md: 'auto'
                  },
                  mt: {
                    xs: 2,
                    md: 0
                  },
                  zIndex: 7
                }}
              >
                <Button
                  variant='outlined'
                  onClick={handleBackToEdit}
                  sx={getButtonSx('163px')}
                >
                  Back to Edit
                </Button>
                {/* <Button
                  variant='outlined'
                  onClick={onSaveDraft}
                  disabled={isDraftSaving}
                  startIcon={
                    isDraftSaving ? (
                      <CircularProgress size={isXs ? 16 : 20} color='inherit' />
                    ) : null
                  }
                  sx={getButtonSx('175px')}
                >
                  {isDraftSaving ? 'Saving...' : 'Save as Draft'}
                </Button> */}
                <Button
                  variant='contained'
                  onClick={onSignAndSave}
                  disabled={isSigningSaving}
                  startIcon={
                    isSigningSaving ? (
                      <CircularProgress size={isXs ? 16 : 20} color='inherit' />
                    ) : null
                  }
                  sx={{
                    ...getButtonSx('181px'),
                    backgroundColor: '#3a35a2',
                    color: '#ffffff'
                  }}
                >
                  {isSigningSaving ? 'Saving...' : 'Sign and Save'}
                </Button>
                <Button
                  variant='contained'
                  onClick={() => {
                    if (!resume) {
                      console.error('No resume data to export')
                      return
                    }

                    // Create a Blob with the resume data
                    const blob = new Blob([JSON.stringify(resume, null, 2)], {
                      type: 'application/json'
                    })

                    // Create a URL for the blob
                    const url = URL.createObjectURL(blob)

                    // Create a temporary anchor element
                    const a = document.createElement('a')
                    a.href = url
                    a.download = `resume-${resumeId || 'draft'}.json`

                    // Trigger the download
                    document.body.appendChild(a)
                    a.click()

                    // Clean up
                    document.body.removeChild(a)
                    URL.revokeObjectURL(url)
                  }}
                  sx={{
                    ...getButtonSx('181px'),
                    backgroundColor: '#3a35a2',
                    color: '#ffffff'
                  }}
                >
                  Export to JSON
                </Button>
              </Stack>
            </Box>
          </Box>
          {/* progress bar placeholder */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              gap: {
                xs: '10px',
                sm: '20px'
              },
              width: '100%',
              padding: {
                xs: '0 15px',
                sm: '0 20px',
                md: '0 10px'
              },
              zIndex: 16,
              m: 0
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                alignSelf: 'stretch',
                gap: '5px',
                minWidth: 0,
                height: {
                  xs: '14px',
                  sm: '18px',
                  md: '15px'
                },
                background: '#614bc4',
                zIndex: 17,
                borderRadius: '4px',
                m: '0 20px 20px 0'
              }}
            />
          </Box>
        </Box>
      </Box>

      {/* OAuth Error Dialog */}
      <Dialog
        open={showAuthError}
        onClose={() => setShowAuthError(false)}
        aria-labelledby='auth-error-dialog-title'
        aria-describedby='auth-error-dialog-description'
      >
        <DialogTitle id='auth-error-dialog-title'>Authentication Required</DialogTitle>
        <DialogContent>
          <DialogContentText id='auth-error-dialog-description'>
            Your session has expired. Please log out and log in again to continue signing
            your resume.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowAuthError(false)}>Cancel</Button>
          <Button onClick={handleLogout} variant='contained' autoFocus>
            Log Out
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default ResumePreviewTopbar
