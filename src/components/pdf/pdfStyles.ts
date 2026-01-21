import { StyleSheet } from '@react-pdf/renderer'

// Page dimensions
const PAGE_WIDTH = 595.28 // A4 width in points
const PAGE_HEIGHT = 841.89 // A4 height in points
const HEADER_HEIGHT = 113 // ~150px converted to points
const FOOTER_HEIGHT = 45 // ~60px converted to points

// Color palette matching current design
export const colors = {
  headerBg: '#F7F9FC',
  primary: '#2563EB',
  textPrimary: '#2E2E48',
  textSecondary: '#666666',
  textDark: '#000000',
  border: '#E5E7EB',
  chipBg: '#E0E7FF',
  chipText: '#1E3A8A',
  qrBg: '#2563EB',
  recommendationBg: '#F9FAFB',
  videoLink: '#DC2626',
  linkedinLink: '#0A66C2'
}

export const styles = StyleSheet.create({
  // Page
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 11
  },

  // Header - First Page
  headerFirst: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.headerBg,
    minHeight: HEADER_HEIGHT
  },
  headerContent: {
    flexDirection: 'column',
    marginLeft: 34,
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 15
  },
  headerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  headerName: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontSize: 21,
    lineHeight: 1
  },
  headerCity: {
    fontWeight: 'normal',
    color: colors.textSecondary,
    fontSize: 14
  },
  headerContactRow: {
    flexDirection: 'row',
    gap: 23,
    alignItems: 'center'
  },
  headerLink: {
    color: colors.primary,
    textDecoration: 'none',
    fontSize: 11,
    fontWeight: 'normal'
  },
  headerSeparator: {
    color: colors.textSecondary,
    fontSize: 11
  },
  headerSocialRow: {
    flexDirection: 'row',
    gap: 19,
    flexWrap: 'wrap',
    alignItems: 'center'
  },
  socialLinkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%'
  },
  viewSourceContainer: {
    textAlign: 'center',
    paddingVertical: 15,
    marginRight: 11
  },
  viewSourceLink: {
    color: colors.textDark,
    textAlign: 'center',
    fontSize: 9,
    fontWeight: 'normal',
    textDecoration: 'underline'
  },
  qrContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: HEADER_HEIGHT,
    width: 96,
    backgroundColor: colors.qrBg
  },

  // Header - Subsequent Pages
  headerSubsequent: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: colors.headerBg,
    height: 45,
    paddingLeft: 34,
    marginTop: 15
  },
  headerSubsequentName: {
    fontWeight: 'bold',
    color: colors.textPrimary,
    fontSize: 18
  },

  // Footer
  footer: {
    backgroundColor: colors.headerBg,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: FOOTER_HEIGHT,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0
  },
  footerText: {
    color: colors.textDark,
    textAlign: 'center',
    fontSize: 8,
    fontWeight: 'normal',
    marginRight: 8
  },
  footerLink: {
    textDecoration: 'underline',
    color: colors.primary
  },

  // Content area
  content: {
    paddingTop: 15,
    paddingBottom: 11,
    paddingHorizontal: 38
  },
  contentFirstPage: {
    paddingTop: 15,
    paddingBottom: FOOTER_HEIGHT + 11,
    paddingHorizontal: 38,
    flex: 1
  },
  contentSubsequentPage: {
    paddingTop: 15,
    paddingBottom: FOOTER_HEIGHT + 11,
    paddingHorizontal: 38,
    flex: 1
  },

  // Section Title
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 6,
    lineHeight: 1.2,
    fontSize: 13,
    letterSpacing: 0.075,
    color: colors.textDark
  },

  // Summary Section
  summarySection: {
    marginBottom: 9
  },
  summaryText: {
    color: colors.textDark,
    fontWeight: 'normal',
    fontSize: 11,
    lineHeight: 1.4
  },

  // Experience Section
  experienceItem: {
    marginBottom: 9
  },
  experienceTitle: {
    fontWeight: 'bold',
    fontSize: 12
  },
  experienceCompany: {
    color: colors.textDark,
    fontWeight: 'normal',
    fontSize: 11
  },
  experienceDate: {
    color: colors.textDark,
    marginBottom: 4,
    fontWeight: 'normal',
    fontSize: 11
  },
  experienceDescription: {
    marginBottom: 8,
    fontWeight: 'normal',
    fontSize: 11,
    lineHeight: 1.4
  },

  // Education Section
  educationItem: {
    marginBottom: 9
  },
  educationTitle: {
    fontWeight: 'bold',
    fontSize: 11
  },
  educationDate: {
    color: colors.textDark,
    fontWeight: 'normal',
    fontSize: 11
  },
  educationDescription: {
    color: colors.textDark,
    fontWeight: 'normal',
    fontSize: 11
  },

  // Certification Section
  certificationItem: {
    marginBottom: 9
  },
  certificationName: {
    fontWeight: 'bold',
    fontSize: 12
  },
  certificationIssuer: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: 'normal'
  },
  certificationDate: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: 'normal'
  },
  certificationId: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: 'normal'
  },

  // Skills Section
  skillsSection: {
    marginBottom: 11
  },
  skillsContainer: {
    fontWeight: 'normal',
    fontSize: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center'
  },
  skillItem: {
    marginRight: 6
  },
  skillSeparator: {
    color: colors.textSecondary
  },

  // Languages Section
  languagesSection: {
    marginBottom: 11
  },
  languagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  languageText: {
    fontWeight: 'normal',
    fontSize: 12
  },

  // Hobbies Section
  hobbiesSection: {
    marginBottom: 11
  },
  hobbiesList: {
    paddingLeft: 15
  },
  hobbyItem: {
    fontWeight: 'normal',
    fontSize: 12,
    marginBottom: 8
  },

  // Project Section
  projectItem: {
    marginBottom: 9
  },
  projectName: {
    fontWeight: 'bold',
    fontSize: 12
  },
  projectDate: {
    fontSize: 12,
    fontWeight: 'normal'
  },
  projectDescription: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 'normal'
  },
  projectUrl: {
    color: colors.primary,
    textDecoration: 'underline',
    fontSize: 12
  },

  // Professional Affiliation Section
  affiliationItem: {
    marginBottom: 9
  },
  affiliationTitle: {
    fontWeight: 'bold',
    fontSize: 12
  },
  affiliationDate: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: 'normal'
  },
  affiliationActive: {
    color: colors.textDark,
    fontSize: 12,
    fontWeight: 'normal'
  },

  // Volunteer Work Section
  volunteerItem: {
    marginBottom: 8
  },
  volunteerTitle: {
    fontWeight: 'bold',
    fontSize: 12
  },
  volunteerLocation: {
    fontSize: 12,
    fontWeight: 'normal'
  },
  volunteerDate: {
    fontSize: 12,
    fontWeight: 'normal'
  },
  volunteerDescription: {
    marginBottom: 8,
    fontSize: 12,
    fontWeight: 'normal'
  },

  // Publication Section
  publicationItem: {
    marginBottom: 8
  },
  publicationTitle: {
    fontWeight: 'bold',
    fontSize: 12
  },
  publicationInfo: {
    fontSize: 12,
    fontWeight: 'normal'
  },
  publicationUrl: {
    color: colors.primary,
    textDecoration: 'underline',
    fontSize: 12
  },

  // Recommendations Section
  recommendationsSection: {
    marginBottom: 11
  },
  recommendationItem: {
    padding: 9,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    backgroundColor: colors.recommendationBg,
    marginBottom: 11
  },
  recommendationHeader: {
    fontWeight: 'bold',
    fontSize: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8
  },
  recommendationAuthor: {
    fontWeight: 'bold'
  },
  recommendationDate: {
    color: colors.textSecondary,
    fontWeight: 'normal',
    fontSize: 9
  },
  recommendationEmail: {
    color: colors.primary,
    fontSize: 10,
    marginBottom: 4
  },
  recommendationMessage: {
    fontSize: 11,
    color: '#111827',
    lineHeight: 1.4
  },
  recommendationSkills: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4
  },
  skillChip: {
    backgroundColor: colors.chipBg,
    color: colors.chipText,
    fontWeight: 'bold',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9
  },
  recommendationLinks: {
    marginTop: 8,
    flexDirection: 'row',
    gap: 15,
    alignItems: 'center'
  },
  videoLink: {
    color: colors.videoLink,
    fontSize: 9,
    fontWeight: 'bold',
    textDecoration: 'none'
  },
  linkedinLink: {
    color: colors.linkedinLink,
    fontSize: 9,
    fontWeight: 'bold',
    textDecoration: 'none'
  },

  // Trust Score Badge
  trustBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  trustBadgeText: {
    fontWeight: 'bold',
    fontSize: 10
  },

  // Credential Link
  credentialLink: {
    color: colors.primary,
    textDecoration: 'underline',
    fontWeight: 'bold',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    fontSize: 11
  },
  credentialsContainer: {
    marginTop: 8,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },

  // Section container
  section: {
    marginBottom: 9
  },
  sectionTitleContainer: {
    marginBottom: 5
  }
})

export { PAGE_WIDTH, PAGE_HEIGHT, HEADER_HEIGHT, FOOTER_HEIGHT }

