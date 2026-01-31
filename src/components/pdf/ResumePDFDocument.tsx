import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  Link,
  Image
} from '@react-pdf/renderer'
import { styles } from './pdfStyles'
import { RecommendationEntry } from '../../services/recommendationService'

interface ResumePDFDocumentProps {
  resume: Resume
  recommendations?: RecommendationEntry[]
  resumeId?: string | null
  qrCodeDataUrl?: string
}

// Helper to strip HTML tags
const stripHtml = (html: string): string => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').trim()
}

// Helper to render date or duration
const renderDateOrDuration = ({
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
}): string => {
  if (duration) return duration
  if (noExpiration) return 'No Expiration'
  if (issueDate) return `Issued on ${issueDate}`
  const start = startDate ?? ''
  let end = endDate ?? ''
  if (!endDate && (currentlyVolunteering || start)) {
    end = 'Present'
  }
  if (!start && !end) return ''
  return `${start}${start ? ' - ' : ''}${end}`
}

// Helper to extract plain text skills from HTML
const extractSkillsFromHTML = (htmlContent: string): string[] => {
  if (!htmlContent) return []
  const plainText = stripHtml(htmlContent)
  return plainText
    .split(/[,•\n]+/)
    .map(skill => skill.trim())
    .filter(Boolean)
}

// Helper to format recommendation date
const formatRecommendationDate = (value?: string): string => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  return parsed.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

// Helper to extract summary from professionalSummary.credentialSubject.narrative if present
const getSummary = (resume: Resume): string => {
  if (
    (resume as any).professionalSummary &&
    (resume as any).professionalSummary.credentialSubject &&
    (resume as any).professionalSummary.credentialSubject.narrative
  ) {
    return (resume as any).professionalSummary.credentialSubject.narrative
  }
  return resume.summary || ''
}


