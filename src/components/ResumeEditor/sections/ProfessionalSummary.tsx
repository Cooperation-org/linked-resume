import React, { useState, useEffect, useRef } from 'react'
import { Box, Typography } from '@mui/material'
import TextEditor from '../../TextEditor/Texteditor'
import { updateSection } from '../../../redux/slices/resume'
import { RootState } from '../../../redux/store'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'

interface ProfessionalSummaryProps {
  onAddFiles?: () => void
  onDelete?: () => void
  onAddCredential?: (text: string) => void
  onFocus?: () => void
  evidence?: string[][]
}

export default function ProfessionalSummary({
  onAddFiles,
  onDelete,
  onAddCredential,
  onFocus,
  evidence = []
}: Readonly<ProfessionalSummaryProps>) {
  const dispatch = useAppDispatch()
  const resume = useAppSelector((state: RootState) => state.resumeEditor.resume)
  const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const [description, setDescription] = useState('')

  // ✅ Load existing summary from Redux if available
  useEffect(() => {
    if (resume?.summary !== undefined) {
      // Prevent unnecessary state updates
      if (resume.summary !== description) {
        setDescription(resume.summary || '')
      }
    }
  }, [resume?.summary, description])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current)
      }
    }
  }, [])

  const handleDescriptionChange = (val: string) => {
    // Always update local state immediately for responsiveness
    setDescription(val)

    // Debounce Redux updates
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current)
    }

    updateTimeoutRef.current = setTimeout(() => {
      dispatch(
        updateSection({
          sectionId: 'summary',
          content: val
        })
      )
    }, 500)
  }

  return (
    <Box>
      <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>
        Write a brief summary highlighting your skills, experience, and achievements.
        Focus on what makes you stand out, including specific expertise or career goals.
        Keep it quantitative, clear, professional, and tailored to your target role.
      </Typography>

      <TextEditor
        key='professional-summary-editor'
        value={description}
        onChange={handleDescriptionChange}
        onAddCredential={onAddCredential}
        onFocus={onFocus}
      />
    </Box>
  )
}
