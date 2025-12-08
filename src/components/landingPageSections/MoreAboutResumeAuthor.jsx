import React from 'react'
import { Box, Typography, Card, CardMedia, CardContent } from '@mui/material'
import image from '../../assets/Resumes.png'
import image1 from '../../assets/Resumes-2.png'
import image2 from '../../assets/Resumes-3.png'

const MoreAbout = () => {
  const sectionData = [image, image1, image2]
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: '60px 20px', sm: '80px 30px', md: '130px' },
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
          marginBottom: { xs: '40px', md: '70px' },
          px: { xs: 2, sm: 3 }
        }}
      >
        Learn More About Resume Author
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', md: 'flex-start' },
          justifyContent: 'center',
          gap: { xs: '30px', md: '60px' },
          width: '100%',
          flexWrap: { sm: 'wrap' }
        }}
      >
        {sectionData.map((section, index) => (
          <Card
            key={index}
            sx={{
              maxWidth: { xs: '100%', sm: '300px', md: '345px' },
              width: { xs: '100%', sm: 'auto' },
              borderRadius: '20px 20px 0px 0px',
              mb: { xs: 3, sm: 0 }
            }}
          >
            <CardMedia
              sx={{ height: { xs: 120, md: 140 } }}
              image={section}
              title='green iguana'
            />
            <CardContent
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
                padding: { xs: '16px', md: '24px' }
              }}
            >
              <Typography
                sx={{
                  fontFamily: 'Nunito Sans',
                  fontWeight: 700,
                  fontSize: { xs: '18px', md: '20px' }
                }}
                gutterBottom
              >
                Headline
              </Typography>
              <Typography
                variant='body2'
                sx={{
                  fontFamily: 'Nunito Sans',
                  fontWeight: 500,
                  fontSize: { xs: '16px', md: '18px' },
                  color: 'text.secondary',
                  textAlign: 'left'
                }}
              >
                All Skills Count means any skill you have developed can be made into
                verifiable credential and embedded into your resume.
              </Typography>
              <Typography
                sx={{
                  color: '#2563EB',
                  fontFamily: 'Nunito Sans',
                  fontSize: { xs: '16px', md: '18px' },
                  fontWeight: 500,
                  letterSpacing: '-0.18px',
                  textDecoration: 'underline',
                  textDecorationSkipInk: 'none',
                  textUnderlineOffset: 'auto',
                  textUnderlinePosition: 'from-font',
                  mt: '10px'
                }}
              >
                Read more
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  )
}

export default MoreAbout
