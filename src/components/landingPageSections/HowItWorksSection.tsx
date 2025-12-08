import { Box, Typography, useMediaQuery, useTheme } from '@mui/material'
import { SVGYellowAdd, SVGResume, SVGFile, SVGVerefied, SVGVe } from '../../assets/svgs'

const HowItWorksSection = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const sectionData = [
    {
      title: 'Import data from your existing resume or start with a blank template.',
      icon: <SVGFile />,
      color: '#5BC930',
      fontFamily: 'Nunito Sans',
      fontWeight: 500
    },
    {
      title: 'Preview your resume and make any changes before finalizing.',
      icon: <SVGResume />,
      color: '#44C4C4',
      fontFamily: 'Nunito Sans',
      fontWeight: 500
    },
    {
      title:
        'Add credentials, recommendations, or evidence of your skills to strengthen your resume.',
      icon: <SVGYellowAdd />,
      color: '#EAB037',
      fontFamily: 'Nunito Sans',
      fontWeight: 500
    },
    {
      title:
        'Sign and save a verifiable presentation of your resume to prove it was created by a human.',
      icon: <SVGVerefied />,
      color: '#404CC8',
      fontFamily: 'Nunito Sans',
      fontWeight: 500
    }
  ]
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        p: { xs: '40px 20px', sm: '50px 40px', md: '76px 93px 20px 93px' },
        backgroundColor: '#FFFFFF',
        justifyContent: { xs: 'center', md: 'space-between' },
        alignItems: { xs: 'center', md: 'flex-start' },
        position: 'relative',
        gap: { xs: '30px', md: '0' }
      }}
    >
      <Typography
        sx={{
          width: { xs: '100%', md: '30%' },
          color: '#282488',
          fontSize: { xs: '32px', sm: '36px', md: '45px' },
          fontWeight: 600,
          fontFamily: 'Poppins',
          lineHeight: { xs: '40px', sm: '45px', md: '52px' },
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        A better way to build a resume
      </Typography>
      <Box
        sx={{
          display: 'flex',
          width: { xs: '100%', md: '65%' },
          flexWrap: 'wrap',
          justifyContent: { xs: 'center', md: 'space-between' }
        }}
      >
        {sectionData.map((section, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: '20px', md: '32px' },
              width: { xs: '100%', sm: '45%' },
              mb: '50px',
              flexDirection: { xs: isMobile ? 'column' : 'row', md: 'row' }
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: '20px',
                border: `2px solid ${section.color}`,
                p: { xs: '15px', md: '20px' }
              }}
            >
              {section.icon}
            </Box>
            <Typography
              sx={{
                fontFamily: section.fontFamily,
                fontWeight: section.fontWeight,
                textAlign: { xs: isMobile ? 'center' : 'left', md: 'left' },
                fontSize: { xs: '14px', sm: '14px', md: '16px' }
              }}
            >
              {section.title}
            </Typography>
          </Box>
        ))}
      </Box>
      {!isMobile && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '0',
            zIndex: 111,
            display: { xs: 'none', md: 'block' }
          }}
        >
          <SVGVe />
        </Box>
      )}
    </Box>
  )
}
export default HowItWorksSection
