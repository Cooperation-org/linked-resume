import React, {
  useState,
  ReactNode,
  useEffect,
  useMemo
} from 'react'
import { Box } from '@mui/material'
import { useSelector } from 'react-redux'
import { RootState } from '../redux/store'
import { usePagination } from '../hooks/usePagination'
import MinimalCredentialViewer from './MinimalCredentialViewer'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import CloseIcon from '@mui/icons-material/Close'
import { RecommendationEntry } from '../services/recommendationService'

// Extracted Subcomponents
import { SectionTitle } from './resumePreview/SectionTitle'
import { FirstPageHeader, SubsequentPageHeader, HEADER_HEIGHT_PX } from './resumePreview/Headers'
import { PageFooter, FOOTER_HEIGHT_PX } from './resumePreview/PageFooter'
import { SummarySection } from './resumePreview/SummarySection'
import { ExperienceItem } from './resumePreview/ExperienceItem'
import { EducationItem } from './resumePreview/EducationItem'
import { CertificationItem } from './resumePreview/CertificationItem'
import { ProjectItem } from './resumePreview/ProjectItem'
import { ProfessionalAffiliationItem } from './resumePreview/ProfessionalAffiliationItem'
import { VolunteerWorkItem } from './resumePreview/VolunteerWorkItem'
import { SkillsSection } from './resumePreview/SkillsSection'
import { LanguagesSection } from './resumePreview/LanguagesSection'
import { HobbiesSection } from './resumePreview/HobbiesSection'
import { PublicationItem } from './resumePreview/PublicationItem'

const PAGE_SIZE = { width: '210mm', height: '297mm' }
const CONTENT_PADDING_TOP = 20
const CONTENT_PADDING_BOTTOM = 15

const mmToPx = (mm: number) => mm * 3.779527559





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
  const storeResume = useSelector((state: RootState) => state.resume?.resume || null)
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
  }, [resume])

  const isSectionTitle = (el: React.ReactElement) => {
    return el.props?.children && React.isValidElement(el.props.children) && el.props.children.type === SectionTitle;
  }
  
  // Now use pagination with the flattened content elements
  const { pages, measureRef } = usePagination(contentSections, isSectionTitle)

  if (!resume) return null

  return (
    <Box
      id='resume-preview'
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'visible',
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
          width: PAGE_SIZE.width,
          pt: CONTENT_PADDING_TOP + 'px',
          pb: CONTENT_PADDING_BOTTOM + 'px',
          px: '50px',
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
                width: PAGE_SIZE.width,
                height: PAGE_SIZE.height,
                position: 'relative',
                bgcolor: '#fff',
                border: '1px solid #78809A',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                mx: 'auto',
                mb: '30px',
                mt: pageIndex === 0 ? '10px' : 0,
                '@media print': {
                  width: '100%',
                  height: '100%',
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
                  px: '50px',
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
