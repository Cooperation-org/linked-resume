import React, { useRef } from 'react'
import {
  Card,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  TextField,
  CircularProgress,
  Tooltip,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { styled } from '@mui/material/styles'
import EditOutlinedIcon from '@mui/icons-material/EditOutlined'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import DeleteIcon from '@mui/icons-material/Delete'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import DownloadIcon from '@mui/icons-material/Download'
import { LinkIcon } from 'lucide-react'
import DeleteConfirmationDialog from './DeleteConfirmDialog'
import ResumePreviewDialog from './ResumePreviewDialog'
import ResumeStatusBadge from './common/ResumeStatusBadge'
import { useResumeCard } from '../hooks/useResumeCard'

interface ResumeCardProps {
  id: string
  title: string
  date: string
  credentials: number
  isDraft?: boolean
  resume: any
  hasLocalChanges?: boolean
  localDraftTime?: string | null
}

const ActionButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  padding: '6px 12px',
  borderRadius: 8,
  color: '#3c4599',
  fontSize: '14px',
  '& .MuiButton-startIcon': { marginRight: 4 },
  [theme.breakpoints.down('md')]: {
    padding: '4px 8px',
    fontSize: '12px',
    '& .MuiButton-startIcon': {
      marginRight: 2,
      '& > svg': { fontSize: '16px' }
    }
  }
}))

const StyledCard = styled(Card)(({ theme }) => ({
  border: `1px solid #001aff`,
  boxShadow: 'none',
  borderRadius: '12px',
  '&:hover': { backgroundColor: '#f9f9f9' },
  [theme.breakpoints.down('md')]: { borderRadius: '8px' }
}))

const ResumeTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 500,
  color: '#3c4599',
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '16px',
  '&:hover': { textDecoration: 'underline' },
  [theme.breakpoints.down('md')]: { fontSize: '14px' }
}))

const StyledMoreButton = styled(IconButton)(({ theme }) => ({
  padding: 8,
  borderRadius: 8,
  '&:hover': { backgroundColor: theme.palette.grey[100] }
}))

