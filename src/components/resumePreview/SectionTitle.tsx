import React, { ReactNode } from 'react'
import { Typography } from '@mui/material'

export const SectionTitle: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Typography
    className='rs-section-title'
    variant='h6'
    sx={{
      fontWeight: 700,
      mb: '8px',
      lineHeight: '20px',
      fontSize: '17px',
      letterSpacing: 0.1,
      color: '#000'
    }}
  >
    {children}
  </Typography>
)
