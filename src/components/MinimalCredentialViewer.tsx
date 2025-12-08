import React from 'react'
import { Box, Typography, Grid, Link as MuiLink } from '@mui/material'

interface PortfolioItem {
  name: string
  url: string
}

interface CredentialSubject {
  type?: string[]
  name?: string
  fullName?: string
  persons?: string
  achievement?: {
    name?: string
    description?: string
    criteria?: { narrative?: string }
    image?: { id?: string }
  }[]
  duration?: string
  credentialName?: string
  credentialDuration?: string
  credentialDescription?: string
  company?: string
  role?: string
  volunteerWork?: string
  volunteerOrg?: string
  volunteerDescription?: string
  skillsGained?: string[]
  volunteerDates?: string
  employeeName?: string
  employeeJobTitle?: string
  reviewStartDate?: string
  reviewEndDate?: string
  reviewDuration?: string
  jobKnowledgeRating?: string
  teamworkRating?: string
  initiativeRating?: string
  communicationRating?: string
  overallRating?: string
  reviewComments?: string
  goalsNext?: string
  portfolio?: PortfolioItem[]
  createdTime?: string
  evidenceLink?: string
  evidenceDescription?: string
  howKnow?: string
  recommendationText?: string
  qualifications?: string
  explainAnswer?: string
}

interface MinimalCredentialViewerProps {
  vcData: any
}

function getVCType(credential: any): string {
  const types = credential.type || []
  if (types.includes('EmploymentCredential')) return 'employment'
  if (types.includes('VolunteeringCredential')) return 'volunteering'
  if (types.includes('PerformanceReviewCredential')) return 'performance-review'
  if (
    credential.credentialSubject?.howKnow ||
    credential.credentialSubject?.recommendationText
  )
    return 'recommendation'
  return 'skill'
}

function getCredentialTitle(credential: any, vcType: string): string {
  const subject = credential.credentialSubject
  switch (vcType) {
    case 'employment':
      return subject?.credentialName || subject?.role || 'Employment Credential'
    case 'volunteering':
      return subject?.volunteerWork || 'Volunteering Credential'
    case 'performance-review':
      return subject?.employeeJobTitle
        ? `Performance Review: ${subject.employeeJobTitle}`
        : 'Performance Review'
    case 'recommendation':
      return 'Recommendation'
    case 'skill':
    default:
      return (
        subject?.achievement?.[0]?.name || subject?.credentialName || 'Skill Credential'
      )
  }
}

function getPersonName(subject: CredentialSubject): string {
  return (
    subject?.fullName ||
    subject?.name ||
    subject?.persons ||
    subject?.employeeName ||
    'Unknown Person'
  )
}

