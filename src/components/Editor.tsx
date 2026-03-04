import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import {
  Box,
  Button,
  Typography,
  LinearProgress,
  linearProgressClasses,
  styled,
  IconButton,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Drawer,
  AppBar,
  Toolbar
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import CloseIcon from '@mui/icons-material/Close'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import LeftSidebar from './ResumeEditor/LeftSidebar'
import RightSidebar from './ResumeEditor/RightSidebar'
import Section from './ResumeEditor/Section'
import { useSelector, useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store'
import { SVGEditName } from '../assets/svgs'
import useGoogleDrive from '../hooks/useGoogleDrive' // , { DriveFileMeta }
import { useNavigate, useLocation } from 'react-router-dom'
import {
  updateSection,
  setSelectedResume,
  setActiveSection,
  resetToInitialState
} from '../redux/slices/resume'
import OptionalSectionsManager from './ResumeEditor/OptionalSectionCard'
import { getLocalStorage } from '../tools/cookie'
import FileSelectorOverlay from './NewFileUpload/FileSelectorOverlay'
import { computeResumeHash, sectionHasItems } from '../utils/resumeEditorUtils'
import { useSectionManager } from '../hooks/useSectionManager'
import { useResumeActions } from '../hooks/useResumeActions'

const COLORS = {
  primary: '#3A35A2',
  primaryHover: '#322e8e',
  text: '#2E2E48',
  white: '#ffffff'
} as const

const ButtonStyles = {
  border: `2px solid ${COLORS.primary}`,
  borderRadius: '100px',
  textTransform: 'none' as const,
  fontWeight: 600,
  color: COLORS.primary,
  p: '5px 25px'
}

const BorderLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '15px',
  borderRadius: '0px 30px 30px 0px',
  [`&.${linearProgressClasses.colorPrimary}`]: {
    backgroundColor: '#E1E2F6',
    ...theme.applyStyles('dark', {
      backgroundColor: theme.palette.grey[800]
    })
  },
  [`& .${linearProgressClasses.bar}`]: {
    borderRadius: 5,
    backgroundColor: '#614BC4',
    ...theme.applyStyles('dark', {
      backgroundColor: '#614BC4'
    })
  }
}))


