import React from 'react'
import { Box, TextField, Typography, Switch, styled, alpha } from '@mui/material'

const PinkSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#34C759',
    '&:hover': {
      backgroundColor: alpha('#34C759', theme.palette.action.hoverOpacity)
    }
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#34C759'
  }
}))

interface SectionDateFieldsProps {
  useDuration: boolean
  onToggle: () => void
  /** Free-text duration string (used when useDuration=true) */
  duration: string
  startDate: string
  endDate: string
  currentlyActive: boolean
  /** Label for startDate field */
  startLabel?: string
  /** Label for endDate field */
  endLabel?: string
  /** Placeholder for the duration textfield */
  durationPlaceholder?: string
  onDurationChange: (val: string) => void
  onStartDateChange: (val: string) => void
  onEndDateChange: (val: string) => void
}

/**
 * Reusable date/duration toggle used by Education, WorkExperience,
 * VolunteerWork and other sections.
 */
export default function SectionDateFields({
  useDuration,
  onToggle,
  duration,
  startDate,
  endDate,
  currentlyActive,
  startLabel = 'Start Date',
  endLabel = 'End Date',
  durationPlaceholder = 'Enter total duration (e.g., 4 years)',
  onDurationChange,
  onStartDateChange,
  onEndDateChange
}: SectionDateFieldsProps) {
  return (
    <Box display='flex' alignItems='start' flexDirection='column'>
      <Typography variant='body1'>Dates</Typography>
      <Box display='flex' alignItems='center'>
        <PinkSwitch
          checked={useDuration}
          onChange={onToggle}
          sx={{ color: '#34C759' }}
        />
        <Typography>Show duration instead of exact dates</Typography>
      </Box>

      {useDuration ? (
        <TextField
          sx={{ bgcolor: '#FFF', mt: 1 }}
          size='small'
          placeholder={durationPlaceholder}
          value={duration}
          onChange={e => onDurationChange(e.target.value)}
          variant='outlined'
          fullWidth
        />
      ) : (
        <Box display='flex' alignItems='center' gap={2} width='100%' mt={1}>
          <TextField
            sx={{
              bgcolor: '#FFF',
              width: '50%',
              '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' }
            }}
            size='small'
            label={startLabel}
            type='date'
            value={startDate}
            onChange={e => onStartDateChange(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          {!currentlyActive && (
            <TextField
              sx={{
                bgcolor: '#FFF',
                width: '50%',
                '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' }
              }}
              size='small'
              label={endLabel}
              type='date'
              value={endDate}
              onChange={e => onEndDateChange(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Box>
      )}
    </Box>
  )
}
