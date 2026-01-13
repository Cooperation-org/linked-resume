import React from 'react'
import { Box, Card, CardContent } from '@mui/material'

type SectionContainerProps = {
  children: React.ReactNode
  px?: number
  py?: number
}

const SectionContainer: React.FC<SectionContainerProps> = ({ children, px = 2, py = 2 }) => (
  <Card
    variant='outlined'
    sx={{
      backgroundColor: '#F1F1FB',
      borderRadius: 1,
      boxShadow: 'none'
    }}
  >
    <CardContent sx={{ px, py, display: 'flex', flexDirection: 'column', gap: 2 }}>
      {children}
    </CardContent>
  </Card>
)

export default SectionContainer

