import React, {
  useRef,
  useState,
  ReactNode,
  useLayoutEffect,
  useEffect,
  useMemo
} from 'react'
import { Box, Typography, Link, Chip } from '@mui/material'
import ResumeQRCode from './ResumeQRCode'
import { BlueVerifiedBadge } from '../assets/svgs'
import { useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'
import { HTMLWithVerifiedLinks, isVerifiedLink } from '../tools/htmlUtils'
import MinimalCredentialViewer from './MinimalCredentialViewer'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import CloseIcon from '@mui/icons-material/Close'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { RecommendationEntry } from '../types/resumeSections'

const PAGE_SIZE = { width: '210mm', height: '297mm' }
const PAGE_MAX_WIDTH = '210mm'
const HEADER_HEIGHT_PX = 150
const FOOTER_HEIGHT_PX = 60 // Footer height including padding (60px + 30px py)
const CONTENT_PADDING_TOP = 20
const CONTENT_PADDING_BOTTOM = 15
const TEXT_SM = { xs: '13px', sm: '14px' }
const TEXT_MD = { xs: '14px', sm: '16px' }
const TITLE_MD = { xs: '15px', sm: '17px' }

const mmToPx = (mm: number) => mm * 3.779527559

const SectionTitle: React.FC<{ children: ReactNode }> = ({ children }) => (
  <Typography
    className='rs-section-title'
    variant='h6'
    sx={{
      fontWeight: 700,
      mb: '8px',
      lineHeight: '20px',
      fontSize: TITLE_MD,
      letterSpacing: 0.1,
      color: '#000'
    }}
  >
    {children}
  </Typography>
)

// Component for rendering links with favicons
const LinkWithFavicon: React.FC<{ url: string; platform?: string }> = ({
  url,
  platform
}) => {
  const cleanUrl = url.replace(/^https?:\/\//, '')
  const domain = platform ? platform.toLowerCase() : cleanUrl.split('/')[0]
  const faviconDomain = domain.includes('.') ? domain : `${domain}.com`
  const isVerified = isVerifiedLink(url)

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: '5px'
      }}
    >
      <Typography
        variant='body2'
        sx={{
          fontWeight: 700,
          color: '#000',
          fontSize: '10px',
          ml: '24px',
          lineHeight: '8px',
          fontFamily: 'DM Sans'
        }}
      >
        {platform ?? domain}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        {isVerified && <BlueVerifiedBadge />}
        <img
          src={`https://www.google.com/s2/favicons?domain=${faviconDomain}&sz=32`}
          alt={`${domain} favicon`}
          style={{ width: 16, height: 16, borderRadius: '50%' }}
        />
        <Link
          href={`https://${cleanUrl}`}
          target='_blank'
          rel='noopener noreferrer'
          sx={{
            color: '#2563EB',
            textDecoration: 'underline',
            fontSize: '16px',
            lineHeight: '9px',
            fontWeight: 400,
            fontFamily: 'DM Sans',
            '&:hover': { opacity: 0.8 }
          }}
        >
          {cleanUrl}
        </Link>
      </Box>
    </Box>
  )
}

// First Page Header with social links
const FirstPageHeader: React.FC<{
  fullName: string
  city?: string
  forcedId?: string
  socialLinks?: Record<string, string | undefined>
  email?: string
  phone?: string
}> = ({ fullName, city, forcedId, socialLinks, email, phone }) => {
  const [resumeLink, setResumeLink] = useState<string>('')
  const [hasValidId, setHasValidId] = useState<boolean>(false)

  const handleLinkGenerated = (link: string, isValid: boolean) => {
    setResumeLink(link)
    setHasValidId(isValid)
  }

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'stretch',
        gap: { xs: 2, sm: 0 },
        flexWrap: 'wrap',
        backgroundColor: '#F7F9FC',
        height: 'fit-content',
        px: { xs: '16px', sm: 0 },
        py: { xs: 2, sm: 0 }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          ml: { xs: 0, sm: '45px' },
          justifyContent: 'center',
          gap: 0.5,
          py: 2,
          flex: 1,
          minWidth: 0
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'baseline',
            gap: { xs: 1, sm: 2 },
            flexWrap: 'wrap'
          }}
        >
          <Typography
            sx={{
              fontWeight: 600,
              color: '#2E2E48',
              fontSize: { xs: '20px', sm: '28px' },
              lineHeight: 1
            }}
          >
            {fullName}
          </Typography>
          {city && (
            <Typography
              sx={{
                fontWeight: 400,
                color: '#666',
                fontSize: { xs: '15px', sm: '18px' }
              }}
            >
              {city}
            </Typography>
          )}
        </Box>

        {(email || phone) && (
          <Box
            sx={{
              display: 'flex',
              gap: { xs: 1.5, sm: 3 },
              alignItems: 'center',
              flexWrap: 'wrap'
            }}
          >
            {email && (
              <Link
                href={`mailto:${email}`}
                sx={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontSize: { xs: '14px', sm: '15px' },
                  fontWeight: 400,
                  fontFamily: 'Arial',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {email}
              </Link>
            )}
            {email && phone && (
              <Typography sx={{ color: '#666', fontSize: { xs: '14px', sm: '15px' } }}>
                |
              </Typography>
            )}
            {phone && (
              <Link
                href={`tel:${phone}`}
                sx={{
                  color: '#2563EB',
                  textDecoration: 'none',
                  fontSize: { xs: '14px', sm: '15px' },
                  fontWeight: 400,
                  fontFamily: 'Arial',
                  '&:hover': { textDecoration: 'underline' }
                }}
              >
                {phone}
              </Link>
            )}
          </Box>
        )}

        {/* Social Links Row */}
        {socialLinks && Object.values(socialLinks).some(link => !!link) && (
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap', alignItems: 'center' }}>
            {Object.entries(socialLinks).map(([platform, url], index, array) =>
              url ? (
                <React.Fragment key={platform}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <img
                      src={`https://www.google.com/s2/favicons?domain=${platform.toLowerCase()}.com&sz=32`}
                      alt={`${platform} favicon`}
                      style={{ width: 16, height: 16, borderRadius: '50%' }}
                    />
                    <Link
                      href={url.startsWith('http') ? url : `https://${url}`}
                      target='_blank'
                      rel='noopener noreferrer'
                      sx={{
                        color: '#2563EB',
                        textDecoration: 'none',
                        fontSize: '15px',
                        fontWeight: 400,
                        fontFamily: 'Arial',
                        '&:hover': { textDecoration: 'underline' }
                      }}
                    >
                      {url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                    </Link>
                  </Box>
                  {index < array.length - 1 &&
                    Object.entries(socialLinks).filter(([_, u]) => u)[index + 1] && (
                      <Typography sx={{ color: '#666', fontSize: '14px' }}>|</Typography>
                    )}
                </React.Fragment>
              ) : null
            )}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          height: '100%',
          width: { xs: '100%', sm: 'auto' },
          justifyContent: 'flex-end',
          gap: { xs: 2, sm: 0 }
        }}
      >
        <Box
          sx={{
            textAlign: 'center',
            py: '20px',
            mr: { xs: 0, sm: '15px' },
            display: hasValidId ? 'block' : 'none'
          }}
        >
          <Link
            href={resumeLink}
            target='_blank'
            rel='noopener noreferrer'
            sx={{
              color: '#000',
              textAlign: 'center',
              fontFamily: 'Arial',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: 400,
              lineHeight: '16px',
              textDecorationLine: 'underline',
              cursor: 'pointer'
            }}
          >
            View Source
          </Link>
        </Box>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: `${HEADER_HEIGHT_PX}px`,
            width: { xs: '108px', sm: '128px' },
            backgroundColor: '#2563EB'
          }}
        >
          <ResumeQRCode
            size={72}
            bgColor='transparent'
            fgColor='#fff'
            forcedId={forcedId}
            onLinkGenerated={handleLinkGenerated}
          />
        </Box>
      </Box>
    </Box>
  )
}

