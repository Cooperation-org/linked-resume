import { Box, Button, Typography } from '@mui/material'
import { login } from '../../tools/auth'

interface AuthErrorDisplayProps {
  error: string
  buttonStyles: React.CSSProperties
}

const AuthErrorDisplay: React.FC<AuthErrorDisplayProps> = ({ error, buttonStyles }) => {
  const isAuthError =
    error === 'Please log in to view your resumes.' ||
    error === 'You need to sign in to view your resumes.' ||
    error.includes('No authentication token found') ||
    error.includes('Authentication expired') ||
    error.includes('Session expired') ||
    error.includes('Please sign in')

  const handleLogin = () => {
    login('/myresumes')
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '400px',
        textAlign: 'center',
        gap: 3
      }}
    >
      <Typography
        variant='h5'
        sx={{
          color: '#2E2E48',
          fontWeight: 600,
          mb: 2
        }}
      >
        {isAuthError ? 'Sign in to Access Your Resumes' : 'Something went wrong'}
      </Typography>

      {isAuthError && (
        <>
          <Typography
            variant='body1'
            sx={{
              color: '#666',
              maxWidth: '400px',
              mb: 3
            }}
          >
            Please sign in to view and manage your resumes. If you don't have an account,
            you can create one to get started.
          </Typography>
          <Button
            onClick={handleLogin}
            style={{
              ...buttonStyles,
              display: 'inline-block',
              textDecoration: 'none'
            }}
          >
            Sign In
          </Button>
        </>
      )}

      {!isAuthError && (
        <Typography
          variant='body1'
          sx={{
            color: '#666',
            maxWidth: '400px'
          }}
        >
          {error}
        </Typography>
      )}
    </Box>
  )
}

export default AuthErrorDisplay
