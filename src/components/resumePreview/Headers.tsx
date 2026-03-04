import React, { useState } from 'react'
import { Box, Typography, Link } from '@mui/material'
import ResumeQRCode from '../ResumeQRCode'

// Keep HEADER_HEIGHT_PX constant here as it's specific to the header
export const HEADER_HEIGHT_PX = 150

export const formatPlatformName = (platform: string) => {
  if (platform.toLowerCase() === 'linkedin') return 'LinkedIn'
  if (platform.toLowerCase() === 'github') return 'GitHub'
  return platform.charAt(0).toUpperCase() + platform.slice(1)
}

// First Page Header with social links
export const FirstPageHeader: React.FC<{
  fullName: string
  city?: string
  forcedId?: string
  socialLinks?: Record<string, string | undefined>
  email?: string
  phone?: string
}> = ({
  fullName,
  city,
  forcedId,
  socialLinks,
  email,
  phone
}) => {
  const [resumeLink, setResumeLink] = useState<string>('')
  const [hasValidId, setHasValidId] = useState<boolean>(false)

  const handleLinkGenerated = (link: string, isValid: boolean) => {
    setResumeLink(link)
    setHasValidId(isValid)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        backgroundColor: '#F7F9FC',
        height: `fit-content`
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ml: '45px',
          justifyContent: 'center',
          gap: 0.5,
          py: 2
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{ fontWeight: 600, color: '#2E2E48', fontSize: '28px', lineHeight: 1 }}
          >
            {fullName}
          </Typography>
          {city && (
            <Typography sx={{ fontWeight: 400, color: '#666', fontSize: '18px' }}>
              {city}
            </Typography>
          )}
        </Box>

        {(email || phone) && (
          <Box sx={{ display: 'flex', gap: 3, alignItems: 'center' }}>
            {email && (
              <Link
                href={`mailto:${email}`}
                sx={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 400,
                  fontFamily: 'Arial',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                Email
              </Link>
            )}
            {email && phone && (
              <Typography sx={{ color: '#666', fontSize: '15px' }}>|</Typography>
            )}
            {phone && (
              <Link
                href={`tel:${phone}`}
                sx={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontSize: '15px',
                  fontWeight: 400,
                  fontFamily: 'Arial',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {phone}
              </Link>
            )}
          </Box>
        )}

        {/* Social Links Row */}
        {socialLinks && Object.values(socialLinks).some(link => !!link) && (
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(socialLinks).map(([platform, url], index, array) =>
              url ? (
                <React.Fragment key={platform}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${platform.toLowerCase()}.com&sz=32`}
                      alt={`${platform} favicon`}
                      style={{ width: 16, height: 16, borderRadius: '50%' }}
                    />
                    <Link
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{
                        color: '#2563EB',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 400,
                        fontFamily: 'Arial',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {formatPlatformName(platform)}
                    </Link>
                  </Box>
                  {index < array.length - 1 &&
                    Object.entries(socialLinks).filter(([_, u]) => u)[index + 1] && (
                      <Typography sx={{ color: '#666', fontSize: '14px' }}>|</Typography>
                    )}
                </React.Fragment>
              ) : null
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '100%'
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: '20px',
            mr: '15px',
            display: hasValidId ? 'block' : 'none'
          }}
        >
          <Link
            href={resumeLink}
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Arial',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '16px',
              textDecorationLine: 'underline',
              cursor: 'pointer'
            }}
          >
            Verified Claims
          </Link>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${HEADER_HEIGHT_PX}px`,
            width: '128px',
            backgroundColor: '#2563EB'
          }}
        >
          <ResumeQRCode
            size={86}
            bgColor='transparent'
            fgColor='#fff'
            forcedId={forcedId}
            onLinkGenerated={handleLinkGenerated}
          />
        </Box>
      </Box>
    </Box>
  )
}

// Simpler header for subsequent pages
export const SubsequentPageHeader: React.FC<{ fullName: string }> = ({ fullName }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
        height: '60px', // Narrower header for subsequent pages
        pl: '45px'
      }}
    >
      <Typography sx={{ fontWeight: 600, color: '#2E2E48', fontSize: '24px' }}>
        {fullName}
      </Typography>
    </Box>
  )
}