// Simpler header for subsequent pages
const SubsequentPageHeader: React.FC<{ fullName: string }> = ({ fullName }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        backgroundColor: '#F7F9FC',
        height: '60px', // Narrower header for subsequent pages
        pl: { xs: '20px', sm: '45px' }
      }}
    >
      <Typography
        sx={{
          fontWeight: 600,
          color: '#2E2E48',
          fontSize: { xs: '20px', sm: '24px' }
        }}
      >
        {fullName}
      </Typography>
    </Box>
  )
}

// Updated PageFooter component
const PageFooter: React.FC<{
  fullName: string
  email: string
  phone?: string
  pageNumber: number
  totalPages: number
  forcedId?: string
}> = ({ fullName, email, phone, pageNumber, totalPages, forcedId }) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [resumeLink, setResumeLink] = useState<string>('') //NOSONAR
  const [hasValidId, setHasValidId] = useState<boolean>(false)

  const handleLinkGenerated = (link: string, isValid: boolean) => {
    setResumeLink(link)
    setHasValidId(isValid)
  }

  return (
    <Box
      sx={{
        backgroundColor: '#F7F9FC',
        py: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${FOOTER_HEIGHT_PX}px`
      }}
    >
      <Typography
        variant='caption'
        sx={{
          color: '#000',
          textAlign: 'center',
          fontFamily: 'DM Sans',
          fontSize: '10px',
          fontStyle: 'normal',
          fontWeight: 400,
          lineHeight: '15px',
          mr: '10px'
        }}
      >
        {fullName} | Page {pageNumber} of {totalPages} |{' '}
        {phone && (
          <a href={`tel:${phone}`} style={{ textDecoration: 'none', color: 'inherit' }}>
            {phone}
          </a>
        )}
        {' | '}
        <a
          href={`mailto:${email}`}
          style={{ textDecoration: 'underline', color: '#2563EB' }}
        >
          {email}
        </a>
      </Typography>
      {hasValidId && (
        <ResumeQRCode
          size={32}
          bgColor='transparent'
          fgColor='#000'
          forcedId={forcedId}
          onLinkGenerated={handleLinkGenerated}
        />
      )}
    </Box>
  )
}

const SummarySection: React.FC<{ summary?: string }> = ({ summary }) => {
  if (!summary) return null
  return (
    <Box sx={{ mb: '12px' }}>
      {' '}
      {/* Further reduced to prevent overlap */}
      <SectionTitle>Professional Summary</SectionTitle>
      <Typography
        variant='body2'
        sx={{
          color: '#000',
          fontWeight: 400,
          fontSize: TEXT_SM, // Reduced from 16px
          fontFamily: 'Arial',
          lineHeight: 1.4
        }}
      >
        <HTMLWithVerifiedLinks htmlContent={summary} />
      </Typography>
    </Box>
  )
}

// Helper to get credential name
function getCredentialName(claim: any): string {
  try {
    if (!claim || typeof claim !== 'object') {
      return 'Invalid Credential'
    }
    const credentialSubject = claim.credentialSubject
    if (!credentialSubject || typeof credentialSubject !== 'object') {
      return 'Unknown Credential'
    }
    if (credentialSubject.employeeName) {
      return `Performance Review: ${credentialSubject.employeeJobTitle || 'Unknown Position'}`
    }
    if (credentialSubject.volunteerWork) {
      return `Volunteer: ${credentialSubject.volunteerWork}`
    }
    if (credentialSubject.role) {
      return `Employment: ${credentialSubject.role}`
    }
    if (credentialSubject.credentialName) {
      return credentialSubject.credentialName
    }
    if (credentialSubject.achievement && credentialSubject.achievement[0]?.name) {
      return credentialSubject.achievement[0].name
    }
    return 'Credential'
  } catch {
    return 'Credential'
  }
}

// Helper to get credential links as array (handles both new and old formats)
function getCredentialLinks(credentialLink: string | string[] | undefined): string[] {
  if (!credentialLink) return []
  if (Array.isArray(credentialLink)) return credentialLink
  if (typeof credentialLink === 'string') {
    try {
      // Check if it's the wrapper format first
      if (credentialLink.trim().startsWith('{') && credentialLink.includes('"fileId"')) {
        // This is the wrapper format, return it as-is
        return [credentialLink]
      }
      // Check for array format (from edit mode)
      if (credentialLink.trim().startsWith('[')) {
        const parsed = JSON.parse(credentialLink)

        return parsed
      }
      // Check if it's a JSON object (but not wrapper format)
      if (credentialLink.trim().startsWith('{')) {
        // Single credential object, wrap in array
        return [credentialLink]
      }
      // Otherwise it's a plain string
      return [credentialLink]
    } catch (e) {
      console.error('Error parsing credential link:', e)
      return [credentialLink]
    }
  }
  return []
}

// Helper function to parse a single credential link and extract credential data
function parseCredentialLink(
  link: string
): { credObj: any; credId: string; fileId: string } | null {
  let credObj: any = null
  let credId = ''
  let fileId = ''

  try {
    // Check if this is an object wrapper with fileId
    if (link.startsWith('{') && link.includes('"fileId"')) {
      // Format: '{"credentialLink":"...","fileId":"..."}'
      const wrapper = JSON.parse(link)
      if (wrapper.fileId) {
        fileId = wrapper.fileId
        // Parse the actual credential from credentialLink
        if (wrapper.credentialLink) {
          const innerLink = wrapper.credentialLink
          if (innerLink.includes(',{')) {
            // Format: 'url,{json}' inside wrapper
            const commaIdx = innerLink.indexOf(',')
            const jsonStr = innerLink.slice(commaIdx + 1)
            credObj = JSON.parse(jsonStr)
            credObj.credentialId = fileId
          } else if (innerLink.startsWith('{')) {
            credObj = JSON.parse(innerLink)
            credObj.credentialId = fileId
          }
        }
      }
    } else if (link.match(/^([\w-]+),\{.*\}$/)) {
      // Format: 'fileid,{json}' (native credentials)
      const commaIdx = link.indexOf(',')
      fileId = link.slice(0, commaIdx)
      credId = fileId // For native credentials, credId and fileId are the same
      const jsonStr = link.slice(commaIdx + 1)
      credObj = JSON.parse(jsonStr)
      credObj.credentialId = fileId
    } else if (link.includes(',{')) {
      // Format: 'url,{json}' (external credentials with URL)
      const commaIdx = link.indexOf(',')
      const urlPart = link.slice(0, commaIdx)
      const jsonStr = link.slice(commaIdx + 1)
      credObj = JSON.parse(jsonStr)
      // For external credentials, we need to extract the ID from somewhere
      // Check if there's an ID in the credential object
      if (credObj.id) {
        fileId = credObj.id
      } else if (credObj.credentialId) {
        fileId = credObj.credentialId
      } else {
        // Generate a fallback ID from the URL
        fileId = urlPart.split('/').pop() || urlPart
      }
      credObj.credentialId = fileId
    } else if (link.startsWith('{')) {
      // Format: '{json}'
      credObj = JSON.parse(link)
      credId = credObj.credentialId || credObj.id || ''
      fileId = credId // For this format, use credId as fileId
    } else if (link) {
      // Just a plain ID
      credId = link
      fileId = link

      // Create a minimal credential object for external credentials
      credObj = { id: fileId, credentialId: fileId }
    }

    if (credObj || fileId) {
      return { credObj, credId, fileId }
    }
  } catch (e) {
    console.error('Error parsing credential link:', e)
  }

  return null
}

// Single function to handle ALL credential rendering for any section
function renderSectionCredentials(
  credentialLink: string | string[] | undefined,
  setDialogCredObj: any,
  setDialogImageUrl: any,
  setOpenCredDialog: any
): ReactNode {
  // Get credential links as array
  const credLinks = getCredentialLinks(credentialLink)

  // Parse and deduplicate credentials
  const dedupedCreds: { credObj: any; credId: string; fileId: string }[] = []
  const seen = new Set<string>()

  credLinks.forEach(link => {
    const parsed = parseCredentialLink(link)
    if (parsed && !seen.has(parsed.fileId)) {
      dedupedCreds.push(parsed)
      seen.add(parsed.fileId)
    }
  })

  // If no credentials, return null
  if (dedupedCreds.length === 0) return null

  // Render the credentials section
  return (
    <Box
      className='rs-avoid-break'
      sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}
    >
      {dedupedCreds.map(({ credObj, credId, fileId }, idx) => (
        <Typography
          key={fileId || idx}
          variant='body2'
          sx={{
            color: '#2563EB',
            textDecoration: 'underline',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            mr: 2,
            cursor: 'pointer',
            gap: '6px',
            '&:hover': { opacity: 0.85 },
            '&:focus-visible': { outline: '2px solid #2563EB', outlineOffset: '2px' }
          }}
          onClick={() => {
            openCredentialDialog(
              credObj,
              fileId,
              setDialogCredObj,
              setDialogImageUrl,
              setOpenCredDialog
            )
          }}
        >
          <WorkspacePremiumIcon
            sx={{ fontSize: 16, color: '#2563EB', flex: '0 0 auto' }}
          />
          {credObj &&
            (credObj.credentialStatus === 'verified' ||
              credObj.credentialStatus?.status === 'verified') && (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <BlueVerifiedBadge />
              </span>
            )}
          {credObj && getCredentialName(credObj) !== 'Credential'
            ? getCredentialName(credObj)
            : `External Credential ${fileId.substring(0, 8)}...`}
        </Typography>
      ))}
    </Box>
  )
}

// Helper to extract portfolio from credential link (for sections that need it)
function getPortfolioFromCredentialLink(
  credentialLink: string | string[] | undefined
): any[] | undefined {
  const credLinks = getCredentialLinks(credentialLink)
  if (credLinks.length === 0) return undefined

  const firstCred = parseCredentialLink(credLinks[0])
  return firstCred?.credObj?.credentialSubject?.portfolio
}

// Helper function to open credential dialog with proper file ID
function openCredentialDialog(
  credObj: any,
  fileId: string,
  setDialogCredObj: any,
  setDialogImageUrl: any,
  setOpenCredDialog: any
) {
  const credentialToShow = credObj || {}
  // Ensure credentialId is always set to the file ID
  credentialToShow.credentialId = fileId

  setDialogCredObj(credentialToShow)
  setDialogImageUrl(null)
  setOpenCredDialog(true)
}

// Helper to render portfolio links/images
function renderPortfolio(portfolio: any[] | undefined) {
  if (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) return null
  return (
    <ul style={{ paddingLeft: 20, margin: 0 }}>
      {portfolio.map((item, idx) =>
        item.name && item.url ? (
          <li key={idx} style={{ marginBottom: 2 }}>
            <a
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: '#2563EB', textDecoration: 'underline' }}
            >
              {item.name}
            </a>
          </li>
        ) : null
      )}
    </ul>
  )
}

// Helper to render attached files
function renderAttachedFiles(attachedFiles: string[] | undefined) {
  if (!attachedFiles || attachedFiles.length === 0) return null

  return (
    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {attachedFiles.map((fileUrl: string, idx: number) => {
        // Extract filename from URL or use a default
        let fileName = `Attachment ${idx + 1}`
        try {
          if (fileUrl.includes('drive.google.com')) {
            // For Google Drive URLs, we can't easily get the filename
            fileName = `File ${idx + 1}`
          } else {
            // Try to extract filename from URL
            const urlParts = fileUrl.split('/')
            const lastPart = urlParts[urlParts.length - 1]
            if (lastPart && !lastPart.includes('?')) {
              fileName = decodeURIComponent(lastPart)
            }
          }
        } catch (e) {
          console.error('Error parsing file URL:', e)
        }

        return (
          <Box
            key={`file-${idx}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <AttachFileIcon sx={{ fontSize: 16, color: '#2563EB' }} />
            <Typography
              variant='body2'
              sx={{
                color: '#2563EB',
                textDecoration: 'underline',
                fontSize: '14px',
                fontFamily: 'Arial'
              }}
            >
              {fileName}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}

// Helper to render date or duration for sections
function renderDateOrDuration({
  duration,
  startDate,
  endDate,
  currentlyVolunteering,
  noExpiration,
  issueDate
}: {
  duration?: string
  startDate?: string
  endDate?: string
  currentlyVolunteering?: boolean
  noExpiration?: boolean
  issueDate?: string
}) {
  if (duration) {
    return duration
  }
  if (noExpiration) {
    return 'No Expiration'
  }
  if (issueDate) {
    return `Issued on ${issueDate}`
  }
  const start = startDate ?? ''
  let end = endDate ?? ''
  if (!endDate && (currentlyVolunteering || start)) {
    end = 'Present'
  }
  if (!start && !end) {
    return ''
  }
  return `${start}${start ? ' - ' : ''}${end}`
}

// Single Experience Item Component
const ExperienceItem: React.FC<{
  item: WorkExperience
  index: number
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, index, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate
  })

  return (
    <Box key={item.id || `exp-${index}`} className='rs-avoid-break' sx={{ mb: '12px' }}>
      {/* Further reduced to prevent overlap */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography
          variant='subtitle1'
          sx={{
            fontWeight: 700,
            fontSize: TEXT_MD, // Standardized font size
            fontFamily: 'Arial'
          }}
        >
          {item.position ?? item.title}
        </Typography>
      </Box>
      <Typography
        variant='body2'
        sx={{
          color: '#000',
          fontWeight: 400,
          fontSize: TEXT_SM, // Slightly smaller for company name
          fontFamily: 'Arial'
        }}
      >
        {item.company}
      </Typography>
      {dateText && (
        <Typography
          variant='body2'
          sx={{
            color: '#000',
            mb: 0.5,
            fontWeight: 400,
            fontSize: TEXT_SM,
            fontFamily: 'Arial'
          }}
        >
          {dateText}
        </Typography>
      )}
      {item.description && (
        <Typography
          variant='body2'
          sx={{
            mb: 1,
            fontWeight: 400,
            fontSize: TEXT_SM, // Reduced font size for descriptions
            fontFamily: 'Arial',
            lineHeight: 1.4 // Tighter line spacing
          }}
        >
          <HTMLWithVerifiedLinks htmlContent={item.description} />
        </Typography>
      )}
      {/* Portfolio */}
      {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
      {/* Render credentials */}
      {renderSectionCredentials(
        item.credentialLink,
        setDialogCredObj,
        setDialogImageUrl,
        setOpenCredDialog
      )}
      {/* Render attached files */}
      {renderAttachedFiles(item.attachedFiles)}
    </Box>
  )
}

// Single Education Item Component
const EducationItem: React.FC<{
  item: Education
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate,
    currentlyVolunteering: item.currentlyEnrolled
  })

  // Fix for empty degree and program name
  let educationTitle = ''
  if (item.type && item.programName) {
    educationTitle = `${item.type} in ${item.programName}`
  } else if (item.type) {
    educationTitle = String(item.type)
  } else if (item.programName) {
    educationTitle = String(item.programName)
  }
  if (educationTitle && item.institution) {
    educationTitle += `, ${item.institution}`
  } else if (item.institution) {
    educationTitle = item.institution
  }

  return (
    <Box key={item.id} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontSize: TEXT_SM, fontFamily: 'Arial' }}
          >
            {educationTitle}
          </Typography>
          {dateText && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontWeight: 400,
                fontSize: TEXT_SM,
                fontFamily: 'Arial'
              }}
            >
              {dateText}
              {item.inProgress ? ' | In Progress' : ''}
            </Typography>
          )}
          {item.description && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontWeight: 400,
                fontSize: TEXT_SM,
                fontFamily: 'Arial'
              }}
            >
              <HTMLWithVerifiedLinks htmlContent={item.description} />
            </Typography>
          )}
          {/* Portfolio */}
          {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
          {/* Render credentials */}
          {renderSectionCredentials(
            item.credentialLink,
            setDialogCredObj,
            setDialogImageUrl,
            setOpenCredDialog
          )}
          {/* Render attached files */}
          {renderAttachedFiles(item.attachedFiles)}
        </Box>
      </Box>
    </Box>
  )
}

