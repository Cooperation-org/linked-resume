// Helper function to compute a simple hash from the resume's critical fields
export const computeResumeHash = (resume: any): string => {
  if (!resume) return ''

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
