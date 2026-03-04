import React from 'react'
import { Box, Typography } from '@mui/material'
import { HTMLWithVerifiedLinks } from '../../tools/htmlUtils'
import { getPortfolioFromCredentialLink } from '../../utils/credentialParsingUtils'
import { renderDateOrDuration } from './utils'
import { renderPortfolio, renderSectionCredentials } from './Renderers'
import { LinkWithFavicon } from './LinkWithFavicon'

export const ProjectItem: React.FC<{
  item: Project
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({})

  return (
    <Box key={item.id} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontFamily: 'Arial', fontSize: '16px' }}
          >
            {item.name}
          </Typography>
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
          {item.url && (
            <Box sx={{ mb: 1 }}>
              <LinkWithFavicon url={item.url} />
            </Box>
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
