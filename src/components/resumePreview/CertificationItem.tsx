import React from 'react'
import { Box, Typography } from '@mui/material'
import { getPortfolioFromCredentialLink } from '../../utils/credentialParsingUtils'
import { renderPortfolio, renderSectionCredentials } from './Renderers'

export const CertificationItem: React.FC<{
  item: Certification
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  let displayDate = ''
  if (item.noExpiration) {
    displayDate = 'No Expiration'
  }
  if (item.issueDate) {
    if (displayDate) {
      displayDate = `Issued on ${item.issueDate} | ${displayDate}`
    } else {
      displayDate = `Issued on ${item.issueDate}`
    }
  }

  return (
    <Box key={item.id || item.name} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ ml: 0 }}>
        <Typography
          variant='subtitle1'
          sx={{ fontWeight: 700, fontSize: '16px', fontFamily: 'Arial' }}
        >
          {item.name}
        </Typography>
        {item.issuer && (
          <Typography
            variant='body2'
            sx={{ color: '#000', fontFamily: 'Arial', fontSize: '16px', fontWeight: 400 }}
          >
            Issued by {item.issuer}
          </Typography>
        )}
        {displayDate && (
          <Typography
            variant='body2'
            sx={{ color: '#000', fontFamily: 'Arial', fontSize: '16px', fontWeight: 400 }}
          >
            {displayDate}
          </Typography>
        )}
        {item.verificationStatus === 'verified' && item.credentialId && (
          <Typography
            variant='body2'
            sx={{
              color: '#2563EB',
              fontFamily: 'Arial',
              fontSize: '16px',
              fontWeight: 400
            }}
          >
            Credential ID: {item.credentialId}
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
  )
}