// Single Certification Item Component
const CertificationItem: React.FC<{
  item: Certification
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  let displayDate = ''
  if (item.noExpiration) {
    displayDate = 'No Expiration'
  }
  if (item.issueDate) {
    if (displayDate) {
      displayDate = `Issued on ${item.issueDate} | ${displayDate}`
    } else {
      displayDate = `Issued on ${item.issueDate}`
    }
  }

  return (
    <Box key={item.id || item.name} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ ml: 0 }}>
        <Typography
          variant='subtitle1'
          sx={{ fontWeight: 700, fontSize: TEXT_MD, fontFamily: 'Arial' }}
        >
          {item.name}
        </Typography>
        {item.issuer && (
          <Typography
            variant='body2'
            sx={{
              color: '#000',
              fontFamily: 'Arial',
              fontSize: TEXT_MD,
              fontWeight: 400
            }}
          >
            Issued by {item.issuer}
          </Typography>
        )}
        {displayDate && (
          <Typography
            variant='body2'
            sx={{
              color: '#000',
              fontFamily: 'Arial',
              fontSize: TEXT_MD,
              fontWeight: 400
            }}
          >
            {displayDate}
          </Typography>
        )}
        {item.verificationStatus === 'verified' && item.credentialId && (
          <Typography
            variant='body2'
            sx={{
              color: '#2563EB',
              fontFamily: 'Arial',
              fontSize: TEXT_MD,
              fontWeight: 400
            }}
          >
            Credential ID: {item.credentialId}
          </Typography>
        )}
        {/* Portfolio */}
        {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
        {/* Render credentials */}
        {renderSectionCredentials(
          item.credentialLink,
          setDialogCredObj,
          setDialogImageUrl,
          setOpenCredDialog
        )}
      </Box>
    </Box>
  )
}

