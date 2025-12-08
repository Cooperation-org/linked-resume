import React from 'react'
import { Box, Typography, Divider, Button, useTheme, useMediaQuery } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import { SVGGitHub, SVGlisence, SVGCopyWriter } from '../../assets/svgs'

const StyledButton = ({ href, startIcon, children }) => (
  <Button
    href={href}
    startIcon={startIcon}
    sx={{
      color: '#2563EB',
      fontFamily: 'Nunito Sans',
      fontSize: { xs: '12px', sm: '14px' },
      fontWeight: 500,
      lineHeight: '40px',
      letterSpacing: '-0.26px',
      textDecoration: 'underline',
      textDecorationSkipInk: 'auto',
      textUnderlineOffset: 'auto',
      textUnderlinePosition: 'from-font',
      textTransform: 'none',
      padding: 0,
      minWidth: 0,
      '&:hover': {
        background: 'transparent'
      }
    }}
  >
    {children}
  </Button>
)

const Footer = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Box
      sx={{
        backgroundColor: '#E9E6F8',
        padding: { xs: '20px 15px', sm: '25px 30px', md: '30px 75px' }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: { xs: 'center', sm: 'flex-start' },
          alignItems: { xs: 'flex-start', sm: 'center' },
          gap: { xs: 2, sm: 3 },
          flexWrap: 'wrap',
          padding: { xs: '0 15px', sm: '0 30px' }
        }}
      >
        <Box display='flex' alignItems='center' gap={1}>
          <SVGCopyWriter />
          <Typography
            sx={{
              color: '#47516B',
              fontFamily: 'Nunito Sans',
              fontSize: { xs: '12px', sm: '14px' },
              fontWeight: 500,
              lineHeight: '40px',
              letterSpacing: '-0.26px'
            }}
          >
            Copyright, Creative Commons License BY 4.0
          </Typography>
        </Box>

        {!isMobile && <Divider orientation='vertical' flexItem />}

        <Box display='flex' justifyContent='center' alignItems='center' gap={1}>
          <SVGlisence />
          <StyledButton href='https://www.apache.org/licenses/LICENSE-2.0'>
            Apache 2 License
          </StyledButton>
        </Box>

        {!isMobile && <Divider orientation='vertical' flexItem />}

        <Box display='flex' alignItems='center' gap={1}>
          <SVGGitHub />
          <Typography
            sx={{
              color: '#47516B',
              fontFamily: 'Nunito Sans',
              fontSize: { xs: '12px', sm: '14px' },
              fontWeight: 500,
              lineHeight: '40px',
              letterSpacing: '-0.26px'
            }}
          >
            Source Code:
          </Typography>
          <StyledButton href='https://github.com/orgs/Cooperation-org/projects/4/views/1'>
            https://github.com/....
          </StyledButton>
        </Box>

        {!isMobile && <Divider orientation='vertical' flexItem />}

        <Button
          component={RouterLink}
          to='/privacy-policy'
          sx={{
            color: '#2563EB',
            fontFamily: 'Nunito Sans',
            fontSize: { xs: '12px', sm: '14px' },
            fontWeight: 500,
            lineHeight: '40px',
            letterSpacing: '-0.26px',
            textDecoration: 'underline',
            textDecorationSkipInk: 'auto',
            textUnderlineOffset: 'auto',
            textUnderlinePosition: 'from-font',
            textTransform: 'none',
            padding: 0,
            minWidth: 0,
            '&:hover': {
              background: 'transparent'
            }
          }}
        >
          Privacy Policy
        </Button>

        {!isMobile && <Divider orientation='vertical' flexItem />}

        <Box display='flex' alignItems='center'>
          <Typography
            sx={{
              color: '#47516B',
              fontFamily: 'Nunito Sans',
              fontSize: { xs: '12px', sm: '14px' },
              fontWeight: 500,
              lineHeight: '40px',
              letterSpacing: '-0.26px'
            }}
          >
            Contact Us:{' '}
            <a
              href='mailto:resumeauthor.support@allskillscount.org'
              style={{
                color: 'var(--Primary-Link, #2563EB)',
                fontFamily: 'Nunito Sans',
                fontSize: { xs: '14px', sm: '16px' },
                fontStyle: 'normal',
                fontWeight: 500,
                lineHeight: '40px',
                letterSpacing: '-0.16px',
                textDecorationLine: 'underline',
                textDecorationStyle: 'solid',
                textDecorationSkipInk: 'auto',
                textDecorationThickness: 'auto',
                textUnderlineOffset: 'auto',
                textUnderlinePosition: 'from-font'
              }}
            >
              resumeauthor.support@allskillscount.org
            </a>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}

export default Footer
