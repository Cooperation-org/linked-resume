import {
  CredentialLink,
  FileItem,
  SelectedCredential,
  SectionListItem
} from '../types/resumeSections'

export const calculateDuration = (
  startDate?: string,
  endDate?: string,
  isOngoing?: boolean
): string => {
  if (!startDate) return ''
  const endObj = isOngoing || !endDate ? new Date() : new Date(endDate)
  const startObj = new Date(startDate)
  if (Number.isNaN(startObj.getTime()) || Number.isNaN(endObj.getTime())) return ''

  let years = endObj.getFullYear() - startObj.getFullYear()
  let months = endObj.getMonth() - startObj.getMonth()
  if (months < 0) {
    years--
    months += 12
  }

  const parts: string[] = []
  if (years > 0) parts.push(`${years} year${years === 1 ? '' : 's'}`)
  if (months > 0 || (years === 0 && months >= 0)) {
    parts.push(`${months} month${months === 1 ? '' : 's'}`)
  }
  return parts.join(' ') || 'Less than a month'
}

export const dedupeSelectedCredentials = (
  creds: SelectedCredential[]
): SelectedCredential[] => {
  return Array.from(new Map(creds.map(c => [c.id, c])).values())
}

export const buildCredentialLinks = (creds: SelectedCredential[]): string => {
  const links = creds
    .map(cred => {
      const fileId = cred.fileId || cred.id
      return fileId && cred.vc ? `${fileId},${JSON.stringify(cred.vc)}` : ''
    })
    .filter(Boolean)
  return links.length ? JSON.stringify(links) : ''
}

export const mapFileIdsToUrls = (
  fileIds: string[] = [],
  allFiles: FileItem[] = []
): string[] => {
  return fileIds.map(fileId => {
    const file = allFiles.find(f => f.id === fileId)
    if (file?.googleId) return `https://drive.google.com/uc?export=view&id=${file.googleId}`
    if (file?.url) return file.url
    return fileId
  })
}

export const getCredentialLinks = (credentialLink: CredentialLink): string[] => {
  if (!credentialLink) return []
  if (Array.isArray(credentialLink)) return credentialLink
  if (typeof credentialLink === 'string') {
    return [credentialLink]
  }
  return []
}

export const parseCredentialLink = (
  link: string
): { credObj: any; credId: string; fileId: string } | null => {
  let credObj: any = null
  let credId = ''
  let fileId = ''
  try {
    if (link.startsWith('{') && link.includes('"fileId"')) {
      const wrapper = JSON.parse(link)
      if (wrapper.fileId) {
        fileId = wrapper.fileId
        if (wrapper.credentialLink) {
          const innerLink = wrapper.credentialLink
          if (innerLink.includes(',{')) {
            const commaIdx = innerLink.indexOf(',')
            const jsonStr = innerLink.slice(commaIdx + 1)
            credObj = JSON.parse(jsonStr)
            credObj.credentialId = fileId
          } else if (innerLink.startsWith('{')) {
            credObj = JSON.parse(innerLink)
            credObj.credentialId = fileId
          }
        }
      }
    } else if (link.match(/^([\\w-]+),\\{.*\\}$/)) {
      const commaIdx = link.indexOf(',')
      fileId = link.slice(0, commaIdx)
      credId = fileId
      const jsonStr = link.slice(commaIdx + 1)
      credObj = JSON.parse(jsonStr)
      credObj.credentialId = fileId
    } else if (link.includes(',{')) {
      const commaIdx = link.indexOf(',')
      const urlPart = link.slice(0, commaIdx)
      const jsonStr = link.slice(commaIdx + 1)
      credObj = JSON.parse(jsonStr)
      if (credObj.id) {
        fileId = credObj.id
      } else if (credObj.credentialId) {
        fileId = credObj.credentialId
      } else {
        fileId = urlPart.split('/').pop() || urlPart
      }
      credObj.credentialId = fileId
    } else if (link.startsWith('{')) {
      credObj = JSON.parse(link)
      credId = credObj.credentialId || credObj.id || ''
      fileId = credId
    } else if (link) {
      credId = link
      fileId = link
      credObj = { id: fileId, credentialId: fileId }
    }

    if (credObj || fileId) {
      return { credObj, credId, fileId }
    }
  } catch (e) {
    console.error('Error parsing credential link:', e)
  }

  return null
}

// Normalize mixed section item inputs into SectionListItem[]
export const normalizeSectionItems = (items: any[]): SectionListItem[] => {
  if (!Array.isArray(items)) return []
  return items.map(item => {
    if (typeof item === 'string') return item
    if (item && typeof item === 'object') {
      return {
        text: item.text || item.name || '',
        credentialId: item.credentialId || item.id,
        verified: item.verified ?? false
      }
    }
    return ''
  })
}

