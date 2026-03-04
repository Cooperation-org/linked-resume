import React, { useEffect } from 'react'
import { Box, Typography, Divider } from '@mui/material'
import { useSelector } from 'react-redux'
import { useLocation } from 'react-router-dom'
import { RootState } from '../../redux/store'
import { login } from '../../tools/auth'
import { checkmarkBlueSVG } from '../../assets/svgs'
import MediaUploadSection from '../NewFileUpload/MediaUploadSection'
import LibraryCard from './common/LibraryCard'
import CredentialsList from './common/CredentialsList'
import { useRemoteFiles } from '../../hooks/useRemoteFiles'
import { useRightSidebarVCs } from '../../hooks/useRightSidebarVCs'
import { FileItem } from './types/section.types'

// Re-export FileItem so existing imports from RightSidebar continue to work
export type { FileItem }

interface RightSidebarProps {
  files: FileItem[]
  onFilesSelected: (files: FileItem[]) => void
  onFileDelete: (event: React.MouseEvent, id: string) => void
  onFileNameChange: (id: string, newName: string) => void
  onAllFilesUpdate: (allFiles: FileItem[]) => void
}

const RightSidebar = ({
  files,
  onFilesSelected,
  onFileDelete,
  onFileNameChange,
  onAllFilesUpdate
}: RightSidebarProps) => {
  const location = useLocation()
  const { accessToken, isAuthenticated } = useSelector((state: RootState) => state.auth)

  // Custom hooks
  const { vcs, isLoading, handleRefresh, isCredentialInUse } = useRightSidebarVCs()
  const { reloadRemoteFiles, getAllFiles } = useRemoteFiles(files)

  // Sync combined file list upward whenever local or remote files change
  useEffect(() => {
    onAllFilesUpdate(getAllFiles())
  }, [getAllFiles, onAllFilesUpdate])

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleGoogleLogin = () => login(location.pathname)

  const handleImport = () => {
    if (accessToken && isAuthenticated) {
      handleRefresh()
    } else {
      handleGoogleLogin()
    }
  }

  const handleFilesSelected = (newFiles: FileItem[]) => {
    onFilesSelected(newFiles)
    // Small delay so Drive has time to register the upload before re-fetching
    setTimeout(() => reloadRemoteFiles(), 500)
  }

  return (
    <Box
      sx={{
        width: { xs: '90%', md: '29%' },
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        bgcolor: 'white',
        pr: '40px'
      }}
    >
      {/* Section 1: Library card */}
      <LibraryCard onImport={handleImport} />

      {/* Section 2: Credentials */}
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <Typography
          sx={{ fontSize: '16px', fontWeight: 700, color: '#47516B', fontFamily: 'Poppins' }}
        >
          Your Credentials
          {isLoading && (
            <Box component='span' sx={{ ml: 1, color: '#9CA3AF' }}>
              (Loading...)
            </Box>
          )}
        </Typography>

        {/* Legend */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ width: 24, height: 24, mr: '12px', display: 'flex' }}>
            {checkmarkBlueSVG()}
          </Box>
          <Typography
            sx={{ fontSize: 14, color: '#2D2D47', fontWeight: 500, fontFamily: 'Nunito Sans' }}
          >
            Items with a filled-in checkmark are included in your resume.
          </Typography>
        </Box>

        <Divider sx={{ borderColor: '#47516B', mt: '3px' }} />

        <Box
          sx={{
            maxHeight: vcs?.length > 10 ? 531 : 'auto',
            overflowY: vcs?.length > 10 ? 'auto' : 'visible',
            paddingRight: 1,
            minHeight: '100px'
          }}
        >
          <CredentialsList
            vcs={vcs}
            isLoading={isLoading}
            isCredentialInUse={isCredentialInUse}
          />
        </Box>
      </Box>

      {/* Section 3: Your Files */}
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
          backgroundColor: '#FFF',
          padding: '20px',
          borderRadius: 2,
          boxShadow: '0px 2px 20px rgba(0,0,0,0.10)'
        }}
      >
        <Typography
          sx={{ fontSize: 16, color: '#47516B', fontWeight: 700, fontFamily: 'Poppins' }}
        >
          Your Files
        </Typography>
        <Divider sx={{ borderColor: '#47516B' }} />
        <MediaUploadSection
          files={files}
          onFilesSelected={handleFilesSelected}
          onDelete={onFileDelete}
          onNameChange={onFileNameChange}
          maxFiles={10}
          maxSizeMB={50}
          accessToken={accessToken ?? undefined}
        />
      </Box>
    </Box>
  )
}

export default RightSidebar
