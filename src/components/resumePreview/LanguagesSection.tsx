import React from 'react'
import { Box } from '@mui/material'
import { SectionTitle } from './SectionTitle'
import { LanguageItem } from './LanguageItem'

export const LanguagesSection: React.FC<{ items: Language[] }> = ({ items }) => {
  if (!items?.length) return null
  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Languages</SectionTitle>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {items.map((lang, idx) => (
          <LanguageItem key={lang.id || `language-${idx}`} lang={lang} idx={idx} />
        ))}
      </Box>
    </Box>
  )
}
