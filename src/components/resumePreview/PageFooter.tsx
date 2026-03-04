import React, { useState } from 'react'
import { Box, Typography } from '@mui/material'
import ResumeQRCode from '../ResumeQRCode'

// Keep FOOTER_HEIGHT_PX constant here as it's specific to the footer
export const FOOTER_HEIGHT_PX = 60 // Footer height including padding (60px + 30px py)

export const PageFooter: React.FC<{
  fullName: string
  email: string
  phone?: string
  pageNumber: number
  totalPages: number
  forcedId?: string
}> = ({ fullName, email, phone, pageNumber, totalPages, forcedId }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [resumeLink, setResumeLink] = useState<string>('') //NOSONAR
  const [hasValidId, setHasValidId] = useState<boolean>(false)

  const handleLinkGenerated = (link: string, isValid: boolean) => {
    setResumeLink(link)
    setHasValidId(isValid)
  }

  return (
    <Box
      sx={{
        backgroundColor: '#F7F9FC',
        py: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${FOOTER_HEIGHT_PX}px`
      }}
    >
      <Typography
        variant='caption'
        sx={{
          color: '#000',
          textAlign: 'center',
          fontFamily: 'DM Sans',
          fontSize: '10px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '15px',
          mr: '10px'
        }}
      >
        {fullName} | Page {pageNumber} of {totalPages} |{' '}
        {phone && (
          <a href={`tel:${phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {phone}
          </a>
        )}
        {' | '}
        <a
          href={`mailto:${email}`}
          style={{ textDecoration: 'underline', color: '#2563EB' }}
        >
          {email}
        </a>
      </Typography>
      {hasValidId && (
        <ResumeQRCode
          size={32}
          bgColor='transparent'
          fgColor='#000'
          forcedId={forcedId}
          onLinkGenerated={handleLinkGenerated}
        />
      )}
    </Box>
  )
}
