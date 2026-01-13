import React, { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Tooltip
} from '@mui/material'
import { GoogleDriveStorage } from '@cooperation/vc-storage'
import { getLocalStorage } from '../tools/cookie'
import ResumePreview from './resumePreview'
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf'
import CloseIcon from '@mui/icons-material/Close'

type RawCredentialData = {
  content?: {
    credentialSubject?: Record<string, any>
  }
  credentialSubject?: Record<string, any>
  issuanceDate?: string
  data?: Record<string, any>
}

interface ResumePreviewDialogProps {
  open: boolean
  onClose: () => void
  id: string
  onDownload: (data: any) => void
  fullScreen: boolean
}

const ResumePreviewDialog: React.FC<ResumePreviewDialogProps> = ({
  open,
  onClose,
  id,
  onDownload,
  fullScreen
}) => {
  const [resumeData, setResumeData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isLoading, setIsLoading] = useState(true) //NOSONAR

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
      instagram: safeGet(socialLinks, ['instagram'], '')
    }),
    [safeGet]
  )

  const exportResumeToPDF = async (data: any) => {
    const element = document.getElementById('resume-preview')
    if (!element) return

    const options = {
      margin: [0, 0, 0, 0],
      filename: `${data.contact.fullName}_Resume.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    const metadata = {
      title: `${data.contact.fullName}'s Resume`,
      creator: 'T3 Resume Author',
      subject: 'Resume',
      keywords: ['Resume', 'CV', data.contact.fullName],
      custom: { resumeData: JSON.stringify(data) }
    }

    const html2pdf = (await import('html2pdf.js')).default
    html2pdf().set(metadata).from(element).set(options).save()
  }

  useEffect(() => {
    const fetchResumeFromDrive = async () => {
      try {
        const accessToken = getLocalStorage('auth')

        if (!accessToken) {
          throw new Error('No authentication token found')
        }

        const storage = new GoogleDriveStorage(accessToken as string)

        const fileData = await storage.retrieve(id)

        const parsedContent: RawCredentialData = fileData?.data || {}

        const resumeContent: Record<string, any> = parsedContent.content
          ? parsedContent.content.credentialSubject || {}
          : parsedContent.credentialSubject || {}

        const transformedResumeData = {
          id: '',
          lastUpdated: parsedContent.issuanceDate ?? new Date().toISOString(),
          name: safeGet(resumeContent, ['person', 'name', 'formattedName'], ''),
          version: 1,
          contact: {
            fullName: safeGet(resumeContent, ['person', 'contact', 'fullName'], ''),
            email: safeGet(resumeContent, ['person', 'contact', 'email'], ''),
            phone: safeGet(resumeContent, ['person', 'contact', 'phone'], ''),
            location: {
              street: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'street'],
                ''
              ),
              city: safeGet(resumeContent, ['person', 'contact', 'location', 'city'], ''),
              state: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'state'],
                ''
              ),
              country: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'country'],
                ''
              ),
              postalCode: safeGet(
                resumeContent,
                ['person', 'contact', 'location', 'postalCode'],
                ''
              )
            },
            socialLinks: extractSocialLinks(
              resumeContent.person?.contact?.socialLinks || {}
            )
          },
          summary: safeGet(resumeContent, ['narrative', 'text'], ''),
          experience: {
            items: [
              ...(resumeContent.employmentHistory || []),
              ...(resumeContent.experience || [])
            ].map((exp: Record<string, any>) => ({
              id: exp.id || '',
              title: exp.title || '',
              company: exp.organization?.tradeName || exp.company || '',
              position: exp.title || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              description: exp.description || '',
              currentlyEmployed: exp.stillEmployed || false,
              duration: '',
              showDuration: false,
              verificationStatus: 'unverified',
              credentialLink: ''
            }))
          },
          education: {
            items: (resumeContent.educationAndLearning || []).map(
              (edu: Record<string, any>) => ({
                id: edu.id || '',
                type: edu.degree || '',
                programName: edu.fieldOfStudy || '',
                degree: edu.degree || '',
                field: edu.fieldOfStudy || '',
                institution: edu.institution || '',
                startDate: edu.startDate || '',
                endDate: edu.endDate || '',
                currentlyEnrolled: false,
                inProgress: false,
                description: edu.description || '',
                showDuration: false,
                duration: edu.duration || '',
                awardEarned: false,
                verificationStatus: 'unverified',
                credentialLink: ''
              })
            )
          },
          skills: {
            items: (resumeContent.skills || []).map((skill: Record<string, any>) => ({
              id: skill.id || '',
              skills: skill.skills || skill.name || '',
              verificationStatus: 'unverified',
              credentialLink: ''
            }))
          },
          awards: {
            items: (resumeContent.awards || []).map((award: Record<string, any>) => ({
              id: award.id || '',
              title: award.title || '',
              description: award.description || '',
              issuer: award.issuer || '',
              date: award.date || '',
              verificationStatus: 'unverified'
            }))
          },
          publications: {
            items: (resumeContent.publications || []).map((pub: Record<string, any>) => ({
              id: pub.id || '',
              title: pub.title || '',
              publisher: pub.publisher || '',
              publishedDate: pub.publishedDate || '',
              url: pub.url || '',
              type: 'Other',
              authors: [],
              verificationStatus: 'unverified'
            }))
          },
          certifications: {
            items: (resumeContent.certifications || []).map(
              (cert: Record<string, any>) => ({
                id: cert.id || '',
                name: cert.name || '',
                issuer: cert.issuer || '',
                issueDate: cert.issueDate || '',
                expiryDate: cert.expiryDate || '',
                credentialId: cert.credentialId || '',
                verificationStatus: 'unverified',
                noExpiration: !cert.expiryDate,
                score: cert.score || ''
              })
            )
          },
          professionalAffiliations: {
            items: (resumeContent.professionalAffiliations || []).map(
              (affiliation: Record<string, any>) => ({
                id: affiliation.id || '',
                name: affiliation.name || '',
                organization: affiliation.organization || '',
                startDate: affiliation.startDate || '',
                endDate: affiliation.endDate || '',
                activeAffiliation: affiliation.activeAffiliation || false,
                showDuration: false,
                verificationStatus: 'unverified',
                credentialLink: '',
                role: affiliation.role || ''
              })
            )
          },
          volunteerWork: {
            items: (resumeContent.volunteerWork || []).map(
              (volunteer: Record<string, any>) => ({
                id: volunteer.id || '',
                role: volunteer.role || '',
                organization: volunteer.organization || '',
                startDate: volunteer.startDate || '',
                endDate: volunteer.endDate || '',
                description: volunteer.description || '',
                currentlyVolunteering: false,
                duration: '',
                showDuration: false,
                verificationStatus: 'unverified',
                location: volunteer.location || '',
                cause: volunteer.cause || ''
              })
            )
          },
          hobbiesAndInterests: resumeContent.hobbiesAndInterests || [],
          languages: {
            items: (resumeContent.languages || []).map((lang: Record<string, any>) => ({
              id: '',
              name: lang.language || '',
              proficiency: (lang.proficiency as 'Basic') || 'Basic',
              verificationStatus: 'unverified',
              certification: lang.certification || '',
              writingLevel: lang.writingLevel || '',
              speakingLevel: lang.speakingLevel || '',
              readingLevel: lang.readingLevel || ''
            }))
          },
          testimonials: { items: [] },
          projects: {
            items: (resumeContent.projects || []).map((project: Record<string, any>) => ({
              id: project.id || '',
              name: project.name || '',
              description: project.description || '',
              url: project.url || '',
              verificationStatus: 'unverified',
              technologies: project.technologies || [],
              credentialLink: project.credentialLink || ''
            }))
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
    <Dialog
      open={open}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth='lg'
      fullWidth
      PaperProps={{
        sx: {
          height: fullScreen ? '100%' : '90vh',
          maxHeight: fullScreen ? '100%' : '90vh',
          borderRadius: fullScreen ? 0 : 4
        }
      }}
    >
      <DialogTitle
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
      >
        <Typography variant='h6'>Resume Preview</Typography>
        <Box>
          <Tooltip title='Download PDF'>
            <IconButton onClick={() => exportResumeToPDF(resumeData)}>
              <PictureAsPdfIcon />
            </IconButton>
          </Tooltip>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent
        sx={{
          p: 0,
          display: 'flex',
          justifyContent: 'center',
          overflow: 'auto'
        }}
      >
        {resumeData && <ResumePreview data={resumeData} forcedId={id} />}
      </DialogContent>
    </Dialog>
  )
}

export default ResumePreviewDialog
