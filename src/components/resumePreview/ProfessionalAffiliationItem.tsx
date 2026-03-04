import React from 'react'
import { Box, Typography } from '@mui/material'
import { getPortfolioFromCredentialLink } from '../../utils/credentialParsingUtils'
import { renderDateOrDuration } from './utils'
import { renderPortfolio, renderSectionCredentials } from './Renderers'

export const ProfessionalAffiliationItem: React.FC<{
  item: ProfessionalAffiliation
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate
  })

  return (
    <Box key={item.id} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontSize: '16px', fontFamily: 'Arial' }}
          >
            {item.name ?? item.role ?? 'Affiliation'}
            {item.organization && ` of the ${item.organization}`}
          </Typography>
          {dateText && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontFamily: 'Arial',
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              {dateText}
            </Typography>
          )}
          {item.activeAffiliation && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontFamily: 'Arial',
                fontSize: '16px',
                fontWeight: 400
              }}
            >
              Active Affiliation
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
