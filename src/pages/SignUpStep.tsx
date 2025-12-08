import { Box, Typography, Button } from '@mui/material'
import { SVGLogoDescreption, SVGALoginLogo, SVGQRCode } from '../assets/svgs'
import { useNavigate } from 'react-router-dom'

export default function SignUpStep() {
  const navigate = useNavigate()

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
          <Box sx={{ transform: { xs: 'scale(0.8)', sm: 'scale(0.9)', md: 'scale(1)' } }}>
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
            Sign Up with Learner Credential Wallet
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
        </Box>

        {/* Right Section */}
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
            Step 1
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
            To Sign Up with Learner Credential Wallet, you will need the app on your
            mobile device.
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
            To get started, scan this QR code with your phone's camera to{' '}
            <Box
              component='span'
              sx={{
                color: 'var(--Text-Primary-Text, #2E2E48)',
                fontFamily: '"Nunito Sans"',
                fontSize: 18,
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
                letterSpacing: '-0.18px',
                display: 'inline'
              }}
            >
              download and install the app
            </Box>{' '}
            from the app store. Once the app is installed, return here and select{' '}
            <Box
              component='span'
              sx={{
                color: 'var(--Text-Primary-Text, #2E2E48)',
                fontFamily: '"Nunito Sans"',
                fontSize: 18,
                fontStyle: 'normal',
                fontWeight: 700,
                lineHeight: 'normal',
                letterSpacing: '-0.18px',
                display: 'inline'
              }}
            >
              Continue
            </Box>
            :
          </Typography>

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
              onClick={() => navigate('/')}
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
            <Button
              onClick={() => navigate('/SignUp2')}
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
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
