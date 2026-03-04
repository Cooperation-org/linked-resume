import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { setSelectedResume } from '../redux/slices/resume'
import { extractTextFromPDF } from '../utils/pdfExtractor'
import { parseResumeWithGemini } from '../services/geminiService'
import { transformGeminiResponseToResume, transformVCToResume } from '../utils/resumeTransformers'

export function useResumeUpload() {
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
    setUrl('https://linkedcreds.allskillscount.org/api/credential-raw/1nJczh7i0Ogp7ztADjdMisajja9CviDmJ')
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
            throw new Error(
              "Unable to fetch data due to CORS restrictions. This usually happens when the credential server doesn't allow cross-origin requests. Please contact the credential provider or try a different URL."
            )
          }
        }
      }

      if (!vcData || !vcData.credentialSubject || !vcData.credentialSubject.person) {
        throw new Error(
          'Invalid credential format: Missing required fields. Please ensure the URL returns a valid verifiable credential.'
        )
      }

      const transformedResume = transformVCToResume(vcData)
      dispatch(setSelectedResume(transformedResume))

      const tempId = `temp-${Date.now()}`
      const draftKey = `resume_draft_${tempId}`
      const draftWithTimestamp = {
        ...transformedResume,
        localStorageLastUpdated: new Date().toISOString(),
        isTemporaryImport: true,
        originalUrl: url
      }
      localStorage.setItem(draftKey, JSON.stringify(draftWithTimestamp))

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
      if (file.type !== 'application/pdf') {
        setError('Please select a valid PDF file')
        return
      }
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
      const pdfText = await extractTextFromPDF(selectedFile)

      if (!pdfText || pdfText.trim().length === 0) {
        throw new Error(
          'No text could be extracted from the PDF. The PDF may be scanned or image-based.'
        )
      }

      setLoadingStep('Parsing resume with AI...')
      const geminiResponse = await parseResumeWithGemini(pdfText)

      setLoadingStep('Processing resume data...')
      const transformedResume = transformGeminiResponseToResume(geminiResponse)

      dispatch(setSelectedResume(transformedResume))

      const tempId = `temp-${Date.now()}`
      const draftKey = `resume_draft_${tempId}`
      const draftWithTimestamp = {
        ...transformedResume,
        localStorageLastUpdated: new Date().toISOString(),
        isTemporaryImport: true,
        originalFile: selectedFile.name
      }
      localStorage.setItem(draftKey, JSON.stringify(draftWithTimestamp))

      navigate(`/resume/new?id=${tempId}`)
    } catch (err) {
      console.error('Error processing PDF:', err)
      let errorMessage = 'Failed to process PDF resume'

      if (err instanceof Error) {
        if (err.message.includes('API key') || err.message.includes('Gemini API key')) {
          errorMessage =
            'Gemini API key is not configured. Please contact the administrator or check your environment variables.'
        } else if (
          err.message.includes('password') ||
          err.message.includes('encrypted')
        ) {
          errorMessage =
            'This PDF is password-protected. Please provide an unencrypted PDF file.'
        } else if (
          err.message.includes('Invalid PDF') ||
          err.message.includes('No text')
        ) {
          errorMessage = err.message
        } else if (err.message.includes('Rate limit')) {
          errorMessage = 'API rate limit exceeded. Please wait a moment and try again.'
        } else if (
          err.message.includes('Network error') ||
          err.message.includes('fetch')
        ) {
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

  return {
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
  }
}
