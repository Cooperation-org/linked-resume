import React, { useState, useRef } from 'react'
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material'
import { styled } from '@mui/system'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSelectedResume } from '../redux/slices/resume'
import { extractTextFromPDF } from '../utils/pdfExtractor'
import { parseResumeWithGemini } from '../services/geminiService'

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

const StyledButton = styled(Button)(() => ({
  backgroundColor: '#2563EB',
  color: '#FFFFFF',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#1d4ed8'
  },
  '&:disabled': {
    backgroundColor: '#9CA3AF',
    color: '#FFFFFF'
  }
}))

// Function to generate unique ID for resume items
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Function to transform Gemini response to resume format
const transformGeminiResponseToResume = (geminiData: any) => {
  // Ensure we have a valid structure
  if (!geminiData) {
    throw new Error('Invalid response from Gemini API')
  }

  const transformedResume = {
    id: geminiData.id || '',
    lastUpdated: geminiData.lastUpdated || new Date().toISOString(),
    name: geminiData.name || geminiData.contact?.fullName || 'Untitled Resume',
    version: geminiData.version || 1,
    contact: {
      fullName: geminiData.contact?.fullName || '',
      email: geminiData.contact?.email || '',
      phone: geminiData.contact?.phone || '',
      location: {
        street: geminiData.contact?.location?.street || '',
        city: geminiData.contact?.location?.city || '',
        state: geminiData.contact?.location?.state || '',
        country: geminiData.contact?.location?.country || '',
        postalCode: geminiData.contact?.location?.postalCode || ''
      },
      socialLinks: {
        linkedin: geminiData.contact?.socialLinks?.linkedin || '',
        github: geminiData.contact?.socialLinks?.github || '',
        portfolio: geminiData.contact?.socialLinks?.portfolio || '',
        instagram: geminiData.contact?.socialLinks?.instagram || ''
      }
    },
    summary: geminiData.summary || '',
    experience: {
      items: (geminiData.experience?.items || []).map((exp: any) => ({
        id: exp.id || generateId('exp'),
        title: exp.title || exp.position || '',
        position: exp.position || exp.title || '',
        company: exp.company || '',
        description: exp.description || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        stillEmployed: exp.stillEmployed || exp.currentlyEmployed || false,
        currentlyEmployed: exp.currentlyEmployed || exp.stillEmployed || false,
        duration: exp.duration || '',
        location: exp.location || '',
        verificationStatus: exp.verificationStatus || 'unverified'
      }))
    },
    education: {
      items: (geminiData.education?.items || []).map((edu: any) => ({
        id: edu.id || generateId('edu'),
        institution: edu.institution || '',
        degree: edu.degree || edu.type || '',
        type: edu.type || edu.degree || '',
        programName: edu.programName || edu.field || '',
        field: edu.field || edu.programName || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        duration: edu.duration || '',
        inProgress: edu.inProgress || edu.currentlyEnrolled || false,
        currentlyEnrolled: edu.currentlyEnrolled || edu.inProgress || false,
        awardEarned: edu.awardEarned || false,
        description: edu.description || '',
        verificationStatus: edu.verificationStatus || 'unverified'
      }))
    },
    skills: {
      items: (geminiData.skills?.items || []).map((skill: any) => ({
        id: skill.id || generateId('skill'),
        skills: skill.skills || skill.name || '',
        verificationStatus: skill.verificationStatus || 'unverified',
        credentialLink: skill.credentialLink || ''
      }))
    },
    projects: {
      items: (geminiData.projects?.items || []).map((project: any) => ({
        id: project.id || generateId('proj'),
        name: project.name || '',
        description: project.description || '',
        url: project.url || '',
        technologies: project.technologies || [],
        credentialLink: project.credentialLink || '',
        verificationStatus: project.verificationStatus || 'unverified'
      }))
    },
    certifications: {
      items: (geminiData.certifications?.items || []).map((cert: any) => ({
        id: cert.id || generateId('cert'),
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.issueDate || cert.date || '',
        expiryDate: cert.expiryDate || '',
        noExpiration: cert.noExpiration || false,
        url: cert.url || '',
        verificationStatus: cert.verificationStatus || 'unverified'
      }))
    },
    awards: {
      items: (geminiData.awards?.items || []).map((award: any) => ({
        id: award.id || generateId('award'),
        title: award.title || award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || '',
        verificationStatus: award.verificationStatus || 'unverified'
      }))
    },
    publications: {
      items: (geminiData.publications?.items || []).map((pub: any) => ({
        id: pub.id || generateId('pub'),
        title: pub.title || '',
        type: pub.type || 'Other',
        publisher: pub.publisher || '',
        publishedDate: pub.publishedDate || pub.date || '',
        authors: pub.authors || [],
        url: pub.url || '',
        verificationStatus: pub.verificationStatus || 'unverified'
      }))
    },
    professionalAffiliations: {
      items: (geminiData.professionalAffiliations?.items || []).map((aff: any) => ({
        id: aff.id || generateId('aff'),
        name: aff.name || '',
        organization: aff.organization || '',
        role: aff.role || '',
        startDate: aff.startDate || '',
        endDate: aff.endDate || '',
        duration: aff.duration || '',
        activeAffiliation: aff.activeAffiliation || false,
        verificationStatus: aff.verificationStatus || 'unverified'
      }))
    },
    volunteerWork: {
      items: (geminiData.volunteerWork?.items || []).map((vol: any) => ({
        id: vol.id || generateId('vol'),
        organization: vol.organization || '',
        role: vol.role || '',
        startDate: vol.startDate || '',
        endDate: vol.endDate || '',
        duration: vol.duration || '',
        currentlyVolunteering: vol.currentlyVolunteering || false,
        description: vol.description || '',
        location: vol.location || '',
        verificationStatus: vol.verificationStatus || 'unverified'
      }))
    },
    languages: {
      items: (geminiData.languages?.items || []).map((lang: any) => ({
        id: lang.id || generateId('lang'),
        name: lang.name || '',
        proficiency: lang.proficiency || 'Basic',
        verificationStatus: lang.verificationStatus || 'unverified'
      }))
    },
    hobbiesAndInterests: geminiData.hobbiesAndInterests || [],
    testimonials: {
      items: geminiData.testimonials?.items || []
    }
  }

  return transformedResume
}

