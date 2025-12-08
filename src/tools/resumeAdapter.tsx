import { replaceCredentialLinksWithContent } from '../services/credentialService'

/**
 * Adapter to transform resume data to make it compatible with the resumeVC.sign function
 * This ensures all data is properly preserved during the signing process
 */
export const prepareResumeForVC = async (
  resume: Resume | null,
  sectionEvidence?: Record<string, string[][]>,
  allFiles?: any[]
): Promise<any> => {
  if (!resume) {
    console.error('Cannot prepare null resume for VC')
    return null
  }

  const preparedResume = JSON.parse(JSON.stringify(resume))

  // Convert file IDs to actual Google Drive URLs for saving
  let evidenceWithUrls: Record<string, string[][]> = {}

  // Add evidence/files data if provided
  if (sectionEvidence && allFiles) {
    Object.keys(sectionEvidence).forEach(sectionId => {
      const sectionFiles = sectionEvidence[sectionId]
      evidenceWithUrls[sectionId] = sectionFiles.map(itemFiles =>
        itemFiles.map(fileId => {
          const file = allFiles.find(f => f.id === fileId)
          if (file?.googleId) {
            return `https://drive.google.com/uc?export=view&id=${file.googleId}`
          } else if (file?.url) {
            return file.url
          }
          return fileId
        })
      )
    })
  }

  preparedResume.evidence = evidenceWithUrls
  if (sectionEvidence && allFiles) {
    console.log('Converting evidence IDs to URLs:', {
      originalEvidence: sectionEvidence,
      convertedEvidence: evidenceWithUrls,
      availableFiles: allFiles?.length || 0
    })
  }

  if (preparedResume.languages?.items) {
    preparedResume.languages.items = preparedResume.languages.items.map((lang: any) => ({
      language: lang.name ?? '',
      proficiency: lang.proficiency ?? '',
      ...lang
    }))
  }

  if (preparedResume.skills?.items) {
    preparedResume.skills.items = preparedResume.skills.items.map((skill: any) => {
      let skillName = skill.skills
      try {
        if (skillName?.includes('<')) {
          const tempDiv = document.createElement('div')
          tempDiv.innerHTML = skillName
          skillName = tempDiv.textContent ?? tempDiv.innerText ?? ''
        }
      } catch (e) {
        console.warn('Error parsing skill HTML:', e)
      }

      return {
        name: skillName ?? '',
        originalSkills: skill.skills,
        ...skill
      }
    })
  }

  if (preparedResume.experience?.items) {
    preparedResume.experience.items = preparedResume.experience.items.map(
      (exp: any, index: number) => ({
        ...exp,
        stillEmployed: exp.currentlyEmployed ?? false,
        title: exp.title ?? exp.position ?? '',
        company: exp.company ?? '',
        attachedFiles:
          evidenceWithUrls?.['Work Experience']?.[index] || exp.attachedFiles || []
      })
    )
  }

  // Convert experience to employmentHistory and replace credential links with full content
  if (preparedResume.experience?.items) {
    console.log(
      '🔍 Processing experience items for credential replacement:',
      preparedResume.experience.items.map((exp: any) => ({
        hasCredentialLink: !!exp.credentialLink,
        credentialLink: exp.credentialLink
      }))
    )
    preparedResume.employmentHistory = await Promise.all(
      preparedResume.experience.items.map(async (exp: any, index: number) => {
        const processedExp = await replaceCredentialLinksWithContent(exp)
        // Add attachedFiles from evidence if available
        const attachedFiles = evidenceWithUrls?.['Work Experience']?.[index] || []
        return { ...exp, ...processedExp, attachedFiles }
      })
    )

    // IMPORTANT: Also update the original experience.items with the processed credential links
    // This ensures the UI shows the correct credential data
    preparedResume.experience.items = preparedResume.employmentHistory
  }

  // Education
  if (preparedResume.education?.items) {
    preparedResume.education.items = preparedResume.education.items.map(
      (edu: any, index: number) => {
        // Set degree and fieldOfStudy directly from type and programName if present
        if (edu.type) edu.degree = edu.type
        if (edu.programName) edu.fieldOfStudy = edu.programName
        return {
          ...edu,
          attachedFiles:
            evidenceWithUrls?.['Education']?.[index] || edu.attachedFiles || []
        }
      }
    )
    preparedResume.educationAndLearning = await Promise.all(
      preparedResume.education.items.map(async (edu: any, index: number) => {
        const processedEdu = await replaceCredentialLinksWithContent(edu)
        const base = { ...edu, ...processedEdu }
        base.degree = edu.degree || ''
        base.fieldOfStudy = edu.fieldOfStudy || ''
        base.description = edu.description || processedEdu.description || ''
        // Add attachedFiles from evidence if available
        const attachedFiles = evidenceWithUrls?.['Education']?.[index] || []
        return { ...base, attachedFiles }
      })
    )

    // Update the original education.items with the processed credential links
    preparedResume.education.items = preparedResume.educationAndLearning
  }

  // Certifications
  if (preparedResume.certifications?.items) {
    preparedResume.certifications.items = preparedResume.certifications.items.map(
      (cert: any, index: number) => ({
        ...cert,
        attachedFiles:
          evidenceWithUrls?.['Certifications and Licenses']?.[index] ||
          cert.attachedFiles ||
          []
      })
    )
    preparedResume.certificationsVC = await Promise.all(
      preparedResume.certifications.items.map(async (cert: any, index: number) => {
        const processedCert = await replaceCredentialLinksWithContent(cert)
        // Add attachedFiles from evidence if available
        const attachedFiles =
          evidenceWithUrls?.['Certifications and Licenses']?.[index] || []
        return {
          ...cert,
          credentialLink: cert.credentialLink ?? '',
          ...processedCert,
          attachedFiles
        }
      })
    )

    // Update the original certifications.items with the processed credential links
    preparedResume.certifications.items = preparedResume.certificationsVC
  }

  // Skills
  if (preparedResume.skills?.items) {
    preparedResume.skillsVC = await Promise.all(
      preparedResume.skills.items.map(async (skill: any) => {
        const processedSkill = await replaceCredentialLinksWithContent(skill)
        return { ...skill, ...processedSkill }
      })
    )

    // Update the original skills.items with the processed credential links
    preparedResume.skills.items = preparedResume.skillsVC
  }

  // Projects
  if (preparedResume.projects?.items) {
    preparedResume.projects.items = preparedResume.projects.items.map(
      (proj: any, index: number) => ({
        ...proj,
        attachedFiles: evidenceWithUrls?.['Projects']?.[index] || proj.attachedFiles || []
      })
    )
    preparedResume.projectsVC = await Promise.all(
      preparedResume.projects.items.map(async (proj: any, index: number) => {
        const processedProj = await replaceCredentialLinksWithContent(proj)
        // Add attachedFiles from evidence if available
        const attachedFiles = evidenceWithUrls?.['Projects']?.[index] || []
        return { ...proj, ...processedProj, attachedFiles }
      })
    )

    // Update the original projects.items with the processed credential links
    preparedResume.projects.items = preparedResume.projectsVC
  }

  // Professional Affiliations
  if (preparedResume.professionalAffiliations?.items) {
    preparedResume.professionalAffiliations.items =
      preparedResume.professionalAffiliations.items.map((aff: any, index: number) => ({
        ...aff,
        attachedFiles:
          evidenceWithUrls?.['Professional Affiliations']?.[index] ||
          aff.attachedFiles ||
          []
      }))
    preparedResume.professionalAffiliationsVC = await Promise.all(
      preparedResume.professionalAffiliations.items.map(
        async (aff: any, index: number) => {
          const processedAff = await replaceCredentialLinksWithContent(aff)
          // Add attachedFiles from evidence if available
          const attachedFiles =
            evidenceWithUrls?.['Professional Affiliations']?.[index] || []
          return {
            ...aff,
            description: aff.description ?? '',
            // preserve RTE fields
            ...processedAff,
            attachedFiles
          }
        }
      )
    )

    // Update the original professionalAffiliations.items with the processed credential links
    preparedResume.professionalAffiliations.items =
      preparedResume.professionalAffiliationsVC
  }

  // Volunteer Work
  if (preparedResume.volunteerWork?.items) {
    preparedResume.volunteerWork.items = preparedResume.volunteerWork.items.map(
      (vol: any, index: number) => ({
        ...vol,
        attachedFiles:
          evidenceWithUrls?.['Volunteer Work']?.[index] || vol.attachedFiles || []
      })
    )
    preparedResume.volunteerWorkVC = await Promise.all(
      preparedResume.volunteerWork.items.map(async (vol: any, index: number) => {
        const processedVol = await replaceCredentialLinksWithContent(vol)
        // Add attachedFiles from evidence if available
        const attachedFiles = evidenceWithUrls?.['Volunteer Work']?.[index] || []
        return { ...vol, ...processedVol, attachedFiles }
      })
    )

    // Update the original volunteerWork.items with the processed credential links
    preparedResume.volunteerWork.items = preparedResume.volunteerWorkVC
  }

  if (preparedResume.hobbiesAndInterests) {
    if (
      Array.isArray(preparedResume.hobbiesAndInterests) &&
      preparedResume.hobbiesAndInterests.length > 0 &&
      typeof preparedResume.hobbiesAndInterests[0] === 'object'
    ) {
      // Already array of objects
      preparedResume.hobbiesAndInterests = preparedResume.hobbiesAndInterests.map(
        (hobby: any) => ({
          name: hobby.name ?? '',
          description: hobby.description ?? ''
        })
      )
    } else if (Array.isArray(preparedResume.hobbiesAndInterests)) {
      // Array of strings, convert to objects
      preparedResume.hobbiesAndInterests = preparedResume.hobbiesAndInterests.map(
        (hobby: any) => ({
          name: hobby,
          description: ''
        })
      )
    }
  }

  if (preparedResume.testimonials?.items) {
    preparedResume.testimonials.items = preparedResume.testimonials.items.map(
      (test: any) => ({
        ...test,
        author: test.author ?? '',
        text: test.text ?? ''
      })
    )
  }

  if (preparedResume.contact?.socialLinks) {
    const links = preparedResume.contact.socialLinks

    if (!links.twitter && links.instagram) {
      links.twitter = links.instagram
    }
  }

  return preparedResume
}

