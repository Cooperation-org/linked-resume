import { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { GoogleDriveStorage, Resume } from '@cooperation/vc-storage'
import { getLocalStorage } from '../tools/cookie'
import { deleteResume, duplicateResume, updateTitle } from '../redux/slices/myresumes'
import { AppDispatch } from '../redux/store'

/** Pure date-formatting helpers */
export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Invalid date'
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  } catch {
    return 'Invalid date'
  }
}

export function getTimeAgo(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recently'
    const diffMs = Date.now() - date.getTime()
    if (diffMs < 0) return 'Just now'
    const diffSecs = Math.floor(diffMs / 1000)
    const diffMins = Math.floor(diffSecs / 60)
    const diffHours = Math.floor(diffMins / 60)
    const diffDays = Math.floor(diffHours / 24)
    const diffMonths = Math.floor(diffDays / 30)
    const diffYears = Math.floor(diffDays / 365)
    if (diffYears > 0) return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`
    if (diffMonths > 0) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`
    if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
    if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
    if (diffMins > 0) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`
    return diffSecs <= 0 ? 'Just now' : `${diffSecs} ${diffSecs === 1 ? 'second' : 'seconds'} ago`
  } catch {
    return 'Recently'
  }
}

interface UseResumeCardProps {
  id: string
  title: string
  date: string
  isDraft?: boolean
  resume: any
}

export interface UseResumeCardReturn {
  // State
  menuAnchor: null | HTMLElement
  isEditing: boolean
  editedTitle: string
  isLoading: boolean
  showCopiedTooltip: boolean
  deleteDialogOpen: boolean
  previewDialogOpen: boolean
  // Derived
  formattedDate: string
  timeAgo: string
  // Helpers
  isSigned: () => boolean
  isCompletedUnsigned: () => boolean
  // Handlers
  handleMenuOpen: (event: React.MouseEvent<HTMLElement>) => void
  handleMenuClose: () => void
  handleEditTitle: () => void
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleBlurOrEnter: (e?: React.KeyboardEvent<HTMLInputElement>) => void
  handleDeleteResume: () => void
  handleDuplicateResume: () => Promise<void>
  handleCopyLink: () => void
  handleConfirmDelete: () => Promise<void>
  handlePreviewResume: () => void
  handleTitleClick: () => void
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>
  setEditedTitle: React.Dispatch<React.SetStateAction<string>>
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPreviewDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
}

/** Maps a resume data entry into the normalized format for duplication */
function buildDuplicatedResume(content: any) {
  const person = content.person || {}
  const personName = person.name || {}
  const personContact = person.contact || {}
  const personLocation = personContact.location || {}
  const personSocialLinks = personContact.socialLinks || {}
  const narrative = content.narrative || {}
  const currentDate = new Date().toISOString()

  return {
    id: '',
    lastUpdated: currentDate,
    name: personName.formattedName || 'Untitled Resume',
    version: 1,
    contact: {
      fullName: personContact.fullName || '',
      email: personContact.email || '',
      phone: personContact.phone || '',
      location: {
        street: personLocation.street || '',
        city: personLocation.city || '',
        state: personLocation.state || '',
        country: personLocation.country || '',
        postalCode: personLocation.postalCode || ''
      },
      socialLinks: {
        linkedin: personSocialLinks.linkedin || '',
        github: personSocialLinks.github || '',
        portfolio: personSocialLinks.portfolio || '',
        instagram: personSocialLinks.twitter || ''
      }
    },
    summary: narrative.text || '',
    experience: {
      items: (content.employmentHistory || []).map((job: any) => ({
        title: job.title || '',
        company: job.organization?.tradeName || '',
        duration: job.duration || '',
        currentlyEmployed: job.stillEmployed || false,
        description: job.description || '',
        position: '',
        startDate: job.startDate || '',
        endDate: job.endDate || '',
        id: job.id || '',
        verificationStatus: job.verificationStatus || '',
        credentialLink: job.credentialLink || '',
        selectedCredentials: job.verifiedCredentials || []
      }))
    },
    education: {
      items: (content.educationAndLearning || []).map((edu: any) => ({
        type: 'Bachelors',
        programName: edu.fieldOfStudy || '',
        institution: edu.institution || '',
        duration: edu.duration || '',
        currentlyEnrolled: false,
        inProgress: false,
        awardEarned: false,
        description: '<p></p>',
        id: edu.id || '',
        verificationStatus: edu.verificationStatus || '',
        credentialLink: edu.credentialLink || '',
        selectedCredentials: edu.verifiedCredentials || [],
        degree: edu.degree || '',
        field: edu.fieldOfStudy || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || ''
      }))
    },
    skills: {
      items: (content.skills || []).map((skill: any) => ({
        skills: `<p>${skill.name || 'Skill'}</p>`,
        id: skill.id || '',
        verificationStatus: skill.verificationStatus || '',
        credentialLink: skill.credentialLink || '',
        selectedCredentials: skill.verifiedCredentials || []
      }))
    },
    awards: { items: [] },
    publications: { items: [] },
    certifications: {
      items: (content.certifications || []).map((cert: any) => ({
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.date || '',
        expiryDate: '',
        credentialId: cert.url || '',
        noExpiration: false,
        id: cert.id || '',
        verificationStatus: cert.verificationStatus || '',
        credentialLink: cert.credentialLink || '',
        selectedCredentials: cert.verifiedCredentials || []
      }))
    },
    professionalAffiliations: {
      items: (content.professionalAffiliations || []).map((aff: any) => ({
        name: aff.name || '',
        organization: aff.organization || '',
        startDate: aff.startDate || '',
        endDate: aff.endDate || '',
        activeAffiliation: aff.activeAffiliation || false,
        id: aff.id || '',
        verificationStatus: aff.verificationStatus || '',
        credentialLink: aff.credentialLink || '',
        duration: aff.duration || '',
        selectedCredentials: aff.selectedCredentials || []
      }))
    },
    volunteerWork: {
      items: (content.volunteerWork || []).map((vol: any) => ({
        role: vol.role || '',
        organization: vol.organization || '',
        location: vol.location || '',
        startDate: vol.startDate || '',
        endDate: vol.endDate || '',
        currentlyVolunteering: vol.currentlyVolunteering || false,
        description: vol.description || '',
        duration: vol.duration || '',
        id: vol.id || '',
        verificationStatus: vol.verificationStatus || '',
        credentialLink: vol.credentialLink || '',
        selectedCredentials: vol.selectedCredentials || []
      }))
    },
    hobbiesAndInterests: content.hobbiesAndInterests || [],
    languages: {
      items: (content.languages || []).map((lang: any) => ({ name: lang.name || '' }))
    },
    testimonials: { items: [] },
    projects: {
      items: (content.projects || []).map((proj: any) => ({
        name: proj.name || '',
        description: proj.description || '',
        url: proj.url || '',
        id: proj.id || '',
        verificationStatus: proj.verificationStatus || '',
        credentialLink: proj.credentialLink || '',
        technologies: [],
        selectedCredentials: proj.verifiedCredentials || []
      }))
    }
  }
}

/**
 * Encapsulates all state and action logic for a single ResumeCard.
 */
export function useResumeCard({ id, title, date, isDraft, resume }: UseResumeCardProps): UseResumeCardReturn {
  const dispatch: AppDispatch = useDispatch()
  const navigate = useNavigate()

  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState(title)
  const [isLoading, setIsLoading] = useState(false)
  const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false)

  const accessToken = getLocalStorage('auth') as string
  const storage = new GoogleDriveStorage(accessToken)
  const resumeManager = new Resume(storage)

  const isSigned = useCallback(() => !isDraft && !!resume?.content?.proof, [isDraft, resume])
  const isCompletedUnsigned = useCallback(
    () => !isDraft && !resume?.content?.proof && resume?.content?.isComplete === true,
    [isDraft, resume]
  )

  const resumeDate = (() => {
    if (isDraft) return resume?.content?.lastUpdated || date
    return resume?.content?.issuanceDate || date
  })()

  const formattedDate = formatDate(date)
  const timeAgo = getTimeAgo(resumeDate)

  const handleMenuOpen = useCallback((event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }, [])

  const handleMenuClose = useCallback(() => setMenuAnchor(null), [])

  const handleEditTitle = useCallback(() => {
    navigate(`/resume/new?id=${id}`)
  }, [navigate, id])

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEditedTitle(e.target.value)
  }, [])

  const handleBlurOrEnter = useCallback(
    async (e?: React.KeyboardEvent<HTMLInputElement>) => {
      if (!e || e.key === 'Enter') {
        setIsEditing(false)
        if (editedTitle !== title) {
          try {
            dispatch(updateTitle({ id, newTitle: editedTitle, type: isDraft ? 'unsigned' : 'signed' }))
            await storage.updateFileData(id, { fileName: `${editedTitle}.json` })
          } catch (err) {
            console.error('Error renaming file:', err)
          }
        }
      }
    },
    [editedTitle, title, id, isDraft, dispatch, storage]
  )

  const handleDeleteResume = useCallback(() => setDeleteDialogOpen(true), [])

  const handleDuplicateResume = useCallback(async () => {
    try {
      setIsLoading(true)
      const rawContent = JSON.parse(
        JSON.stringify(resume?.content?.credentialSubject || resume?.content || resume)
      )
      if (rawContent.proof) delete rawContent.proof
      const newResume = buildDuplicatedResume(rawContent)
      const file = await resumeManager.saveResume({ resume: newResume, type: 'unsigned' })
      if (file) {
        dispatch(duplicateResume({ id: file.id, type: 'unsigned', resume: { ...rawContent, id: file.id } }))
        navigate(`/resume/new?id=${file.id}`)
      }
    } catch (err) {
      console.error('Error duplicating resume:', err)
    } finally {
      setIsLoading(false)
      handleMenuClose()
    }
  }, [resume, resumeManager, dispatch, navigate, handleMenuClose])

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(`https://resume.allskillscount.org/resume/view/${id}`)
    setShowCopiedTooltip(true)
    setTimeout(() => setShowCopiedTooltip(false), 2000)
    handleMenuClose()
  }, [id, handleMenuClose])

  const handleConfirmDelete = useCallback(async () => {
    dispatch(deleteResume({ id, type: isDraft ? 'unsigned' : 'signed' }))
    setDeleteDialogOpen(false)
    handleMenuClose()
    await storage.delete(id)
  }, [id, isDraft, dispatch, storage, handleMenuClose])

  const handlePreviewResume = useCallback(() => {
    if (isSigned()) {
      navigate(`/resume/view/${id}`)
    } else {
      navigate(`/resume/view?id=${id}`)
    }
  }, [isSigned, navigate, id])

  const handleTitleClick = useCallback(() => {
    if (isSigned()) {
      navigate(`/resume/view/${id}`)
    } else {
      navigate(`/resume/new?id=${id}`)
    }
  }, [isSigned, navigate, id])

  return {
    menuAnchor,
    isEditing,
    editedTitle,
    isLoading,
    showCopiedTooltip,
    deleteDialogOpen,
    previewDialogOpen,
    formattedDate,
    timeAgo,
    isSigned,
    isCompletedUnsigned,
    handleMenuOpen,
    handleMenuClose,
    handleEditTitle,
    handleTitleChange,
    handleBlurOrEnter,
    handleDeleteResume,
    handleDuplicateResume,
    handleCopyLink,
    handleConfirmDelete,
    handlePreviewResume,
    handleTitleClick,
    setIsEditing,
    setEditedTitle,
    setDeleteDialogOpen,
    setPreviewDialogOpen
  }
}
