import React from 'react'
import { Box, Typography } from '@mui/material'
import { HTMLWithVerifiedLinks } from '../../tools/htmlUtils'
import { getPortfolioFromCredentialLink } from '../../utils/credentialParsingUtils'
import { renderDateOrDuration } from './utils'
import { renderPortfolio, renderSectionCredentials } from './Renderers'

export const VolunteerWorkItem: React.FC<{
  item: VolunteerWork
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate,
    currentlyVolunteering: item.currentlyVolunteering
  })

  return (
    <Box key={item.id} sx={{ mb: '10px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontFamily: 'Arial', fontSize: '16px' }}
          >
            {item.role} at {item.organization}
          </Typography>
          {item.location && (
            <Typography
              variant='body2'
              sx={{ fontFamily: 'Arial', fontSize: '16px', fontWeight: 400 }}
            >
              {item.location}
            </Typography>
          )}
          {dateText && (
            <Typography
              variant='body2'
              sx={{ fontFamily: 'Arial', fontSize: '16px', fontWeight: 400 }}
            >
              {dateText}
            </Typography>
          )}
          {item.description && (
            <Typography
              variant='body2'
              sx={{ mb: 1, fontFamily: 'Arial', fontSize: '16px', fontWeight: 400 }}
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
        </Box>
      </Box>
    </Box>
  )
}
