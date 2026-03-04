import React from 'react'
import { Box, Typography } from '@mui/material'

export const LanguageItem: React.FC<{ lang: Language; idx: number }> = ({ lang, idx }) => {
  return (
    <Box
      key={lang.id || `language-${idx}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: 'calc(100% - 8px)',
        mb: 1
      }}
    >
      <Typography sx={{ fontWeight: 400, fontSize: '16px', fontFamily: 'Arial' }}>
        {lang.name} {lang.proficiency ? `(${lang.proficiency})` : ''}
      </Typography>
    </Box>
  )
}