const ResumeCard: React.FC<ResumeCardProps> = ({
  id, title, date, isDraft, resume
}) => {
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const inputRef = useRef<HTMLInputElement | null>(null)

  const {
    menuAnchor, isEditing, editedTitle, isLoading, showCopiedTooltip,
    deleteDialogOpen, previewDialogOpen, formattedDate, timeAgo,
    isSigned, isCompletedUnsigned,
    handleMenuOpen, handleMenuClose, handleEditTitle, handleTitleChange,
    handleBlurOrEnter, handleDeleteResume, handleDuplicateResume, handleCopyLink,
    handleConfirmDelete, handlePreviewResume, handleTitleClick,
    setDeleteDialogOpen, setPreviewDialogOpen
  } = useResumeCard({ id, title, date, isDraft, resume })

  return (
    <>
      <StyledCard>
        <Box position='relative' sx={{ p: { xs: 1.5, md: 2 }, opacity: isLoading ? 0.5 : 1 }}>
          {isLoading && (
            <Box position='absolute' top='50%' left='50%' sx={{ transform: 'translate(-50%, -50%)' }}>
              <CircularProgress size={24} />
            </Box>
          )}

          <Box
            display='flex'
            flexDirection={{ xs: 'column', sm: 'row' }}
            justifyContent='space-between'
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            gap={{ xs: 2, sm: 0 }}
          >
            {/* Left: badge + title */}
            <Box display='flex' gap={{ xs: 1, md: 1.5 }}>
              <ResumeStatusBadge
                isSigned={isSigned()}
                isCompletedUnsigned={isCompletedUnsigned()}
              />
              <Box>
                {isEditing ? (
                  <TextField
                    type='text'
                    value={editedTitle}
                    onChange={handleTitleChange}
                    onBlur={() => handleBlurOrEnter()}
                    onKeyDown={e => e.key === 'Enter' && handleBlurOrEnter(e as any)}
                    inputRef={inputRef}
                    autoFocus
                    variant='standard'
                    sx={{
                      fontSize: '0.875rem',
                      '& .MuiInputBase-root': { padding: 0 },
                      '& .MuiInputBase-input': { padding: 0, margin: 0, fontSize: 'inherit', fontWeight: 500, color: '#3c4599' },
                      '& .MuiInput-underline:before': { borderBottom: 'none' },
                      '& .MuiInput-underline:after': { borderBottom: 'none' }
                    }}
                  />
                ) : (
                  <ResumeTitle onClick={handleTitleClick} variant='body1'>
                    {title} - {formattedDate}
                  </ResumeTitle>
                )}
                <Typography variant='body2' color='text.secondary' sx={{ mt: 0.5, fontSize: '0.875rem' }}>
                  {isDraft ? 'DRAFT' : isSigned() ? `SIGNED - ${timeAgo}` : `COMPLETED - ${timeAgo}`}
                </Typography>
              </Box>
            </Box>

            {/* Right: action buttons */}
            <Box
              display='flex'
              alignItems='center'
              color='#3c4599'
              gap={0.5}
              width={{ xs: '100%', sm: 'auto' }}
              justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
            >
              <Box className='resume-card-actions' sx={{ display: 'flex', gap: { xs: 0.5, md: 1 }, flexWrap: 'wrap' }}>
                {isDraft || isCompletedUnsigned() ? (
                  <>
                    <ActionButton size='small' startIcon={!isMobile && <EditOutlinedIcon />} onClick={handleEditTitle}>
                      Edit
                    </ActionButton>
                    <ActionButton size='small' startIcon={!isMobile && <VisibilityOutlinedIcon />} onClick={handlePreviewResume}>
                      Preview
                    </ActionButton>
                  </>
                ) : (
                  <>
                    <Tooltip title={showCopiedTooltip ? 'Copied!' : 'Copy Link'}>
                      <ActionButton size='small' startIcon={!isMobile && <LinkIcon size={16} />} onClick={handleCopyLink}>
                        {isMobile ? 'Link' : 'Copy Link'}
                      </ActionButton>
                    </Tooltip>
                    <ActionButton onClick={() => setPreviewDialogOpen(true)} size='small' startIcon={!isMobile && <DownloadIcon />}>
                      {isMobile ? 'PDF' : 'Download PDF'}
                    </ActionButton>
                    <ActionButton size='small' startIcon={!isMobile && <VisibilityOutlinedIcon />} onClick={handlePreviewResume}>
                      Preview
                    </ActionButton>
                  </>
                )}
              </Box>
              <StyledMoreButton size='small' onClick={handleMenuOpen}>
                <MoreVertIcon sx={{ fontSize: { xs: 16, md: 18 } }} />
              </StyledMoreButton>
            </Box>
          </Box>

          <Menu anchorEl={menuAnchor} open={Boolean(menuAnchor)} onClose={handleMenuClose}>
            <MenuItem onClick={handleDeleteResume} disabled={isLoading}>
              <ListItemIcon><DeleteIcon fontSize='small' /></ListItemIcon>
              <ListItemText primary='Delete' />
            </MenuItem>
            <MenuItem onClick={handleDuplicateResume} disabled={isLoading}>
              <ListItemIcon><ContentCopyIcon fontSize='small' /></ListItemIcon>
              <ListItemText primary='Duplicate and Edit' />
            </MenuItem>
          </Menu>
        </Box>
      </StyledCard>

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
      />
      <ResumePreviewDialog
        open={previewDialogOpen}
        onClose={() => setPreviewDialogOpen(false)}
        id={id}
        onDownload={() => setPreviewDialogOpen(true)}
        fullScreen={fullScreen}
      />
    </>
  )
}

export default ResumeCard
