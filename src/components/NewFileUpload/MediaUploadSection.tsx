'use client'

import React, { useRef, useState, useCallback } from 'react'
import { Box, Typography, styled, Card, Snackbar, Alert } from '@mui/material'
import FileListDisplay from './FileList'
import { SVGUploadMedia } from '../../assets/svgs'
import useGoogleDrive from '../../hooks/useGoogleDrive'
import LoadingOverlay from './LoadingOverlay'

export interface FileItem {
  id: string
  file: File
  name: string
  url: string
  uploaded: boolean
  fileExtension: string
  googleId?: string
}

const CardStyle = styled(Card)({
  padding: '0 0 40px 0',
  cursor: 'default',
  width: '100%',
  transition: 'all 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  borderRadius: 8,
  gap: 8,
  border: '2px dashed #ccc'
})

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'video/mp4',
  'video/quicktime'
] as const

type Props = {
  files: FileItem[]
  maxFiles?: number
  maxSizeMB?: number
  onFilesSelected: (files: FileItem[]) => void
  onDelete: (e: React.MouseEvent, id: string) => void
  onNameChange: (id: string, name: string) => void
  hideUpload?: boolean
  accessToken?: string
}

const MediaUploadSection: React.FC<Props> = ({
  files,
  maxFiles = 10,
  maxSizeMB = 20,
  onFilesSelected,
  onDelete,
  onNameChange,
  hideUpload = false,
  accessToken
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { instances, isInitialized } = useGoogleDrive()
  const [uploadingId, setUploadingId] = useState<string | undefined>(undefined)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const openPicker = () => fileInputRef.current?.click()
  const handleCloseError = () => setError(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const dropped = Array.from(e.dataTransfer.files)
    if (!dropped.length) return

    const processed = await Promise.all(dropped.map(validateAndConvert))
    const validItems = processed.filter(Boolean) as FileItem[]
    if (!validItems.length) return

    const merged = [...files]
    validItems.forEach(item => {
      const idx = merged.findIndex(f => f.name === item.name)
      idx !== -1 ? (merged[idx] = item) : merged.push(item)
    })
    onFilesSelected(merged)
  }

  const validateAndConvert = useCallback(
    (file: File): Promise<FileItem | null> =>
      new Promise(resolve => {
        if (!ALLOWED_TYPES.includes(file.type as any)) {
          setError(`Type not allowed: ${file.name}`)
          return resolve(null)
        }
        if (file.size > maxSizeMB * 1024 * 1024) {
          setError(`File too large (> ${maxSizeMB} MB): ${file.name}`)
          return resolve(null)
        }
        const reader = new FileReader()
        reader.onload = e =>
          resolve({
            id: crypto.randomUUID(),
            file,
            name: file.name,
            url: e.target?.result as string,
            uploaded: false,
            fileExtension: file.name.split('.').pop() ?? ''
          })
        reader.readAsDataURL(file)
      }),
    [maxSizeMB]
  )

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files
    if (!list) return

    const overshoot = files.length + list.length - maxFiles
    if (overshoot > 0) {
      setError(`You can only upload ${maxFiles} files. Remove ${overshoot} first.`)
      return
    }

    const processed = await Promise.all(Array.from(list).map(validateAndConvert))
    const validItems = processed.filter(Boolean) as FileItem[]
    if (!validItems.length) {
      e.target.value = ''
      return
    }

    const merged = [...files]
    validItems.forEach(item => {
      const i = merged.findIndex(f => f.name === item.name)
      i !== -1 ? (merged[i] = item) : merged.push(item)
    })

    onFilesSelected(merged)
    e.target.value = ''
  }

  const handleUploadFile = async (fileItem: FileItem) => {
    if (!isInitialized || !instances.storage) {
      setUploadError('Google Drive is not initialized.')
      return
    }
    setUploadingId(fileItem.id)
    try {
      const newName = fileItem.name
      const renamedFile = new File([fileItem.file], newName, { type: fileItem.file.type })
      const result = await instances.storage.uploadBinaryFile({ file: renamedFile })
      const updatedFiles = files.map(f =>
        f.id === fileItem.id
          ? { ...f, uploaded: true, googleId: result.id, file: renamedFile }
          : f
      )
      onFilesSelected(updatedFiles)
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed')
    } finally {
      setUploadingId(undefined)
    }
  }

  const getDriveViewUrl = (fileId: string) =>
    `https://drive.google.com/uc?export=view&id=${fileId}`

  return (
    <Box width='100%'>
      <CardStyle variant='outlined'>
        <FileListDisplay
          files={files.map(f => {
            if (f.googleId) {
              const ext = f.name.split('.').pop()?.toLowerCase() || ''
              if (
                ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'mp4', 'mov'].includes(ext)
              ) {
                return { ...f, url: getDriveViewUrl(f.googleId) }
              }
              return f
            }
            return f
          })}
          onDelete={onDelete}
          onNameChange={onNameChange}
          onUploadFile={handleUploadFile}
          uploadingId={uploadingId}
          accessToken={accessToken}
        />

        {!hideUpload && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mt: 2,
              mb: 1,
              gap: 1.5,
              cursor: 'pointer',
              width: '100%'
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={openPicker}
          >
            <Typography
              sx={{
                fontSize: 24,
                color: '#9CA3AF',
                fontFamily: 'Poppins',
                fontWeight: 600
              }}
            >
              + Add more media
            </Typography>
            <Box sx={{ width: 'auto', height: 54, display: 'flex' }}>
              <SVGUploadMedia />
            </Box>
            <Typography
              sx={{
                fontSize: 16,
                textAlign: 'center',
                fontFamily: 'Nunito Sans'
              }}
            >
              Drop your files here or browse
            </Typography>
            <Typography
              sx={{
                fontSize: 14,
                color: '#9CA3AF',
                textAlign: 'center',
                fontFamily: 'Nunito Sans'
              }}
            >
              Maximum size: {maxSizeMB}MB
            </Typography>
            <input
              type='file'
              ref={fileInputRef}
              onChange={handleFileChange}
              accept={ALLOWED_TYPES.join(',')}
              multiple
              hidden
            />
          </Box>
        )}
      </CardStyle>

      <Snackbar
        open={!!error || !!uploadError}
        onClose={handleCloseError}
        autoHideDuration={6000}
      >
        <Alert severity='error' onClose={handleCloseError} variant='filled'>
          {error || uploadError}
        </Alert>
      </Snackbar>

      <LoadingOverlay open={!!uploadingId} text='Uploading file...' />
    </Box>
  )
}

export default MediaUploadSection
