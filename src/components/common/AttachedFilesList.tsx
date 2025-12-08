import React from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import ImageIcon from '@mui/icons-material/Image'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import DescriptionIcon from '@mui/icons-material/Description'

interface FileItem {
  id: string
  file?: File
  name: string
  url: string
  uploaded: boolean
  fileExtension: string
  googleId?: string
}

interface AttachedFilesListProps {
  files: FileItem[]
  onRemove: (index: number) => void
}

const getFileIcon = (fileExtension: string) => {
  const ext = fileExtension.toLowerCase()
  if (['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.svg'].includes(ext)) {
    return <ImageIcon fontSize='small' color='primary' />
  }
  if (ext === '.pdf') {
    return <PictureAsPdfIcon fontSize='small' color='primary' />
  }
  if (['.doc', '.docx', '.txt', '.rtf'].includes(ext)) {
    return <DescriptionIcon fontSize='small' color='primary' />
  }
  return <InsertDriveFileIcon fontSize='small' color='primary' />
}

const AttachedFilesList: React.FC<AttachedFilesListProps> = ({ files, onRemove }) => {
  if (!Array.isArray(files) || files.length === 0) return null

  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant='body2' sx={{ fontWeight: 'bold', mb: 1 }}>
        Attached Files:
      </Typography>
      {files.map((file, fileIndex) => (
        <Box
          key={`file-${file.id}-${fileIndex}`}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 0.5,
            backgroundColor: '#e8f4f8',
            p: 0.5,
            borderRadius: 1
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              flexGrow: 1
            }}
            onClick={() => {
              if (file.url) {
                window.open(file.url, '_blank')
              }
            }}
          >
            {getFileIcon(file.fileExtension)}
            <Typography
              variant='body2'
              sx={{
                color: 'primary.main',
                textDecoration: 'underline'
              }}
            >
              {file.name}
            </Typography>
          </Box>
          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation()
              onRemove(fileIndex)
            }}
            sx={{
              p: 0.5,
              color: 'grey.500',
              '&:hover': {
                color: 'error.main'
              }
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      ))}
    </Box>
  )
}

export default AttachedFilesList
