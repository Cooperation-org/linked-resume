// Function to generate unique ID for resume items
export const generateId = (prefix: string) =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

// Function to transform Gemini response to resume format
export const transformGeminiResponseToResume = (geminiData: any) => {
  // Ensure we have a valid structure
  if (!geminiData) {
    throw new Error('Invalid response from Gemini API')
  }

  const transformedResume = {
    id: geminiData.id || '',
    lastUpdated: geminiData.lastUpdated || new Date().toISOString(),
    name: geminiData.name || geminiData.contact?.fullName || 'Untitled Resume',
    version: geminiData.version || 1,
    contact: {
      fullName: geminiData.contact?.fullName || '',
      email: geminiData.contact?.email || '',
      phone: geminiData.contact?.phone || '',
      location: {
        street: geminiData.contact?.location?.street || '',
        city: geminiData.contact?.location?.city || '',
        state: geminiData.contact?.location?.state || '',
        country: geminiData.contact?.location?.country || '',
        postalCode: geminiData.contact?.location?.postalCode || ''
      },
      socialLinks: {
        linkedin: geminiData.contact?.socialLinks?.linkedin || '',
        github: geminiData.contact?.socialLinks?.github || '',
        portfolio: geminiData.contact?.socialLinks?.portfolio || '',
        instagram: geminiData.contact?.socialLinks?.instagram || ''
      }
    },
    summary: geminiData.summary || '',
    experience: {
      items: (geminiData.experience?.items || []).map((exp: any) => ({
        id: exp.id || generateId('exp'),
        title: exp.title || exp.position || '',
        position: exp.position || exp.title || '',
        company: exp.company || '',
        description: exp.description || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        stillEmployed: exp.stillEmployed || exp.currentlyEmployed || false,
        currentlyEmployed: exp.currentlyEmployed || exp.stillEmployed || false,
        duration: exp.duration || '',
        location: exp.location || '',
        verificationStatus: exp.verificationStatus || 'unverified'
      }))
    },
    education: {
      items: (geminiData.education?.items || []).map((edu: any) => ({
        id: edu.id || generateId('edu'),
        institution: edu.institution || '',
        degree: edu.degree || edu.type || '',
        type: edu.type || edu.degree || '',
        programName: edu.programName || edu.field || '',
        field: edu.field || edu.programName || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        duration: edu.duration || '',
        inProgress: edu.inProgress || edu.currentlyEnrolled || false,
        currentlyEnrolled: edu.currentlyEnrolled || edu.inProgress || false,
        awardEarned: edu.awardEarned || false,
        description: edu.description || '',
        verificationStatus: edu.verificationStatus || 'unverified'
      }))
    },
    skills: {
      items: (geminiData.skills?.items || []).map((skill: any) => ({
        id: skill.id || generateId('skill'),
        skills: skill.skills || skill.name || '',
        verificationStatus: skill.verificationStatus || 'unverified',
        credentialLink: skill.credentialLink || ''
      }))
    },
    projects: {
      items: (geminiData.projects?.items || []).map((project: any) => ({
        id: project.id || generateId('proj'),
        name: project.name || '',
        description: project.description || '',
        url: project.url || '',
        technologies: project.technologies || [],
        credentialLink: project.credentialLink || '',
        verificationStatus: project.verificationStatus || 'unverified'
      }))
    },
    certifications: {
      items: (geminiData.certifications?.items || []).map((cert: any) => ({
        id: cert.id || generateId('cert'),
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.issueDate || cert.date || '',
        expiryDate: cert.expiryDate || '',
        noExpiration: cert.noExpiration || false,
        url: cert.url || '',
        verificationStatus: cert.verificationStatus || 'unverified'
      }))
    },
    awards: {
      items: (geminiData.awards?.items || []).map((award: any) => ({
        id: award.id || generateId('award'),
        title: award.title || award.name || '',
        issuer: award.issuer || '',
        date: award.date || '',
        description: award.description || '',
        verificationStatus: award.verificationStatus || 'unverified'
      }))
    },
    publications: {
      items: (geminiData.publications?.items || []).map((pub: any) => ({
        id: pub.id || generateId('pub'),
        title: pub.title || '',
        type: pub.type || 'Other',
        publisher: pub.publisher || '',
        publishedDate: pub.publishedDate || pub.date || '',
        authors: pub.authors || [],
        url: pub.url || '',
        verificationStatus: pub.verificationStatus || 'unverified'
      }))
    },
    professionalAffiliations: {
      items: (geminiData.professionalAffiliations?.items || []).map((aff: any) => ({
        id: aff.id || generateId('aff'),
        name: aff.name || '',
        organization: aff.organization || '',
        role: aff.role || '',
        startDate: aff.startDate || '',
        endDate: aff.endDate || '',
        duration: aff.duration || '',
        activeAffiliation: aff.activeAffiliation || false,
        verificationStatus: aff.verificationStatus || 'unverified'
      }))
    },
    volunteerWork: {
      items: (geminiData.volunteerWork?.items || []).map((vol: any) => ({
        id: vol.id || generateId('vol'),
        organization: vol.organization || '',
        role: vol.role || '',
        startDate: vol.startDate || '',
        endDate: vol.endDate || '',
        duration: vol.duration || '',
        currentlyVolunteering: vol.currentlyVolunteering || false,
        description: vol.description || '',
        location: vol.location || '',
        verificationStatus: vol.verificationStatus || 'unverified'
      }))
    },
    languages: {
      items: (geminiData.languages?.items || []).map((lang: any) => ({
        id: lang.id || generateId('lang'),
        name: lang.name || '',
        proficiency: lang.proficiency || 'Basic',
        verificationStatus: lang.verificationStatus || 'unverified'
      }))
    },
    hobbiesAndInterests: geminiData.hobbiesAndInterests || [],
    testimonials: {
      items: geminiData.testimonials?.items || []
    }
  }

  return transformedResume
}

