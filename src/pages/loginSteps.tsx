import { Box, Typography, Button, Link } from '@mui/material'
import { SVGLogoDescreption, SVGALoginLogo, SVGQRCode } from '../assets/svgs'
import { useState } from 'react'

const stepText = ['Step 1', 'Scan the QR Code']

const DescriptionText = [
  'To Sign Up with Learner Credential Wallet, you will need the app on your mobile device.',
  'If you have the Learner Credential Wallet installed on your phone, use your phone’s camera to scan this QR code to authorize Resume Author to store your credentials and resumes in Learner Credential Wallet.'
]

export default function LoginWithWallet() {
  const [step, setStep] = useState(0)
  const handleCancel = () => {
    // Placeholder for cancel logic
  }

  const handleLaunch = () => {
    // Placeholder for launch logic
  }

  const TypographyLink = ({ children, href }: any) => {
    return (
      <Link
        href={href}
        sx={{
          color: 'var(--Primary-Link, #2563EB)',
          fontFamily: '"Nunito Sans"',
          fontSize: '14px',
          fontStyle: 'normal',
          fontWeight: 700,
          lineHeight: 'normal',
          letterSpacing: '-0.14px',
          textDecoration: 'underline',
          textDecorationStyle: 'solid',
          textDecorationSkipInk: 'auto',
          textUnderlineOffset: 'auto',
          textUnderlinePosition: 'from-font',
          '&:hover': {
            opacity: 0.8
          }
        }}
      >
        {children}
      </Link>
    )
  }

  return (
    <Box sx={{ width: '100%', bgcolor: '#FFFFFF', minHeight: '100vh' }}>
      {/* Header Section */}
      <Box
        sx={{
          width: '100%',
          bgcolor: '#F7F9FC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          py: { xs: 3, md: 6 },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
            maxWidth: 'fit-content'
          }}
        >
          <Box
            sx={{
              transform: { xs: 'scale(0.8)', sm: 'scale(0.9)', md: 'scale(1)' }
            }}
          >
            <SVGALoginLogo />
          </Box>
          <Typography
            sx={{
              fontSize: { xs: 24, sm: 32, md: 40, lg: 48 },
              fontWeight: 700,
              color: '#44464D',
              textAlign: 'center',
              lineHeight: 1.2,
              fontFamily: 'Poppins'
            }}
          >
            {step === 0 ? 'Sign Up' : 'Login'} with Learner Credential Wallet
          </Typography>
        </Box>
      </Box>

      {/* Main Content Section */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'center',
          alignItems: { xs: 'center', md: 'flex-start' },
          px: { xs: 2, sm: 4, md: 8, lg: 25 },
          py: { xs: 4, md: 8 },
          gap: { xs: 6, md: 15 },
          bgcolor: '#FFFFFF'
        }}
      >
        {/* Left Section with Logo */}
        <Box
          sx={{
            width: { xs: '100%', sm: '80%', md: '40%' },
            maxWidth: { xs: 400, md: 'none' },
            transform: { xs: 'scale(0.9)', md: 'scale(1)' }
          }}
        >
          <SVGLogoDescreption />
          {step === 1 && (
            <Box
              sx={{
                bgcolor: '#E9E6F8',
                borderRadius: 2,
                '& .MuiOutlinedInput-input': { fontSize: 14 },
                mt: 2,
                p: '15px',
                width: '221px'
              }}
            >
              <Typography sx={{ fontSize: '14px', fontWeight: 400 }}>
                Need Learner Credential Wallet?
              </Typography>
              <TypographyLink href='#'>Go here to download and install</TypographyLink>
            </Box>
          )}
        </Box>

        {/* Right Section with QR Code */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: { xs: 'center', md: 'flex-start' }
          }}
        >
          <Typography
            sx={{
              fontSize: { xs: 20, sm: 24, md: 30 },
              fontWeight: 700,
              color: '#44464D',
              mb: 2,
              textAlign: { xs: 'center', md: 'left' },
              width: '100%',
              fontFamily: 'Poppins'
            }}
          >
            {stepText[step]}
          </Typography>

          <Typography
            sx={{
              color: '#2D2D47',
              fontSize: { xs: 14, sm: 18 },
              mb: 3,
              textAlign: { xs: 'center', md: 'left' },
              maxWidth: { xs: '100%', sm: '90%', md: '100%' },
              fontFamily: 'Nunito sans'
            }}
          >
            {DescriptionText[step]}
          </Typography>
          {step === 0 && (
            <Typography
              sx={{
                color: '#2D2D47',
                fontSize: { xs: 14, sm: 18 },
                mb: 3,
                textAlign: { xs: 'center', md: 'left' },
                maxWidth: { xs: '100%', sm: '90%', md: '100%' },
                fontFamily: 'Nunito sans'
              }}
            >
              To get started, scan this QR code with your phone’s camera to download and
              install the app from the app store. Once the app is installed, return here
              and select Continue:
            </Typography>
          )}

          <Box
            sx={{
              my: 3,
              transform: { xs: 'scale(0.9)', sm: 'scale(1)' },
              display: 'flex',
              justifyContent: { xs: 'center', md: 'flex-start' },
              width: '100%'
            }}
          >
            <SVGQRCode />
          </Box>

          {step === 1 && (
            <Typography
              sx={{
                color: '#2D2D47',
                fontSize: { xs: 14, sm: 18 },
                mb: 4,
                textAlign: { xs: 'center', md: 'left' },
                maxWidth: { xs: '100%', sm: '90%', md: '100%' },
                fontFamily: 'Nunito sans'
              }}
            >
              If your screen doesn’t automatically refresh 30 seconds after you consent,
              select the Launch Resume Author button to continue:
            </Typography>
          )}

          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexDirection: { xs: 'column', sm: 'row' },
              width: { xs: '100%', sm: 'auto' },
              alignItems: 'center',
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}
          >
            <Button
              onClick={handleCancel}
              variant='outlined'
              sx={{
                border: '2px solid #3A35A2',
                color: '#3A35A2',
                borderRadius: '50px',
                textTransform: 'none',
                fontWeight: 'bold',
                minWidth: { xs: '80%', sm: 120 },
                p: '21px 31px'
              }}
            >
              Cancel
            </Button>
            {step === 0 && (
              <Button
                onClick={() => {
                  setStep(1)
                }}
                variant='outlined'
                sx={{
                  border: '2px solid #3A35A2',
                  bgcolor: '#3A35A2',
                  color: '#FFF',
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  minWidth: { xs: '80%', sm: 200 },
                  p: '21px 31px'
                }}
              >
                Continue
              </Button>
            )}
            {step === 1 && (
              <Button
                onClick={handleLaunch}
                variant='outlined'
                sx={{
                  border: '2px solid #3A35A2',
                  bgcolor: '#FFF',
                  color: '#3A35A2',
                  borderRadius: '50px',
                  textTransform: 'none',
                  fontWeight: 700,
                  minWidth: { xs: '80%', sm: 200 },
                  p: '21px 31px'
                }}
              >
                Launch Resume Author
              </Button>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
