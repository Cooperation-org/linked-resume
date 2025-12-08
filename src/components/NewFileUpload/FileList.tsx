'use client'

import React, { useState, useEffect, useCallback } from 'react'
import {
  Box,
  styled,
  Card,
  CardContent,
  IconButton,
  TextField,
  Typography,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemButton,
  ListItemText
} from '@mui/material'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import CloudUploadIcon from '@mui/icons-material/CloudUpload'
import useGoogleDrive, { DriveFileMeta } from '../../hooks/useGoogleDrive'
import { useSelector } from 'react-redux'
import { RootState } from '../../redux/store'
import StorageService from '../../storage-singlton'

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

export interface FileItem {
  id: string
  file: File
  name: string
  url: string
  uploaded: boolean
  fileExtension: string
  googleId?: string
}

interface FileListProps {
  files: FileItem[]
  onDelete: (e: React.MouseEvent, id: string) => void
  onNameChange: (id: string, newName: string) => void
  onUploadFile: (fileItem: FileItem) => Promise<void>
  uploadingId?: string
  accessToken?: string
}

const FileListContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: '15px',
  paddingBottom: '20px',
  width: '100%'
})

const isImage = (n: string) => /\.(jpe?g|png|gif|bmp|webp)$/i.test(n)
const isPDF = (n: string) => n.toLowerCase().endsWith('.pdf')
const isMP4 = (n: string) => n.toLowerCase().endsWith('.mp4')

async function renderPDFThumbnail(file: FileItem): Promise<string> {
  try {
    const loadingTask = file.url.startsWith('data:')
      ? (() => {
          const b64 = file.url.split(',')[1]
          const bin = atob(b64)
          const arr = new Uint8Array(bin.length)
          for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
          return getDocument({ data: arr })
        })()
      : getDocument(file.url)

    const pdf = await loadingTask.promise
    const page = await pdf.getPage(1)
    const vp = page.getViewport({ scale: 0.1 })
    const c = document.createElement('canvas')
    c.width = vp.width
    c.height = vp.height
    await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise
    return c.toDataURL()
  } catch {
    return '/fallback-pdf-thumbnail.svg'
  }
}

function generateVideoThumbnail(file: FileItem): Promise<string> {
  return new Promise((res, rej) => {
    const v = document.createElement('video')
    v.src = file.url
    v.addEventListener('loadeddata', () => (v.currentTime = 1), { once: true })
    v.addEventListener(
      'seeked',
      () => {
        const c = document.createElement('canvas')
        c.width = v.videoWidth
        c.height = v.videoHeight
        const ctx = c.getContext('2d')
        if (!ctx) return rej(new Error('Canvas error'))
        ctx.drawImage(v, 0, 0, c.width, c.height)
        res(c.toDataURL('image/png'))
      },
      { once: true }
    )
    v.addEventListener('error', () => rej(new Error('Video load failed')))
  })
}

const getDriveThumbnailUrl = (id: string) =>
  `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${id}`

