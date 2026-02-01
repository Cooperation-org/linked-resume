import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Paper,
  Divider,
  Chip,
  Link,
  CircularProgress,
  Alert,
  Button,
  Dialog,
  DialogContent,
  IconButton
} from '@mui/material'
import { useParams, useNavigate } from 'react-router-dom'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ShieldIcon from '@mui/icons-material/Shield'
import WorkIcon from '@mui/icons-material/Work'
import SchoolIcon from '@mui/icons-material/School'
import BadgeIcon from '@mui/icons-material/Badge'
import CodeIcon from '@mui/icons-material/Code'
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism'
import RecommendIcon from '@mui/icons-material/Recommend'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import { QRCodeSVG } from 'qrcode.react'
import { getFileViaFirebase } from '../firebase/storage'
import { mapDriveResume } from '../utils/driveResumeMapper'
import {
  fetchRecommendations,
  RecommendationEntry
} from '../services/recommendationService'
import MinimalCredentialViewer from '../components/MinimalCredentialViewer'
import {
  extractSkillsFromHTML,
  getCredentialFromLink
} from '../utils/credentialParsingUtils'

interface VerifiedItem {
  id: string
  title: string
  subtitle?: string
  type: 'experience' | 'education' | 'certification' | 'skill' | 'project' | 'volunteer'
  isVerified: boolean
  credentialLink?: string
  credentialObj?: any // Parsed credential object for click-to-view
}