/**
 * Transform the VC format back to the Resume format for UI display
 */
export const transformVCToResume = (vc: any): Resume => {
  if (!vc?.credentialSubject) {
    throw new Error('Invalid VC format')
  }

  const subject = vc.credentialSubject
  const person = subject.person ?? {}
  const contact = person.contact ?? {}

  const resume: Partial<Resume> = {
    id: vc.id ?? '',
    lastUpdated: vc.issuanceDate ?? new Date().toISOString(),
    name: person.name?.formattedName ?? 'Untitled Resume',
    version: 1,

    contact: {
      fullName: contact.fullName ?? '',
      email: contact.email ?? '',
      phone: contact.phone ?? '',
      location: {
        street: contact.location?.street ?? '',
        city: contact.location?.city ?? '',
        state: contact.location?.state ?? '',
        country: contact.location?.country ?? '',
        postalCode: contact.location?.postalCode ?? ''
      },
      socialLinks: {
        linkedin: contact.socialLinks?.linkedin ?? '',
        github: contact.socialLinks?.github ?? '',
        portfolio: contact.socialLinks?.portfolio ?? '',
        instagram: contact.socialLinks?.instagram ?? ''
      }
    },

    summary: subject.narrative?.text ?? '',

    experience: {
      items: (subject.experience ?? subject.employmentHistory ?? []).map((exp: any) => ({
        title: exp.title ?? '',
        company: exp.company ?? '',
        duration: exp.duration ?? '',
        currentlyEmployed: exp.stillEmployed ?? false,
        description: exp.description ?? '',
        position: exp.title ?? '',
        startDate: exp.startDate ?? '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: '',
        attachedFiles: exp.attachedFiles ?? []
      }))
    },

    education: {
      items: (subject.educationAndLearning ?? []).map((edu: any) => ({
        type: edu.degree ?? '',
        programName: edu.fieldOfStudy ?? '',
        institution: edu.institution ?? '',
        duration: '',
        currentlyEnrolled: false,
        inProgress: false,
        awardEarned: true,
        description: '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: '',
        selectedCredentials: [],
        degree: edu.degree ?? '',
        field: edu.fieldOfStudy ?? '',
        startDate: edu.startDate ?? '',
        endDate: edu.endDate ?? '',
        attachedFiles: edu.attachedFiles ?? []
      }))
    },

    skills: {
      items: (subject.skills ?? []).map((skill: any) => ({
        skills: skill.originalSkills ?? `<p>${skill.name ?? ''}</p>`,
        id: '',
        verificationStatus: 'unverified',
        credentialLink: ''
      }))
    },

    awards: {
      items: (subject.awards ?? []).map((award: any) => ({
        title: award.title ?? '',
        issuer: award.issuer ?? '',
        date: award.date ?? '',
        description: award.description ?? '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: ''
      }))
    },

    publications: {
      items: (subject.publications ?? []).map((pub: any) => ({
        title: pub.title ?? '',
        publisher: pub.publisher ?? '',
        publishedDate: pub.date ?? '',
        url: pub.url ?? '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: '',
        authors: []
      }))
    },

    certifications: {
      items: (subject.certifications ?? []).map((cert: any) => ({
        name: cert.name ?? '',
        issuer: cert.issuer ?? '',
        issueDate: cert.date ?? '',
        expiryDate: '',
        credentialId: '',
        noExpiration: false,
        id: '',
        verificationStatus: 'unverified',
        credentialLink: cert.url ?? ''
      }))
    },

    professionalAffiliations: {
      items: (subject.professionalAffiliations ?? []).map((aff: any) => ({
        name: aff.role ?? '',
        organization: aff.organization ?? '',
        startDate: aff.startDate ?? '',
        endDate: aff.endDate ?? '',
        activeAffiliation: false,
        id: '',
        verificationStatus: 'unverified',
        credentialLink: ''
      }))
    },

    volunteerWork: {
      items: (subject.volunteerWork ?? []).map((vol: any) => ({
        role: vol.role ?? '',
        organization: vol.organization ?? '',
        location: '',
        startDate: vol.startDate ?? '',
        endDate: vol.endDate ?? '',
        currentlyVolunteering: false,
        description: vol.description ?? '',
        duration: '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: ''
      }))
    },

    hobbiesAndInterests: subject.hobbiesAndInterests ?? [],

    languages: {
      items: (subject.languages ?? []).map((lang: any) => ({
        name: lang.language ?? '',
        proficiency: lang.proficiency ?? ''
      }))
    },

    testimonials: {
      items: (subject.testimonials ?? []).map((test: any) => ({
        author: test.author ?? '',
        text: test.text ?? '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: ''
      }))
    },

    projects: {
      items: (subject.projects ?? []).map((proj: any) => ({
        name: proj.name ?? '',
        description: proj.description ?? '',
        url: proj.url ?? '',
        id: '',
        verificationStatus: 'unverified',
        credentialLink: '',
        technologies: []
      }))
    }
  }

  return resume as Resume
}

