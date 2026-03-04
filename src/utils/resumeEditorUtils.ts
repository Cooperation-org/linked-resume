export const computeResumeHash = (resume: any): string => {
  if (!resume) return ''

  // Extract fields that we want to monitor for changes
  const fieldsToCheck = {
    name: resume.name ?? '',
    contact: resume.contact ?? {},
    summary: resume.summary ?? '',
    experience: resume.experience ?? {},
    education: resume.education ?? {},
    affiliations: resume.affiliations ?? {},
    skills: resume.skills ?? {}
  }

  return JSON.stringify(fieldsToCheck)
}

export function forceCredentialJsonString(sectionArr: any[]): any[] {
  if (!Array.isArray(sectionArr)) return sectionArr
  return sectionArr.map(item => {
    if (
      item.credentialLink &&
      (typeof item.credentialLink !== 'string' ||
        (typeof item.credentialLink === 'string' && !item.credentialLink.startsWith('{')))
    ) {
      if (item.fullCredential) {
        return {
          ...item,
          credentialLink: JSON.stringify(item.fullCredential)
        }
      }
    }
    return item
  })
}

export function ensureAbsoluteIds(obj: any) {
  if (Array.isArray(obj)) {
    obj.forEach(ensureAbsoluteIds)
  } else if (obj !== null && typeof obj === 'object') {
    for (const key in obj) {
      if (key === 'id' || key === '@id') {
        const val = obj[key]
        if (typeof val === 'string') {
          if (!val.startsWith('http://') && !val.startsWith('https://') && !val.startsWith('urn:')) {
            obj[key] = `urn:uuid:${val}`
          }
        }
      } else {
        ensureAbsoluteIds(obj[key])
      }
    }
  }
}

export function sectionHasItems(section: any): section is { items: any[] } {
  return section && Array.isArray(section.items)
}
