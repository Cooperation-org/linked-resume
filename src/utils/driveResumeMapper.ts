const safeGet = (obj: any, path: string[], defaultValue: any = ''): any => {
  return path.reduce(
    (acc, key) => (acc && acc[key] !== undefined ? acc[key] : defaultValue),
    obj
  )
}

const extractSocialLinks = (socialLinks: any) => ({
  linkedin: safeGet(socialLinks, ['linkedin'], ''),
  github: safeGet(socialLinks, ['github'], ''),
  portfolio: safeGet(socialLinks, ['portfolio'], ''),
  instagram: safeGet(socialLinks, ['instagram'], safeGet(socialLinks, ['twitter'], ''))
})

/**
 * Map drive/fetch payload into our Resume shape.
 * This mirrors the mapping logic used in PreviewPageFromDrive so recommendation
 * page shows the full resume.
 */
export const mapDriveResume = (fileData: any, resumeId: string): Resume | null => {
  if (!fileData) return null

  const parsedContent: any = fileData?.data ?? fileData ?? {}
  let resumeContent: any = {}

  if (parsedContent?.credentialSubject) {
    resumeContent = parsedContent.credentialSubject
  } else if (parsedContent?.content?.credentialSubject) {
    resumeContent = parsedContent.content.credentialSubject
  } else if ((fileData as any)?.credentialSubject) {
    resumeContent = (fileData as any).credentialSubject
  } else if ((fileData as any)?.content?.credentialSubject) {
    resumeContent = (fileData as any).content.credentialSubject
  } else {
    resumeContent = parsedContent ?? fileData ?? {}
  }

  const experienceItems = [
    ...(resumeContent.employmentHistory ?? []),
    ...(resumeContent.experience?.items ?? [])
  ]
    .filter(
      (exp: any, index: number, self: any[]) =>
        self.findIndex(
          t =>
            t.id === exp.id ||
            (t.title === exp.title &&
              t.company === (exp.organization?.tradeName || exp.company) &&
              t.startDate === exp.startDate &&
              t.endDate === exp.endDate)
        ) === index
    )
    .map(
      (exp: any): WorkExperience => ({
        id: exp.id ?? '',
        title: exp.title ?? exp.position ?? '',
        company: exp.organization?.tradeName ?? exp.company ?? '',
        position: exp.title ?? exp.position ?? '',
        startDate: exp.startDate ?? '',
        endDate: exp.endDate ?? '',
        description: exp.description ?? '',
        achievements: exp.achievements ?? [],
        currentlyEmployed: exp.stillEmployed ?? exp.currentlyEmployed ?? false,
        duration: exp.duration ?? '',
        verificationStatus: exp.verificationStatus ?? 'unverified',
        credentialLink: exp.credentialLink ?? ''
      })
    )

  const educationItems = (
    resumeContent.educationAndLearning ??
    resumeContent.education?.items ??
    []
  ).map(
    (edu: any): Education => ({
      id: edu.id ?? '',
      type: edu.degree ?? edu.type ?? '',
      programName: edu.fieldOfStudy ?? edu.field ?? '',
      degree: edu.degree ?? edu.type ?? '',
      field: edu.fieldOfStudy ?? edu.field ?? '',
      institution: edu.institution ?? '',
      startDate: edu.startDate ?? '',
      endDate: edu.endDate ?? '',
      currentlyEnrolled: edu.currentlyEnrolled ?? false,
      inProgress: edu.inProgress ?? false,
      description: edu.description ?? '',
      duration: edu.duration ?? '',
      awardEarned: edu.awardEarned ?? true,
      verificationStatus: edu.verificationStatus ?? 'unverified',
      credentialLink: edu.credentialLink ?? ''
    })
  )

  const skillsItems = (resumeContent.skills ?? resumeContent.skills?.items ?? []).map(
    (skill: any): Skill => ({
      id: skill.id ?? '',
      skills: skill.originalSkills ?? skill.skills ?? skill.name ?? '',
      verificationStatus: skill.verificationStatus ?? 'unverified',
      credentialLink: skill.credentialLink ?? ''
    })
  )

  const awardsItems = (resumeContent.awards ?? resumeContent.awards?.items ?? []).map(
    (award: any): Award => ({
      id: award.id ?? '',
      title: award.title ?? '',
      description: award.description ?? '',
      issuer: award.issuer ?? '',
      date: award.date ?? '',
      verificationStatus: award.verificationStatus ?? 'unverified'
    })
  )

  const publicationsItems = (
    resumeContent.publications ??
    resumeContent.publications?.items ??
    []
  ).map(
    (pub: any): Publication => ({
      id: pub.id ?? '',
      title: pub.title ?? '',
      publisher: pub.publisher ?? '',
      publishedDate: pub.publishedDate ?? pub.date ?? '',
      url: pub.url ?? '',
      type: pub.type ?? 'Other',
      authors: pub.authors ?? [],
      verificationStatus: pub.verificationStatus ?? 'unverified'
    })
  )

  const certificationsItems = (
    resumeContent.certifications ??
    resumeContent.certifications?.items ??
    []
  ).map(
    (cert: any): Certification => ({
      id: cert.id ?? '',
      name: cert.name ?? '',
      issuer: cert.issuer ?? '',
      issueDate: cert.issueDate ?? cert.date ?? '',
      expiryDate: cert.expiryDate ?? '',
      credentialId: cert.credentialId ?? cert.id ?? '',
      verificationStatus: cert.verificationStatus ?? 'unverified',
      noExpiration:
        cert.noExpiration !== undefined ? cert.noExpiration : !cert.expiryDate,
      score: cert.score ?? '',
      credentialLink: cert.credentialLink ?? ''
    })
  )

  const professionalAffiliationsItems = (
    resumeContent.professionalAffiliations ??
    resumeContent.professionalAffiliations?.items ??
    []
  ).map(
    (aff: any): ProfessionalAffiliation => ({
      id: aff.id ?? '',
      name: aff.name ?? aff.role ?? '',
      organization: aff.organization ?? '',
      role: aff.role ?? aff.name ?? '',
      startDate: aff.startDate ?? '',
      endDate: aff.endDate ?? '',
      duration: aff.duration ?? '',
      activeAffiliation: aff.activeAffiliation ?? false,
      verificationStatus: aff.verificationStatus ?? 'unverified',
      credentialLink: aff.credentialLink ?? ''
    })
  )

  const volunteerWorkItems = (
    resumeContent.volunteerWork ??
    resumeContent.volunteerWork?.items ??
    []
  ).map(
    (vol: any): VolunteerWork => ({
      id: vol.id ?? '',
      role: vol.role ?? '',
      organization: vol.organization ?? '',
      startDate: vol.startDate ?? '',
      endDate: vol.endDate ?? '',
      description: vol.description ?? '',
      currentlyVolunteering: vol.currentlyVolunteering ?? false,
      duration: vol.duration ?? '',
      verificationStatus: vol.verificationStatus ?? 'unverified',
      location: vol.location ?? '',
      cause: vol.cause ?? '',
      credentialLink: vol.credentialLink ?? ''
    })
  )

  const languagesItems = (
    resumeContent.languages ??
    resumeContent.languages?.items ??
    []
  ).map(
    (lang: any): Language => ({
      id: lang.id ?? '',
      name: lang.language ?? lang.name ?? '',
      proficiency: (lang.proficiency as 'Basic') ?? 'Basic',
      verificationStatus: lang.verificationStatus ?? 'unverified',
      certification: lang.certification ?? '',
      writingLevel: lang.writingLevel ?? '',
      speakingLevel: lang.speakingLevel ?? '',
      readingLevel: lang.readingLevel ?? ''
    })
  )

  const testimonialsItems = (
    resumeContent.testimonials ??
    resumeContent.testimonials?.items ??
    []
  ).map(
    (test: any): Testimonial => ({
      id: test.id ?? '',
      author: test.author ?? '',
      text: test.text ?? '',
      verificationStatus: test.verificationStatus ?? 'unverified'
    })
  )

  const projectsItems = (
    resumeContent.projects ??
    resumeContent.projects?.items ??
    []
  ).map(
    (project: any): Project => ({
      id: project.id ?? '',
      name: project.name ?? '',
      description: project.description ?? '',
      url: project.url ?? '',
      verificationStatus: project.verificationStatus ?? 'unverified',
      technologies: project.technologies ?? [],
      credentialLink: project.credentialLink ?? ''
    })
  )

  const resume: Resume = {
    id: resumeId,
    lastUpdated: parsedContent.issuanceDate ?? new Date().toISOString(),
    name: safeGet(
      resumeContent,
      ['person', 'name', 'formattedName'],
      safeGet(resumeContent, ['name'], 'Untitled Resume')
    ),
    version: 1,
    contact: {
      fullName: safeGet(
        resumeContent,
        ['person', 'contact', 'fullName'],
        safeGet(resumeContent, ['contact', 'fullName'], '')
      ),
      email: safeGet(
        resumeContent,
        ['person', 'contact', 'email'],
        safeGet(resumeContent, ['contact', 'email'], '')
      ),
      phone: safeGet(
        resumeContent,
        ['person', 'contact', 'phone'],
        safeGet(resumeContent, ['contact', 'phone'], '')
      ),
      location: {
        street: safeGet(
          resumeContent,
          ['person', 'contact', 'location', 'street'],
          safeGet(resumeContent, ['contact', 'location', 'street'], '')
        ),
        city: safeGet(
          resumeContent,
          ['person', 'contact', 'location', 'city'],
          safeGet(resumeContent, ['contact', 'location', 'city'], '')
        ),
        state: safeGet(
          resumeContent,
          ['person', 'contact', 'location', 'state'],
          safeGet(resumeContent, ['contact', 'location', 'state'], '')
        ),
        country: safeGet(
          resumeContent,
          ['person', 'contact', 'location', 'country'],
          safeGet(resumeContent, ['contact', 'location', 'country'], '')
        ),
        postalCode: safeGet(
          resumeContent,
          ['person', 'contact', 'location', 'postalCode'],
          safeGet(resumeContent, ['contact', 'location', 'postalCode'], '')
        )
      },
      socialLinks: extractSocialLinks(
        resumeContent.person?.contact?.socialLinks ??
          resumeContent.contact?.socialLinks ??
          {}
      )
    },
    summary: safeGet(
      resumeContent,
      ['narrative', 'text'],
      safeGet(resumeContent, ['summary'], '')
    ),
    ...(resumeContent.professionalSummary
      ? { professionalSummary: resumeContent.professionalSummary }
      : {}),
    experience: { items: experienceItems },
    education: { items: educationItems },
    skills: { items: skillsItems },
    awards: { items: awardsItems },
    publications: { items: publicationsItems },
    certifications: { items: certificationsItems },
    professionalAffiliations: { items: professionalAffiliationsItems },
    volunteerWork: { items: volunteerWorkItems },
    hobbiesAndInterests: resumeContent.hobbiesAndInterests ?? [],
    languages: { items: languagesItems },
    testimonials: { items: testimonialsItems },
    projects: { items: projectsItems }
  }

  return resume
}