/**
 * Transforms a resume from the VC schema to the editor schema
 */
export const transformVCToEditorSchema = (resume: any): any => {
  if (!resume) return null

  const transformed = {
    id: resume.id || '',
    fullName: resume.credentialSubject?.person?.name?.formattedName || 'Untitled',
    lastUpdated: new Date().toISOString(),
    name: resume.credentialSubject?.person?.name?.formattedName || 'Untitled',
    version: 1,
    contact: {
      fullName: resume.credentialSubject?.person?.contact?.fullName || '',
      email: resume.credentialSubject?.person?.contact?.email || '',
      phone: resume.credentialSubject?.person?.contact?.phone || '',
      location: {
        street: resume.credentialSubject?.person?.contact?.location?.street || '',
        city: resume.credentialSubject?.person?.contact?.location?.city || '',
        state: resume.credentialSubject?.person?.contact?.location?.state || '',
        country: resume.credentialSubject?.person?.contact?.location?.country || '',
        postalCode: resume.credentialSubject?.person?.contact?.location?.postalCode || ''
      },
      socialLinks: {
        linkedin: resume.credentialSubject?.person?.contact?.socialLinks?.linkedin || '',
        github: resume.credentialSubject?.person?.contact?.socialLinks?.github || '',
        portfolio:
          resume.credentialSubject?.person?.contact?.socialLinks?.portfolio || '',
        instagram: resume.credentialSubject?.person?.contact?.socialLinks?.instagram || ''
      }
    },
    summary: resume.credentialSubject?.narrative?.text || '',
    experience: {
      items: Array.isArray(resume.credentialSubject?.experience)
        ? resume.credentialSubject.experience.map((exp: any) => ({
            title: exp.title || '',
            company: exp.company || '',
            duration: exp.duration || '',
            currentlyEmployed: exp.stillEmployed || false,
            description: exp.description || '',
            showDuration: true,
            position: exp.position || '',
            startDate: exp.startDate || '',
            endDate: exp.endDate || '',
            achievements: [],
            id: '',
            verificationStatus: 'unverified',
            credentialLink: '',
            selectedCredentials: []
          }))
        : []
    },
    education: {
      items: Array.isArray(resume.credentialSubject?.educationAndLearning)
        ? resume.credentialSubject.educationAndLearning.map((edu: any) => ({
            type: edu.degree || 'Bachelors',
            programName: edu.fieldOfStudy || '',
            institution: edu.institution || '',
            duration: edu.duration || '1 year',
            showDuration: false,
            currentlyEnrolled: false,
            inProgress: false,
            awardEarned: false,
            description: edu.description || '',
            id: '',
            verificationStatus: 'unverified',
            credentialLink: '',
            selectedCredentials: [],
            degree: edu.degree || '',
            field: edu.fieldOfStudy || '',
            startDate: edu.startDate || '',
            endDate: edu.endDate || ''
          }))
        : []
    },
    skills: {
      items: Array.isArray(resume.credentialSubject?.skills)
        ? resume.credentialSubject.skills.map((skill: any) => ({
            skills: skill.name || '',
            id: '',
            verificationStatus: 'unverified',
            credentialLink: '',
            selectedCredentials: []
          }))
        : []
    },
    awards: {
      items: []
    },
    publications: {
      items: []
    },
    certifications: {
      items: []
    },
    professionalAffiliations: {
      items: Array.isArray(resume.credentialSubject?.professionalAffiliations)
        ? resume.credentialSubject.professionalAffiliations.map((aff: any) => ({
            name: aff.role || '',
            organization: aff.organization || '',
            startDate: aff.startDate || '',
            endDate: aff.endDate || '',
            showDuration: false,
            activeAffiliation: false,
            id: '',
            verificationStatus: 'unverified',
            credentialLink: '',
            duration: '',
            selectedCredentials: []
          }))
        : []
    },
    volunteerWork: {
      items: []
    },
    hobbiesAndInterests: Array.isArray(resume.credentialSubject?.hobbiesAndInterests)
      ? resume.credentialSubject.hobbiesAndInterests
      : [],
    languages: {
      items: Array.isArray(resume.credentialSubject?.languages)
        ? resume.credentialSubject.languages.map((lang: any) => ({
            name: lang.language || ''
          }))
        : []
    },
    testimonials: {
      items: []
    },
    projects: {
      items: []
    },
    content: resume
  }

  return transformed
}