// Function to transform VC data to resume format
const transformVCToResume = (vcData: any) => {
  const credentialSubject = vcData.credentialSubject
  const person = credentialSubject.person
  const contact = person.contact

  const transformedResume = {
    name: person.name?.formattedName || '',
    contact: {
      fullName: contact?.fullName || person.name?.formattedName || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      location: {
        street: contact?.location?.street || '',
        city: contact?.location?.city || '',
        state: contact?.location?.state || '',
        country: contact?.location?.country || '',
        postalCode: contact?.location?.postalCode || ''
      },
      socialLinks: {
        linkedin: contact?.socialLinks?.linkedin || '',
        github: contact?.socialLinks?.github || '',
        portfolio: contact?.socialLinks?.portfolio || '',
        twitter: contact?.socialLinks?.twitter || ''
      }
    },
    summary: credentialSubject.narrative?.text?.replace(/<[^>]*>/g, '') || '',
    experience: {
      items: (credentialSubject.employmentHistory || []).map((exp: any) => ({
        id: exp.id || `exp-${Date.now()}-${Math.random()}`,
        company: exp.organization?.tradeName || '',
        position: exp.title || '',
        title: exp.title || '',
        description: exp.description || '',
        duration: exp.duration || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        stillEmployed: exp.stillEmployed || false,
        verificationStatus: exp.verificationStatus || 'unverified'
      }))
    },
    education: {
      items: (credentialSubject.educationAndLearning || []).map((edu: any) => ({
        id: edu.id || `edu-${Date.now()}-${Math.random()}`,
        institution: edu.institution || '',
        type: edu.degree || '',
        programName: edu.fieldOfStudy || '',
        duration: edu.duration || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        inProgress: false,
        currentlyEnrolled: false,
        awardEarned: false,
        verificationStatus: edu.verificationStatus || 'unverified'
      }))
    },
    skills: {
      items: (credentialSubject.skills || []).map((skill: any) => ({
        id: skill.id || `skill-${Date.now()}-${Math.random()}`,
        skills: skill.name || '',
        verificationStatus: skill.verificationStatus || 'unverified'
      }))
    },
    certifications: {
      items: (credentialSubject.certifications || []).map((cert: any) => ({
        id: cert.id || `cert-${Date.now()}-${Math.random()}`,
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.date || '',
        url: cert.url || '',
        noExpiration: false,
        verificationStatus: cert.verificationStatus || 'unverified'
      }))
    },
    projects: {
      items: (credentialSubject.projects || []).map((project: any) => ({
        id: project.id || `proj-${Date.now()}-${Math.random()}`,
        name: project.name || '',
        description: project.description || '',
        url: project.url || '',
        duration: project.duration || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        verificationStatus: project.verificationStatus || 'unverified'
      }))
    },
    professionalAffiliations: {
      items: (credentialSubject.professionalAffiliations || []).map(
        (affiliation: any) => ({
          id: affiliation.id || `aff-${Date.now()}-${Math.random()}`,
          name: affiliation.name || '',
          organization: affiliation.organization || '',
          role: affiliation.name || '',
          startDate: affiliation.startDate || '',
          endDate: affiliation.endDate || '',
          duration: affiliation.duration || '',
          activeAffiliation: affiliation.activeAffiliation || false,
          verificationStatus: affiliation.verificationStatus || 'unverified'
        })
      )
    },
    volunteerWork: {
      items: (credentialSubject.volunteerWork || []).map((volunteer: any) => ({
        id: volunteer.id || `vol-${Date.now()}-${Math.random()}`,
        role: volunteer.role || '',
        organization: volunteer.organization || '',
        location: volunteer.location || '',
        startDate: volunteer.startDate || '',
        endDate: volunteer.endDate || '',
        duration: volunteer.duration || '',
        currentlyVolunteering: volunteer.currentlyVolunteering || false,
        description: volunteer.description || '',
        verificationStatus: volunteer.verificationStatus || 'unverified'
      }))
    },
    languages: {
      items: (credentialSubject.languages || []).map((lang: any) => ({
        id: lang.id || `lang-${Date.now()}-${Math.random()}`,
        name: lang.name || '',
        proficiency: lang.proficiency || ''
      }))
    },
    hobbiesAndInterests: credentialSubject.hobbiesAndInterests || []
  }

  return transformedResume
}

