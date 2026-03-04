import React from 'react'
import { Box } from '@mui/material'
import { SectionTitle } from './SectionTitle'
import { HobbyItem } from './HobbyItem'

export const HobbiesSection: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items?.length) return null
  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Hobbies and Interests</SectionTitle>
      <Box component='ul' sx={{ pl: 2 }}>
        {items.map((hobby, idx) => (
          <HobbyItem key={`hobby-${idx}`} hobby={hobby} idx={idx} />
        ))}
      </Box>
    </Box>
  )
}
