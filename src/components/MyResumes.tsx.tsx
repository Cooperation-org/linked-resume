import { Box, Typography, Button, Paper } from '@mui/material'
import ResumeCard from './ResumeCard'
import { useDispatch } from 'react-redux'
import { RootState, AppDispatch } from '../redux/store'
import { useAppSelector } from '../redux/hooks'
import { useEffect } from 'react'
import { fetchUserResumes } from '../redux/slices/myresumes'
import { refreshAccessToken } from '../tools/auth'
import { getLocalStorage } from '../tools/cookie'

const ResumeScreen: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { signed, unsigned, status, error } = useAppSelector(
    (state: RootState) => state.resumeLibrary
  )

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        await dispatch(fetchUserResumes()).unwrap()
      } catch (error) {
        console.error('Error fetching resumes:', error)

        if (
          error instanceof Error &&
          /auth|token|credential|OAuth|authentication/i.test(error.message)
        ) {
          try {
            const refreshToken = getLocalStorage('refresh_token')
            if (refreshToken) {
              await refreshAccessToken(refreshToken)

              dispatch(fetchUserResumes())
            }
          } catch (refreshError) {
            console.error('Error refreshing token:', refreshError)
          }
        }
      }
    }

    fetchResumes()
  }, [dispatch])
  const handleRetryWithRefresh = async () => {
    try {
      const refreshToken = getLocalStorage('refresh_token')
      if (refreshToken) {
        await refreshAccessToken(refreshToken)
      }
      dispatch(fetchUserResumes())
    } catch (error) {
      console.error('Error refreshing token:', error)
    }
  }

  const renderErrorMessage = () => {
    if (
      error?.includes('invalid authentication credentials') ||
      error?.includes('OAuth') ||
      error?.includes('Access token not found') ||
      error?.includes('access token not found')
    ) {
      return (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{ mb: 2, color: '#2E2E48', fontFamily: 'Nunito Sans' }}
          >
            Session Expired
          </Typography>
          <Typography sx={{ mb: 3, fontFamily: 'Nunito Sans' }}>
            It looks like your login session has expired. Please sign in again to access
            your resumes.
          </Typography>
          <Button
            variant='contained'
            sx={{
              bgcolor: '#4F46E5',
              borderRadius: '40px',
              '&:hover': { bgcolor: '#3f38b5' }
            }}
            onClick={() => (window.location.href = '/')}
          >
            Sign In
          </Button>
        </Paper>
      )
    } else if (
      error?.includes('Root folder') ||
      (error?.includes('not found') &&
        !error?.includes('token') &&
        !error?.includes('Access'))
    ) {
      return (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{ mb: 2, color: '#2E2E48', fontFamily: 'Nunito Sans' }}
          >
            Time to Create Your First Resume!
          </Typography>
          <Typography sx={{ mb: 3, fontFamily: 'Nunito Sans' }}>
            Welcome! Looks like you're new here. Start your journey by creating your first
            professional resume.
          </Typography>
          <Button
            variant='contained'
            sx={{
              bgcolor: '#4F46E5',
              borderRadius: '40px',
              '&:hover': { bgcolor: '#3f38b5' }
            }}
            onClick={() => {
              window.location.href = '/resume/new'
            }}
          >
            Create Your First Resume
          </Button>
        </Paper>
      )
    } else {
      return (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography
            variant='h6'
            sx={{ mb: 2, color: '#2E2E48', fontFamily: 'Nunito Sans' }}
          >
            Oops! Something Went Wrong
          </Typography>
          <Typography sx={{ mb: 3, fontFamily: 'Nunito Sans' }}>
            We're having trouble retrieving your resumes right now. Please try again in a
            moment.
          </Typography>
          <Button
            variant='contained'
            sx={{
              bgcolor: '#4F46E5',
              borderRadius: '40px',
              '&:hover': { bgcolor: '#3f38b5' }
            }}
            onClick={handleRetryWithRefresh}
          >
            Try Again
          </Button>
        </Paper>
      )
    }
  }

  const renderEmptyState = () => {
    return (
      <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <Typography
          variant='h6'
          sx={{ mb: 2, color: '#2E2E48', fontFamily: 'Nunito Sans' }}
        >
          No Resumes Yet
        </Typography>
        <Typography sx={{ mb: 3, fontFamily: 'Nunito Sans' }}>
          You haven't created any resumes yet. Get started by creating your first resume.
        </Typography>
        <Button
          variant='contained'
          sx={{
            bgcolor: '#4F46E5',
            borderRadius: '40px',
            '&:hover': { bgcolor: '#3f38b5' }
          }}
          onClick={() => {
            window.location.href = '/resume/new'
          }}
        >
          Create Your First Resume
        </Button>
      </Paper>
    )
  }

  const shouldShowCreateButton = !(
    (status === 'failed' &&
      (error?.includes('Root folder') || error?.includes('not found'))) ||
    (status === 'succeeded' && signed.length + unsigned.length === 0)
  )

  return (
    <Box
      sx={{
        mx: 'auto',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
        marginInline: 3,
        gap: 2
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
          mt: 2
        }}
      >
        <Typography
          variant='h4'
          sx={{ color: '#2E2E48', fontWeight: 700, fontFamily: 'Nunito Sans' }}
        >
          My Resumes
        </Typography>
        {shouldShowCreateButton && (
          <button
            style={{
              background: '#4F46E5',
              padding: '0.7rem 1rem',
              borderRadius: '40px',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'none'
            }}
            onClick={() => {
              window.location.href = '/resume/new'
            }}
          >
            Create new resume
          </button>
        )}
      </Box>

      {status === 'loading' && (
        <Paper elevation={0} sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant='h6' sx={{ color: '#2E2E48', fontFamily: 'Nunito Sans' }}>
            Loading your resumes...
          </Typography>
        </Paper>
      )}

      {status === 'failed' && renderErrorMessage()}

      {status === 'succeeded' && signed.length > 0 && (
        <>
          {signed.map(resume => (
            <ResumeCard
              key={resume?.id}
              id={resume?.id}
              title={
                resume?.content?.credentialSubject?.person?.name?.formattedName ||
                'Untitled (Signed)'
              }
              date={new Date(
                resume?.content?.issuanceDate || Date.now()
              ).toLocaleDateString()}
              credentials={0}
              isDraft={false}
              resume={resume}
            />
          ))}
        </>
      )}

      {status === 'succeeded' && unsigned.length > 0 && (
        <>
          {unsigned.map(resume => (
            <ResumeCard
              key={resume.id}
              id={resume.id}
              title={resume?.content?.contact?.fullName?.split('.')[0]}
              date={new Date().toLocaleDateString()}
              credentials={0}
              isDraft={true}
              resume={resume}
            />
          ))}
        </>
      )}

      {status === 'succeeded' &&
        signed.length + unsigned.length === 0 &&
        renderEmptyState()}
    </Box>
  )
}

export default ResumeScreen
