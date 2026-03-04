import React from 'react'
import { Box, Typography } from '@mui/material'
import { LinkWithFavicon } from './LinkWithFavicon'

export const PublicationItem: React.FC<{ item: Publication }> = ({ item }) => {
  return (
    <Box key={item.id} sx={{ mb: '10px' }}>
      <Typography
        variant='subtitle1'
        sx={{ fontWeight: 700, fontFamily: 'Arial', fontSize: '16px' }}
      >
        {item.title}
      </Typography>
      <Typography
        variant='body2'
        sx={{ fontFamily: 'Arial', fontSize: '16px', fontWeight: 400 }}
      >
        {item.publisher} | {item.publishedDate || 'Published'}
      </Typography>
      {item.url && (
        <Box sx={{ mb: 1 }}>
          <LinkWithFavicon url={item.url} />
        </Box>
      )}
    </Box>
  )
}
