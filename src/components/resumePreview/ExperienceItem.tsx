import React from 'react'
import { Box, Typography } from '@mui/material'
import { HTMLWithVerifiedLinks } from '../../tools/htmlUtils'
import { getPortfolioFromCredentialLink } from '../../utils/credentialParsingUtils'
import { renderDateOrDuration } from './utils'
import { renderPortfolio, renderSectionCredentials, renderAttachedFiles } from './Renderers'

export const ExperienceItem: React.FC<{
  item: WorkExperience
  index: number
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, index, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate
  })

  return (
    <Box key={item.id || `exp-${index}`} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant='subtitle1'
          sx={{
            fontWeight: 700,
            fontSize: '16px',
            fontFamily: 'Arial'
          }}
        >
          {item.position ?? item.title}
        </Typography>
      </Box>
      <Typography
        variant='body2'
        sx={{
          color: '#000',
          fontWeight: 400,
          fontSize: '14px',
          fontFamily: 'Arial'
        }}
      >
        {item.company}
      </Typography>
      {dateText && (
        <Typography
          variant='body2'
          sx={{
            color: '#000',
            mb: 0.5,
            fontWeight: 400,
            fontSize: '14px',
            fontFamily: 'Arial'
          }}
        >
          {dateText}
        </Typography>
      )}
      {item.description && (
        <Typography
          variant='body2'
          sx={{
            mb: 1,
            fontWeight: 400,
            fontSize: '14px',
            fontFamily: 'Arial',
            lineHeight: 1.4
          }}
        >
          <HTMLWithVerifiedLinks htmlContent={item.description} />
        </Typography>
      )}
      {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
      {renderSectionCredentials(
        item.credentialLink,
        setDialogCredObj,
        setDialogImageUrl,
        setOpenCredDialog
      )}
      {renderAttachedFiles(item.attachedFiles)}
    </Box>
  )
}