// Single Project Item Component
const ProjectItem: React.FC<{
  item: Project
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({})

  return (
    <Box key={item.id} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontFamily: 'Arial', fontSize: TEXT_MD }}
          >
            {item.name}
          </Typography>
          {dateText && (
            <Typography
              variant='body2'
              sx={{ fontFamily: 'Arial', fontSize: TEXT_MD, fontWeight: 400 }}
            >
              {dateText}
            </Typography>
          )}
          {item.description && (
            <Typography
              variant='body2'
              sx={{ mb: 1, fontFamily: 'Arial', fontSize: TEXT_MD, fontWeight: 400 }}
            >
              <HTMLWithVerifiedLinks htmlContent={item.description} />
            </Typography>
          )}
          {item.url && (
            <Box sx={{ mb: 1 }}>
              <LinkWithFavicon url={item.url} />
            </Box>
          )}
          {/* Portfolio */}
          {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
          {/* Render credentials */}
          {renderSectionCredentials(
            item.credentialLink,
            setDialogCredObj,
            setDialogImageUrl,
            setOpenCredDialog
          )}
        </Box>
      </Box>
    </Box>
  )
}

// Single Professional Affiliation Item Component
const ProfessionalAffiliationItem: React.FC<{
  item: ProfessionalAffiliation
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate
  })

  return (
    <Box key={item.id} className='rs-avoid-break' sx={{ mb: '12px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontSize: TEXT_MD, fontFamily: 'Arial' }}
          >
            {item.name ?? item.role ?? 'Affiliation'}
            {item.organization && ` of the ${item.organization}`}
          </Typography>
          {dateText && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontFamily: 'Arial',
                fontSize: TEXT_MD,
                fontWeight: 400
              }}
            >
              {dateText}
            </Typography>
          )}
          {item.activeAffiliation && (
            <Typography
              variant='body2'
              sx={{
                color: '#000',
                fontFamily: 'Arial',
                fontSize: TEXT_MD,
                fontWeight: 400
              }}
            >
              Active Affiliation
            </Typography>
          )}
          {/* Portfolio */}
          {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
          {/* Render credentials */}
          {renderSectionCredentials(
            item.credentialLink,
            setDialogCredObj,
            setDialogImageUrl,
            setOpenCredDialog
          )}
        </Box>
      </Box>
    </Box>
  )
}

