type Nullable<T> = T | null | undefined

const latexSpecialChars: Record<string, string> = {
  '\\\\': '\\textbackslash{}',
  '{': '\\{',
  '}': '\\}',
  '#': '\\#',
  $: '\\$',
  '%': '\\%',
  '&': '\\&',
  _: '\\_',
  '~': '\\textasciitilde{}',
  '^': '\\textasciicircum{}'
}

const escapeLatex = (value: Nullable<string | number>): string => {
  if (value === null || value === undefined) {
    return ''
  }
  const asString = String(value)
  return asString.replace(/[\\{}#$%&_~^]/g, match => latexSpecialChars[match] ?? match)
}

const stripHtml = (value: Nullable<string>): string => {
  if (!value) return ''
  return value
    .replace(/<\/?(strong|em|u|span|p)[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/?ul[^>]*>/gi, '\n')
    .replace(/<\/?li[^>]*>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
}

const normalizeText = (value: Nullable<string | number>): string => {
  const stripped = stripHtml(value as string)
  return escapeLatex(stripped.trim().replace(/\s+/g, ' '))
}

const normalizeParagraph = (value: Nullable<string | number>): string => {
  if (!value) return ''
  const stripped = stripHtml(String(value))
  const normalized = stripped
    .split(/\n+/)
    .map(segment => segment.trim())
    .filter(Boolean)
    .join('\\newline ')
  return escapeLatex(normalized)
}

const formatDateToken = (value: Nullable<string>): string => {
  if (!value) return ''
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return normalizeText(value)
  }
  try {
    return escapeLatex(
      new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }).format(parsed)
    )
  } catch {
    return normalizeText(value)
  }
}

const formatRange = ({
  duration,
  startDate,
  endDate,
  isCurrent
}: {
  duration?: string
  startDate?: string
  endDate?: string
  isCurrent?: boolean
}): string => {
  if (duration) return normalizeText(duration)
  const start = formatDateToken(startDate)
  const end = formatDateToken(endDate) || (isCurrent ? 'Present' : '')
  if (!start && !end) return ''
  if (!start) return end
  return `${start}${end ? ` -- ${end}` : ''}`
}

type CredentialCarrier = {
  verificationStatus?: string
  verifiedCredentials?: VerificationCredential[]
  id?: string
}

const buildCredentialFootnote = (item: CredentialCarrier): string => {
  const primary = item.verifiedCredentials?.[0]
  const parts: string[] = []
  if (item.verificationStatus) {
    parts.push(`Status: ${item.verificationStatus}`)
  }
  if (primary?.issuer?.name) {
    parts.push(`Issuer: ${primary.issuer.name}`)
  }
  if (primary?.dateVerified) {
    const formatted = formatDateToken(primary.dateVerified)
    if (formatted) {
      parts.push(`Verified ${formatted}`)
    }
  }
  const credentialId = primary?.vcId ?? primary?.vcDid ?? item.id
  if (credentialId) {
    parts.push(`ID ${credentialId}`)
  }
  if (!parts.length) return ''
  // Use inline text instead of footnote since latex.js doesn't support \footnote in browser
  return ` \\textit{(${escapeLatex(parts.join('; '))})}`
}

const buildBulletBlock = (values?: Nullable<string | string[]>): string => {
  if (!values) return ''
  const normalizedArray: string[] = Array.isArray(values)
    ? values
    : stripHtml(values)
        .split(/[\n•|-]+/)
        .map(entry => entry.trim())
  const bullets = normalizedArray
    .map(entry => entry.trim())
    .filter(Boolean)
    .map(entry => `  \\item ${escapeLatex(entry)}`)
  if (!bullets.length) return ''
  // Use basic itemize without enumitem package options
  return ['\\begin{itemize}', ...bullets, '\\end{itemize}'].join('\n')
}

const buildContactBlock = (resume: Resume): string => {
  const contact = resume.contact || ({} as Contact)
  const fullName = contact.fullName || resume.name || 'Untitled Resume'
  const locationParts = [
    contact.location?.city,
    contact.location?.state,
    contact.location?.country
  ]
    .map(part => part?.trim())
    .filter(Boolean)
  const contactParts: string[] = []
  if (contact.email) {
    contactParts.push(escapeLatex(contact.email))
  }
  if (contact.phone) {
    contactParts.push(escapeLatex(contact.phone))
  }
  const socialLinks = Object.entries(contact.socialLinks ?? {})
    .map(([platform, url]) => (url ? escapeLatex(platform) : null))
    .filter(Boolean) as string[]
  const metaLine = [...contactParts, ...socialLinks].join(' $\\cdot$ ')
  return [
    '\\begin{center}',
    `\\Huge\\textbf{${escapeLatex(fullName)}}\\\\`,
    locationParts.length ? `${escapeLatex(locationParts.join(', '))}\\\\` : '',
    metaLine ? `${metaLine}\\\\` : '',
    resume.summary ? '' : '\\vspace{0.5em}',
    '\\end{center}'
  ]
    .filter(Boolean)
    .join('\n')
}

const buildSummarySection = (resume: Resume): string => {
  const summary = resume.summary || ''
  const narrative =
    (resume as any)?.professionalSummary?.credentialSubject?.narrative ??
    (resume as any)?.professionalSummary?.credentialSubject?.summary
  if (!summary.trim()) return ''
  return [
    '\\section*{Professional Summary}',
    normalizeParagraph(summary),
    narrative ? `\\\\${normalizeParagraph(narrative)}` : ''
  ]
    .filter(Boolean)
    .join('\n')
}

const buildExperienceSection = (items: WorkExperience[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const title = item.position || item.title || ''
      const company = item.company ? `, ${escapeLatex(item.company)}` : ''
      const dateRange = formatRange({
        duration: item.duration,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.currentlyEmployed
      })
      const location = item.location
        ? ` \\textbullet\\ ${escapeLatex(item.location)}`
        : ''
      const details = normalizeParagraph(item.description)
      const achievements = buildBulletBlock(item.acheivements)
      const attachments = buildBulletBlock(item.attachedFiles)
      return [
        `\\textbf{${escapeLatex(title)}}${company}${buildCredentialFootnote(item)}\\\\`,
        dateRange || location ? `\\textit{${dateRange}${location}}\\\\` : '',
        details,
        achievements,
        attachments
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Work Experience}', body].join('\n')
}

const buildEducationSection = (items: Education[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const degree = item.degree || item.programName || ''
      const institution = item.institution ? `, ${escapeLatex(item.institution)}` : ''
      const dateRange = formatRange({
        duration: item.duration,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.currentlyEnrolled
      })
      const description = normalizeParagraph(item.description)
      const honors = buildBulletBlock(item.honors)
      return [
        `\\textbf{${escapeLatex(degree)}}${institution}${buildCredentialFootnote(item)}\\\\`,
        dateRange ? `\\textit{${dateRange}}\\\\` : '',
        description,
        honors
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Education}', body].join('\n')
}

const buildProjectsSection = (items: Project[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const nameLine = `\\textbf{${escapeLatex(item.name)}}${buildCredentialFootnote(item)}`
      const url = item.url ? normalizeText(item.url) : ''
      const tech =
        item.technologies && item.technologies.length
          ? `\\textit{Tech: ${escapeLatex(item.technologies.join(', '))}}`
          : ''
      const description = normalizeParagraph(item.description)
      return [nameLine, url, tech, description].filter(Boolean).join('\\\\\n')
    })
    .join('\n\n')
  return ['\\section*{Projects}', body].join('\n')
}

const buildSkillsSection = (items: Skill[] = []): string => {
  if (!items.length) return ''
  const skills = items
    .flatMap(item => {
      if (!item.skills) return []
      return stripHtml(item.skills)
        .split(/[,•\n]+/)
        .map(skill => skill.trim())
        .filter(Boolean)
    })
    .map(skill => escapeLatex(skill))
  if (!skills.length) return ''
  const skillsText = skills.join(' $\\cdot$ ')
  return ['\\section*{Skills}', skillsText].join('\n')
}

const buildCertificationsSection = (items: Certification[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const issuer = item.issuer ? `\\textit{${escapeLatex(item.issuer)}}` : ''
      const issueDate = formatDateToken(item.issueDate)
      const expiry = item.noExpiration
        ? 'No Expiration'
        : item.expiryDate
          ? `Expires ${formatDateToken(item.expiryDate)}`
          : ''
      const dateLine = [issueDate, expiry].filter(Boolean).join(' \\textbullet\\ ')
      const credentialId = item.credentialId
        ? `Credential ID: ${escapeLatex(item.credentialId)}`
        : ''
      return [
        `\\textbf{${escapeLatex(item.name)}}${buildCredentialFootnote(item)}\\\\`,
        issuer,
        dateLine ? `${dateLine}\\\\` : '',
        credentialId
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Certifications}', body].join('\n')
}

const buildAwardsSection = (items: Award[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const issuer = item.issuer ? `\\textit{${escapeLatex(item.issuer)}}` : ''
      const date = formatDateToken(item.date)
      const description = normalizeParagraph(item.description)
      return [
        `\\textbf{${escapeLatex(item.title)}}${buildCredentialFootnote(item)}\\\\`,
        issuer,
        date ? `${date}\\\\` : '',
        description
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Awards}', body].join('\n')
}

const buildPublicationsSection = (items: Publication[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const meta = [
        item.publisher && `Published by ${escapeLatex(item.publisher)}`,
        item.publishedDate && formatDateToken(item.publishedDate)
      ]
        .filter(Boolean)
        .join(' -- ')
      const url = item.url ? normalizeText(item.url) : ''
      const citation = item.citation ? normalizeParagraph(item.citation) : ''
      return [
        `\\textbf{${escapeLatex(item.title)}}${buildCredentialFootnote(item)}\\\\`,
        meta ? `${meta}\\\\` : '',
        url,
        citation
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Publications}', body].join('\n')
}

const buildAffiliationsSection = (items: ProfessionalAffiliation[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const name = item.name || item.organization || ''
      const role = item.role ? ` (${escapeLatex(item.role)})` : ''
      const dateRange = formatRange({
        duration: item.duration,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.activeAffiliation
      })
      const description = normalizeParagraph(item.description)
      return [
        `\\textbf{${escapeLatex(name)}}${role}${buildCredentialFootnote(item)}\\\\`,
        dateRange ? `\\textit{${dateRange}}\\\\` : '',
        description
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Professional Affiliations}', body].join('\n')
}

const buildVolunteerSection = (items: VolunteerWork[] = []): string => {
  if (!items.length) return ''
  const body = items
    .map(item => {
      const organization = item.organization
        ? ` at ${escapeLatex(item.organization)}`
        : ''
      const dateRange = formatRange({
        duration: item.duration,
        startDate: item.startDate,
        endDate: item.endDate,
        isCurrent: item.currentlyVolunteering
      })
      const description = normalizeParagraph(item.description)
      return [
        `\\textbf{${escapeLatex(item.role)}}${organization}${buildCredentialFootnote(item)}\\\\`,
        dateRange ? `\\textit{${dateRange}}\\\\` : '',
        description
      ]
        .filter(Boolean)
        .join('\n')
    })
    .join('\n\n')
  return ['\\section*{Volunteer Work}', body].join('\n')
}

const buildLanguagesSection = (items: Language[] = []): string => {
  if (!items.length) return ''
  const bullets = items.map(lang => {
    const proficiency = lang.proficiency ? ` (${lang.proficiency})` : ''
    return `  \\item ${escapeLatex(lang.name)}${proficiency}`
  })
  return ['\\section*{Languages}', '\\begin{itemize}', ...bullets, '\\end{itemize}'].join(
    '\n'
  )
}

const buildTestimonialsSection = (testimonials?: { items: any[] }): string => {
  const entries = testimonials?.items ?? []
  if (!entries.length) return ''
  const body = entries
    .map(testimonial => {
      const author = testimonial.author
        ? `\\textbf{${escapeLatex(testimonial.author)}}`
        : ''
      const text = normalizeParagraph(testimonial.text)
      return [author, text].filter(Boolean).join('\\\\\n')
    })
    .join('\n\n')
  return ['\\section*{Testimonials}', body].join('\n')
}

const buildHobbiesSection = (items: string[] = []): string => {
  if (!items.length) return ''
  const bullets = items.map(hobby => `  \\item ${escapeLatex(hobby)}`)
  return [
    '\\section*{Hobbies & Interests}',
    '\\begin{itemize}',
    ...bullets,
    '\\end{itemize}'
  ].join('\n')
}

export const resumeToLatex = (resume: Resume | null | undefined): string => {
  if (!resume) {
    // Return a minimal valid LaTeX document if no resume data
    const preamble = '\\documentclass[11pt]{article}'
    const body =
      '\\begin{center}\n\\Huge\\textbf{Resume}\n\\end{center}\n\\vspace{1em}\nNo resume data available.'
    return `${preamble}\n\\begin{document}\n${body}\n\\end{document}`
  }

  const sections = [
    buildSummarySection(resume),
    buildExperienceSection(resume.experience?.items ?? []),
    buildEducationSection(resume.education?.items ?? []),
    buildProjectsSection(resume.projects?.items ?? []),
    buildSkillsSection(resume.skills?.items ?? []),
    buildCertificationsSection(resume.certifications?.items ?? []),
    buildAwardsSection(resume.awards?.items ?? []),
    buildPublicationsSection(resume.publications?.items ?? []),
    buildAffiliationsSection(resume.professionalAffiliations?.items ?? []),
    buildVolunteerSection(resume.volunteerWork?.items ?? []),
    buildLanguagesSection(resume.languages?.items ?? []),
    buildHobbiesSection(resume.hobbiesAndInterests ?? []),
    buildTestimonialsSection(resume.testimonials)
  ].filter(section => section && section.trim())

  const lastUpdated = resume.lastUpdated
    ? `\\vspace{1em}\\begin{flushright}\\small Last updated: ${formatDateToken(resume.lastUpdated)}\\end{flushright}`
    : ''

  const contactBlock = buildContactBlock(resume)
  const bodyContent = [contactBlock, ...sections, lastUpdated]
    .filter(Boolean)
    .join('\n\n')

  // Ensure we always have some content in the document body
  const documentBody =
    bodyContent.trim() || '\\begin{center}\\textbf{Resume}\\end{center}'

  // Build the LaTeX document with proper line breaks
  // latex.js has limited support in browser - only use basic documentclass
  const preamble = '\\documentclass[11pt]{article}'

  return `${preamble}\n\\begin{document}\n${documentBody}\n\\end{document}`
}

export default resumeToLatex
