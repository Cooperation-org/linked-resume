import {
  Box,
  TextField,
  Typography,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import { styled } from '@mui/system'
import { Button } from '../components/ui/Button'
import { useResumeUpload } from '../hooks/useResumeUpload'

const Container = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
  backgroundColor: '#FFFFFF',
  padding: '20px'
}))

const FormContainer = styled(Box)(() => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '20px',
  width: '100%',
  maxWidth: '600px',
  padding: '40px',
  borderRadius: '10px',
  border: '1px solid #E1E5E9',
  backgroundColor: '#FFFFFF',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
}))





export default function ResumeUploadPage() {
  const {
    uploadMode,
    url,
    setUrl,
    selectedFile,
    isLoading,
    error,
    loadingStep,
    fileInputRef,
    handleTestSample,
    handleSubmit,
    handleCancel,
    handleFileChange,
    handlePDFUpload,
    handleTabChange
  } = useResumeUpload()

  return (
    <Container>
      <FormContainer>
        <Typography
          variant='h4'
          sx={{
            color: '#07142B',
            textAlign: 'center',
            fontFamily: 'Poppins',
            fontSize: '32px',
            fontWeight: 600,
            mb: 2
          }}
        >
          Upload Resume
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={uploadMode} onChange={handleTabChange} centered>
            <Tab label='From URL' value='url' disabled={isLoading} />
            <Tab label='From PDF File' value='pdf' disabled={isLoading} />
          </Tabs>
        </Box>

        {uploadMode === 'url' ? (
          <>
            <Typography
              variant='body1'
              sx={{
                color: '#1F2937',
                textAlign: 'center',
                fontSize: '16px',
                mb: 3
              }}
            >
              Enter the URL of your verifiable credential to import your resume data
            </Typography>

            <Box sx={{ mb: 3, p: 2, backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
              <Typography
                variant='body2'
                sx={{ color: '#374151', mb: 1, fontWeight: 600 }}
              >
                💡 Tips for success:
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}
              >
                • Make sure the URL is publicly accessible
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}
              >
                • The URL should return a verifiable credential in JSON format
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px' }}>
                • If you encounter CORS errors, the system will automatically try proxy
                solutions
              </Typography>
            </Box>

            <form onSubmit={handleSubmit}>
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  fullWidth
                  label='Resume URL'
                  placeholder='https://example.com/api/credential-raw/your-credential-id'
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  disabled={isLoading}
                  variant='outlined'
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: '8px'
                    }
                  }}
                />
                <Button
                  type='button'
                  onClick={handleTestSample}
                  disabled={isLoading}
                  sx={{
                    minWidth: '120px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    textTransform: 'none',
                    fontSize: '14px',
                    fontWeight: 500,
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    '&:hover': {
                      backgroundColor: '#E5E7EB'
                    }
                  }}
                >
                  Use Sample
                </Button>
              </Box>

              {error && (
                <Alert severity='error' sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                <Button
                  type='button'
                  onClick={handleCancel}
                  sx={{
                    color: '#6B7280',
                    textTransform: 'none',
                    fontSize: '16px',
                    fontWeight: 600,
                    padding: '12px 24px',
                    borderRadius: '8px',
                    border: '1px solid #D1D5DB',
                    '&:hover': {
                      backgroundColor: '#F9FAFB'
                    }
                  }}
                  disabled={isLoading}
                >
                  Cancel
                </Button>

                <Button
                  type='submit'
                  disabled={isLoading || !url.trim()}
                  isLoading={isLoading}
                >
                  Import Resume
                </Button>
              </Box>
            </form>
          </>
        ) : (
          <>
            <Typography
              variant='body1'
              sx={{
                color: '#1F2937',
                textAlign: 'center',
                fontSize: '16px',
                mb: 3
              }}
            >
              Upload a PDF resume file and we'll automatically extract and parse your
              information
            </Typography>

            <Box sx={{ mb: 3, p: 2, backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
              <Typography
                variant='body2'
                sx={{ color: '#374151', mb: 1, fontWeight: 600 }}
              >
                💡 Tips for best results:
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}
              >
                • Use a text-based PDF (not scanned images)
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}
              >
                • PDFs in any language are supported
              </Typography>
              <Typography
                variant='body2'
                sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}
              >
                • Maximum file size: 20MB
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px' }}>
                • The AI will extract contact info, experience, education, skills, and
                more
              </Typography>
            </Box>

            <Box sx={{ mb: 2 }}>
              <input
                type='file'
                accept='application/pdf'
                onChange={handleFileChange}
                ref={fileInputRef}
                disabled={isLoading}
                style={{ display: 'none' }}
                id='pdf-file-input'
              />
              <label htmlFor='pdf-file-input'>
                <Button
                  component='span'
                  variant='outlined'
                  fullWidth
                  disabled={isLoading}
                  sx={{
                    py: 2,
                    borderStyle: 'dashed',
                    borderWidth: 2,
                    borderColor: selectedFile ? '#2563EB' : '#D1D5DB',
                    color: selectedFile ? '#2563EB' : '#6B7280',
                    textTransform: 'none',
                    fontSize: '16px',
                    '&:hover': {
                      borderColor: '#2563EB',
                      backgroundColor: '#F3F4F6'
                    }
                  }}
                >
                  {selectedFile ? selectedFile.name : 'Choose PDF File'}
                </Button>
              </label>
            </Box>

            {error && (
              <Alert severity='error' sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loadingStep && (
              <Alert severity='info' sx={{ mb: 2 }}>
                {loadingStep}
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Button
                type='button'
                onClick={handleCancel}
                sx={{
                  color: '#6B7280',
                  textTransform: 'none',
                  fontSize: '16px',
                  fontWeight: 600,
                  padding: '12px 24px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  '&:hover': {
                    backgroundColor: '#F9FAFB'
                  }
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>

              <Button
                type='button'
                onClick={handlePDFUpload}
                disabled={isLoading || !selectedFile}
                isLoading={isLoading}
              >
                Upload & Parse Resume
              </Button>
            </Box>
          </>
        )}
      </FormContainer>
    </Container>
  )
}