// Single Volunteer Work Item Component
const VolunteerWorkItem: React.FC<{
  item: VolunteerWork
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ item, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  const dateText = renderDateOrDuration({
    duration: item.duration,
    startDate: item.startDate,
    endDate: item.endDate,
    currentlyVolunteering: item.currentlyVolunteering
  })

  return (
    <Box key={item.id} sx={{ mb: '10px' }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
        <Box sx={{ ml: 0 }}>
          <Typography
            variant='subtitle1'
            sx={{ fontWeight: 700, fontFamily: 'Arial', fontSize: TEXT_MD }}
          >
            {item.role} at {item.organization}
          </Typography>
          {item.location && (
            <Typography
              variant='body2'
              sx={{ fontFamily: 'Arial', fontSize: TEXT_MD, fontWeight: 400 }}
            >
              {item.location}
            </Typography>
          )}
          {dateText && (
            <Typography
              variant='body2'
              sx={{ fontFamily: 'Arial', fontSize: TEXT_MD, fontWeight: 400 }}
            >
              {dateText}
            </Typography>
          )}
          {item.description && (
            <Typography
              variant='body2'
              sx={{ mb: 1, fontFamily: 'Arial', fontSize: TEXT_MD, fontWeight: 400 }}
            >
              <HTMLWithVerifiedLinks htmlContent={item.description} />
            </Typography>
          )}
          {/* Portfolio */}
          {renderPortfolio(getPortfolioFromCredentialLink(item.credentialLink))}
          {/* Render credentials */}
          {renderSectionCredentials(
            item.credentialLink,
            setDialogCredObj,
            setDialogImageUrl,
            setOpenCredDialog
          )}
        </Box>
      </Box>
    </Box>
  )
}

// Helper function to extract plain text from HTML and split into individual skills
const extractSkillsFromHTML = (htmlContent: string): string[] => {
  if (!htmlContent) return []

  // Create a temporary DOM element to extract text content
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // Get plain text
  const plainText = tempDiv.textContent || tempDiv.innerText || ''

  // Split by commas, bullets, and newlines (similar to LaTeX parsing)
  return plainText
    .split(/[,•\n]+/)
    .map(skill => skill.trim())
    .filter(Boolean)
}

// Single Language Item Component
const LanguageItem: React.FC<{ lang: Language; idx: number }> = ({ lang, idx }) => {
  return (
    <Box
      key={lang.id || `language-${idx}`}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        width: 'calc(100% - 8px)',
        mb: 1
      }}
    >
      <Typography sx={{ fontWeight: 400, fontSize: TEXT_MD, fontFamily: 'Arial' }}>
        {lang.name} {lang.proficiency ? `(${lang.proficiency})` : ''}
      </Typography>
    </Box>
  )
}

// Single Hobby Item Component
const HobbyItem: React.FC<{ hobby: string; idx: number }> = ({ hobby, idx }) => {
  return (
    <Typography
      component='li'
      key={`hobby-${idx}`}
      sx={{ fontWeight: 400, fontSize: TEXT_MD, fontFamily: 'Arial', mb: 1 }}
    >
      {hobby}
    </Typography>
  )
}

