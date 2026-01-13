import React, { useEffect, useState, useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Skeleton,
  Tabs,
  Tab
} from '@mui/material'
import { useParams } from 'react-router-dom'
import { GoogleDriveStorage } from '@cooperation/vc-storage'
import { getLocalStorage } from '../tools/cookie'
import ResumePreview from '../components/resumePreview'
import LaTeXResumePreview from '../components/LaTeXResumePreview'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ZoomInIcon from '@mui/icons-material/ZoomIn'
import ZoomOutIcon from '@mui/icons-material/ZoomOut'
import FitScreenIcon from '@mui/icons-material/FitScreen'
import RestartAltIcon from '@mui/icons-material/RestartAlt'
import DescriptionIcon from '@mui/icons-material/Description'
import ScienceIcon from '@mui/icons-material/Science'
import { HtmlGenerator, parse } from 'latex.js'
import resumeToLatex from '../tools/resumeToLatex'
import '../styles/pdf-export.css'
import {
  fetchRecommendations,
  RecommendationEntry
} from '../services/recommendationService'

type RawCredentialData = {
  content?: {
    credentialSubject?: Record<string, any>
  }
  credentialSubject?: Record<string, any>
  issuanceDate?: string
  data?: Record<string, any>
}

interface Testimonial extends VerifiableItem {
  author: string
  text: string
  credentialLink?: string
}