const ResumeEditor: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()
  const [isEditingName, setIsEditingName] = useState(false)
  const [resumeName, setResumeName] = useState('Untitled')
  const [isLoading, setIsLoading] = useState(false)
  const [showExitDialog, setShowExitDialog] = useState(false)
  const [exitDestination, setExitDestination] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  // Reference to store the original resume state for comparison
  const originalResumeRef = useRef<string | null>(null)

  // Get resumeId from URL parameters
  const queryParams = new URLSearchParams(location.search)
  const resumeId = queryParams.get('id')

  const activeSection = useSelector((state: RootState) => state.resume.activeSection)
  const resume = useSelector((state: RootState) => state?.resume.resume)
  const { instances, isInitialized } = useGoogleDrive()
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const refreshToken = getLocalStorage('refresh_token')

  const {
    sectionOrder,
    fileSelectorOpen,
    setFileSelectorOpen,
    activeSectionId,
    setActiveSectionId,
    sectionEvidence,
    files,
    allFiles,
    activeItemIndex,
    setActiveItemIndex,
    requiredSections,
    handleAddSection,
    handleRemoveSection,
    handleAddFiles,
    handleFilesSelected,
    handleFileDelete,
    handleFileNameChange,
    handleEvidenceSelected,
    handleRemoveFile,
    handleAddCredential,
    getSectionEvidence,
    handleAllFilesUpdate
  } = useSectionManager(activeSection || '', resume)

  const {
    isDraftSaving,
    setIsDraftSaving,
    isSigningSaving,
    handleSaveDraft,
    handleSignAndSave
  } = useResumeActions({
    resume,
    resumeId,
    instances,
    sectionEvidence,
    allFiles,
    originalResumeRef,
    setIsDirty,
    accessToken,
    refreshToken
  })
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false)
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState(false)

  // Responsive constants
  const SPACING = {
    mobile: { px: 2, py: 1 },
    desktop: { px: 2, py: 1 }
  } as const

  const DRAWER_WIDTH = {
    mobile: '90%',
    tablet: 420
  } as const

  // Memoize the resume hash computation
  const currentResumeHash = useMemo(() => computeResumeHash(resume), [resume])

  // Memoize button spacing based on screen size
  const buttonSpacing = useMemo(
    () => (isMobile ? SPACING.mobile : SPACING.desktop),
    [isMobile, SPACING.mobile, SPACING.desktop]
  )

  // Memoize drawer handlers
  const handleLeftDrawerToggle = useCallback(() => {
    setIsLeftDrawerOpen(prev => !prev)
  }, [])

  const handleRightDrawerToggle = useCallback(() => {
    setIsRightDrawerOpen(prev => !prev)
  }, [])

  const closeLeftDrawer = useCallback(() => setIsLeftDrawerOpen(false), [])
  const closeRightDrawer = useCallback(() => setIsRightDrawerOpen(false), [])

  // Handle creating a new resume (clear form data)
  useEffect(() => {
    if (!resumeId && isInitialized) {
      // Reset the entire Redux state to initial state
      dispatch(resetToInitialState())
      sessionStorage.removeItem('lastEditedResumeId')

      // Clear any localStorage drafts that might interfere
      const keys = Object.keys(localStorage)
      const draftKeys = keys.filter(key => key.startsWith('resume_draft_'))
      draftKeys.forEach(key => {
        localStorage.removeItem(key)
      })

      originalResumeRef.current = null
      setIsDirty(false)
      setResumeName('Untitled')
    }
  }, [resumeId, isInitialized, dispatch])

  // Load resume data from Google Drive
  useEffect(() => {
    if (resumeId && isInitialized) {
      const fetchResumeData = async () => {
        setIsLoading(true)

        try {
          // Check if this is a temporary import (starts with "temp-")
          if (resumeId.startsWith('temp-')) {
            // Load from localStorage instead of Google Drive
            const draftKey = `resume_draft_${resumeId}`
            const savedDraft = localStorage.getItem(draftKey)

            if (savedDraft) {
              const resumeData = JSON.parse(savedDraft)

              // Dispatch to Redux
              dispatch(setSelectedResume(resumeData))

              // Store the original resume hash for dirty state comparison
              originalResumeRef.current = computeResumeHash(resumeData)

              // Try to set resume name if we can find it
              try {
                const name =
                  resumeData.contact?.fullName ?? resumeData.name ?? 'Imported Resume'
                setResumeName(name)
              } catch (e) {
                setResumeName('Imported Resume')
              }

              console.log(
                'Resume loaded successfully from localStorage (temporary import)'
              )
            } else {
              console.error('Temporary resume data not found in localStorage')
              // Redirect back to upload page if data is missing
              navigate('/resume/upload')
            }
          } else {
            // Load from Google Drive as usual
            const fileData = await instances.storage?.retrieve(resumeId)

            if (fileData) {
              const resumeData = fileData.data ?? fileData

              // Dispatch to Redux
              dispatch(setSelectedResume(resumeData))

              // Store the original resume hash for dirty state comparison
              originalResumeRef.current = computeResumeHash(resumeData)

              // Try to set resume name if we can find it
              try {
                const name =
                  resumeData.contact?.fullName ?? resumeData.name ?? 'Untitled Resume'
                setResumeName(name)
              } catch (e) {
                setResumeName('Untitled Resume')
              }
            } else {
              console.error('Retrieved resume data is empty')
            }
          }
        } catch (error) {
          console.error('Error retrieving resume data:', error)
        } finally {
          setIsLoading(false)
        }
      }

      fetchResumeData()
    }
  }, [resumeId, isInitialized, dispatch, instances.storage, navigate])

  // Check if resume has been modified using the optimized hash comparison
  useEffect(() => {
    if (resume && originalResumeRef.current) {
      const newDirtyState = currentResumeHash !== originalResumeRef.current
      // Only update if state actually changes to prevent unnecessary re-renders
      setIsDirty(prev => {
        if (prev !== newDirtyState) {
          return newDirtyState
        }
        return prev
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentResumeHash]) // NEVER include resume here - it causes infinite loops!

  // Handle browser's built-in beforeunload dialog for page reloads
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isDirty) {
        const message = 'You have unsaved changes. Are you sure you want to leave?'
        event.preventDefault()
        event.returnValue = message
        return message
      }
    }

    if (isDirty) {
      window.addEventListener('beforeunload', handleBeforeUnload)

      if (resumeId) {
        sessionStorage.setItem('lastEditedResumeId', resumeId)
      }
    } else {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, resumeId]) // Intentionally omitting resume to prevent loops

  useEffect(() => {
    if (!resumeId) {
      const storedResumeId = sessionStorage.getItem('lastEditedResumeId')
      if (storedResumeId) {
        navigate(`/resume/new?id=${storedResumeId}`)
        sessionStorage.removeItem('lastEditedResumeId')
      }
    }
  }, [resumeId, navigate])

  // Handle navigation with exit confirmation
  const handleNavigate = (path: string) => {
    if (isDirty) {
      // Only show dialog if there are unsaved changes
      setShowExitDialog(true)
      setExitDestination(path)
    } else {
      navigate(path)
    }
  }

  // Handle browser navigation events
  useEffect(() => {
    window.history.pushState(
      { editor: true },
      '',
      window.location.pathname + window.location.search
    )

    // Handle browser back/forward button
    const handlePopState = (event: PopStateEvent) => {
      if (isDirty) {
        // Stop the navigation event
        event.preventDefault()

        // Show our custom dialog
        setShowExitDialog(true)
        setExitDestination('/myresumes') // Default destination for back button

        window.history.pushState(
          { editor: true },
          '',
          window.location.pathname + window.location.search
        )

        return false
      } else {
        // If not dirty, allow navigation
        navigate('/myresumes')
      }
    }

    // Listen for navigation events
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
    }
  }, [isDirty, navigate])

  useEffect(() => {
    // Intercept link clicks for custom dialog
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('a')

      // If a link was clicked and it's an internal link
      if (
        link &&
        link.href &&
        link.href.startsWith(window.location.origin) &&
        !link.hasAttribute('target')
      ) {
        // Check if we have unsaved changes
        if (isDirty) {
          e.preventDefault()
          const destination = link?.getAttribute('href') ?? '/'
          setExitDestination(destination)
          setShowExitDialog(true)
        }
      }
    }

    document.addEventListener('click', handleLinkClick)

    return () => {
      document.removeEventListener('click', handleLinkClick)
    }
  }, [isDirty])

  // Handle discarding changes and exiting
  const handleDiscardAndExit = () => {
    // If we have a destination, navigate there
    if (exitDestination) {
      navigate(exitDestination)
    } else {
      // Default to myresumes
      navigate('/myresumes')
    }
    setShowExitDialog(false)
    setExitDestination(null)
  }

  // Handle saving changes and then exiting
  const handleSaveAndExit = async () => {
    try {
      setIsDraftSaving(true)

      if (resume && resumeId && instances?.resumeManager) {
        // Save the updated resume to Google Drive
        await instances.resumeManager.saveResume({
          resume: resume,
          type: 'unsigned'
        })

        // Update our original reference so it's no longer dirty
        originalResumeRef.current = computeResumeHash(resume)
        setIsDirty(false)

        // Close dialog and navigate
        setShowExitDialog(false)

        // Navigate to destination after brief delay
        setTimeout(() => {
          if (exitDestination) {
            navigate(exitDestination)
          } else {
            navigate('/myresumes')
          }
          setExitDestination(null)
        }, 100)

        return
      }
    } catch (error) {
      console.error('Error saving resume before exit:', error)
    } finally {
      setIsDraftSaving(false)
      setShowExitDialog(false)
      setExitDestination(null)
    }
  }

  // Cancel exit
  const handleCancelExit = () => {
    setShowExitDialog(false)
    setExitDestination(null)
  }

  const handlePreview = () => {
    // If we have a resumeId, pass it to the preview page
    if (resumeId) {
      handleNavigate(`/resume/view?id=${resumeId}`)
    } else {
      handleNavigate('/resume/view')
    }
  }

  const handleEditNameClick = () => {
    setIsEditingName(true)
    // Initialize with current resume name if available
    if (resume && resume.name) {
      setResumeName(resume.name)
    }
  }

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setResumeName(event.target.value)
  }

  const handleNameSave = () => {
    if (!resume) return

    dispatch(updateSection({ sectionId: 'name', content: resumeName }))
    setResumeName(resumeName)
    setIsEditingName(false)
  }

  const handleNameKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleNameSave()
    } else if (event.key === 'Escape') {
      setIsEditingName(false)
      // Reset to original value
      if (resume && resume.name) {
        setResumeName(resume.name)
      } else {
        setResumeName('Untitled')
      }
    }
  }

  const handleSectionFocus = useCallback(
    (sectionId: string) => {
      dispatch(setActiveSection(sectionId))
    },
    [dispatch]
  )
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        mx: 'auto',
        mt: { xs: 0, md: 3 },
        pr: { xs: 0, md: 6 },
        pl: { xs: 0, md: 6 }
      }}
    >
      {/* Mobile Header AppBar */}
      {isMobile && (
        <AppBar
          position='sticky'
          elevation={0}
          sx={{ bgcolor: COLORS.white, color: COLORS.text }}
        >
          <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton
                onClick={handleLeftDrawerToggle}
                size='small'
                aria-label='Open menu'
              >
                <MenuIcon />
                <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>
                  details
                </Typography>
              </IconButton>
            </Box>
            <IconButton
              onClick={handleRightDrawerToggle}
              size='small'
              aria-label='Open library'
            >
              <Typography sx={{ fontWeight: 700, fontSize: '1.1rem' }}>Creds</Typography>
              <LibraryBooksIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      )}
      {/* Debug indicator - only in development */}
      {process.env.NODE_ENV === 'development' && (
        <Box
          sx={{
            position: 'fixed',
            bottom: '10px',
            right: '10px',
            padding: '4px 8px',
            borderRadius: '4px',
            backgroundColor: isDirty
              ? 'rgba(244, 67, 54, 0.8)'
              : 'rgba(76, 175, 80, 0.8)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            zIndex: 9000,
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
          }}
        >
          {isDirty ? 'Unsaved Changes' : 'Saved'}
        </Box>
      )}

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh'
          }}
        >
          <CircularProgress />
          <Typography sx={{ ml: 2 }}>Loading resume data...</Typography>
        </Box>
      ) : (
        <>
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: { xs: '0 16px', md: '0 20px' },
              mt: { xs: 2, md: 0 }
            }}
          >
            {/* Resume Name */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {isEditingName ? (
                  <TextField
                    autoFocus
                    value={resumeName}
                    onChange={handleNameChange}
                    onBlur={handleNameSave}
                    onKeyPress={handleNameKeyPress}
                    variant='standard'
                    sx={{ fontWeight: 'bold' }}
                  />
                ) : (
                  <>
                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: '1.25rem',
                        color: '#2E2E48'
                      }}
                    >
                      {resumeName}
                    </Typography>
                    <IconButton onClick={handleEditNameClick} size='small'>
                      <SVGEditName />
                    </IconButton>
                  </>
                )}
              </Box>
            </Box>

            {/* Action Buttons */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', md: 'center' },
                mb: 2,
                mt: { xs: 1, md: 0 },
                gap: { xs: 2, md: 0 }
              }}
            >
              <Typography
                sx={{
                  color: COLORS.text,
                  fontFamily: 'Nunito Sans',
                  fontSize: { xs: '14px', md: '16px' },
                  fontStyle: 'normal',
                  fontWeight: 500,
                  lineHeight: 'normal',
                  letterSpacing: '0.16px',
                  mb: { xs: 1, md: 0 }
                }}
              >
                Name your resume with your first and last name so recruiters can easily
                locate your resume.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: { xs: 1, md: 2 },
                  flexWrap: 'wrap',
                  justifyContent: { xs: 'center', md: 'flex-start' }
                }}
              >
                <Button
                  onClick={handlePreview}
                  sx={{
                    ...ButtonStyles,
                    backgroundColor: COLORS.primary,
                    color: COLORS.white,
                    fontSize: { xs: '14px', md: '16px' },
                    px: buttonSpacing.px,
                    py: buttonSpacing.py,
                    '&:hover': { backgroundColor: COLORS.primaryHover }
                  }}
                >
                  Preview
                </Button>
                <Button
                  onClick={handleSaveDraft}
                  disabled={isDraftSaving}
                  sx={{
                    ...ButtonStyles,
                    backgroundColor: COLORS.white,
                    fontSize: { xs: '14px', md: '16px' },
                    px: buttonSpacing.px,
                    py: buttonSpacing.py,
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  startIcon={
                    isDraftSaving && <CircularProgress size={20} color='inherit' />
                  }
                >
                  {isDraftSaving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button
                  onClick={handleSignAndSave}
                  disabled={isSigningSaving}
                  sx={{
                    ...ButtonStyles,
                    backgroundColor: COLORS.white,
                    fontSize: { xs: '14px', md: '16px' },
                    px: buttonSpacing.px,
                    py: buttonSpacing.py,
                    '&:hover': { backgroundColor: '#f5f5f5' }
                  }}
                  startIcon={
                    isSigningSaving && <CircularProgress size={20} color='inherit' />
                  }
                >
                  {isSigningSaving ? 'Signing...' : 'Sign And Save'}
                </Button>
              </Box>
            </Box>
          </Box>
          {/* Rest of the component */}
          <BorderLinearProgress variant='determinate' value={100} />
          <Typography
            sx={{
              color: '#2E2E48',
              fontFamily: 'DM Sans',
              fontSize: '16px',
              fontStyle: 'normal',
              fontWeight: 500,
              lineHeight: 'normal',
              letterSpacing: '0.16px',
              mt: '20px'
            }}
          >
            Any section left blank will not appear on your resume.
          </Typography>
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 0, md: 4 },
              mt: 2,
              flexDirection: { xs: 'column', md: 'row' }
            }}
          >
            {/* Left Sidebar on desktop */}
            {!isMobile && <LeftSidebar />}

            {/* Main Content */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                maxWidth: '100%',
                mx: 'auto',
                width: '100%'
              }}
            >
              {sectionOrder.map(sectionId => {
                let itemCount = 1
                if (resume && typeof resume === 'object' && sectionId in resume) {
                  const section = (resume as any)[sectionId]
                  if (sectionHasItems(section)) {
                    itemCount = section.items.length
                  }
                }
                return (
                  <Section
                    key={sectionId}
                    sectionId={sectionId}
                    onDelete={() => handleRemoveSection(sectionId)}
                    onAddFiles={itemIndex => handleAddFiles(sectionId, itemIndex)}
                    onAddCredential={handleAddCredential}
                    isRemovable={!requiredSections.includes(sectionId)}
                    onFocus={() => handleSectionFocus(sectionId)}
                    evidence={getSectionEvidence(sectionId, itemCount)}
                    allFiles={allFiles}
                    onRemoveFile={handleRemoveFile}
                  />
                )
              })}

              {/* Optional sections manager */}
              <OptionalSectionsManager
                activeSections={sectionOrder}
                onAddSection={handleAddSection}
              />
            </Box>

            {/* Right Sidebar on desktop */}
            {!isMobile && (
              <RightSidebar
                files={files}
                onFilesSelected={handleFilesSelected}
                onFileDelete={handleFileDelete}
                onFileNameChange={handleFileNameChange}
                onAllFilesUpdate={handleAllFilesUpdate}
              />
            )}
          </Box>
        </>
      )}

      {/* Exit Confirmation Dialog */}
      <Dialog
        open={showExitDialog}
        onClose={handleCancelExit}
        aria-labelledby='alert-dialog-title'
        aria-describedby='alert-dialog-description'
        // Prevent closing by clicking outside or escape key
        disableEscapeKeyDown
        // Styling for the Dialog component
        PaperProps={{
          sx: {
            borderRadius: '12px',
            minWidth: '450px',
            maxWidth: '600px',
            margin: '16px',
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.15)'
          }
        }}
        // Style to ensure dialog appears above everything
        sx={{
          zIndex: 9999,
          '& .MuiBackdrop-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.6)'
          }
        }}
      >
        <DialogTitle
          id='alert-dialog-title'
          sx={{
            pb: 1,
            fontWeight: 'bold',
            fontSize: '1.4rem',
            color: '#3A35A2'
          }}
        >
          Unsaved Changes
        </DialogTitle>
        <DialogContent>
          <DialogContentText
            id='alert-dialog-description'
            sx={{
              color: '#2E2E48',
              fontSize: '1rem',
              mb: 1
            }}
          >
            You have unsaved changes to your resume. If you exit now, these changes will
            be lost. Would you like to save your changes before exiting?
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 1 }}>
          <Button
            onClick={handleCancelExit}
            sx={{
              color: '#4F46E5',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          >
            Continue Editing
          </Button>
          <Button
            onClick={handleDiscardAndExit}
            sx={{
              color: '#F43F5E',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem'
            }}
          >
            Exit Without Saving
          </Button>
          <Button
            onClick={handleSaveAndExit}
            variant='contained'
            disableElevation
            sx={{
              bgcolor: '#4F46E5',
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.95rem',
              borderRadius: '8px',
              padding: '8px 16px',
              '&:hover': { bgcolor: '#4338CA' }
            }}
            disabled={isDraftSaving}
            startIcon={
              isDraftSaving ? <CircularProgress size={16} color='inherit' /> : null
            }
          >
            {isDraftSaving ? 'Saving...' : 'Save and Exit'}
          </Button>
        </DialogActions>
      </Dialog>
      <FileSelectorOverlay
        open={fileSelectorOpen}
        onClose={() => {
          setFileSelectorOpen(false)
          setActiveSectionId(null)
          setActiveItemIndex(undefined)
        }}
        onSelect={selectedFileIds =>
          handleEvidenceSelected(selectedFileIds, activeItemIndex)
        }
        files={allFiles}
        initialSelectedFiles={
          activeSectionId && typeof activeItemIndex === 'number'
            ? (sectionEvidence[activeSectionId]?.[activeItemIndex] || []).map(id => ({
                id
              }))
            : []
        }
      />
      {/* Left Drawer for mobile */}
      <Drawer
        anchor='left'
        open={isLeftDrawerOpen}
        onClose={closeLeftDrawer}
        PaperProps={{ sx: { width: { xs: DRAWER_WIDTH.mobile, sm: 400 } } }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Contact & Sections</Typography>
          <IconButton onClick={closeLeftDrawer} aria-label='Close menu'>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <LeftSidebar />
        </Box>
      </Drawer>

      {/* Right Drawer for mobile */}
      <Drawer
        anchor='right'
        open={isRightDrawerOpen}
        onClose={closeRightDrawer}
        PaperProps={{
          sx: { width: { xs: DRAWER_WIDTH.mobile, sm: DRAWER_WIDTH.tablet } }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          <Typography sx={{ fontWeight: 700 }}>Library & Files</Typography>
          <IconButton onClick={closeRightDrawer} aria-label='Close library'>
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ p: 2 }}>
          <RightSidebar
            files={files}
            onFilesSelected={handleFilesSelected}
            onFileDelete={handleFileDelete}
            onFileNameChange={handleFileNameChange}
            onAllFilesUpdate={handleAllFilesUpdate}
          />
        </Box>
      </Drawer>
    </Box>
  )
}

export default ResumeEditor

