import React from 'react'
import { Box, Typography } from '@mui/material'
import { HTMLWithVerifiedLinks } from '../../tools/htmlUtils'
import { SectionTitle } from './SectionTitle'

export const SummarySection: React.FC<{ summary?: string }> = ({ summary }) => {
  if (!summary) return null
  return (
    <Box sx={{ mb: '12px' }}>
      <SectionTitle>Professional Summary</SectionTitle>
      <Typography
        variant='body2'
        sx={{
          color: '#000',
          fontWeight: 400,
          fontSize: '14px',
          fontFamily: 'Arial',
          lineHeight: 1.4
        }}
      >
        <HTMLWithVerifiedLinks htmlContent={summary} />
      </Typography>
    </Box>
  )
}