// First Page Header Component
const FirstPageHeader: React.FC<{
  resume: Resume
  recommendations: number
  qrCodeDataUrl?: string
  resumeId?: string | null
}> = ({ resume, recommendations, qrCodeDataUrl, resumeId }) => {
  const { contact } = resume
  const hasValidId = !!resumeId && !!qrCodeDataUrl

  return (
    <View style={styles.headerFirst}>
      <View style={styles.headerContent}>
        <View style={styles.headerNameRow}>
          <Text style={styles.headerName}>{contact?.fullName || 'Your Name'}</Text>
          {contact?.location?.city && (
            <Text style={styles.headerCity}>{contact.location.city}</Text>
          )}
        </View>

        {(contact?.email || contact?.phone) && (
          <View style={styles.headerContactRow}>
            {contact.email && (
              <Link src={`mailto:${contact.email}`} style={styles.headerLink}>
                {contact.email}
              </Link>
            )}
            {contact.email && contact.phone && (
              <Text style={styles.headerSeparator}>|</Text>
            )}
            {contact.phone && (
              <Link src={`tel:${contact.phone}`} style={styles.headerLink}>
                {contact.phone}
              </Link>
            )}
          </View>
        )}

        {contact?.socialLinks &&
          Object.values(contact.socialLinks).some(link => !!link) && (
            <View style={styles.headerSocialRow}>
              {Object.entries(contact.socialLinks).map(([platform, url], index, array) =>
                url ? (
                  <React.Fragment key={platform}>
                    <View style={styles.socialLinkContainer}>
                      <Link
                        src={url.startsWith('http') ? url : `https://${url}`}
                        style={styles.headerLink}
                      >
                        {url.replace(/^https?:\/\//, '').replace(/^www\./, '')}
                      </Link>
                    </View>
                    {index < array.length - 1 &&
                      Object.entries(contact.socialLinks || {}).filter(([_, u]) => u)[
                        index + 1
                      ] && <Text style={styles.headerSeparator}>|</Text>}
                  </React.Fragment>
                ) : null
              )}
            </View>
          )}
      </View>

      <View style={styles.qrSection}>
        {hasValidId && (
          <View style={styles.viewSourceContainer}>
            <Link
              src={`${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${resumeId}`}
              style={styles.viewSourceLink}
            >
              View Source
            </Link>
          </View>
        )}
        <View style={styles.qrContainer}>
          {qrCodeDataUrl ? (
            <Image src={qrCodeDataUrl} style={{ width: 65, height: 65 }} />
          ) : (
            <Text style={{ color: '#FFFFFF', fontSize: 7, textAlign: 'center', padding: 4 }}>
              No verifiable version created yet
            </Text>
          )}
        </View>
      </View>
    </View>
  )
}

// Subsequent Page Header (for future multi-page support)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SubsequentPageHeader: React.FC<{ fullName: string }> = ({ fullName }) => (
  <View style={styles.headerSubsequent}>
    <Text style={styles.headerSubsequentName}>{fullName}</Text>
  </View>
)

// Page Footer Component
const PageFooter: React.FC<{
  fullName: string
  email: string
  phone?: string
  pageNumber: number
  totalPages: number
  qrCodeDataUrl?: string
}> = ({ fullName, email, phone, pageNumber, totalPages, qrCodeDataUrl }) => (
  <View style={styles.footer}>
    <Text style={styles.footerText}>
      {fullName} | Page {pageNumber} of {totalPages}
      {phone && ` | ${phone}`}
      {' | '}
    </Text>
    <Link src={`mailto:${email}`} style={[styles.footerText, styles.footerLink]}>
      {email}
    </Link>
    {qrCodeDataUrl && (
      <Image src={qrCodeDataUrl} style={{ width: 24, height: 24, marginLeft: 8 }} />
    )}
  </View>
)

// Summary Section
const SummarySection: React.FC<{ summary?: string }> = ({ summary }) => {
  if (!summary) return null
  return (
    <View style={styles.summarySection}>
      <Text style={styles.sectionTitle}>Professional Summary</Text>
      <Text style={styles.summaryText}>{stripHtml(summary)}</Text>
    </View>
  )
}

// Recommendations Section
const RecommendationsSection: React.FC<{ entries: RecommendationEntry[] }> = ({
  entries
}) => {
  if (!entries?.length) return null

  return (
    <View style={styles.recommendationsSection}>
      <Text style={styles.sectionTitle}>Recommendations</Text>
      {entries.map(entry => (
        <View key={entry.id} style={styles.recommendationItem} wrap={false}>
          <View style={styles.recommendationHeader}>
            <Text style={styles.recommendationAuthor}>
              {entry.author}
              {entry.relationship ? ` • ${entry.relationship}` : ''}
            </Text>
            <Text style={styles.recommendationDate}>
              {formatRecommendationDate(entry.createdAt)}
            </Text>
          </View>
          {entry.email && (
            <Text style={styles.recommendationEmail}>{entry.email}</Text>
          )}
          <Text style={styles.recommendationMessage}>{entry.message}</Text>
          {entry.skills && entry.skills.length > 0 && (
            <View style={styles.recommendationSkills}>
              {entry.skills.map(skill => (
                <Text key={skill} style={styles.skillChip}>
                  {skill}
                </Text>
              ))}
            </View>
          )}
          {((entry as any).videoUrl || (entry as any).linkedinUrl) && (
            <View style={styles.recommendationLinks}>
              {(entry as any).videoUrl && (
                <Link src={(entry as any).videoUrl} style={styles.videoLink}>
                  Video Testimonial
                </Link>
              )}
              {(entry as any).linkedinUrl && (
                <Link src={(entry as any).linkedinUrl} style={styles.linkedinLink}>
                  LinkedIn Profile
                </Link>
              )}
            </View>
          )}
        </View>
      ))}
    </View>
  )
}

// Experience Section
const ExperienceSection: React.FC<{ items: WorkExperience[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Work Experience</Text>
      </View>
      {items.map((item, index) => {
        const dateText = renderDateOrDuration({
          duration: item.duration,
          startDate: item.startDate,
          endDate: item.endDate
        })

        return (
          <View key={item.id || `exp-${index}`} style={styles.experienceItem} wrap={false}>
            <Text style={styles.experienceTitle}>
              {item.position ?? item.title}
            </Text>
            <Text style={styles.experienceCompany}>{item.company}</Text>
            {dateText && <Text style={styles.experienceDate}>{dateText}</Text>}
            {item.description && (
              <Text style={styles.experienceDescription}>
                {stripHtml(item.description)}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

// Education Section
const EducationSection: React.FC<{ items: Education[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Education</Text>
      </View>
      {items.map(item => {
        const dateText = renderDateOrDuration({
          duration: item.duration,
          startDate: item.startDate,
          endDate: item.endDate,
          currentlyVolunteering: item.currentlyEnrolled
        })

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
          <View key={item.id} style={styles.educationItem} wrap={false}>
            <Text style={styles.educationTitle}>{educationTitle}</Text>
            {dateText && (
              <Text style={styles.educationDate}>
                {dateText}
                {item.inProgress ? ' | In Progress' : ''}
              </Text>
            )}
            {item.description && (
              <Text style={styles.educationDescription}>
                {stripHtml(item.description)}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

// Certifications Section
const CertificationsSection: React.FC<{ items: Certification[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Certifications</Text>
      </View>
      {items.map(item => {
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
          <View key={item.id || item.name} style={styles.certificationItem} wrap={false}>
            <Text style={styles.certificationName}>{item.name}</Text>
            {item.issuer && (
              <Text style={styles.certificationIssuer}>
                Issued by {item.issuer}
              </Text>
            )}
            {displayDate && (
              <Text style={styles.certificationDate}>{displayDate}</Text>
            )}
            {item.verificationStatus === 'verified' && item.credentialId && (
              <Text style={styles.certificationId}>
                Credential ID: {item.credentialId}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

// Skills Section
const SkillsSection: React.FC<{ items: Skill[] }> = ({ items }) => {
  if (!items?.length) return null

  const allSkills = items.flatMap(item => extractSkillsFromHTML(item.skills || ''))

  return (
    <View style={styles.skillsSection} wrap={false}>
      <Text style={styles.sectionTitle}>Skills</Text>
      <View style={styles.skillsContainer}>
        {allSkills.map((skill, index) => (
          <React.Fragment key={index}>
            <Text style={styles.skillItem}>{skill}</Text>
            {index < allSkills.length - 1 && (
              <Text style={styles.skillSeparator}>•</Text>
            )}
          </React.Fragment>
        ))}
      </View>
    </View>
  )
}

// Languages Section
const LanguagesSection: React.FC<{ items: Language[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.languagesSection} wrap={false}>
      <Text style={styles.sectionTitle}>Languages</Text>
      <View style={styles.languagesContainer}>
        {items.map((lang, idx) => (
          <View key={lang.id || `language-${idx}`} style={styles.languageItem}>
            <Text style={styles.languageText}>
              {lang.name} {lang.proficiency ? `(${lang.proficiency})` : ''}
            </Text>
          </View>
        ))}
      </View>
    </View>
  )
}

// Hobbies Section
const HobbiesSection: React.FC<{ items: string[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.hobbiesSection} wrap={false}>
      <Text style={styles.sectionTitle}>Hobbies and Interests</Text>
      <View style={styles.hobbiesList}>
        {items.map((hobby, idx) => (
          <Text key={`hobby-${idx}`} style={styles.hobbyItem}>
            • {hobby}
          </Text>
        ))}
      </View>
    </View>
  )
}

// Projects Section
const ProjectsSection: React.FC<{ items: Project[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Projects</Text>
      </View>
      {items.map(item => (
        <View key={item.id} style={styles.projectItem} wrap={false}>
          <Text style={styles.projectName}>{item.name}</Text>
          {item.description && (
            <Text style={styles.projectDescription}>
              {stripHtml(item.description)}
            </Text>
          )}
          {item.url && (
            <Link src={item.url} style={styles.projectUrl}>
              {item.url.replace(/^https?:\/\//, '')}
            </Link>
          )}
        </View>
      ))}
    </View>
  )
}

// Professional Affiliations Section
const AffiliationsSection: React.FC<{ items: ProfessionalAffiliation[] }> = ({
  items
}) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Professional Affiliations</Text>
      </View>
      {items.map(item => {
        const dateText = renderDateOrDuration({
          duration: item.duration,
          startDate: item.startDate,
          endDate: item.endDate
        })

        return (
          <View key={item.id} style={styles.affiliationItem} wrap={false}>
            <Text style={styles.affiliationTitle}>
              {item.name ?? item.role ?? 'Affiliation'}
              {item.organization && ` of the ${item.organization}`}
            </Text>
            {dateText && (
              <Text style={styles.affiliationDate}>{dateText}</Text>
            )}
            {item.activeAffiliation && (
              <Text style={styles.affiliationActive}>Active Affiliation</Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

// Volunteer Work Section
const VolunteerWorkSection: React.FC<{ items: VolunteerWork[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Volunteer Work</Text>
      </View>
      {items.map(item => {
        const dateText = renderDateOrDuration({
          duration: item.duration,
          startDate: item.startDate,
          endDate: item.endDate,
          currentlyVolunteering: item.currentlyVolunteering
        })

        return (
          <View key={item.id} style={styles.volunteerItem} wrap={false}>
            <Text style={styles.volunteerTitle}>
              {item.role} at {item.organization}
            </Text>
            {item.location && (
              <Text style={styles.volunteerLocation}>{item.location}</Text>
            )}
            {dateText && <Text style={styles.volunteerDate}>{dateText}</Text>}
            {item.description && (
              <Text style={styles.volunteerDescription}>
                {stripHtml(item.description)}
              </Text>
            )}
          </View>
        )
      })}
    </View>
  )
}

// Publications Section
const PublicationsSection: React.FC<{ items: Publication[] }> = ({ items }) => {
  if (!items?.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Text style={styles.sectionTitle}>Publications</Text>
      </View>
      {items.map(item => (
        <View key={item.id} style={styles.publicationItem} wrap={false}>
          <Text style={styles.publicationTitle}>{item.title}</Text>
          <Text style={styles.publicationInfo}>
            {item.publisher} | {item.publishedDate || 'Published'}
          </Text>
          {item.url && (
            <Link src={item.url} style={styles.publicationUrl}>
              {item.url.replace(/^https?:\/\//, '')}
            </Link>
          )}
        </View>
      ))}
    </View>
  )
}

// Main Resume PDF Document
const ResumePDFDocument: React.FC<ResumePDFDocumentProps> = ({
  resume,
  recommendations = [],
  resumeId,
  qrCodeDataUrl
}) => {
  const summary = getSummary(resume)

  return (
    <Document
      title={`${resume.contact?.fullName || 'Resume'}'s Resume`}
      author="T3 Resume Author"
      subject="Resume"
      keywords="Resume, CV"
    >
      <Page size="A4" style={styles.page}>
        <FirstPageHeader
          resume={resume}
          recommendations={recommendations.length}
          qrCodeDataUrl={qrCodeDataUrl}
          resumeId={resumeId}
        />

        <View style={styles.contentFirstPage}>
          {summary && <SummarySection summary={summary} />}

          {(recommendations?.length ?? 0) > 0 && (
            <RecommendationsSection entries={recommendations} />
          )}

          {(resume.experience?.items?.length ?? 0) > 0 && (
            <ExperienceSection items={resume.experience?.items || []} />
          )}

          {(resume.certifications?.items?.length ?? 0) > 0 && (
            <CertificationsSection items={resume.certifications?.items || []} />
          )}

          {(resume.education?.items?.length ?? 0) > 0 && (
            <EducationSection items={resume.education?.items || []} />
          )}

          {(resume.skills?.items?.length ?? 0) > 0 && (
            <SkillsSection items={resume.skills?.items || []} />
          )}

          {(resume.professionalAffiliations?.items?.length ?? 0) > 0 && (
            <AffiliationsSection items={resume.professionalAffiliations?.items || []} />
          )}

          {(resume.languages?.items?.length ?? 0) > 0 && (
            <LanguagesSection items={resume.languages?.items || []} />
          )}

          {(resume.hobbiesAndInterests?.length ?? 0) > 0 && (
            <HobbiesSection items={resume.hobbiesAndInterests || []} />
          )}

          {(resume.projects?.items?.length ?? 0) > 0 && (
            <ProjectsSection items={resume.projects?.items || []} />
          )}

          {(resume.publications?.items?.length ?? 0) > 0 && (
            <PublicationsSection items={resume.publications?.items || []} />
          )}

          {(resume.volunteerWork?.items?.length ?? 0) > 0 && (
            <VolunteerWorkSection items={resume.volunteerWork?.items || []} />
          )}
        </View>

        <PageFooter
          fullName={resume.contact?.fullName || 'Your Name'}
          email={resume.contact?.email || 'email@example.com'}
          phone={resume.contact?.phone}
          pageNumber={1}
          totalPages={1}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      </Page>
    </Document>
  )
}

export default ResumePDFDocument

