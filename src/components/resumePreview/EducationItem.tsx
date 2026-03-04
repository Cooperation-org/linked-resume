import React from 'react'
import { Box, Typography } from '@mui/material'
import { HTMLWithVerifiedLinks } from '../../tools/htmlUtils'
import { getPortfolioFromCredentialLink } from '../../utils/credentialParsingUtils'
import { renderDateOrDuration } from './utils'
import { renderPortfolio, renderSectionCredentials, renderAttachedFiles } from './Renderers'

export const EducationItem: React.FC<{
  item: Education
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate,
    currentlyVolunteering: item.currentlyEnrolled
  })

  let educationTitle = ''
  if (item.type && item.programName) {
    educationTitle = `${item.type} in ${item.programName}`
  } else if (item.type) {
    educationTitle = String(item.type)
  } else if (item.programName) {
    educationTitle = String(item.programName)
  }
  if (educationTitle && item.institution) {
    educationTitle += `, ${item.institution}`
  } else if (item.institution) {
    educationTitle = item.institution
  }

  return (
    <Box key={item.id} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontSize: '15px', fontFamily: 'Arial' }}
          >
            {educationTitle}
          </Typography>
          {dateText && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontWeight: 400,
                fontSize: '15px',
                fontFamily: 'Arial'
              }}
            >
              {dateText}
              {item.inProgress ? ' | In Progress' : ''}
            </Typography>
          )}
          {item.description && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontWeight: 400,
                fontSize: '14px',
                fontFamily: 'Arial'
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
      </Box>
    </Box>
  )
}