const FileListDisplay: React.FC<FileListProps> = ({
  files,
  onDelete,
  onNameChange,
  onUploadFile,
  uploadingId
}) => {
  const { listFilesMetadata } = useGoogleDrive()
  const { accessToken } = useSelector((state: RootState) => state.auth)
  const [remoteFiles, setRemoteFiles] = useState<DriveFileMeta[]>([])
  const [loadingRemote, setLoadingRemote] = useState(false)

  const reloadRemote = useCallback(async () => {
    if (!accessToken) return

    setLoadingRemote(true)
    try {
      const storageService = StorageService.getInstance()
      storageService.initialize(accessToken)

      // Use enhanced API call handling with automatic token refresh
      const files = await storageService.handleApiCall(async () => {
        const storage = storageService.getStorage()
        const folderId = await storage.getMediaFolderId()
        return await listFilesMetadata(folderId)
      })

      setRemoteFiles(files)
    } catch (error) {
      console.error('Error fetching remote files:', error)
      setRemoteFiles([])
    } finally {
      setLoadingRemote(false)
    }
  }, [accessToken, listFilesMetadata])

  useEffect(() => {
    if (accessToken) {
      reloadRemote()
    }
  }, [accessToken, reloadRemote])

  const [pdfThumbs, setPdfThumbs] = useState<Record<string, string>>({})
  const [vidThumbs, setVidThumbs] = useState<Record<string, string>>({})

  useEffect(() => {
    files.forEach(f => {
      if (isPDF(f.name) && !pdfThumbs[f.id]) {
        renderPDFThumbnail(f).then(t => setPdfThumbs(p => ({ ...p, [f.id]: t })))
      }
      if (isMP4(f.name) && !vidThumbs[f.id]) {
        generateVideoThumbnail(f)
          .then(t => setVidThumbs(v => ({ ...v, [f.id]: t })))
          .catch(() => setVidThumbs(v => ({ ...v, [f.id]: '/fallback-video.png' })))
      }
    })
  }, [files, pdfThumbs, vidThumbs])

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')

  const startEdit = (f: FileItem) => {
    setEditingId(f.id)
    setEditingValue(f.name.replace(/(\.[^/.]+)$/, ''))
  }
  const saveEdit = (f: FileItem) => {
    if (!editingValue.trim()) return setEditingId(null)
    const ext = f.name.split('.').pop() || ''
    onNameChange(f.id, `${editingValue.trim()}.${ext}`)
    setEditingId(null)
  }

  const handleUpload = async (f: FileItem) => {
    await onUploadFile(f)
    setEditingId(null)
    await new Promise(r => setTimeout(r, 500))
    reloadRemote()
  }

  const [preview, setPreview] = useState<{ url: string; mime: string } | null>(null)
  const openPreview = (url: string, mime: string) => setPreview({ url, mime })
  const closePreview = () => setPreview(null)

  const pending = files.filter(f => !f.uploaded)

  return (
    <>
      <FileListContainer>
        {pending.map(f => {
          const ext = f.name.split('.').pop() || ''
          const isEd = editingId === f.id
          const isUp = uploadingId === f.id

          return (
            <Box key={f.id} sx={{ width: '100%' }}>
              <Card sx={{ width: '100%', bgcolor: 'white', borderRadius: 2 }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isImage(f.name) ? (
                      <img
                        src={f.url}
                        alt={f.name}
                        width={80}
                        height={80}
                        style={{ borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => openPreview(f.url, `image/${ext}`)}
                      />
                    ) : isPDF(f.name) ? (
                      <img
                        src={pdfThumbs[f.id] ?? '/fallback-pdf-thumbnail.svg'}
                        alt='PDF thumbnail'
                        width={80}
                        height={80}
                        style={{ borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => openPreview(f.url, 'application/pdf')}
                      />
                    ) : isMP4(f.name) ? (
                      <img
                        src={vidThumbs[f.id] ?? '/fallback-video.png'}
                        alt='video thumbnail'
                        width={80}
                        height={80}
                        style={{ borderRadius: 8, cursor: 'pointer' }}
                        onClick={() => openPreview(f.url, 'video/mp4')}
                      />
                    ) : (
                      <Box
                        role='img'
                        aria-label='file icon'
                        sx={{
                          width: 80,
                          height: 80,
                          bgcolor: '#f3f3f3',
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.9rem',
                          color: '#666'
                        }}
                      >
                        FILE
                      </Box>
                    )}
                    <Box sx={{ flexGrow: 1 }}>
                      {isEd ? (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <TextField
                            size='small'
                            value={editingValue}
                            onChange={e => setEditingValue(e.target.value)}
                            fullWidth
                          />
                          <Typography>.{ext}</Typography>
                        </Box>
                      ) : (
                        <Typography
                          sx={{
                            fontSize: '0.95rem',
                            fontWeight: 500,
                            wordBreak: 'break-all',
                            cursor: 'pointer',
                            textDecoration: 'underline'
                          }}
                          onClick={() =>
                            openPreview(
                              f.url,
                              isImage(f.name)
                                ? `image/${ext}`
                                : isPDF(f.name)
                                  ? 'application/pdf'
                                  : isMP4(f.name)
                                    ? 'video/mp4'
                                    : 'application/octet-stream'
                            )
                          }
                        >
                          {f.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                </CardContent>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 1,
                    bgcolor: '#242c41',
                    p: 2,
                    borderBottomLeftRadius: 2,
                    borderBottomRightRadius: 2
                  }}
                >
                  {!isUp && (
                    <Box
                      role='button'
                      tabIndex={0}
                      onClick={() => handleUpload(f)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer'
                      }}
                    >
                      <IconButton sx={{ color: 'white' }}>
                        <CloudUploadIcon />
                      </IconButton>
                      <Typography sx={{ color: 'white' }}>Upload</Typography>
                    </Box>
                  )}
                  {isUp && <Typography sx={{ color: 'white' }}>Uploading…</Typography>}
                  {isEd ? (
                    <Box
                      role='button'
                      tabIndex={0}
                      onClick={() => saveEdit(f)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer'
                      }}
                    >
                      <IconButton sx={{ color: 'white' }}>
                        <CheckIcon />
                      </IconButton>
                      <Typography sx={{ color: 'white' }}>Save</Typography>
                    </Box>
                  ) : (
                    <Box
                      role='button'
                      tabIndex={0}
                      onClick={() => startEdit(f)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        cursor: 'pointer'
                      }}
                    >
                      <IconButton sx={{ color: 'white' }}>
                        <EditIcon />
                      </IconButton>
                      <Typography sx={{ color: 'white' }}>Edit</Typography>
                    </Box>
                  )}
                  <Box
                    role='button'
                    tabIndex={0}
                    onClick={e => onDelete(e, f.googleId ?? f.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      cursor: 'pointer'
                    }}
                  >
                    <IconButton sx={{ color: 'white' }}>
                      <DeleteIcon />
                    </IconButton>
                    <Typography sx={{ color: 'white' }}>Delete</Typography>
                  </Box>
                </Box>
              </Card>
            </Box>
          )
        })}
      </FileListContainer>

      <Box>
        {loadingRemote ? (
          <Box sx={{ textAlign: 'center', p: 2 }}>
            <Typography>Loading uploaded files…</Typography>
          </Box>
        ) : remoteFiles.length ? (
          <List dense>
            {remoteFiles.map(rf => (
              <ListItem
                key={rf.id}
                disablePadding
                sx={{ pr: 2 }}
                secondaryAction={
                  <Typography variant='caption' sx={{ pr: 1, fontSize: '10px' }}>
                    Uploaded
                  </Typography>
                }
              >
                <ListItemButton
                  onClick={() => openPreview(getDriveThumbnailUrl(rf.id), rf.mimeType)}
                  sx={{ pr: 1 }}
                >
                  <ListItemAvatar sx={{ minWidth: 40 }}>
                    <Avatar
                      src={getDriveThumbnailUrl(rf.id)}
                      alt={rf.name}
                      variant='rounded'
                      sx={{ width: 32, height: 32 }}
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={rf.name}
                    primaryTypographyProps={{ 
                      fontSize: '14px',
                      sx: { 
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        wordBreak: 'break-word',
                        maxWidth: '150px'
                      }
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography>No uploaded files yet.</Typography>
        )}
      </Box>

      <Dialog open={!!preview} onClose={closePreview} maxWidth='md' fullWidth>
        <DialogContent sx={{ textAlign: 'center' }}>
          {preview?.mime.startsWith('image/') && (
            <Box
              component='img'
              src={preview.url}
              alt='preview'
              sx={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          )}
          {preview?.mime.startsWith('video/') && (
            <Box
              component='video'
              src={preview.url}
              controls
              sx={{ maxWidth: '100%', maxHeight: '80vh' }}
            />
          )}
          {preview?.mime === 'application/pdf' && (
            <Box
              component='iframe'
              src={preview.url}
              sx={{ width: '100%', height: '80vh', border: 0 }}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FileListDisplay