const VerificationPage: React.FC = () => {
  const { id: resumeId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [resumeData, setResumeData] = useState<Resume | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [recommendations, setRecommendations] = useState<RecommendationEntry[]>([])
  const [copied, setCopied] = useState(false)
  const [openCredDialog, setOpenCredDialog] = useState(false)
  const [dialogCredObj, setDialogCredObj] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      if (!resumeId) {
        setError('Missing resume ID')
        setLoading(false)
        return
      }
      try {
        const fileData = await getFileViaFirebase(resumeId)
        const normalized = mapDriveResume(fileData, resumeId)
        if (!normalized) {
          setError('Could not load the resume details.')
        } else {
          setResumeData(normalized)
        }

        const entries = await fetchRecommendations(resumeId)
        setRecommendations(entries)
      } catch (err) {
        console.error('Failed to load verification data', err)
        setError('Failed to load the resume. Please try again later.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [resumeId])


  const verifiedItems = useMemo((): VerifiedItem[] => {
    if (!resumeData) return []
    const items: VerifiedItem[] = []

    const isVerified = (item: any): boolean => {
      return (
        item?.verificationStatus === 'verified' ||
        (item?.credentialLink && item.credentialLink.length > 0)
      )
    }

    // Experience
    resumeData.experience?.items?.forEach(item => {
      const credObj = getCredentialFromLink(item.credentialLink)
      items.push({
        id: item?.id || '',
        title: item.title || item.position || 'Position',
        subtitle: item.company,
        type: 'experience',
        isVerified: isVerified(item),
        credentialLink: item.credentialLink,
        credentialObj: credObj
      })
    })

    // Education
    resumeData.education?.items?.forEach(item => {
      const credObj = getCredentialFromLink(item.credentialLink)
      items.push({
        id: item.id,
        title: item.degree || item.type?.toString() || 'Degree',
        subtitle: item.institution,
        type: 'education',
        isVerified: isVerified(item),
        credentialLink: item.credentialLink,
        credentialObj: credObj
      })
    })

    // Certifications
    resumeData.certifications?.items?.forEach(item => {
      const credObj = getCredentialFromLink(item.credentialLink)
      items.push({
        id: item.id,
        title: item.name,
        subtitle: item.issuer,
        type: 'certification',
        isVerified: isVerified(item),
        credentialLink: item.credentialLink,
        credentialObj: credObj
      })
    })

    // Skills - extract plain text from HTML content
    resumeData.skills?.items?.forEach(item => {
      const skillsText = extractSkillsFromHTML(item.skills || '').join(', ')
      const credObj = getCredentialFromLink(item.credentialLink)
      items.push({
        id: item.id,
        title: skillsText || 'Skills',
        type: 'skill',
        isVerified: isVerified(item),
        credentialLink: item.credentialLink,
        credentialObj: credObj
      })
    })

    // Projects
    resumeData.projects?.items?.forEach(item => {
      const credObj = getCredentialFromLink(item.credentialLink)
      items.push({
        id: item.id,
        title: item.name,
        subtitle:
          item.description?.substring(0, 50) +
          (item.description?.length > 50 ? '...' : ''),
        type: 'project',
        isVerified: isVerified(item),
        credentialLink: item.credentialLink,
        credentialObj: credObj
      })
    })

    // Volunteer Work
    resumeData.volunteerWork?.items?.forEach(item => {
      const credObj = getCredentialFromLink(item.credentialLink)
      items.push({
        id: item.id,
        title: item.role,
        subtitle: item.organization,
        type: 'volunteer',
        isVerified: isVerified(item),
        credentialLink: item.credentialLink,
        credentialObj: credObj
      })
    })

    return items
  }, [resumeData])

  const getTypeIcon = (type: VerifiedItem['type']) => {
    switch (type) {
      case 'experience':
        return <WorkIcon sx={{ fontSize: 18 }} />
      case 'education':
        return <SchoolIcon sx={{ fontSize: 18 }} />
      case 'certification':
        return <BadgeIcon sx={{ fontSize: 18 }} />
      case 'skill':
        return <CodeIcon sx={{ fontSize: 18 }} />
      case 'project':
        return <CodeIcon sx={{ fontSize: 18 }} />
      case 'volunteer':
        return <VolunteerActivismIcon sx={{ fontSize: 18 }} />
      default:
        return <WorkIcon sx={{ fontSize: 18 }} />
    }
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Ignore
    }
  }

  const handleViewResume = () => {
    navigate(`/resume/view/${resumeId}`)
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F7F9FC'
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  if (error || !resumeData) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: '#F7F9FC',
          p: 3
        }}
      >
        <Alert severity='error'>{error || 'Resume not found'}</Alert>
      </Box>
    )
  }

  const verifiedCount = verifiedItems.filter(i => i.isVerified).length
  const totalCount = verifiedItems.length

  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: '#F7F9FC',
        py: { xs: 2, md: 4 },
        px: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {/* Header */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            background: 'linear-gradient(135deg, #ffffff 0%, #f7f9fc 100%)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', md: 'center' },
              gap: 2
            }}
          >
            <Box>
              <Typography variant='h4' sx={{ fontWeight: 700, color: '#1F2937', mb: 1 }}>
                {resumeData.contact?.fullName || 'Resume Verification'}
              </Typography>
              <Typography variant='body1' color='text.secondary'>
                Verified credentials and endorsements
              </Typography>
            </Box>
            
          </Box>

          <Divider sx={{ my: 2 }} />

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1.5,
              alignItems: 'center'
            }}
          >
            <Chip
              icon={<VerifiedUserIcon />}
              label={`${verifiedCount} of ${totalCount} claims verified`}
              sx={{
                bgcolor: verifiedCount > 0 ? '#D1FAE5' : '#F3F4F6',
                color: verifiedCount > 0 ? '#059669' : '#6B7280',
                fontWeight: 600
              }}
            />
            {recommendations.length > 0 && (
              <Chip
                icon={<RecommendIcon />}
                label={`${recommendations.length} recommendation${recommendations.length > 1 ? 's' : ''}`}
                sx={{ bgcolor: '#E0E7FF', color: '#3730A3', fontWeight: 600 }}
              />
            )}
          </Box>
        </Paper>

        {/* Verified Claims */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            mb: 3,
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }}
        >
          <Typography variant='h6' sx={{ fontWeight: 700, mb: 2 }}>
            Verified Claims
          </Typography>

          {verifiedItems.length === 0 ? (
            <Typography color='text.secondary'>No claims to verify.</Typography>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {verifiedItems.map(item => (
                <Box
                  key={item.id}
                  onClick={() => {
                    if (item.isVerified && item.credentialObj) {
                      setDialogCredObj(item.credentialObj)
                      setOpenCredDialog(true)
                    }
                  }}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: item.isVerified ? '#F0FDF4' : '#F9FAFB',
                    border: `1px solid ${item.isVerified ? '#86EFAC' : '#E5E7EB'}`,
                    cursor: item.isVerified && item.credentialObj ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    '&:hover': item.isVerified && item.credentialObj ? {
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.15)',
                      borderColor: '#059669'
                    } : {}
                  }}
                >
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: '50%',
                      bgcolor: item.isVerified ? '#D1FAE5' : '#F3F4F6',
                      color: item.isVerified ? '#059669' : '#9CA3AF'
                    }}
                  >
                    {getTypeIcon(item.type)}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#1F2937',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {item.title}
                    </Typography>
                    {item.subtitle && (
                      <Typography
                        sx={{
                          fontSize: '13px',
                          color: '#6B7280',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {item.subtitle}
                      </Typography>
                    )}
                    {item.isVerified && item.credentialObj && (
                      <Typography
                        sx={{
                          fontSize: '12px',
                          color: '#059669',
                          fontWeight: 500,
                          mt: 0.5
                        }}
                      >
                        Click to view credential
                      </Typography>
                    )}
                  </Box>
                  {item.isVerified ? (
                    <VerifiedUserIcon sx={{ fontSize: 20, color: '#059669' }} />
                  ) : (
                    <ShieldIcon sx={{ fontSize: 20, color: '#D1D5DB' }} />
                  )}
                </Box>
              ))}
            </Box>
          )}
        </Paper>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, md: 3 },
              mb: 3,
              borderRadius: 3,
              border: '1px solid #E5E7EB'
            }}
          >
            <Typography
              variant='h6'
              sx={{
                fontWeight: 700,
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <RecommendIcon sx={{ color: '#3730A3' }} />
              Recommendations
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {recommendations.map(entry => (
                <Box
                  key={entry.id}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F9FAFB',
                    border: '1px solid #E5E7EB'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '15px' }}>
                      {entry.author}
                      {entry.relationship && (
                        <Typography
                          component='span'
                          sx={{ fontWeight: 400, color: '#6B7280', ml: 1 }}
                        >
                          • {entry.relationship}
                        </Typography>
                      )}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line'
                    }}
                  >
                    {entry.message}
                  </Typography>
                  {entry.skills && entry.skills.length > 0 && (
                    <Box sx={{ mt: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {entry.skills.map(skill => (
                        <Chip
                          key={skill}
                          label={skill}
                          size='small'
                          sx={{
                            bgcolor: '#E0E7FF',
                            color: '#3730A3',
                            fontWeight: 600,
                            fontSize: '12px'
                          }}
                        />
                      ))}
                    </Box>
                  )}
                  {(entry as any).videoUrl && (
                    <Box sx={{ mt: 1.5 }}>
                      <Link
                        href={(entry as any).videoUrl}
                        target='_blank'
                        rel='noopener noreferrer'
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 0.5,
                          color: '#2563EB',
                          fontWeight: 600,
                          fontSize: '13px'
                        }}
                      >
                        <PlayCircleOutlineIcon sx={{ fontSize: 18 }} />
                        Watch video testimonial
                      </Link>
                    </Box>
                  )}
                </Box>
              ))}
            </Box>
          </Paper>
        )}

        {/* Actions & QR Code */}
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            border: '1px solid #E5E7EB'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 3
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant='h6' sx={{ fontWeight: 700, mb: 1 }}>
                Share This Verification
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ mb: 2 }}>
                Share this link with recruiters or hiring managers to prove the
                authenticity of this resume.
              </Typography>
              <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                <Button
                  variant='contained'
                  startIcon={<OpenInNewIcon />}
                  onClick={handleViewResume}
                  sx={{
                    bgcolor: '#3A35A2',
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '100px',
                    '&:hover': { bgcolor: '#2f2e8c' }
                  }}
                >
                  View Full Resume
                </Button>
                <Button
                  variant='outlined'
                  startIcon={<ContentCopyIcon />}
                  onClick={handleCopyLink}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    borderRadius: '100px',
                    borderColor: '#3A35A2',
                    color: '#3A35A2'
                  }}
                >
                  {copied ? 'Copied!' : 'Copy Link'}
                </Button>
              </Box>
            </Box>
            <Box
              sx={{
                p: 2,
                bgcolor: '#fff',
                borderRadius: 2,
                border: '1px solid #E5E7EB'
              }}
            >
              <QRCodeSVG
                value={window.location.href}
                size={100}
                level='L'
                bgColor='#ffffff'
                fgColor='#1F2937'
              />
            </Box>
          </Box>
        </Paper>

        {/* Footer */}
        <Box sx={{ textAlign: 'center', mt: 4, mb: 2 }}>
          <Typography variant='caption' color='text.secondary'>
            Powered by Resume Author • Verified Credentials
          </Typography>
        </Box>
      </Box>

      {/* Credential Dialog */}
      <Dialog
        open={openCredDialog}
        onClose={() => setOpenCredDialog(false)}
        maxWidth='sm'
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'visible'
          }
        }}
      >
        <IconButton
          onClick={() => setOpenCredDialog(false)}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            zIndex: 1,
            bgcolor: 'rgba(255,255,255,0.9)',
            '&:hover': { bgcolor: 'rgba(255,255,255,1)' }
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ p: 3 }}>
          {dialogCredObj && <MinimalCredentialViewer vcData={dialogCredObj} />}
        </DialogContent>
      </Dialog>
    </Box>
  )
}

export default VerificationPage