function cleanHTML(htmlContent: any): string {
  if (typeof htmlContent !== 'string') {
    return ''
  }
  return htmlContent
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    .replace(/<br>/g, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
}

const MinimalCredentialViewer: React.FC<MinimalCredentialViewerProps> = ({ vcData }) => {
  if (!vcData) return null
  const subject: CredentialSubject = vcData.credentialSubject || {}
  const vcType = getVCType(vcData)
  const credentialTitle = getCredentialTitle(vcData, vcType)
  const personName = getPersonName(subject)
  const hasPortfolio = Array.isArray(subject.portfolio) && subject.portfolio.length > 0
  // Use fileId from parent if available, otherwise fallback to id in the JSON
  const fileId = vcData.credentialId || vcData.id

  const renderCredentialContent = () => {
    switch (vcType) {
      case 'employment':
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              <b>Company:</b> {subject.company}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              <b>Role:</b> {subject.role}
            </Typography>
            {subject.credentialDuration && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Duration:</b> {subject.credentialDuration}
              </Typography>
            )}
            {subject.credentialDescription && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanHTML(subject.credentialDescription)
                  }}
                />
              </Typography>
            )}
          </Box>
        )
      case 'volunteering':
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              <b>Organization:</b> {subject.volunteerOrg}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              <b>Work:</b> {subject.volunteerWork}
            </Typography>
            {subject.volunteerDates && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Dates:</b> {subject.volunteerDates}
              </Typography>
            )}
            {subject.volunteerDescription && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanHTML(subject.volunteerDescription)
                  }}
                />
              </Typography>
            )}
            {subject.skillsGained && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Skills Gained:</b>{' '}
                {Array.isArray(subject.skillsGained)
                  ? subject.skillsGained.join(', ')
                  : subject.skillsGained}
              </Typography>
            )}
          </Box>
        )
      case 'performance-review':
        return (
          <Box sx={{ mt: 1 }}>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              <b>Employee Name:</b> {subject.employeeName}
            </Typography>
            <Typography variant='body2' sx={{ fontWeight: 500 }}>
              <b>Job Title:</b> {subject.employeeJobTitle}
            </Typography>
            {subject.reviewDuration && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Review Period:</b> {subject.reviewDuration}
              </Typography>
            )}
            {subject.overallRating && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Overall Rating:</b> {subject.overallRating}/5
              </Typography>
            )}
            {subject.reviewComments && (
              <Typography variant='body2' sx={{ mt: 1 }}>
                <span
                  dangerouslySetInnerHTML={{ __html: cleanHTML(subject.reviewComments) }}
                />
              </Typography>
            )}
          </Box>
        )
      case 'recommendation':
        return (
          <Box sx={{ mt: 1 }}>
            {subject.howKnow && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>How They Know:</b>{' '}
                <span dangerouslySetInnerHTML={{ __html: cleanHTML(subject.howKnow) }} />
              </Typography>
            )}
            {subject.recommendationText && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Recommendation:</b>{' '}
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanHTML(subject.recommendationText)
                  }}
                />
              </Typography>
            )}
            {subject.qualifications && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Qualifications:</b>{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: cleanHTML(subject.qualifications) }}
                />
              </Typography>
            )}
            {subject.explainAnswer && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Explanation:</b>{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: cleanHTML(subject.explainAnswer) }}
                />
              </Typography>
            )}
          </Box>
        )
      case 'skill':
      default:
        const achievement = subject.achievement?.[0]
        return (
          <Box sx={{ mt: 1 }}>
            {achievement?.description && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Description:</b>{' '}
                <span
                  dangerouslySetInnerHTML={{ __html: cleanHTML(achievement.description) }}
                />
              </Typography>
            )}
            {achievement?.criteria?.narrative && (
              <Typography variant='body2' sx={{ fontWeight: 500 }}>
                <b>Criteria:</b>{' '}
                <span
                  dangerouslySetInnerHTML={{
                    __html: cleanHTML(achievement.criteria.narrative)
                  }}
                />
              </Typography>
            )}
          </Box>
        )
    }
  }

  return (
    <Box
      sx={{
        border: '1.5px solid #2563EB',
        borderRadius: '18px',
        p: 3, // uniform padding on all sides
        mb: 0, // remove extra margin at the bottom
        background: 'linear-gradient(135deg, #f7faff 60%, #e9f0ff 100%)',
        boxShadow: '0 8px 32px rgba(30, 64, 175, 0.10)',
        minWidth: 0,
        maxWidth: 420,
        animation: 'fadeInScale 0.4s cubic-bezier(.4,2,.6,1) 1',
        position: 'relative',
        transition: 'box-shadow 0.2s',
        '&:hover': { boxShadow: '0 12px 36px rgba(30, 64, 175, 0.18)' },
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'stretch'
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, position: 'relative' }}>
        <Box
          sx={{
            width: 6,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(180deg, #2563EB 60%, #003FE0 100%)',
            mr: 2
          }}
        />
        <Typography
          sx={{
            fontWeight: 800,
            fontSize: '22px',
            color: '#003FE0',
            mr: 1,
            letterSpacing: '-0.5px'
          }}
        >
          {credentialTitle}
        </Typography>
        {personName && (
          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #e0e7ef 60%, #f7faff 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '15px',
                color: '#2563EB',
                mr: 1
              }}
            >
              {personName
                .split(' ')
                .map(n => n[0])
                .join('')
                .slice(0, 2)
                .toUpperCase()}
            </Box>
            <Typography
              sx={{ fontWeight: 500, fontSize: '15px', color: '#222', opacity: 0.7 }}
            >
              by {personName}
            </Typography>
          </Box>
        )}
      </Box>
      <Box sx={{ mt: 1, mb: 2 }}>{renderCredentialContent()}</Box>
      {hasPortfolio && (
        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 700, mb: 1, color: '#222' }}>
            Supporting Evidence / Portfolio:
          </Typography>
          <Grid container spacing={2}>
            {subject.portfolio!.map((item, idx) => {
              const isImage = item.url.match(/\.(jpeg|jpg|png|gif|webp|svg)$/i)
              return (
                <Grid item xs={12} key={idx}>
                  {isImage ? (
                    <Box
                      sx={{
                        mb: 1,
                        borderRadius: 2,
                        overflow: 'hidden',
                        boxShadow: '0 2px 8px rgba(30,64,175,0.10)',
                        transition: 'box-shadow 0.2s',
                        '&:hover': { boxShadow: '0 4px 16px rgba(30,64,175,0.18)' }
                      }}
                    >
                      <img
                        src={item.url}
                        alt={item.name}
                        style={{
                          width: '100%',
                          maxHeight: 120,
                          objectFit: 'cover',
                          borderRadius: 8,
                          display: 'block'
                        }}
                      />
                      <Typography
                        variant='caption'
                        sx={{ display: 'block', mt: 0.5, wordBreak: 'break-all', px: 1 }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  ) : (
                    <MuiLink
                      href={item.url}
                      target='_blank'
                      rel='noopener noreferrer'
                      underline='hover'
                      sx={{
                        color: '#2563EB',
                        fontWeight: 600,
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        minWidth: 0,
                        maxWidth: '100%',
                        whiteSpace: 'normal',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        transition: 'background 0.2s',
                        '&:hover': { background: '#e9f0ff' }
                      }}
                    >
                      <Box component='span' sx={{ fontSize: 18, mr: 0.5 }}>
                        📄
                      </Box>
                      {item.name}
                    </MuiLink>
                  )}
                </Grid>
              )
            })}
          </Grid>
        </Box>
      )}
      {fileId && (
        <Box
          sx={{
            mt: 3,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: 2
          }}
        >
          <MuiLink
            href={`https://linked-creds-author-businees-enhancement.vercel.app/view/${fileId}`}
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              color: '#2563EB',
              fontWeight: 700,
              textDecoration: 'underline',
              fontSize: '16px',
              mb: 1
            }}
          >
            View Origin
          </MuiLink>
          <Box
            sx={{
              border: '1px solid #e0e7ef',
              borderRadius: 2,
              p: 1,
              background: '#fff'
            }}
          >
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=https://linked-creds-author-businees-enhancement.vercel.app/api/credential-raw/${fileId}`}
              alt='QR Code'
              style={{ width: 120, height: 120 }}
            />
          </Box>
        </Box>
      )}
      <style>{`
        @keyframes fadeInScale {
          0% { opacity: 0; transform: scale(0.95); }
          100% { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </Box>
  )
}

export default MinimalCredentialViewer
