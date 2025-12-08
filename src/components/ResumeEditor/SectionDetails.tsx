import React from 'react'
import { Box } from '@mui/material'
import ProfessionalSummary from './sections/ProfessionalSummary'
import WorkExperience from './sections/WorkExperience'
import Education from './sections/Education'
import ProfessionalAffiliations from './sections/ProfessionalAffiliations'
import SkillsAndAbilities from './sections/SkillsAndAbilities'
import HobbiesAndInterests from './sections/HobbiesAndInterests'
import Projects from './sections/Projects'
import VolunteerWork from './sections/VolunteerWork'
import CertificationsAndLicenses from './sections/CertificationsAndLicenses'

interface FileItem {
  id: string
  file: File
  name: string
  url: string
  uploaded: boolean
  fileExtension: string
  googleId?: string
}

interface SectionDetailsProps {
  sectionId: string
  onDelete?: () => void
  onAddFiles?: (itemIndex?: number) => void
  onAddCredential?: (text: string) => void
  onFocus?: () => void
  evidence?: string[][]
  allFiles?: FileItem[]
  onRemoveFile?: (sectionId: string, itemIndex: number, fileIndex: number) => void
}

export default function SectionDetails({
  sectionId,
  onDelete,
  onAddFiles,
  onAddCredential,
  onFocus,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: Readonly<SectionDetailsProps>) {
  const renderSection = () => {
    switch (sectionId) {
      case 'Professional Summary':
        return (
          <ProfessionalSummary
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
          />
        )
      case 'Work Experience':
        return (
          <WorkExperience
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'Education':
        return (
          <Education
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'Professional Affiliations':
        return (
          <ProfessionalAffiliations
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'Skills and Abilities':
        return (
          <SkillsAndAbilities
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'Hobbies and Interests':
        return (
          <HobbiesAndInterests
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
          />
        )
      case 'Projects':
        return (
          <Projects
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'Volunteer Work':
        return (
          <VolunteerWork
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      case 'Certifications and Licenses':
        return (
          <CertificationsAndLicenses
            onAddFiles={onAddFiles}
            onDelete={onDelete}
            onAddCredential={onAddCredential}
            evidence={evidence}
            allFiles={allFiles}
            onRemoveFile={onRemoveFile}
          />
        )
      default:
        return null
    }
  }

  return <Box>{renderSection()}</Box>
}
