import React, { useState } from 'react'
import {
  Box, Typography, IconButton, Tooltip, Menu, MenuItem,
  Snackbar, Alert, Skeleton, Tabs, Tab
} from '@mui/material'
import { useParams } from 'react-router-dom'
import ResumePreview from '../components/resumePreview'
import LaTeXResumePreview from '../components/LaTeXResumePreview'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import '../styles/pdf-export.css'
import { usePublicResume } from '../hooks/usePublicResume'
import { useResumeExports } from '../hooks/useResumeExports'

const PreviewPageFromDrive: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const { resumeData, recommendations, loading: isLoading, error } = usePublicResume(id)

  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const [previewMode, setPreviewMode] = useState<'html' | 'latex'>('html')

  const {
    snackbar, setSnackbar,
    exportResumeToPDF, handleCopyLink, handleAskForRecommendation,
  } = useResumeExports(resumeData, id, recommendations)


  if (isLoading) {
    return (
      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <Box sx={{ width: '100%', maxWidth: '900px' }}>
          <Skeleton variant='rectangular' height={64} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={24} sx={{ mb: 1, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={680} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={680} sx={{ mb: 2, borderRadius: 1 }} />
        </Box>
        <Typography variant='body1' color='text.secondary'>Loading resume preview…</Typography>
      </Box>
    )
  }

  if (error) {
    return <Box sx={{ p: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Typography color='error' variant='body1'>{error}</Typography></Box>
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Preview mode tabs */}
      <Box sx={{ maxWidth: '900px', mx: 'auto', px: 2, mt: 2 }}>
        <Tabs value={previewMode} onChange={(_, v) => setPreviewMode(v)} aria-label='Preview mode tabs' variant='fullWidth'>
          <Tab label='HTML Preview' value='html' />
          <Tab label='LaTeX Preview' value='latex' />
        </Tabs>
      </Box>

      {/* Floating controls */}
      <Box sx={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, display: { xs: 'none', sm: 'flex' }, flexDirection: 'column', gap: 1, '@media print': { display: 'none' } }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title='Export & Share'>
            <IconButton aria-label='Export menu' onClick={e => setExportAnchorEl(e.currentTarget)} sx={{ bgcolor: 'background.paper', boxShadow: 2 }}><MoreVertIcon /></IconButton>
          </Tooltip>
        </Box>
        <Menu anchorEl={exportAnchorEl} open={Boolean(exportAnchorEl)} onClose={() => setExportAnchorEl(null)}>
          <MenuItem onClick={() => { setExportAnchorEl(null); exportResumeToPDF() }}><PictureAsPdfIcon sx={{ mr: 1 }} /> Download PDF</MenuItem>
          <MenuItem onClick={() => { setExportAnchorEl(null); window.print() }}>Print</MenuItem>
          <MenuItem onClick={() => { setExportAnchorEl(null); handleCopyLink() }}>Copy Share Link</MenuItem>
          <MenuItem onClick={() => { setExportAnchorEl(null); handleAskForRecommendation() }}>Ask for Recommendation</MenuItem>
        </Menu>
      </Box>

      {/* HTML preview */}
      <Box sx={{ display: previewMode === 'html' ? 'flex' : 'none', justifyContent: 'center', transition: 'transform 120ms ease', transformOrigin: 'top center' }}>
        {resumeData && <ResumePreview data={resumeData} forcedId={id!} recommendations={recommendations} />}
      </Box>

      {/* LaTeX preview */}
      <Box sx={{ display: previewMode === 'latex' ? 'block' : 'none', px: 2 }}>
        <LaTeXResumePreview data={resumeData} />
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={2200} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>
        <Alert onClose={() => setSnackbar(s => ({ ...s, open: false }))} severity={snackbar.severity} variant='filled' sx={{ width: '100%' }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  )
}

export default PreviewPageFromDrive