// Function to transform VC data to resume format
export const transformVCToResume = (vcData: any) => {
  const credentialSubject = vcData.credentialSubject
  const person = credentialSubject.person
  const contact = person.contact

  const transformedResume = {
    name: person.name?.formattedName || '',
    contact: {
      fullName: contact?.fullName || person.name?.formattedName || '',
      email: contact?.email || '',
      phone: contact?.phone || '',
      location: {
        street: contact?.location?.street || '',
        city: contact?.location?.city || '',
        state: contact?.location?.state || '',
        country: contact?.location?.country || '',
        postalCode: contact?.location?.postalCode || ''
      },
      socialLinks: {
        linkedin: contact?.socialLinks?.linkedin || '',
        github: contact?.socialLinks?.github || '',
        portfolio: contact?.socialLinks?.portfolio || '',
        twitter: contact?.socialLinks?.twitter || ''
      }
    },
    summary: credentialSubject.narrative?.text?.replace(/<[^>]*>/g, '') || '',
    experience: {
      items: (credentialSubject.employmentHistory || []).map((exp: any) => ({
        id: exp.id || generateId('exp'),
        company: exp.organization?.tradeName || '',
        position: exp.title || '',
        title: exp.title || '',
        description: exp.description || '',
        duration: exp.duration || '',
        startDate: exp.startDate || '',
        endDate: exp.endDate || '',
        stillEmployed: exp.stillEmployed || false,
        verificationStatus: exp.verificationStatus || 'unverified'
      }))
    },
    education: {
      items: (credentialSubject.educationAndLearning || []).map((edu: any) => ({
        id: edu.id || generateId('edu'),
        institution: edu.institution || '',
        type: edu.degree || '',
        programName: edu.fieldOfStudy || '',
        duration: edu.duration || '',
        startDate: edu.startDate || '',
        endDate: edu.endDate || '',
        inProgress: false,
        currentlyEnrolled: false,
        awardEarned: false,
        verificationStatus: edu.verificationStatus || 'unverified'
      }))
    },
    skills: {
      items: (credentialSubject.skills || []).map((skill: any) => ({
        id: skill.id || generateId('skill'),
        skills: skill.name || '',
        verificationStatus: skill.verificationStatus || 'unverified'
      }))
    },
    certifications: {
      items: (credentialSubject.certifications || []).map((cert: any) => ({
        id: cert.id || generateId('cert'),
        name: cert.name || '',
        issuer: cert.issuer || '',
        issueDate: cert.date || '',
        url: cert.url || '',
        noExpiration: false,
        verificationStatus: cert.verificationStatus || 'unverified'
      }))
    },
    projects: {
      items: (credentialSubject.projects || []).map((project: any) => ({
        id: project.id || generateId('proj'),
        name: project.name || '',
        description: project.description || '',
        url: project.url || '',
        duration: project.duration || '',
        startDate: project.startDate || '',
        endDate: project.endDate || '',
        verificationStatus: project.verificationStatus || 'unverified'
      }))
    },
    professionalAffiliations: {
      items: (credentialSubject.professionalAffiliations || []).map(
        (affiliation: any) => ({
          id: affiliation.id || generateId('aff'),
          name: affiliation.name || '',
          organization: affiliation.organization || '',
          role: affiliation.name || '',
          startDate: affiliation.startDate || '',
          endDate: affiliation.endDate || '',
          duration: affiliation.duration || '',
          activeAffiliation: affiliation.activeAffiliation || false,
          verificationStatus: affiliation.verificationStatus || 'unverified'
        })
      )
    },
    volunteerWork: {
      items: (credentialSubject.volunteerWork || []).map((volunteer: any) => ({
        id: volunteer.id || generateId('vol'),
        role: volunteer.role || '',
        organization: volunteer.organization || '',
        location: volunteer.location || '',
        startDate: volunteer.startDate || '',
        endDate: volunteer.endDate || '',
        duration: volunteer.duration || '',
        currentlyVolunteering: volunteer.currentlyVolunteering || false,
        description: volunteer.description || '',
        verificationStatus: volunteer.verificationStatus || 'unverified'
      }))
    },
    languages: {
      items: (credentialSubject.languages || []).map((lang: any) => ({
        id: lang.id || generateId('lang'),
        name: lang.name || '',
        proficiency: lang.proficiency || ''
      }))
    },
    hobbiesAndInterests: credentialSubject.hobbiesAndInterests || []
  }

  return transformedResume
}