const PreviewPageFromDrive: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [zoom, setZoom] = useState(1)
  const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null)
  const [previewMode, setPreviewMode] = useState<'html' | 'latex'>('html')
  const [isLatexPdfGenerating, setIsLatexPdfGenerating] = useState(false)
  const [snackbar, setSnackbar] = useState<{
    open: boolean
    message: string
    severity: 'success' | 'info' | 'error'
  }>({ open: false, message: '', severity: 'success' })
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([])
  const latexSource = useMemo(
    () => (resumeData ? resumeToLatex(resumeData) : ''),
    [resumeData]
  )

  const safeGet = useCallback((obj: any, path: string[], defaultValue = ''): string => {
    return path.reduce(
      (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
      obj
    )
  }, [])

  const extractSocialLinks = useCallback(
    (socialLinks: any) => ({
      linkedin: safeGet(socialLinks, ['linkedin'], ''),
      github: safeGet(socialLinks, ['github'], ''),
      portfolio: safeGet(socialLinks, ['portfolio'], ''),
      instagram: safeGet(
        socialLinks,
        ['instagram'],
        safeGet(socialLinks, ['twitter'], '')
      )
    }),
    [safeGet]
  )

  const exportResumeToPDF = async () => {
    if (!resumeData) return

    const element = document.getElementById('resume-preview')
    if (!element) return

    // Temporarily reset zoom so export is crisp and unscaled
    const prevZoom = zoom
    setZoom(1)

    const options = {
      margin: [0, 0, 0, 0],
      filename: `${resumeData.contact?.fullName ?? 'Resume'}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    const metadata = {
      title: `${resumeData.contact?.fullName ?? 'Resume'}'s Resume`,
      creator: 'T3 Resume Author',
      subject: 'Resume',
      keywords: ['Resume', 'CV', resumeData.contact?.fullName ?? 'Resume'],
      custom: { resumeData: JSON.stringify(resumeData) }
    }

    try {
      const html2pdf = (await import('html2pdf.js')).default
      await html2pdf().set(metadata).from(element).set(options).save()
    } finally {
      setZoom(prevZoom)
    }
  }

  const handleCopyLink = async () => {
    try {
      const url = window.location.href
      await navigator.clipboard.writeText(url)
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard',
        severity: 'success'
      })
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' })
    }
  }

  const handleAskForRecommendation = () => {
    if (!id) return
    const url = `${window.location.origin}/resume/recommend/${id}`
    const userEmail = resumeData?.contact?.email || ''
    const fullName = resumeData?.contact?.fullName || 'my resume'
    const subject = encodeURIComponent(`Recommendation request for ${fullName}`)
    const body = encodeURIComponent(
      `Hi there,\n\nCould you please share a quick recommendation for my resume? You can use this form:\n${url}\n\nThank you!\n${fullName}${
        userEmail ? `\n\nYou can reply to me at: ${userEmail}` : ''
      }`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }

  const handleDownloadJson = () => {
    if (!resumeData) return
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], {
      type: 'application/json'
    })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${resumeData.contact?.fullName ?? 'Resume'}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }

  const handleDownloadLatexSource = () => {
    if (!latexSource) return
    const sourceBlob = new Blob([latexSource], { type: 'application/x-tex' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(sourceBlob)
    const baseName = (resumeData?.contact?.fullName || 'Resume').replace(/\s+/g, '_')
    link.download = `${baseName}.tex`
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
  }

  const exportLatexPdf = async () => {
    if (!latexSource.trim()) return
    setIsLatexPdfGenerating(true)
    let tempContainer: HTMLDivElement | null = null
    try {
      const generator = parse(latexSource, {
        generator: new HtmlGenerator({
          hyphenate: false,
          documentClass: 'article'
        })
      })
      tempContainer = document.createElement('div')
      tempContainer.style.position = 'fixed'
      tempContainer.style.top = '-10000px'
      tempContainer.style.left = '0'
      tempContainer.style.width = '794px'
      tempContainer.style.backgroundColor = '#fff'
      tempContainer.className = 'latex-export-container'
      tempContainer.innerHTML = generator.htmlDocument().body.innerHTML
      document.body.appendChild(tempContainer)

      const baseName = (resumeData?.contact?.fullName || 'Resume').replace(/\s+/g, '_')
      const html2pdf = (await import('html2pdf.js')).default
      const worker = html2pdf().set({
        margin: [10, 10, 10, 10],
        filename: `${baseName}_LaTeX.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })

      await worker.from(tempContainer).save()
      setSnackbar({ open: true, message: 'LaTeX PDF downloaded', severity: 'success' })
    } catch (err) {
      console.error('Failed to export LaTeX PDF', err)
      setSnackbar({
        open: true,
        message: 'Failed to export LaTeX PDF',
        severity: 'error'
      })
    } finally {
      if (tempContainer?.parentNode) {
        tempContainer.parentNode.removeChild(tempContainer)
      }
      setIsLatexPdfGenerating(false)
    }
  }

  const handlePreviewModeChange = (_: React.SyntheticEvent, value: 'html' | 'latex') => {
    setPreviewMode(value)
  }

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault()
        window.print()
      } else if (e.key === '+' || e.key === '=') {
        e.preventDefault()
        setZoom(z => Math.min(1.5, parseFloat((z + 0.1).toFixed(2))))
      } else if (e.key === '-') {
        e.preventDefault()
        setZoom(z => Math.max(0.7, parseFloat((z - 0.1).toFixed(2))))
      } else if (e.key === '0') {
        e.preventDefault()
        setZoom(1)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const fitToWidthZoom = useMemo(() => 0.9, [])

  useEffect(() => {
    const fetchResumeFromDrive = async () => {
      try {
        const accessToken = getLocalStorage('auth')

        if (!accessToken) {
          throw new Error('No authentication token found')
        }

        const storage = new GoogleDriveStorage(accessToken as string)

        const fileData = await storage.retrieve(id!)

        let parsedContent: RawCredentialData = {}
        if (fileData?.data) {
          parsedContent = fileData.data
        } else {
          parsedContent = fileData ?? {}
        }

        let resumeContent: Record<string, any> = {}

        if (parsedContent?.credentialSubject) {
          resumeContent = parsedContent.credentialSubject
        } else if (parsedContent?.content?.credentialSubject) {
          resumeContent = parsedContent.content.credentialSubject
        } else if ((fileData as any)?.credentialSubject) {
          resumeContent = (fileData as any).credentialSubject
        } else if ((fileData as any)?.content?.credentialSubject) {
          resumeContent = (fileData as any).content.credentialSubject
        } else {
          resumeContent = parsedContent ?? fileData ?? {}
        }

        const transformedResumeData: Resume = {
          id: id ?? '',
          lastUpdated: parsedContent.issuanceDate ?? new Date().toISOString(),
          name: safeGet(
            resumeContent,
            ['person', 'name', 'formattedName'],
            safeGet(resumeContent, ['name'], 'Untitled Resume')
          ),
          version: 1,
          contact: {
            fullName: safeGet(
              resumeContent,
              ['person', 'contact', 'fullName'],
              safeGet(resumeContent, ['contact', 'fullName'], '')
            ),
            email: safeGet(
              resumeContent,
              ['person', 'contact', 'email'],
              safeGet(resumeContent, ['contact', 'email'], '')
            ),
            phone: safeGet(
              resumeContent,
              ['person', 'contact', 'phone'],
              safeGet(resumeContent, ['contact', 'phone'], '')
            ),
            location: {
              street: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'street'],
                safeGet(resumeContent, ['contact', 'location', 'street'], '')
              ),
              city: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'city'],
                safeGet(resumeContent, ['contact', 'location', 'city'], '')
              ),
              state: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'state'],
                safeGet(resumeContent, ['contact', 'location', 'state'], '')
              ),
              country: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'country'],
                safeGet(resumeContent, ['contact', 'location', 'country'], '')
              ),
              postalCode: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'postalCode'],
                safeGet(resumeContent, ['contact', 'location', 'postalCode'], '')
              )
            },
            socialLinks: extractSocialLinks(
              resumeContent.person?.contact?.socialLinks ??
                resumeContent.contact?.socialLinks ??
                {}
            )
          },
          summary: safeGet(
            resumeContent,
            ['narrative', 'text'],
            safeGet(resumeContent, ['summary'], '')
          ),
          // PATCH: Add professionalSummary if present
          ...(resumeContent.professionalSummary
            ? { professionalSummary: resumeContent.professionalSummary }
            : {}),
          experience: {
            items: [
              ...(resumeContent.employmentHistory ?? []),
              ...(resumeContent.experience?.items ?? [])
            ]
              .filter(
                (exp, index, self) =>
                  self.findIndex(
                    t =>
                      t.id === exp.id ||
                      (t.title === exp.title &&
                        t.company === (exp.organization?.tradeName || exp.company) &&
                        t.startDate === exp.startDate &&
                        t.endDate === exp.endDate)
                  ) === index
              )
              .map((exp: Record<string, any>): WorkExperience => {
                const startDate = exp.startDate ?? ''
                const endDate = exp.endDate ?? ''
                const duration = exp.duration ?? ''
                const isCurrentlyEmployed =
                  exp.stillEmployed ?? exp.currentlyEmployed ?? false

                return {
                  id: exp.id ?? '',
                  title: exp.title ?? exp.position ?? '',
                  company: exp.organization?.tradeName ?? exp.company ?? '',
                  position: exp.title ?? exp.position ?? '',
                  startDate: startDate,
                  endDate: endDate,
                  description: exp.description ?? '',
                  achievements: exp.achievements ?? [],
                  currentlyEmployed: isCurrentlyEmployed,
                  duration: duration,
                  verificationStatus: exp.verificationStatus ?? 'unverified',
                  credentialLink: exp.credentialLink ?? ''
                }
              })
          },
          education: {
            items: (
              resumeContent.educationAndLearning ??
              resumeContent.education?.items ??
              []
            ).map((edu: Record<string, any>): Education => {
              const startDate = edu.startDate ?? ''
              const endDate = edu.endDate ?? ''
              const duration = edu.duration ?? ''
              const isCurrentlyEnrolled = edu.currentlyEnrolled ?? false

              const degree = edu.degree ?? edu.type ?? ''
              const fieldOfStudy = edu.fieldOfStudy ?? edu.field ?? ''

              return {
                id: edu.id ?? '',
                type: degree,
                programName: fieldOfStudy,
                degree: degree,
                field: fieldOfStudy,
                institution: edu.institution ?? '',
                startDate: startDate,
                endDate: endDate,
                currentlyEnrolled: isCurrentlyEnrolled,
                inProgress: edu.inProgress ?? false,
                description: edu.description ?? '',
                duration: duration,
                awardEarned: edu.awardEarned ?? true,
                verificationStatus: edu.verificationStatus ?? 'unverified',
                credentialLink: edu.credentialLink ?? ''
              }
            })
          },
          skills: {
            items: (resumeContent.skills ?? resumeContent.skills?.items ?? []).map(
              (skill: Record<string, any>): Skill => ({
                id: skill.id ?? '',
                skills: skill.originalSkills ?? skill.skills ?? skill.name ?? '',
                verificationStatus: skill.verificationStatus ?? 'unverified',
                credentialLink: skill.credentialLink ?? ''
              })
            )
          },
          awards: {
            items: (resumeContent.awards ?? resumeContent.awards?.items ?? []).map(
              (award: Record<string, any>): Award => ({
                id: award.id ?? '',
                title: award.title ?? '',
                description: award.description ?? '',
                issuer: award.issuer ?? '',
                date: award.date ?? '',
                verificationStatus: award.verificationStatus ?? 'unverified'
              })
            )
          },
          publications: {
            items: (
              resumeContent.publications ??
              resumeContent.publications?.items ??
              []
            ).map(
              (pub: Record<string, any>): Publication => ({
                id: pub.id ?? '',
                title: pub.title ?? '',
                publisher: pub.publisher ?? '',
                publishedDate: pub.publishedDate ?? pub.date ?? '',
                url: pub.url ?? '',
                type: pub.type ?? 'Other',
                authors: pub.authors ?? [],
                verificationStatus: pub.verificationStatus ?? 'unverified'
              })
            )
          },
          certifications: {
            items: (
              resumeContent.certifications ??
              resumeContent.certifications?.items ??
              []
            ).map((cert: Record<string, any>): Certification => {
              const rawDateValue = cert.issueDate || cert.date || ''
              let processedDate = ''

              if (rawDateValue) {
                try {
                  if (
                    typeof rawDateValue === 'string' &&
                    (rawDateValue.includes('-') || rawDateValue.includes('/'))
                  ) {
                    const dateObj = new Date(rawDateValue)
                    if (!isNaN(dateObj.getTime())) {
                      processedDate = dateObj.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    } else {
                      processedDate = rawDateValue
                    }
                  } else {
                    processedDate = rawDateValue
                  }
                } catch (e) {
                  processedDate = rawDateValue
                }
              }

              return {
                id: cert.id ?? '',
                name: cert.name ?? '',
                issuer: cert.issuer ?? '',
                issueDate: processedDate,
                expiryDate: cert.expiryDate ?? '',
                credentialId: cert.credentialId ?? cert.id ?? '',
                verificationStatus: cert.verificationStatus ?? 'unverified',
                noExpiration:
                  cert.noExpiration !== undefined ? cert.noExpiration : !cert.expiryDate,
                score: cert.score ?? '',
                credentialLink: cert.credentialLink ?? ''
              }
            })
          },
          professionalAffiliations: {
            items: (
              resumeContent.professionalAffiliations ??
              resumeContent.professionalAffiliations?.items ??
              []
            ).map((affiliation: Record<string, any>): ProfessionalAffiliation => {
              const startDate = affiliation.startDate ?? ''
              const endDate = affiliation.endDate ?? ''
              const duration = affiliation.duration ?? ''
              const isActive = affiliation.activeAffiliation ?? false

              return {
                id: affiliation.id ?? '',
                name: affiliation.name ?? affiliation.role ?? '',
                organization: affiliation.organization ?? '',
                startDate: startDate,
                endDate: endDate,
                activeAffiliation: isActive,
                duration: duration,
                verificationStatus: affiliation.verificationStatus ?? 'unverified',
                credentialLink: affiliation.credentialLink ?? '',
                role: affiliation.role ?? affiliation.name ?? ''
              }
            })
          },
          volunteerWork: {
            items: (
              resumeContent.volunteerWork ??
              resumeContent.volunteerWork?.items ??
              []
            ).map((volunteer: Record<string, any>): VolunteerWork => {
              const startDate = volunteer.startDate ?? ''
              const endDate = volunteer.endDate ?? ''
              const duration = volunteer.duration ?? ''
              const isCurrentlyVolunteering = volunteer.currentlyVolunteering ?? false

              return {
                id: volunteer.id ?? '',
                role: volunteer.role ?? '',
                organization: volunteer.organization ?? '',
                startDate: startDate,
                endDate: endDate,
                description: volunteer.description ?? '',
                currentlyVolunteering: isCurrentlyVolunteering,
                duration: duration,
                verificationStatus: volunteer.verificationStatus ?? 'unverified',
                location: volunteer.location ?? '',
                cause: volunteer.cause ?? '',
                credentialLink: volunteer.credentialLink ?? ''
              }
            })
          },
          hobbiesAndInterests: resumeContent.hobbiesAndInterests ?? [],
          languages: {
            items: (resumeContent.languages ?? resumeContent.languages?.items ?? []).map(
              (lang: Record<string, any>): Language => ({
                id: lang.id ?? '',
                name: lang.language ?? lang.name ?? '',
                proficiency: (lang.proficiency as 'Basic') ?? 'Basic',
                verificationStatus: lang.verificationStatus ?? 'unverified',
                certification: lang.certification ?? '',
                writingLevel: lang.writingLevel ?? '',
                speakingLevel: lang.speakingLevel ?? '',
                readingLevel: lang.readingLevel ?? ''
              })
            )
          },
          testimonials: {
            items: (
              resumeContent.testimonials ??
              resumeContent.testimonials?.items ??
              []
            ).map(
              (test: Record<string, any>): Testimonial => ({
                id: test.id ?? '',
                author: test.author ?? '',
                text: test.text ?? '',
                verificationStatus: test.verificationStatus ?? 'unverified',
                credentialLink: test.credentialLink ?? ''
              })
            )
          },
          projects: {
            items: (resumeContent.projects ?? resumeContent.projects?.items ?? []).map(
              (project: Record<string, any>): Project => {
                const name = project.name ?? ''
                const description = project.description ?? ''
                const url = project.url ?? ''
                const technologies = project.technologies ?? []
                const credentialLink = project.credentialLink ?? ''
                const verificationStatus = project.verificationStatus ?? 'unverified'

                return {
                  id: project.id ?? '',
                  name,
                  description,
                  url,
                  verificationStatus,
                  technologies,
                  credentialLink
                }
              }
            )
          }
        }

        setResumeData(transformedResumeData)
        setIsLoading(false)
      } catch (err) {
        console.error('Error fetching resume:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to load resume. Please try again later.'
        )
        setIsLoading(false)
      }
    }

    if (id) {
      fetchResumeFromDrive()
    }
  }, [id, safeGet, extractSocialLinks])

  useEffect(() => {
    const loadRecommendations = async () => {
      if (!id) return
      const entries = await fetchRecommendations(id)
      setRecommendations(entries)
    }

    loadRecommendations()
  }, [id])

  if (isLoading) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Box sx={{ width: '100%', maxWidth: '900px' }}>
          <Skeleton variant='rectangular' height={64} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={24} sx={{ mb: 1, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={680} sx={{ mb: 2, borderRadius: 1 }} />
          <Skeleton variant='rectangular' height={680} sx={{ mb: 2, borderRadius: 1 }} />
        </Box>
        <Typography variant='body1' color='text.secondary'>
          Loading resume preview…
        </Typography>
      </Box>
    )
  }

  if (error) {
    return (
      <Box
        sx={{
          p: 4,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography color='error' variant='body1'>
          {error}
        </Typography>
      </Box>
    )
  }

  return (
    <Box sx={{ width: '100%', minHeight: '100vh', bgcolor: 'background.default' }}>
      <Box
        sx={{
          maxWidth: '900px',
          mx: 'auto',
          px: 2,
          mt: 2
        }}
      >
        <Tabs
          value={previewMode}
          onChange={handlePreviewModeChange}
          aria-label='Preview mode tabs'
          variant='fullWidth'
        >
          <Tab label='HTML Preview' value='html' />
          <Tab label='LaTeX Preview' value='latex' />
        </Tabs>
      </Box>

      {/* Controls: Zoom and Export */}
      <Box
        sx={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          display: { xs: 'none', sm: 'flex' },
          flexDirection: 'column',
          gap: 1,
          '@media print': { display: 'none' }
        }}
      >
        {previewMode === 'html' && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              bgcolor: 'background.paper',
              borderRadius: 1,
              p: 0.5,
              boxShadow: 2
            }}
          >
            <Tooltip title='Zoom out (-)'>
              <IconButton
                aria-label='Zoom out'
                onClick={() =>
                  setZoom(z => Math.max(0.7, parseFloat((z - 0.1).toFixed(2))))
                }
              >
                <ZoomOutIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Reset zoom (0)'>
              <IconButton aria-label='Reset zoom' onClick={() => setZoom(1)}>
                <RestartAltIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Zoom in (+)'>
              <IconButton
                aria-label='Zoom in'
                onClick={() =>
                  setZoom(z => Math.min(1.5, parseFloat((z + 0.1).toFixed(2))))
                }
              >
                <ZoomInIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title='Fit'>
              <IconButton
                aria-label='Fit to width'
                onClick={() => setZoom(fitToWidthZoom)}
              >
                <FitScreenIcon />
              </IconButton>
            </Tooltip>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Tooltip title='Export & Share'>
            <IconButton
              aria-label='Export menu'
              onClick={e => setExportAnchorEl(e.currentTarget)}
              sx={{ bgcolor: 'background.paper', boxShadow: 2 }}
            >
              <MoreVertIcon />
            </IconButton>
          </Tooltip>
        </Box>
        <Menu
          anchorEl={exportAnchorEl}
          open={Boolean(exportAnchorEl)}
          onClose={() => setExportAnchorEl(null)}
        >
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              exportResumeToPDF()
            }}
          >
            <PictureAsPdfIcon sx={{ mr: 1 }} /> Download PDF
          </MenuItem>
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              window.print()
            }}
          >
            Print
          </MenuItem>
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              handleCopyLink()
            }}
          >
            Copy Share Link
          </MenuItem>
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              handleAskForRecommendation()
            }}
          >
            Ask for Recommendation
          </MenuItem>
          <MenuItem
            disabled={!latexSource}
            onClick={() => {
              setExportAnchorEl(null)
              handleDownloadLatexSource()
            }}
          >
            <DescriptionIcon sx={{ mr: 1 }} /> Download LaTeX (.tex)
          </MenuItem>
          <MenuItem
            disabled={!latexSource || isLatexPdfGenerating}
            onClick={() => {
              setExportAnchorEl(null)
              exportLatexPdf()
            }}
          >
            <ScienceIcon sx={{ mr: 1 }} /> Compile LaTeX PDF
          </MenuItem>
          <Divider />
          <MenuItem
            onClick={() => {
              setExportAnchorEl(null)
              handleDownloadJson()
            }}
          >
            Download JSON
          </MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          display: previewMode === 'html' ? 'flex' : 'none',
          justifyContent: 'center',
          transition: 'transform 120ms ease',
          transform: `scale(${zoom})`,
          transformOrigin: 'top center'
        }}
      >
        {resumeData && (
          <ResumePreview
            data={resumeData}
            forcedId={id!}
            recommendations={recommendations}
          />
        )}
      </Box>

      <Box
        sx={{
          display: previewMode === 'latex' ? 'block' : 'none',
          px: 2
        }}
      >
        <LaTeXResumePreview data={resumeData} />
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={2200}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant='filled'
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default PreviewPageFromDrive
