import React from 'react'
import { Typography } from '@mui/material'

export const HobbyItem: React.FC<{ hobby: string; idx: number }> = ({ hobby, idx }) => {
  return (
    <Typography
      component='li'
      key={`hobby-${idx}`}
      sx={{ fontWeight: 400, fontSize: '16px', fontFamily: 'Arial', mb: 1 }}
    >
      {hobby}
    </Typography>
  )
}
