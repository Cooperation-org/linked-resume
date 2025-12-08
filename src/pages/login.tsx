import React from 'react'
import { Box, Button, Typography, Link } from '@mui/material'
import img from '../assets/image 116.png'
import Nav from '../components/Nav'
import Footer from '../components/landingPageSections/Footer'
import {
  SVGAddGreenCheck,
  SVGHelpSection,
  SVGHeroicon2,
  SVGHeroicon1,
  SVGSmallLine
} from '../assets/svgs'

interface FeatureListItemProps {
  text: string
}

const FeatureListItem: React.FC<FeatureListItemProps> = ({ text }) => (
  <Box
    sx={{
      display: 'flex',
      alignItems: 'center',
      mb: 1,
      '& .MuiSvgIcon-root': {
        color: 'primary.main',
        mr: 1
      }
    }}
  >
    <SVGAddGreenCheck />
    <Typography>{text}</Typography>
  </Box>
)

const DigitalWalletLogin: React.FC = () => {
  const features = [
    'Secure storage for credentials',
    'Embed credentials from your Wallet into your resume',
    'Easy sharing with employers or institutions',
    'Ownership and control of your personal data'
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      <Nav />
      <Box sx={{ flex: 1, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
            height: '100%'
          }}
        >
          {/* Left Section */}
          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
              padding: '30px 75px'
            }}
          >
            <Box sx={{ p: { xs: 4 } }}>
              <Typography
                sx={{
                  fontSize: '45px',
                  fontWeight: 700,
                  fontFamily: 'Poppins',
                  lineHeight: '60px',
                  mb: '15px',
                  color: '#44474D'
                }}
              >
                Login or Sign Up with Google Drive
              </Typography>
              <Typography
                sx={{
                  fontSize: '20px',
                  fontWeight: 500,
                  fontFamily: 'Nunito Sans',
                  lineHeight: '30px',
                  color: '#2E2E48'
                }}
              >
                A digital Wallet securely stores your credentials and allows you to manage
                and share your information easily.
              </Typography>

              <Box sx={{ my: 4 }}>
                {features.map((feature, index) => (
                  <FeatureListItem key={index} text={feature} />
                ))}
              </Box>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: 2
                }}
              >
                <Button
                  variant='contained'
                  onClick={() => (window.location.href = '/login-scan')}
                  sx={{
                    bgcolor: '#FFF',
                    color: '#4527A0',
                    p: '10px 20px',
                    borderRadius: '100px',
                    border: '2px solid #4527A0',
                    textTransform: 'capitalize'
                  }}
                >
                  Login with Learner Credential Wallet
                </Button>
                <Button
                  variant='contained'
                  onClick={() => (window.location.href = '/signup')}
                  sx={{
                    bgcolor: '#FFF',
                    color: '#4527A0',
                    p: '10px 20px',
                    borderRadius: '100px',
                    border: '2px solid #4527A0',
                    textTransform: 'capitalize'
                  }}
                >
                  Sign Up with Learner Credential Wallet
                </Button>
              </Box>

              <Typography
                variant='caption'
                sx={{
                  display: 'block',
                  mt: 2,
                  fontFamily: 'Nunito Sans',
                  fontSize: '13px'
                }}
              >
                We currently support
                <Box component='span' sx={{ fontWeight: 700 }}>
                  Learner Credential Wallet
                </Box>
                , an open source mobile Wallet app developed by the{' '}
                <Box component='span' sx={{ textDecoration: 'underline' }}>
                  Digital Credentials Consortium
                </Box>
                .
              </Typography>

              <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column' }}>
                <Typography
                  sx={{
                    color: 'var(--Text-Primary-Text, #2E2E48)',
                    fontFamily: 'Nunito Sans',
                    fontSize: '21px',
                    fontStyle: 'normal',
                    fontWeight: 700,
                    lineHeight: '34px',
                    letterSpacing: '-0.24px'
                  }}
                >
                  Don't see the Wallet you want?{' '}
                </Typography>
                <Link
                  href='#'
                  sx={{
                    color: 'var(--Primary-Link, #2563EB)',
                    fontFamily: 'Nunito Sans',
                    fontSize: '21px',
                    fontStyle: 'normal',
                    fontWeight: 400,
                    lineHeight: '34px',
                    letterSpacing: '-0.24px',
                    textDecorationLine: 'underline',
                    textDecorationStyle: 'solid',
                    textDecorationSkipInk: 'auto',
                    textDecorationThickness: 'auto',
                    textUnderlineOffset: 'auto',
                    textUnderlinePosition: 'from-font'
                  }}
                >
                  Send us an email to add it to our roadmap
                </Link>
              </Box>
            </Box>
          </Box>

          {/* Right Section */}
          <Box
            sx={{
              flex: 1,
              height: '100%',
              overflow: 'hidden'
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                '& img': {
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }
              }}
            >
              <img src={img} alt='Solar panel worker' />
            </Box>
            <Box sx={{ position: 'absolute', top: '32%', left: '41%', zIndex: 111 }}>
              <SVGSmallLine />
            </Box>
            <Box sx={{ position: 'absolute', top: '26%', left: '43%', zIndex: 111 }}>
              <SVGHelpSection />
            </Box>
            <Box sx={{ position: 'absolute', top: '26%', left: '41.5%', zIndex: 111 }}>
              <SVGHeroicon1 />
            </Box>
            <Box sx={{ position: 'absolute', top: '47.5%', left: '45%', zIndex: 111 }}>
              <SVGHeroicon2 />
            </Box>
            <Box sx={{ position: 'absolute', top: '48%', left: '44%', zIndex: 111 }}>
              <SVGHeroicon2 />
            </Box>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  )
}

export default DigitalWalletLogin