export default function ResumeUploadPage() {
  const [uploadMode, setUploadMode] = useState<'url' | 'pdf'>('url')
  const [url, setUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [loadingStep, setLoadingStep] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const handleTestSample = () => {
    setUrl(
      'https://linkedcreds.allskillscount.org/api/credential-raw/1nJczh7i0Ogp7ztADjdMisajja9CviDmJ'
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url.trim()) {
      setError('Please enter a valid URL')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      let vcData

      // Try direct fetch first
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
          },
          mode: 'cors'
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        vcData = await response.json()
      } catch (corsError) {
        

        // Use the backend server as a proxy
        try {
          const backendUrl =
            process.env.REACT_APP_SERVER_URL || 'https://linkedcreds.allskillscount.org'
          const proxyUrl = `${backendUrl}/api/proxy-credential?url=${encodeURIComponent(url)}`

          const proxyResponse = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json'
            }
          })

          if (!proxyResponse.ok) {
            throw new Error(`Backend proxy error! status: ${proxyResponse.status}`)
          }

          vcData = await proxyResponse.json()
        } catch (backendError) {
          

          // Fallback to public CORS proxy
          try {
            const publicProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`
            const publicProxyResponse = await fetch(publicProxyUrl)

            if (!publicProxyResponse.ok) {
              throw new Error(`Public proxy error! status: ${publicProxyResponse.status}`)
            }

            const publicProxyData = await publicProxyResponse.json()
            vcData = JSON.parse(publicProxyData.contents)
          } catch (publicProxyError) {
            // If all attempts fail, provide user-friendly error message
            throw new Error(
              "Unable to fetch data due to CORS restrictions. This usually happens when the credential server doesn't allow cross-origin requests. Please contact the credential provider or try a different URL."
            )
          }
        }
      }

      // Validate that it's a verifiable credential with the expected structure
      if (!vcData || !vcData.credentialSubject || !vcData.credentialSubject.person) {
        throw new Error(
          'Invalid credential format: Missing required fields. Please ensure the URL returns a valid verifiable credential.'
        )
      }

      // Transform the VC data to resume format
      const transformedResume = transformVCToResume(vcData)

      // Store the transformed data in Redux
      dispatch(setSelectedResume(transformedResume))

      // Generate a temporary ID for the new resume
      const tempId = `temp-${Date.now()}`

      // Save the data to localStorage so it persists on page reload
      const draftKey = `resume_draft_${tempId}`
      const draftWithTimestamp = {
        ...transformedResume,
        localStorageLastUpdated: new Date().toISOString(),
        isTemporaryImport: true, // Flag to indicate this is from URL import
        originalUrl: url // Store the original URL for reference
      }
      localStorage.setItem(draftKey, JSON.stringify(draftWithTimestamp))

      // Navigate to the resume editor with the loaded data
      navigate(`/resume/new?id=${tempId}`)
    } catch (err) {
      console.error('Error fetching resume data:', err)
      let errorMessage = 'Failed to fetch resume data from URL'

      if (err instanceof Error) {
        if (err.message.includes('CORS') || err.message.includes('cors')) {
          errorMessage =
            'CORS Error: The server does not allow cross-origin requests. Please contact the credential provider to enable CORS or use a different URL.'
        } else if (
          err.message.includes('NetworkError') ||
          err.message.includes('Failed to fetch')
        ) {
          errorMessage =
            'Network Error: Unable to connect to the URL. Please check your internet connection and ensure the URL is correct.'
        } else if (err.message.includes('Invalid credential format')) {
          errorMessage = err.message
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    navigate('/resume/import')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file')
        return
      }
      // Validate file size (max 20MB)
      if (file.size > 20 * 1024 * 1024) {
        setError('File size must be less than 20MB')
        return
      }
      setSelectedFile(file)
      setError('')
    }
  }

  const handlePDFUpload = async () => {
    if (!selectedFile) {
      setError('Please select a PDF file')
      return
    }

    setIsLoading(true)
    setError('')
    setLoadingStep('Extracting text from PDF...')

    try {
      // Step 1: Extract text from PDF
      const pdfText = await extractTextFromPDF(selectedFile)
      
      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error('No text could be extracted from the PDF. The PDF may be scanned or image-based.')
      }

      setLoadingStep('Parsing resume with AI...')

      // Step 2: Parse with Gemini API
      const geminiResponse = await parseResumeWithGemini(pdfText)

      setLoadingStep('Processing resume data...')

      // Step 3: Transform Gemini response to resume format
      const transformedResume = transformGeminiResponseToResume(geminiResponse)

      // Step 4: Store in Redux
      dispatch(setSelectedResume(transformedResume))

      // Step 5: Generate temporary ID and save to localStorage
      const tempId = `temp-${Date.now()}`
      const draftKey = `resume_draft_${tempId}`
      const draftWithTimestamp = {
        ...transformedResume,
        localStorageLastUpdated: new Date().toISOString(),
        isTemporaryImport: true,
        originalFile: selectedFile.name
      }
      localStorage.setItem(draftKey, JSON.stringify(draftWithTimestamp))

      // Step 6: Navigate to editor
      navigate(`/resume/new?id=${tempId}`)
    } catch (err) {
      console.error('Error processing PDF:', err)
      let errorMessage = 'Failed to process PDF resume'

      if (err instanceof Error) {
        if (err.message.includes('API key') || err.message.includes('Gemini API key')) {
          errorMessage =
            'Gemini API key is not configured. Please contact the administrator or check your environment variables.'
        } else if (err.message.includes('password') || err.message.includes('encrypted')) {
          errorMessage =
            'This PDF is password-protected. Please provide an unencrypted PDF file.'
        } else if (err.message.includes('Invalid PDF') || err.message.includes('No text')) {
          errorMessage = err.message
        } else if (err.message.includes('Rate limit')) {
          errorMessage =
            'API rate limit exceeded. Please wait a moment and try again.'
        } else if (err.message.includes('Network error') || err.message.includes('fetch')) {
          errorMessage =
            'Network error: Unable to connect to the AI service. Please check your internet connection and try again.'
        } else if (err.message.includes('parse') || err.message.includes('JSON')) {
          errorMessage =
            'Failed to parse the resume. The PDF may be in an unsupported format or contain complex layouts. Please try a different PDF or manually enter your resume.'
        } else {
          errorMessage = err.message
        }
      }

      setError(errorMessage)
      setLoadingStep('')
    } finally {
      setIsLoading(false)
      setLoadingStep('')
    }
  }

  const handleTabChange = (_event: React.SyntheticEvent, newValue: 'url' | 'pdf') => {
    setUploadMode(newValue)
    setError('')
    setUrl('')
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
              <Typography variant='body2' sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                💡 Tips for success:
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
                • Make sure the URL is publicly accessible
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
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

                <StyledButton
                  type='submit'
                  disabled={isLoading || !url.trim()}
                  startIcon={
                    isLoading ? <CircularProgress size={20} color='inherit' /> : null
                  }
                >
                  {isLoading ? 'Loading...' : 'Import Resume'}
                </StyledButton>
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
              Upload a PDF resume file and we'll automatically extract and parse your information
            </Typography>

            <Box sx={{ mb: 3, p: 2, backgroundColor: '#F3F4F6', borderRadius: '8px' }}>
              <Typography variant='body2' sx={{ color: '#374151', mb: 1, fontWeight: 600 }}>
                💡 Tips for best results:
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
                • Use a text-based PDF (not scanned images)
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
                • PDFs in any language are supported
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px', mb: 1 }}>
                • Maximum file size: 20MB
              </Typography>
              <Typography variant='body2' sx={{ color: '#6B7280', fontSize: '14px' }}>
                • The AI will extract contact info, experience, education, skills, and more
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

              <StyledButton
                type='button'
                onClick={handlePDFUpload}
                disabled={isLoading || !selectedFile}
                startIcon={
                  isLoading ? <CircularProgress size={20} color='inherit' /> : null
                }
              >
                {isLoading ? 'Processing...' : 'Upload & Parse Resume'}
              </StyledButton>
            </Box>
          </>
        )}
      </FormContainer>
    </Container>
  )
}
