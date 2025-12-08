import React from 'react'
import {
  Box,
  Container,
  Typography,
  styled,
  useMediaQuery,
  useTheme
} from '@mui/material'
import image1 from '../../assets/Rectangle 5573-2.png'
import image2 from '../../assets/Rectangle 5573-3.png'
import image3 from '../../assets/Rectangle 5573-4.png'
import { SVGBihVerefied, SVGVe2 } from '../../assets/svgs'

const BenefitItem = styled(Container)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'center',
  gap: '60px',
  [theme.breakpoints.down('md')]: {
    flexDirection: 'column !important',
    alignItems: 'center',
    gap: '30px',
    padding: '0 20px'
  }
}))

const BenefitsSection = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const sectionData = [
    {
      title: 'All Skills Count',
      text: (
        <>
          All Skills Count means any skill you have developed can be made into a
          verifiable credential - whether it was earned on the job or through other life
          experiences. You can claim any skill using
          <span
            style={{
              color: '#2563EB',
              fontFamily: 'Nunito Sans',
              fontSize: isMobile ? '18px' : '26px',
              fontStyle: 'normal',
              fontWeight: 700,
              lineHeight: isMobile ? '30px' : '40px',
              letterSpacing: '-0.26px',
              textDecoration: 'underline',
              textDecorationStyle: 'solid',
              textDecorationSkipInk: 'none',
              textUnderlineOffset: 'auto',
              textUnderlinePosition: 'from-font'
            }}
          >
            LinkedCreds Author
          </span>
          and link to them from within your resume using the Resume Author editor.
        </>
      ),
      color: '#EAB037',
      img: image1
    },
    {
      title: 'Tell Your Unique Story',
      text: 'Showcase your journey by highlighting your skills and experiences as verified credentials within your resume. Whether gained through work, volunteering, or life experiences, you can seamlessly add them to your resume with Resume Author, creating a complete and authentic representation of who you are.',
      color: '#53D221',
      img: image2
    },
    {
      title: 'Share a Verifiable Presentation of Your Resume',
      text: 'Publish your verifiable resume on LinkedIn or send it directly to employers. With AI ever on the rise, recruiters and hiring managers want to know candidates are real. Leap ahead of others with verifiable proof that your resume and the skills you claim are real and backed by evidence.',
      color: '#3A35A2',
      img: image3
    }
  ]

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#F7F9FC',
        alignItems: 'center',
        gap: { xs: '20px', md: '30px' },
        p: { xs: '60px 20px', sm: '80px 30px', md: '130px 0' },
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <Typography
        sx={{
          color: '#292489',
          textAlign: 'center',
          fontFamily: 'Poppins',
          fontSize: { xs: '32px', sm: '42px', md: '55px' },
          fontWeight: 600,
          lineHeight: { xs: '40px', sm: '50px', md: '62px' },
          px: { xs: 2, sm: 3 }
        }}
      >
        Why choose Resume Author?
      </Typography>
      <Typography
        sx={{
          color: '#000',
          textAlign: 'center',
          fontFamily: 'Nunito Sans',
          fontSize: { xs: '20px', sm: '24px', md: '32px' },
          fontWeight: 500,
          lineHeight: 'normal',
          letterSpacing: '-0.32px',
          mb: { xs: '40px', md: '70px' },
          px: { xs: 2, sm: 3 }
        }}
      >
        Empowering you to showcase your skills through a tamper-proof verifable resume.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: { xs: '40px', md: '60px' },
          mb: { xs: '40px', md: '70px' },
          width: '100%'
        }}
      >
        {sectionData.map((section, index) => (
          <BenefitItem
            key={index}
            sx={{
              flexDirection:
                section.title === 'Tell Your Unique Story' ? 'row-reverse' : 'row'
            }}
          >
            <img
              src={section.img}
              alt='img'
              style={{
                width: isMobile ? '300px' : isTablet ? '400px' : '500px',
                height: 'auto',
                maxWidth: '100%',
                objectFit: 'contain'
              }}
            />
            <Box sx={{ maxWidth: { xs: '100%', md: '50%' } }}>
              <Typography
                sx={{
                  fontSize: { xs: '22px', sm: '26px', md: '30px' },
                  color: '#292489',
                  fontFamily: 'Poppins',
                  fontWeight: 700,
                  letterSpacing: '-0.3px',
                  mb: '20px',
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                {section.title}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: '16px', sm: '20px', md: '26px' },
                  color: '#2E2E48',
                  fontFamily: 'Nunito Sans',
                  fontWeight: 500,
                  lineHeight: { xs: '24px', sm: '30px', md: '40px' },
                  letterSpacing: '-0.26px',
                  textAlign: { xs: 'center', md: 'left' }
                }}
              >
                {section.text}
              </Typography>
            </Box>
          </BenefitItem>
        ))}
      </Box>

      <Container
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'center',
          justifyContent: 'center',
          gap: { xs: '20px', md: '30px' },
          px: { xs: 2, md: 4 }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            width: { xs: '100%', md: 'auto' }
          }}
        >
          <SVGBihVerefied />
        </Box>
        <Typography
          sx={{
            color: '#3A35A2',
            textAlign: 'center',
            fontFamily: 'Poppins',
            fontSize: { xs: '24px', sm: '30px', md: '40px' },
            fontWeight: 600,
            lineHeight: 'normal'
          }}
        >
          No matter your background, Resume Author helps you stand out with a verifiable
          resume.
        </Typography>
      </Container>
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: '26%',
            right: '0',
            zIndex: 111,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <SVGVe2 />
        </Box>
      )}
    </Box>
  )
}

export default BenefitsSection
