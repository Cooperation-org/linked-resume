// Base Interfaces for VC
interface IssuerInfo {
  id: string
  name: string
  type: 'organization' | 'institution' | 'individual'
  verificationURL?: string
  logo?: string
}

interface VerificationCredential {
  vcId?: string // Google Drive ID OR DID if using decentralized storage
  vcDid?: string // DID if using decentralized storage
  issuer: IssuerInfo
  dateVerified: string
  expiryDate?: string
  status: 'valid' | 'expired' | 'revoked'
}

interface VerifiableItem {
  id: string
  verificationStatus: 'unverified' | 'pending' | 'verified'
  verifiedCredentials?: VerificationCredential[]
  isVisible?: boolean
}

// Resume Section Interfaces
interface Contact {
  fullName: string
  email: string
  phone?: string
  location?: {
    street?: string
    city: string
    state?: string
    country: string
    postalCode?: string
  }
  socialLinks?: {
    linkedin?: string
    github?: string
    portfolio?: string
    instagram?: string
    [key: string]: string | undefined
  }
}

interface WorkExperience extends VerifiableItem {
  title: string
  duration: string
  currentlyEmployed: boolean
  company: string
  endDate?: string
  location?: string
  description: string
  position?: string
  startDate?: string
  acheivements?: string[]
  id?: string
  verificationStatus?: 'unverified' | 'verified'
  credentialLink?: string
  evidence?: string[]
  attachedFiles?: string[]
  [key: string]: any
}

interface Education extends VerifiableItem {
  type: ReactNode
  programName: ReactNode
  awardEarned: boolean
  institution: string
  degree: string
  field: string
  startDate: string
  endDate?: string
  location?: string
  gpa?: string
  honors?: string[]
  thesis?: string
  relevantCourses?: string[]
  duration: string
  currentlyEnrolled: boolean
  inProgress: boolean
  description: string
  id: string
  verificationStatus: string
  credentialLink: string
  evidence?: string[]
  attachedFiles?: string[]
  [key: string]: any
}

interface Skill extends VerifiableItem {
  // name: string
  // category?: string
  // level?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
  // yearsOfExperience?: number
  skills: string
  id: string
  verificationStatus: string
  credentialLink: string
  evidence?: string[]
  attachedFiles?: string[]
  [key: string]: any
}

interface Conference extends VerifiableItem {
  name: string
  role: 'Attendee' | 'Speaker' | 'Organizer' | 'Presenter' | 'Panelist'
  date: string
  location: string
  description?: string
  presentationTitle?: string
  url?: string
  evidence?: string[]
}

interface Project extends VerifiableItem {
  name: string
  description: string
  url?: string
  technologies: string[]
  credentialLink?: string
  evidence?: string[]
  attachedFiles?: string[]
}

interface Award extends VerifiableItem {
  title: string
  issuer: string
  date: string
  description?: string
  recognition?: string
  evidence?: string[]
}

interface Publication extends VerifiableItem {
  title: string
  type: 'Journal' | 'Conference' | 'Book' | 'Article' | 'Patent' | 'Other'
  publishedDate: string
  publisher: string
  authors: string[]
  url?: string
  doi?: string
  citation?: string
  abstract?: string
  impact?: string
  evidence?: string[]
}

interface Certification extends VerifiableItem {
  name: string
  issuer: string
  issueDate: string
  expiryDate?: string
  credentialId?: string
  credentialLink?: string
  noExpiration: boolean
  score?: string
  evidence?: string[]
  attachedFiles?: string[]
}

interface ProfessionalAffiliation extends VerifiableItem {
  name: string
  organization: string
  role?: string
  startDate: string
  endDate?: string
  duration?: string
  membershipId?: string
  description?: string
  benefits?: string[]
  activeAffiliation: boolean
  id: string
  verificationStatus: string
  credentialLink: string
  evidence?: string[]
  attachedFiles?: string[]
  [key: string]: any
}

interface VolunteerWork extends VerifiableItem {
  organization: string
  role: string
  startDate: string
  endDate?: string
  location?: string
  description?: string
  currentlyVolunteering: boolean
  duration: string
  credentialLink?: string
  cause?: string
  evidence?: string[]
  attachedFiles?: string[]
}

interface Language extends VerifiableItem {
  name: string
  proficiency: 'Basic' | 'Intermediate' | 'Advanced' | 'Native'
  certification?: string
  writingLevel?: string
  speakingLevel?: string
  readingLevel?: string
  evidence?: string[]
}

interface Recommendation {
  id: string
  author: string
  relationship?: string
  email?: string
  skills?: string[]
  message: string
  createdAt?: string
}

interface Testimonial extends VerifiableItem {
  author: string
  text: string
  relationship?: string
  email?: string
  skills?: string[]
  createdAt?: string
}

// Main Resume Interface
interface Resume {
  id: string
  lastUpdated: string
  name: string
  version?: number
  contact: Contact
  summary: string
  experience: {
    items: WorkExperience[]
  }
  education: {
    items: Education[]
  }
  skills: {
    items: Skill[]
  }
  projects: {
    items: Project[]
  }
  awards?: {
    items: Award[]
  }
  publications?: {
    items: Publication[]
  }
  certifications?: {
    items: Certification[]
  }
  professionalAffiliations?: {
    items: ProfessionalAffiliation[]
  }
  volunteerWork?: {
    items: VolunteerWork[]
  }
  hobbiesAndInterests?: string[]
  languages?: {
    items: Language[]
  }
  testimonials: {
    items: Testimonial[]
  }
}

interface ResumeData {
  id: string
  content: {
    resume: {
      id: string
      title: string
      contact: {
        fullName: string
      }
      lastUpdated: string
    }
  }
  type: 'signed' | 'unsigned'
}

interface ResumePreviewProps {
  data: Resume
}
