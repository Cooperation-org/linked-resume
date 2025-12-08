import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Container,
  useMediaQuery,
  useTheme,
  Fab,
  CardMedia
} from '@mui/material'

const LandingPage = () => {
  const theme = useTheme()
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Box component='main' sx={{ width: '100%' }}>
      {/* Hero Section */}
      <Box sx={{ background: '#FFFFFF', padding: { xs: '60px 20px', md: '80px 40px' } }}>
        <Container maxWidth='lg'>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
              gap: { xs: 4, md: 8 },
              alignItems: 'center'
            }}
          >
            {/* Left Content */}
            <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
              <Typography
                variant='h1'
                sx={{
                  fontSize: { xs: '2.5rem', md: '3.5rem', lg: '4rem' },
                  fontWeight: 800,
                  marginBottom: 3,
                  color: '#1A1A1A',
                  lineHeight: 1.2
                }}
              >
                Unleash Your Online Potential with Our Creative Web Agency
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '1.1rem', md: '1.25rem' },
                  marginBottom: 4,
                  color: '#666666',
                  lineHeight: 1.6
                }}
              >
                Let our creative web agency help you reach new heights online. From custom
                web design to development services, we've got the skills and experience to
                bring your vision to life.
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: { xs: 'center', md: 'flex-start' },
                  marginTop: 4
                }}
              >
                <Button
                  variant='contained'
                  href='#contact'
                  sx={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    backgroundColor: '#4C3AE3',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      backgroundColor: '#3929B4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(76, 58, 227, 0.3)'
                    }
                  }}
                >
                  Get in Touch
                </Button>
                <Button
                  variant='outlined'
                  href='#projects'
                  sx={{
                    padding: '12px 32px',
                    borderRadius: '8px',
                    borderColor: '#4C3AE3',
                    color: '#4C3AE3',
                    fontSize: '1rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#3929B4',
                      backgroundColor: 'rgba(76, 58, 227, 0.04)',
                      transform: 'translateY(-2px)'
                    }
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Box>

            {/* Right Content - Illustration */}
            <Box
              sx={{
                display: { xs: 'none', md: 'flex' },
                justifyContent: 'center',
                alignItems: 'center'
              }}
            >
              <Box
                component='img'
                src='/images/portfolio.svg'
                alt='Creative Web Design Illustration'
                sx={{
                  width: '100%',
                  maxWidth: '600px',
                  height: 'auto'
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* About Section */}
      <Box
        id='about'
        sx={{
          padding: { xs: '60px 20px', md: '80px 40px' },
          background: '#F8F9FA'
        }}
      >
        <Container maxWidth='md'>
          <Typography
            variant='h2'
            align='center'
            sx={{
              marginBottom: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              color: '#1A1A1A'
            }}
          >
            About T3 Innovation Network
          </Typography>
          <Typography
            sx={{
              fontSize: '1.2rem',
              lineHeight: 1.8,
              color: '#666666',
              textAlign: 'center'
            }}
          >
            The T3 Innovation Network is exploring emerging technologies and standards in
            the talent marketplace to create more equitable and effective learning and
            career pathways.
          </Typography>
        </Container>
      </Box>

      {/* Projects Section */}
      <Box
        id='projects'
        sx={{
          padding: { xs: '60px 20px', md: '80px 40px' },
          background: '#FFFFFF'
        }}
      >
        <Container maxWidth='lg'>
          <Typography
            variant='h2'
            align='center'
            sx={{
              marginBottom: 6,
              fontSize: { xs: '2rem', md: '3rem' },
              fontWeight: 700,
              color: '#1A1A1A'
            }}
          >
            Our Projects
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 4
            }}
          >
            {/* OpenCreds Project */}
            <Card
              sx={{
                height: '100%',
                borderRadius: '16px',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardMedia
                component='img'
                height='240'
                image='/images/opencreds.png'
                alt='OpenCreds Platform Preview'
                sx={{
                  objectFit: 'cover'
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant='h3'
                  sx={{
                    marginBottom: 2,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1A1A1A'
                  }}
                >
                  OpenCreds
                </Typography>
                <Typography sx={{ color: '#666666', fontSize: '1.1rem', mb: 3 }}>
                  A platform for issuing and managing verifiable credentials, enhancing
                  trust and transparency in the talent marketplace.
                </Typography>
                <Button
                  variant='contained'
                  href='https://www.opencreds.net/'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{
                    backgroundColor: '#4C3AE3',
                    '&:hover': {
                      backgroundColor: '#3929B4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(76, 58, 227, 0.3)'
                    }
                  }}
                >
                  Try Now
                </Button>
              </CardContent>
            </Card>

            {/* Resume Author Project */}
            <Card
              sx={{
                height: '100%',
                borderRadius: '16px',
                transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 12px 24px rgba(0,0,0,0.1)'
                }
              }}
            >
              <CardMedia
                component='img'
                height='240'
                image='images/reusmeauthor.png'
                alt='Resume Author Platform Preview'
                sx={{
                  objectFit: 'cover'
                }}
              />
              <CardContent sx={{ p: 4 }}>
                <Typography
                  variant='h3'
                  sx={{
                    marginBottom: 2,
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#1A1A1A'
                  }}
                >
                  Resume Author
                </Typography>
                <Typography sx={{ color: '#666666', fontSize: '1.1rem', mb: 3 }}>
                  A web-based tool to create and manage verifiable resumes, empowering
                  individuals to showcase their skills and experiences securely.
                </Typography>
                <Button
                  variant='contained'
                  href='https://resume-author.vercel.app/'
                  target='_blank'
                  rel='noopener noreferrer'
                  sx={{
                    backgroundColor: '#4C3AE3',
                    '&:hover': {
                      backgroundColor: '#3929B4',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(76, 58, 227, 0.3)'
                    }
                  }}
                >
                  Try Now
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Container>
      </Box>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Fab
          onClick={scrollToTop}
          aria-label='Scroll to top'
          sx={{
            position: 'fixed',
            bottom: '2rem',
            right: '2rem',
            backgroundColor: '#4C3AE3',
            color: '#FFFFFF',
            '&:hover': {
              backgroundColor: '#3929B4'
            }
          }}
        >
          ↑
        </Fab>
      )}
    </Box>
  )
}

export default LandingPage