// Single Publication Item Component
const PublicationItem: React.FC<{ item: Publication }> = ({ item }) => {
  return (
    <Box key={item.id} sx={{ mb: '10px' }}>
      <Typography
        variant='subtitle1'
        sx={{ fontWeight: 700, fontFamily: 'Arial', fontSize: TEXT_MD }}
      >
        {item.title}
      </Typography>
      <Typography
        variant='body2'
        sx={{ fontFamily: 'Arial', fontSize: TEXT_MD, fontWeight: 400 }}
      >
        {item.publisher} | {item.publishedDate || 'Published'}
      </Typography>
      {item.url && (
        <Box sx={{ mb: 1 }}>
          <LinkWithFavicon url={item.url} />
        </Box>
      )}
    </Box>
  )
}

const SkillsSection: React.FC<{
  items: Skill[]
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ items, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  if (!items?.length) return null

  // Extract all skills from all items and flatten into a single array
  const allSkills = items.flatMap(item => extractSkillsFromHTML(item.skills || ''))

  // Collect all credential links from all skill items
  const allCredLinks = items.flatMap(item => {
    const links = getCredentialLinks(item.credentialLink)

    return links
  })
  const combinedCredentialLink = allCredLinks.length > 0 ? allCredLinks : undefined

  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Skills</SectionTitle>
      <Typography
        sx={{
          fontWeight: 400,
          fontSize: TEXT_MD,
          fontFamily: 'Arial',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 8px',
          alignItems: 'center'
        }}
      >
        {allSkills.map((skill, index) => (
          <React.Fragment key={index}>
            <span>{skill}</span>
            {index < allSkills.length - 1 && <span style={{ color: '#666' }}>•</span>}
          </React.Fragment>
        ))}
      </Typography>
      {/* Render all credentials at the end of the section */}
      {renderSectionCredentials(
        combinedCredentialLink,
        setDialogCredObj,
        setDialogImageUrl,
        setOpenCredDialog
      )}
    </Box>
  )
}

const LanguagesSection: React.FC<{ items: Language[] }> = ({ items }) => {
  if (!items?.length) return null
  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Languages</SectionTitle>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {items.map((lang, idx) => (
          <LanguageItem key={lang.id || `language-${idx}`} lang={lang} idx={idx} />
        ))}
      </Box>
    </Box>
  )
}

const HobbiesSection: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items?.length) return null
  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Hobbies and Interests</SectionTitle>
      <Box component='ul' sx={{ pl: 2 }}>
        {items.map((hobby, idx) => (
          <HobbyItem key={`hobby-${idx}`} hobby={hobby} idx={idx} />
        ))}
      </Box>
    </Box>
  )
}