/**
 * Transforms a resume from the editor schema to the VC schema
 */
export const transformEditorToVCSchema = (resume: any): any => {
  if (!resume) return null

  const transformed = {
    '@context': [
      'https://www.w3.org/2018/credentials/v1',
      {
        '@vocab': 'https://schema.hropenstandards.org/4.4/',
        name: 'https://schema.org/name',
        formattedName: 'https://schema.org/formattedName',
        primaryLanguage: 'https://schema.org/primaryLanguage',
        narrative: 'https://schema.org/narrative',
        text: 'https://schema.org/text',
        contact: 'https://schema.org/ContactPoint',
        email: 'https://schema.org/email',
        phone: 'https://schema.org/telephone',
        location: 'https://schema.org/address',
        street: 'https://schema.org/streetAddress',
        city: 'https://schema.org/addressLocality',
        state: 'https://schema.org/addressRegion',
        country: 'https://schema.org/addressCountry',
        postalCode: 'https://schema.org/postalCode',
        socialLinks: {
          '@id': 'https://schema.org/URL',
          '@container': '@set'
        },
        linkedin: 'https://schema.org/sameAs',
        github: 'https://schema.org/sameAs',
        portfolio: 'https://schema.org/url',
        twitter: 'https://schema.org/sameAs',
        experience: {
          '@id': 'https://schema.org/WorkExperience',
          '@container': '@list'
        },
        employmentHistory: {
          '@id': 'https://schema.org/employmentHistory',
          '@container': '@list'
        },
        educationAndLearning: {
          '@id': 'https://schema.org/EducationalOccupationalProgram',
          '@container': '@list'
        },
        certifications: {
          '@id': 'https://schema.org/EducationalOccupationalCredential',
          '@container': '@list'
        },
        skills: {
          '@id': 'https://schema.org/skills',
          '@container': '@list'
        },
        projects: {
          '@id': 'https://schema.org/Project',
          '@container': '@list'
        },
        professionalAffiliations: {
          '@id': 'https://schema.org/OrganizationRole',
          '@container': '@list'
        },
        volunteerWork: {
          '@id': 'https://schema.org/VolunteerRole',
          '@container': '@list'
        },
        company: 'https://schema.org/worksFor',
        position: 'https://schema.org/jobTitle',
        description: 'https://schema.org/description',
        startDate: 'https://schema.org/startDate',
        endDate: 'https://schema.org/endDate',
        stillEmployed: 'https://schema.org/Boolean',
        duration: 'https://schema.org/temporalCoverage',
        degree: 'https://schema.org/educationalCredentialAwarded',
        fieldOfStudy: 'https://schema.org/studyField',
        institution: 'https://schema.org/educationalInstitution',
        year: 'https://schema.org/year',
        awards: {
          '@id': 'https://schema.org/Achievement',
          '@container': '@list'
        },
        title: 'https://schema.org/name',
        issuer: 'https://schema.org/issuer',
        date: 'https://schema.org/dateReceived',
        publications: {
          '@id': 'https://schema.org/CreativeWork',
          '@container': '@list'
        },
        publisher: 'https://schema.org/publisher',
        url: 'https://schema.org/url',
        activeAffiliation: 'https://schema.org/Boolean',
        currentlyVolunteering: 'https://schema.org/Boolean',
        hobbiesAndInterests: {
          '@id': 'https://schema.org/knowsAbout',
          '@container': '@set'
        },
        languages: {
          '@id': 'https://schema.org/knowsLanguage',
          '@container': '@list'
        },
        language: 'https://schema.org/inLanguage',
        proficiency: 'https://schema.org/proficiencyLevel',
        testimonials: {
          '@id': 'https://schema.org/Review',
          '@container': '@list'
        },
        author: 'https://schema.org/author',
        issuanceDate: 'https://schema.org/issuanceDate',
        credentialSubject: 'https://schema.org/credentialSubject',
        person: 'https://schema.org/Person',
        Resume: 'https://schema.hropenstandards.org/4.4#Resume'
      },
      'https://w3id.org/security/suites/ed25519-2020/v1'
    ],
    id: `urn:uuid:${crypto.randomUUID()}`,
    type: ['VerifiableCredential', 'LERRSCredential'],
    issuer: 'did:key:z6MkpF19yNE48GbT7YcaCMjrLdBtcaSZY3NRq25bniMcctd3',
    issuanceDate: new Date().toISOString(),
    credentialSubject: {
      type: 'Resume',
      person: {
        name: {
          formattedName: resume.contact?.fullName || ''
        },
        primaryLanguage: 'en',
        contact: {
          fullName: resume.contact?.fullName || '',
          email: resume.contact?.email || '',
          phone: resume.contact?.phone || '',
          location: {
            street: resume.contact?.location?.street || '',
            city: resume.contact?.location?.city || '',
            state: resume.contact?.location?.state || '',
            country: resume.contact?.location?.country || '',
            postalCode: resume.contact?.location?.postalCode || ''
          },
          socialLinks: {
            linkedin: resume.contact?.socialLinks?.linkedin || '',
            github: resume.contact?.socialLinks?.github || '',
            portfolio: resume.contact?.socialLinks?.portfolio || '',
            twitter: resume.contact?.socialLinks?.instagram || ''
          }
        }
      },
      narrative: {
        text: resume.summary || ''
      },
      employmentHistory: Array.isArray(resume.employmentHistory)
        ? resume.employmentHistory.map((exp: any) => ({ ...exp }))
        : [],
      educationAndLearning: Array.isArray(resume.educationAndLearning)
        ? resume.educationAndLearning.map((edu: any) => ({
            ...edu,
            degree: edu.type || edu.degree || '',
            fieldOfStudy: edu.programName || edu.fieldOfStudy || '',
            description: edu.description || ''
          }))
        : [],
      certifications: Array.isArray(resume.certificationsVC)
        ? resume.certificationsVC.map((cert: any) => ({
            ...cert,
            credentialLink: cert.credentialLink ?? ''
          }))
        : [],
      skills: Array.isArray(resume.skillsVC)
        ? resume.skillsVC.map((skill: any) => ({ ...skill }))
        : [],
      projects: Array.isArray(resume.projectsVC)
        ? resume.projectsVC.map((proj: any) => ({ ...proj }))
        : [],
      professionalAffiliations: Array.isArray(resume.professionalAffiliationsVC)
        ? resume.professionalAffiliationsVC.map((aff: any) => ({
            ...aff,
            description: aff.description ?? ''
          }))
        : [],
      volunteerWork: Array.isArray(resume.volunteerWorkVC)
        ? resume.volunteerWorkVC.map((vol: any) => ({ ...vol }))
        : [],
      hobbiesAndInterests: Array.isArray(resume.hobbiesAndInterests)
        ? resume.hobbiesAndInterests.map((hobby: any) => ({
            name: hobby.name ?? hobby ?? '',
            description: hobby.description ?? ''
          }))
        : []
    }
  }

  return transformed
}
