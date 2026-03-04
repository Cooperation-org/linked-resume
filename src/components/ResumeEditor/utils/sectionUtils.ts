import { SelectedCredential } from '../types/section.types'

/** Calculates a human-readable duration between two dates */
export function calculateDuration(
  startDate: string,
  endDate: string | undefined,
  currentlyActive: boolean
): string {
  if (!startDate) return ''
  const end = currentlyActive || !endDate ? new Date() : new Date(endDate)
  const start = new Date(startDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''

  let years = end.getFullYear() - start.getFullYear()
  let months = end.getMonth() - start.getMonth()
  if (months < 0) {
    years--
    months += 12
  }

  let result = ''
  if (years > 0) result += `${years} year${years !== 1 ? 's' : ''}`
  if (months > 0 || years === 0) {
    if (result) result += ' '
    result += `${months} month${months !== 1 ? 's' : ''}`
  }
  return result || 'Less than a month'
}

/** Deduplicates credentials by id */
export function dedupeCredentials(credentials: SelectedCredential[]): SelectedCredential[] {
  return Array.from(new Map(credentials.map(c => [c.id, c])).values())
}

/** Builds an array of "fileId,{vcJson}" strings for storage in credentialLink */
export function buildCredentialLinks(credentials: SelectedCredential[]): string[] {
  return credentials
    .map(cred => {
      const fileId = cred.fileId || cred.id
      return fileId && cred.vc ? `${fileId},${JSON.stringify(cred.vc)}` : ''
    })
    .filter(Boolean)
}

/** Resolves a file URL from allFiles evidence */
export function resolveFileUrl(
  fileId: string,
  allFiles: Array<{ id: string; url?: string; googleId?: string }>
): string {
  const file = allFiles.find(f => f.id === fileId)
  if (file?.googleId) return `https://drive.google.com/uc?export=view&id=${file.googleId}`
  if (file?.url) return file.url
  return fileId
}
