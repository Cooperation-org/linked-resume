import React from 'react'
import { Box, Typography, styled, useMediaQuery, useTheme } from '@mui/material'
import { SVGCopyCheck, SVGLink, SVGMobileImg, SVGline } from '../../assets/svgs'

const FeatureCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '144px',
  height: '144px',
  borderRadius: '100px',
  backgroundColor: '#E9E6F8',
  position: 'absolute',
  border: '10px solid #F7F9FC',
  zIndex: 10,
  [theme.breakpoints.up('md')]: {
    right: '-130px',
    top: '30px'
  },
  [theme.breakpoints.down('md')]: {
    right: 'calc(50% - 72px)',
    bottom: '-72px',
    width: '100px',
    height: '100px'
  }
}))

const LandingPage = () => {
  const theme = useTheme()
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const sectionData = [
    {
      text: 'Import data from your existing resume, LinkedIn, or start with a blank template.',
      icon: <SVGCopyCheck />
    },
    {
      text: 'Edit or add details, and link to credentials and evidence to strengthen your resume.',
      icon: <SVGLink />
    },
    {
      text: "Sign and save a verifiable presentation of your resume, proof it's human-made.",
      icon: <SVGMobileImg />
    }
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: '60px 20px', sm: '80px 30px', md: '150px 20px 130px 20px' },
        textAlign: 'center',
        backgroundColor: '#FFF',
        gap: { xs: '20px', md: '30px' }
      }}
    >
      <Typography
        variant='h1'
        sx={{
          color: '#292489',
          fontSize: { xs: '32px', sm: '42px', md: '55px' },
          fontWeight: '600',
          marginBottom: { xs: '10px', md: '16px' },
          px: { xs: 2, sm: 3 }
        }}
      >
        How Resume Author Works
      </Typography>

      <Typography
        sx={{
          color: '#000',
          fontSize: { xs: '20px', sm: '24px', md: '32px' },
          marginBottom: { xs: '40px', md: '70px' }
        }}
      >
        Just 3 easy steps to get started.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'center', md: 'flex-start' },
          p: { xs: '0', sm: '0 40px', md: '0 120px' },
          justifyContent: { xs: 'center', md: 'space-evenly' },
          flexDirection: { xs: 'column', md: 'row' },
          gap: { xs: '80px', md: '40px' },
          width: '100%',
          maxWidth: '100%'
        }}
      >
        {sectionData.map((section, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: '20px',
              background: 'linear-gradient(180deg, #361F7D 0%, #414FCD 100%)',
              width: { xs: '85%', sm: '70%', md: '18%' },
              position: 'relative',
              p: { xs: '20px', sm: '25px', md: '30px' },
              minHeight: { xs: '180px', md: '220px' },
              marginBottom: {
                xs: index !== sectionData.length - 1 ? '30px' : '0',
                md: '0'
              },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}
          >
            <Typography
              sx={{
                color: '#FFF',
                fontFamily: 'Nunito Sans',
                fontSize: { xs: '18px', sm: '24px', md: '32px' },
                fontWeight: 500,
                lineHeight: 'normal',
                letterSpacing: '-0.32px',
                marginBottom: { xs: '60px', md: '0' }
              }}
            >
              {section.text}
            </Typography>
            <FeatureCard>{section.icon}</FeatureCard>
            {!isTablet && index !== sectionData.length - 1 && (
              <Box
                sx={{
                  position: 'absolute',
                  right: '-170px',
                  top: '100px',
                  zIndex: 9,
                  display: { xs: 'none', md: 'block' }
                }}
              >
                <SVGline />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default LandingPage
