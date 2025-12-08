import React, { useState, useEffect, useRef, useMemo } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Skeleton
} from '@mui/material'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import FitScreenIcon from '@mui/icons-material/FitScreen'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import { GoogleDriveStorage } from '@cooperation/vc-storage'
import { getLocalStorage } from '../tools/cookie'
import ResumePreview from '../components/resumePreview'
import ResumePreviewTopbar from '../components/ResumePreviewTopbar'
import html2pdf from 'html2pdf.js'
import { useLocation } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { setSelectedResume } from '../redux/slices/resume'
import { AppDispatch, RootState } from '../redux/store'

const PreviewPage = () => {
  const [isDraftSaving, setIsDraftSaving] = useState(false)
  const [isSigningSaving, setIsSigningSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [zoom, setZoom] = useState(1)
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'error'
  }>({ open: false, message: '', severity: 'success' })
  const location = useLocation()
  const dispatch = useDispatch<AppDispatch>()

  // Get the resume from Redux state first
  const reduxResume = useSelector((state: RootState) => state.resume?.resume)

  // Get resumeId from URL parameters
  const queryParams = new URLSearchParams(location.search)
  const resumeId = queryParams.get('id')

  // Initialize state based on whether we have Redux data or need to fetch
  const [resumeData, setResumeData] = useState<any>(reduxResume)
  const [isLoading, setIsLoading] = useState(!reduxResume && !!resumeId)
  const hasLoadedFromDrive = useRef(false)

  // Update local state when Redux state changes (only if we haven't loaded from Drive)
  useEffect(() => {
    if (reduxResume && !hasLoadedFromDrive.current) {
      setResumeData(reduxResume)
    }
  }, [reduxResume])

  useEffect(() => {
    const fetchResumeFromDrive = async () => {
      if (!resumeId) return

      try {
        const accessToken = getLocalStorage('auth')
        if (!accessToken) throw new Error('No authentication token found')

        setIsLoading(true)
        const storage = new GoogleDriveStorage(accessToken as string)
        const fileData = await storage.retrieve(resumeId)

        if (fileData?.data ?? fileData) {
          const data = fileData.data ?? fileData
          setResumeData(data)
          hasLoadedFromDrive.current = true
          // Also update Redux state so Sign and Save has access to the resume data
          dispatch(setSelectedResume(data))
        } else {
          setResumeData(fileData)
          hasLoadedFromDrive.current = true
          dispatch(setSelectedResume(fileData))
        }
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching resume:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load resume. Please try again later.'
        )
        setIsLoading(false)
      }
    }

    fetchResumeFromDrive()
  }, [resumeId, dispatch])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        window.print()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setZoom(z => Math.min(1.5, parseFloat((z + 0.1).toFixed(2))))
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom(z => Math.max(0.7, parseFloat((z - 0.1).toFixed(2))))
      } else if (e.key === '0') {
        e.preventDefault()
        setZoom(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const exportResumeToPDF = async () => {
    if (!resumeData) return

    const element = document.getElementById('resume-preview')
    if (!element) return

    const options = {
      margin: [0, 0, 0, 0],
      filename: `${resumeData.contact?.fullName ?? 'Resume'}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    const metadata = {
      title: `${resumeData.contact?.fullName ?? 'Resume'}'s Resume`,
      creator: 'T3 Resume Author',
      subject: 'Resume',
      keywords: ['Resume', 'CV', resumeData.contact?.fullName ?? 'Resume'],
      custom: { resumeData: JSON.stringify(resumeData) }
    }

    // Temporarily reset zoom for export to avoid scaled capture
    const prevZoom = zoom
    setZoom(1)
    try {
      await html2pdf().set(metadata).from(element).set(options).save()
    } finally {
      setZoom(prevZoom)
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = resumeId
        ? `${window.location.origin}${window.location.pathname}?id=${resumeId}`
        : window.location.href
      await navigator.clipboard.writeText(url)
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard',
        severity: 'success'
      })
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' })
    }
  }

  const handleDownloadJson = () => {
    if (!resumeData) return
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], {
      type: 'application/json'
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${resumeData.contact?.fullName ?? 'Resume'}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }

  const fitToWidthZoom = useMemo(() => {
    // Approximate: page width 210mm; container likely full width; we'll scale down on small screens
    // Leave as 1 on desktop, clamp to 0.9 on smaller; user can tap Fit control as needed
    return 0.9
  }, [])

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '900px' }}>
          <Skeleton variant='rectangular' height={64} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={24} sx={{ mb: 1, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={680} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={680} sx={{ mb: 2, borderRadius: 1 }} />
        </Box>
        <Typography variant='body1' color='text.secondary'>
          Loading resume preview…
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography color='error' variant='body1'>
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <ResumePreviewTopbar
        isDraftSaving={isDraftSaving}
        isSigningSaving={isSigningSaving}
        setIsDraftSaving={setIsDraftSaving}
        setIsSigningSaving={setIsSigningSaving}
        resumeId={resumeId}
      />

      {/* Controls: Zoom and Export */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          gap: 1,
          '@media print': { display: 'none' }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            p: 0.5,
            boxShadow: 2
          }}
        >
          <Tooltip title='Zoom out (-)'>
            <IconButton
              aria-label='Zoom out'
              onClick={() =>
                setZoom(z => Math.max(0.7, parseFloat((z - 0.1).toFixed(2))))
              }
            >
              <ZoomOutIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Reset zoom (0)'>
            <IconButton aria-label='Reset zoom' onClick={() => setZoom(1)}>
              <RestartAltIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Zoom in (+)'>
            <IconButton
              aria-label='Zoom in'
              onClick={() =>
                setZoom(z => Math.min(1.5, parseFloat((z + 0.1).toFixed(2))))
              }
            >
              <ZoomInIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title='Fit'>
            <IconButton aria-label='Fit to width' onClick={() => setZoom(fitToWidthZoom)}>
              <FitScreenIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title='Export & Share'>
            <IconButton
              aria-label='Export menu'
              onClick={e => setExportAnchorEl(e.currentTarget)}
              sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              exportResumeToPDF()
            }}
          >
            <PictureAsPdfIcon sx={{ mr: 1 }} /> Download PDF
          </MenuItem>
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              window.print()
            }}
          >
            Print
          </MenuItem>
          <MenuItem
            disabled={!resumeId}
            onClick={() => {
              setExportAnchorEl(null)
              handleCopyLink()
            }}
          >
            Copy Share Link
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              handleDownloadJson()
            }}
          >
            Download JSON
          </MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          transition: 'transform 120ms ease',
          transform: `scale(${zoom})`,
          transformOrigin: 'top center'
        }}
      >
        <ResumePreview data={resumeData} />
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

export default PreviewPage
