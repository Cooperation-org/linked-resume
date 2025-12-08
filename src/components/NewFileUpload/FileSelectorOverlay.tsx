'use client'

import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Checkbox,
  styled,
  Dialog,
  DialogContent,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from '@mui/material'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import { FileItem } from './FileList'

GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

const StyledScrollbar = styled(Box)({
  '&::-webkit-scrollbar': { width: 10 },
  '&::-webkit-scrollbar-track': { background: 'transparent' },
  '&::-webkit-scrollbar-thumb': {
    background: '#E1E2F5',
    borderRadius: 30
  }
})

const isImage = (n: string) => /\.(jpe?g|png|gif|bmp|webp)$/i.test(n)
const isPDF = (n: string) => n.toLowerCase().endsWith('.pdf')
const isMP4 = (n: string) => n.toLowerCase().endsWith('.mp4')

const getDriveThumbnailUrl = (googleId: string) =>
  `https://drive.google.com/thumbnail?authuser=0&sz=w320&id=${googleId}`

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
    const viewport = page.getViewport({ scale: 0.1 })
    const canvas = document.createElement('canvas')
    canvas.width = viewport.width
    canvas.height = viewport.height
    await page.render({
      canvasContext: canvas.getContext('2d')!,
      viewport
    }).promise
    return canvas.toDataURL()
  } catch {
    return ''
  }
}

const generateVideoThumbnail = (file: FileItem): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    video.src = file.url
    video.addEventListener(
      'loadeddata',
      () => {
        video.currentTime = 1
      },
      { once: true }
    )
    video.addEventListener(
      'seeked',
      () => {
        const canvas = document.createElement('canvas')
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        const ctx = canvas.getContext('2d')
        if (!ctx) return reject(new Error('Canvas error'))
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        return resolve(canvas.toDataURL('image/png'))
      },
      { once: true }
    )
    video.addEventListener('error', () => {
      return reject(new Error('Video load failed'))
    })
  })
}

interface FileSelectorOverlayProps {
  open: boolean
  onClose: () => void
  onSelect: (ids: string[]) => void
  initialSelectedFiles?: { id: string }[]
  files: FileItem[]
}

const FileSelectorOverlay: React.FC<FileSelectorOverlayProps> = ({
  open,
  onClose,
  onSelect,
  initialSelectedFiles = [],
  files
}) => {
  const [selected, setSelected] = useState<string[]>([])
  const [thumbs, setThumbs] = useState<Record<string, string>>({})

  // console.log('FileSelectorOverlay render:', { open, filesCount: files.length, files })

  useEffect(() => {
    setSelected(initialSelectedFiles.map(f => f.id))
  }, [initialSelectedFiles])

  useEffect(() => {
    files.forEach(f => {
      if (f.googleId) {
        setThumbs(t => ({
          ...t,
          [f.id]: getDriveThumbnailUrl(f.googleId as string)
        }))
        return
      }

      if (isImage(f.name)) {
        setThumbs(t => ({ ...t, [f.id]: f.url }))
      } else if (isPDF(f.name)) {
        renderPDFThumbnail(f).then(src => {
          if (src) setThumbs(t => ({ ...t, [f.id]: src }))
        })
      } else if (isMP4(f.name)) {
        generateVideoThumbnail(f)
          .then(src => setThumbs(t => ({ ...t, [f.id]: src })))
          .catch(() => {
            /* ignore errors */
          })
      }
    })
  }, [files])

  const allSelected = selected.length === files.length
  const toggleAll = () => setSelected(allSelected ? [] : files.map(f => f.id))
  const toggleOne = (id: string) =>
    setSelected(curr => (curr.includes(id) ? curr.filter(x => x !== id) : [...curr, id]))
  const confirm = () => {
    onSelect(selected)
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth='sm'
      fullWidth
      disableEscapeKeyDown={false}
      disableEnforceFocus={false}
      disableAutoFocus={false}
      disableRestoreFocus={false}
      aria-labelledby='file-selector-title'
      sx={{
        '& .MuiDialog-container': {
          '& .MuiPaper-root': {
            backgroundColor: 'white',
            borderRadius: 2
          }
        }
      }}
    >
      <DialogContent>
        <Typography id='file-selector-title' variant='h6' gutterBottom>
          Select Files as Evidence
        </Typography>

        <Button onClick={toggleAll} sx={{ mb: 2 }}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </Button>

        <StyledScrollbar sx={{ maxHeight: 350, overflowY: 'auto' }}>
          {files.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant='body1' color='text.secondary'>
                No files available. Please upload files in the "Your Files" section on the
                right sidebar first.
              </Typography>
            </Box>
          ) : (
            <List>
              {files.map(f => {
                const thumbSrc = thumbs[f.id] || ''
                const checked = selected.includes(f.id)
                const labelId = `file-item-${f.id}`

                return (
                  <ListItem
                    key={f.id}
                    disablePadding
                    onClick={() => toggleOne(f.id)}
                    secondaryAction={
                      <Checkbox
                        edge='end'
                        checked={checked}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    }
                  >
                    <ListItemAvatar>
                      <Avatar
                        src={thumbSrc}
                        alt={f.name}
                        variant='rounded'
                        sx={{ width: 56, height: 56 }}
                      >
                        {f.fileExtension?.toUpperCase() || 'FILE'}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      id={labelId}
                      primary={f.name}
                      secondary={f.fileExtension?.toUpperCase()}
                    />
                  </ListItem>
                )
              })}
            </List>
          )}
        </StyledScrollbar>

        <Box display='flex' justifyContent='flex-end' mt={2} gap={2}>
          <Button variant='outlined' onClick={onClose}>
            Cancel
          </Button>
          <Button variant='contained' onClick={confirm}>
            Add Selected
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  )
}

export default FileSelectorOverlay
