import { Box, CircularProgress, Typography } from '@mui/material'

type PageLoaderProps = {
  message?: string
  minHeight?: number | string
}

const PageLoader = ({ message = 'Loading...', minHeight = '300px' }: PageLoaderProps) => (
  <Box
    sx={{
      width: '100%',
      minHeight,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'column',
      gap: 1.5
    }}
  >
    <CircularProgress />
    <Typography variant='body2' color='text.secondary'>
      {message}
    </Typography>
  </Box>
)

export default PageLoader

