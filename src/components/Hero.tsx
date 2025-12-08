import {
  Container,
  Box,
  Typography,
  Stack,
  Button,
  useMediaQuery,
  useTheme
} from '@mui/material'
import React from 'react'
import HeroImage from '../assets/image 1.png'
import HeroImage2 from '../assets/Union.png'
import HeroImage3 from '../assets/Union-2.png'
import HowItWorksSection from './landingPageSections/HowItWorksSection'
import HowResumeAuthorWorks from './landingPageSections/HowResumeAuthorWorks'
import WhoBenefitsSection from './landingPageSections/WhoBenefitsSection'
import SelectCards from './landingPageSections/SelectCards'
import MoreAbout from './landingPageSections/MoreAboutResumeAuthor'
import Footer from './landingPageSections/Footer'
import { login } from '../tools/auth'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { useNavigate } from 'react-router-dom'

const Hero = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'))

  const handleLogin = () => {
    if (!isAuthenticated) {
      login('/resume/import')
    } else {
      navigate('/resume/import')
    }
  }
  return (
    <div>
      <Container maxWidth='lg' sx={{ mt: 4, pb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            gap: { xs: '30px', md: '50px' },
            minHeight: { xs: 'auto', md: '60vh' }
          }}
        >
          <Box sx={{ flex: 1, width: '100%' }}>
            <Typography
              variant='h1'
              sx={{
                color: 'white',
                fontSize: { xs: '28px', sm: '32px', md: '40px' },
                fontWeight: 700,
                mb: 2,
                fontFamily: 'Poppins',
                lineHeight: { xs: '36px', sm: '40px', md: '50px' }
              }}
            >
              Prove your skills in a verifiable resume that employers trust.
            </Typography>
            <Typography
              sx={{
                color: 'white',
                mb: 4,
                fontSize: { xs: '16px', md: '18px' },
                fontWeight: '500',
                fonstFamily: 'Nunito sans'
              }}
            >
              Resume Author transforms resume bullet points into verified proof of your
              skills, turning your experiences into a compelling, trusted expression of
              who you are.
            </Typography>
            <Stack direction='row' spacing={2}>
              <Button
                variant='outlined'
                onClick={handleLogin}
                sx={{
                  color: '#4527A0',
                  bgcolor: 'white',
                  p: { xs: '8px 20px', md: '10px 30px' },
                  borderRadius: '100px',
                  textTransform: 'capitalize',
                  fontWeight: 700,
                  fonstFamily: 'Nunito Sans',
                  fontSize: { xs: '14px', md: '16px' },
                  whiteSpace: 'nowrap'
                }}
              >
                {!isAuthenticated
                  ? 'Login or Sign Up with Google Drive'
                  : 'Start Your Resume'}
              </Button>
            </Stack>

            <Typography
              sx={{
                mt: 4,
                color: 'rgba(255,255,255,0.7)',
                fontSize: { xs: '12px', md: '14px' },
                fontWeight: 700,
                fontFamily: 'Nunito Sans',
                cursor: 'pointer',
                '&:hover': {
                  color: 'rgba(255,255,255,1)'
                }
              }}
            >
              Created for you by the{' '}
              <Box
                component='span'
                sx={{
                  textDecoration: 'underline',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                US Chamber of Commerce Foundation T3 Innovation Network
              </Box>
              .
            </Typography>
          </Box>

          {!isMobile ? (
            <Box
              sx={{
                display: 'flex',
                gap: { sm: '15px', md: '27px' }
              }}
            >
              <Box
                component='img'
                src={HeroImage}
                alt='Construction worker'
                sx={{
                  width: { sm: 120, md: 200 },
                  height: { sm: 240, md: 400 },
                  borderRadius: '10px'
                }}
              />
              <Box
                component='img'
                src={HeroImage2}
                alt='Construction worker'
                sx={{
                  width: { sm: 120, md: 200 },
                  height: { sm: 240, md: 400 }
                }}
              />
              {!isTablet && (
                <Box
                  component='img'
                  src={HeroImage3}
                  alt='Construction worker'
                  sx={{ width: 200, height: 400 }}
                />
              )}
            </Box>
          ) : (
            <Box
              sx={{
                display: 'flex',
                gap: '15px',
                justifyContent: 'center',
                width: '100%'
              }}
            >
              <Box
                component='img'
                src={HeroImage}
                alt='Construction worker'
                sx={{ width: 120, height: 240, borderRadius: '10px' }}
              />
              <Box
                component='img'
                src={HeroImage2}
                alt='Construction worker'
                sx={{ width: 120, height: 240 }}
              />
            </Box>
          )}
        </Box>
      </Container>
      <HowItWorksSection />
      <WhoBenefitsSection />
      <HowResumeAuthorWorks />
      <SelectCards />
      <MoreAbout />
      <Footer />
    </div>
  )
}

export default Hero