const formatRecommendationDate = (value?: string) => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const RecommendationsSection: React.FC<{ entries: RecommendationEntry[] }> = ({
  entries
}) => {
  if (!entries?.length) return null

  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Recommendations</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {entries.map(entry => (
          <Box
            key={entry.id}
            sx={{
              p: 1.2,
              border: '1px solid #E5E7EB',
              borderRadius: 1,
              backgroundColor: '#F9FAFB'
            }}
          >
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: '15px',
                fontFamily: 'Arial',
                display: 'flex',
                justifyContent: 'space-between',
                gap: 1
              }}
            >
              <span>
                {entry.author}
                {entry.relationship ? ` • ${entry.relationship}` : ''}
              </span>
              <span style={{ color: '#6B7280', fontWeight: 500, fontSize: '12px' }}>
                {formatRecommendationDate(entry.createdAt)}
              </span>
            </Typography>
            {entry.email && (
              <Typography
                sx={{
                  color: '#2563EB',
                  fontSize: '13px',
                  fontFamily: 'Arial',
                  mb: 0.5
                }}
              >
                {entry.email}
              </Typography>
            )}
            <Typography
              sx={{
                fontSize: '14px',
                color: '#111827',
                fontFamily: 'Arial',
                lineHeight: 1.4,
                whiteSpace: 'pre-line'
              }}
            >
              {entry.message}
            </Typography>
            {entry.skills && entry.skills.length > 0 && (
              <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {entry.skills.map(skill => (
                  <Chip
                    key={skill}
                    label={skill}
                    size='small'
                    sx={{
                      backgroundColor: '#E0E7FF',
                      color: '#1E3A8A',
                      fontWeight: 600,
                      height: 24
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

// Improved usePagination that handles item-level splitting
function usePagination(content: ReactNode[]) {
  const [pages, setPages] = useState<ReactNode[][]>([])
  const measureRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout

    const measureAndPaginate = () => {
      if (!measureRef.current) return

      const fullPageHeightPx = mmToPx(parseFloat(PAGE_SIZE.height))
      const firstPageContentMaxHeightPx =
        fullPageHeightPx -
        HEADER_HEIGHT_PX -
        FOOTER_HEIGHT_PX -
        CONTENT_PADDING_TOP -
        CONTENT_PADDING_BOTTOM
      const subsequentPageContentMaxHeightPx =
        fullPageHeightPx -
        60 -
        FOOTER_HEIGHT_PX -
        CONTENT_PADDING_TOP -
        CONTENT_PADDING_BOTTOM

      const horizontalPaddingPx = window.innerWidth < 640 ? 20 : 50
      measureRef.current.style.width = '100%'
      measureRef.current.style.maxWidth = PAGE_MAX_WIDTH
      measureRef.current.style.padding = `${CONTENT_PADDING_TOP}px ${horizontalPaddingPx}px ${CONTENT_PADDING_BOTTOM}px`

      const contentElements = Array.from(measureRef.current.children)
      if (contentElements.length === 0) {
        setPages([[]])
        return
      }

      const contentHeights = contentElements.map((el, idx) => {
        el.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(el)
        const marginTop = parseFloat(computedStyle.marginTop)
        const marginBottom = parseFloat(computedStyle.marginBottom)
        const height = (el as HTMLElement).offsetHeight + marginTop + marginBottom
        return height
      })

      let currentPage: ReactNode[] = []
      let currentHeight = 0
      const paginated: ReactNode[][] = []
      const SAFETY_MARGIN = 50

      for (let i = 0; i < content.length; i++) {
        const element = content[i]
        const elementHeight = contentHeights[i] || 0
        const currentPageIndex = paginated.length
        const contentMaxHeightPx =
          currentPageIndex === 0
            ? firstPageContentMaxHeightPx
            : subsequentPageContentMaxHeightPx
        const effectiveMaxHeight = contentMaxHeightPx - SAFETY_MARGIN

        // --- PATCH: Prevent orphaned section titles ---
        // If this is a section title (Box with SectionTitle inside), and next element exists,
        // check if both title and next item fit. If not, break to new page before the title.
        const isSectionTitle =
          React.isValidElement(element) &&
          element.type === Box &&
          element.props.children &&
          React.isValidElement(element.props.children) &&
          element.props.children.type === SectionTitle
        if (isSectionTitle && i + 1 < content.length) {
          const nextElementHeight = contentHeights[i + 1] || 0
          if (currentHeight + elementHeight + nextElementHeight > effectiveMaxHeight) {
            if (currentPage.length > 0) {
              paginated.push([...currentPage])
              currentPage = []
              currentHeight = 0
            }
          }
        }
        // --- END PATCH ---

        if (currentHeight > 0 && currentHeight + elementHeight > effectiveMaxHeight) {
          paginated.push([...currentPage])
          currentPage = []
          currentHeight = 0
        }
        currentPage.push(element)
        currentHeight += elementHeight
      }
      if (currentPage.length > 0) {
        paginated.push(currentPage)
      }
      if (paginated.length === 0) {
        paginated.push([])
      }
      setPages(paginated)
    }
    timeoutId = setTimeout(measureAndPaginate, 300)
    window.addEventListener('resize', measureAndPaginate)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', measureAndPaginate)
    }
  }, [content])
  return { pages, measureRef }
}

// Patch: Extract summary from professionalSummary.credentialSubject.narrative if present
function getSummary(resume: any) {
  if (
    resume.professionalSummary &&
    resume.professionalSummary.credentialSubject &&
    resume.professionalSummary.credentialSubject.narrative
  ) {
    return resume.professionalSummary.credentialSubject.narrative
  }
  return resume.summary || ''
}

const ResumePreview: React.FC<{
  data?: Resume
  forcedId?: string
  recommendations?: RecommendationEntry[]
}> = ({ data: propData, forcedId, recommendations = [] }) => {
  const storeResume = useAppSelector(
    (state: RootState) => state.resumeEditor?.resume || null
  )
  const resume = propData || storeResume

  const [initialRenderComplete, setInitialRenderComplete] = useState(false)

  const [openCredDialog, setOpenCredDialog] = useState(false)
  const [dialogCredObj, setDialogCredObj] = useState<any>(null)
  const [dialogImageUrl, setDialogImageUrl] = useState<string | null>(null)

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setInitialRenderComplete(true)
    }, 500)
    return () => clearTimeout(timeoutId)
  }, [])

  // Build content sections array - memoized to prevent recreation on every render
  // Now we flatten sections with multiple items into individual elements
  const contentSections = useMemo(() => {
    const elements: ReactNode[] = []

    if (resume) {
      console.log('Building content sections:', {
        hasSummary: !!resume.summary,
        hasSocialLinks: !!resume.contact?.socialLinks,
        experienceCount: resume.experience?.items?.length || 0,
        educationCount: resume.education?.items?.length || 0,
        skillsCount: resume.skills?.items?.length || 0
      })

      // Always add summary as the first element, using getSummary
      const summary = getSummary(resume)
      if (summary) {
        elements.push(<SummarySection key='summary' summary={summary} />)
      }
      // Social links are now in the first page header, so we don't add them here

      // Experience section - add title then each item separately
      if (resume.experience?.items?.length) {
        elements.push(
          <Box key='experience-title' sx={{ mb: '6px' }}>
            <SectionTitle>Work Experience</SectionTitle>
          </Box>
        )
        resume.experience.items.forEach((item, index) => {
          elements.push(
            <ExperienceItem
              key={`experience-${item.id || index}`}
              item={item}
              index={index}
              setDialogCredObj={setDialogCredObj}
              setDialogImageUrl={setDialogImageUrl}
              setOpenCredDialog={setOpenCredDialog}
            />
          )
        })
      }

      // Certifications section - add title then each item separately
      if (resume.certifications?.items?.length) {
        elements.push(
          <Box key='certifications-title' sx={{ mb: '6px' }}>
            <SectionTitle>Certifications</SectionTitle>
          </Box>
        )
        resume.certifications.items.forEach(item => {
          elements.push(
            <CertificationItem
              key={`certification-${item.id || item.name}`}
              item={item}
              setDialogCredObj={setDialogCredObj}
              setDialogImageUrl={setDialogImageUrl}
              setOpenCredDialog={setOpenCredDialog}
            />
          )
        })
      }

      // Education section - add title then each item separately
      if (resume.education?.items?.length) {
        elements.push(
          <Box key='education-title' sx={{ mb: '6px' }}>
            <SectionTitle>Education</SectionTitle>
          </Box>
        )
        resume.education.items.forEach(item => {
          elements.push(
            <EducationItem
              key={`education-${item.id}`}
              item={item}
              setDialogCredObj={setDialogCredObj}
              setDialogImageUrl={setDialogImageUrl}
              setOpenCredDialog={setOpenCredDialog}
            />
          )
        })
      }

      // Skills section - keep as one unit since it's usually not that tall
      if (resume.skills?.items?.length) {
        elements.push(
          <SkillsSection
            key='skills'
            items={resume.skills.items}
            setDialogCredObj={setDialogCredObj}
            setDialogImageUrl={setDialogImageUrl}
            setOpenCredDialog={setOpenCredDialog}
          />
        )
      }

      // Professional Affiliations - add title then each item separately
      if (resume.professionalAffiliations?.items?.length) {
        elements.push(
          <Box key='affiliations-title' sx={{ mb: '6px' }}>
            <SectionTitle>Professional Affiliations</SectionTitle>
          </Box>
        )
        resume.professionalAffiliations.items.forEach(item => {
          elements.push(
            <ProfessionalAffiliationItem
              key={`affiliation-${item.id}`}
              item={item}
              setDialogCredObj={setDialogCredObj}
              setDialogImageUrl={setDialogImageUrl}
              setOpenCredDialog={setOpenCredDialog}
            />
          )
        })
      }

      // Languages section - keep as one unit
      if (resume.languages?.items?.length) {
        elements.push(<LanguagesSection key='languages' items={resume.languages.items} />)
      }

      // Hobbies section - keep as one unit
      if (resume.hobbiesAndInterests?.length) {
        elements.push(<HobbiesSection key='hobbies' items={resume.hobbiesAndInterests} />)
      }

      // Projects - add title then each item separately
      if (resume.projects?.items?.length) {
        elements.push(
          <Box key='projects-title' sx={{ mb: '6px' }}>
            <SectionTitle>Projects</SectionTitle>
          </Box>
        )
        resume.projects.items.forEach(item => {
          elements.push(
            <ProjectItem
              key={`project-${item.id}`}
              item={item}
              setDialogCredObj={setDialogCredObj}
              setDialogImageUrl={setDialogImageUrl}
              setOpenCredDialog={setOpenCredDialog}
            />
          )
        })
      }

      // Publications - add title then each item separately
      if (resume.publications?.items?.length) {
        elements.push(
          <Box key='publications-title' sx={{ mb: '6px' }}>
            <SectionTitle>Publications</SectionTitle>
          </Box>
        )
        resume.publications.items.forEach(item => {
          elements.push(<PublicationItem key={`publication-${item.id}`} item={item} />)
        })
      }

      if (recommendations?.length) {
        elements.push(
          <RecommendationsSection key='recommendations' entries={recommendations} />
        )
      }

      // Volunteer Work - add title then each item separately
      if (resume.volunteerWork?.items?.length) {
        elements.push(
          <Box key='volunteer-title' sx={{ mb: '6px' }}>
            <SectionTitle>Volunteer Work</SectionTitle>
          </Box>
        )
        resume.volunteerWork.items.forEach(item => {
          elements.push(
            <VolunteerWorkItem
              key={`volunteer-${item.id}`}
              item={item}
              setDialogCredObj={setDialogCredObj}
              setDialogImageUrl={setDialogImageUrl}
              setOpenCredDialog={setOpenCredDialog}
            />
          )
        })
      }
    }
    return elements
  }, [recommendations, resume])

  // Now use pagination with the flattened content elements
  const { pages, measureRef } = usePagination(contentSections)

  if (!resume) return null

  return (
    <Box
      id='resume-preview'
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: { xs: 2, sm: 0 },
        overflow: 'visible',
        px: { xs: 1.5, sm: 0 },
        '@media print': { margin: 0, padding: 0 }
      }}
    >
      {/* Dialog for credential or image viewing */}
      <Dialog
        open={openCredDialog}
        onClose={() => setOpenCredDialog(false)}
        maxWidth='xs'
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(6px)',
            position: 'relative',
            overflow: 'visible'
          }
        }}
        BackdropProps={{
          sx: { background: 'rgba(30, 41, 59, 0.25)', backdropFilter: 'blur(2px)' }
        }}
      >
        <DialogContent
          sx={{ display: 'block', p: 0, background: 'transparent', position: 'relative' }}
        >
          {/* Close button */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              cursor: 'pointer',
              color: '#222',
              bgcolor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              p: 0.5,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: '#e0e7ef', color: '#003FE0' }
            }}
            onClick={() => setOpenCredDialog(false)}
          >
            <CloseIcon fontSize='medium' />
          </Box>
          {dialogCredObj && <MinimalCredentialViewer vcData={dialogCredObj} />}
          {dialogImageUrl && (
            <img
              src={dialogImageUrl}
              alt='Attachment'
              style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: 8 }}
            />
          )}
        </DialogContent>
      </Dialog>
      {/* Hidden measure area */}
      <Box
        ref={measureRef}
        sx={{
          visibility: 'hidden',
          position: 'absolute',
          width: '100%',
          maxWidth: PAGE_MAX_WIDTH,
          pt: CONTENT_PADDING_TOP + 'px',
          pb: CONTENT_PADDING_BOTTOM + 'px',
          px: { xs: '20px', sm: '50px' },
          left: '-9999px', // Move far off screen
          top: 0
        }}
      >
        {contentSections}
      </Box>

      {/* Render pages */}
      {initialRenderComplete && (
        <>
          {(pages.length > 0 ? pages : [[]]).map((pageContent, pageIndex) => (
            <Box
              key={`page-${pageIndex}`}
              id={`page-${pageIndex}`}
              className='resume-page'
              sx={{
                width: '100%',
                maxWidth: PAGE_MAX_WIDTH,
                height: PAGE_SIZE.height,
                position: 'relative',
                bgcolor: '#fff',
                border: '1px solid #78809A',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mx: 'auto',
                mb: '30px',
                mt: pageIndex === 0 ? '10px' : 0,
                '@media print': {
                  width: PAGE_SIZE.width,
                  height: PAGE_SIZE.height,
                  margin: 0,
                  padding: 0,
                  boxShadow: 'none'
                }
              }}
            >
              {pageIndex === 0 ? (
                <FirstPageHeader
                  fullName={resume.contact?.fullName || 'Your Name'}
                  city={resume.contact?.location?.city}
                  forcedId={forcedId}
                  socialLinks={resume.contact?.socialLinks}
                  email={resume.contact?.email}
                  phone={resume.contact?.phone}
                />
              ) : (
                <SubsequentPageHeader
                  fullName={resume.contact?.fullName || 'Your Name'}
                />
              )}
              <Box
                sx={{
                  pt: CONTENT_PADDING_TOP + 'px',
                  pb: CONTENT_PADDING_BOTTOM + 'px',
                  px: { xs: '20px', sm: '50px' },
                  position: 'relative',
                  minHeight: 0,
                  height: `calc(100% - ${pageIndex === 0 ? HEADER_HEIGHT_PX : 60}px - ${FOOTER_HEIGHT_PX}px)`,
                  overflow: 'hidden' // Prevent content from spilling out
                }}
              >
                {pageContent}
              </Box>
              <Box
                sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%' }}
              >
                <PageFooter
                  fullName={resume.contact?.fullName || 'Your Name'}
                  email={resume.contact?.email || 'email@example.com'}
                  phone={resume.contact?.phone}
                  pageNumber={pageIndex + 1}
                  totalPages={Math.max(pages.length, 1)}
                  forcedId={forcedId}
                />
              </Box>
            </Box>
          ))}
        </>
      )}
    </Box>
  )
}

export default ResumePreview
