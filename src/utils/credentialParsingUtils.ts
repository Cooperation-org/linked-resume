/**
 * Utility functions for parsing and handling credential links.
 * These functions are used across the application to extract credential data
 * from various storage formats.
 */
import { getCredentialName as _getCredentialName } from './credentialUtils'

/**
 * Extracts plain text from HTML content and splits into individual skills.
 * Used for displaying skills that are stored as HTML from TextEditor.
 * 
 * @param htmlContent - HTML string containing skill text
 * @returns Array of individual skill strings
 */
export const extractSkillsFromHTML = (htmlContent: string): string[] => {
  if (!htmlContent) return []

  // Create a temporary DOM element to extract text content
  const tempDiv = document.createElement('div')
  tempDiv.innerHTML = htmlContent

  // Get plain text
  const plainText = tempDiv.textContent || tempDiv.innerText || ''

  // Split by commas, bullets, and newlines (similar to LaTeX parsing)
  return plainText
    .split(/[,•\n]+/)
    .map(skill => skill.trim())
    .filter(Boolean)
}

/**
 * Parses credential links and returns them as an array.
 * Handles multiple formats:
 * - Array of strings
 * - JSON stringified array
 * - Wrapper format with fileId
 * - Plain URL or ID string
 * 
 * @param credentialLink - Credential link in various formats
 * @returns Array of credential link strings
 */
export function getCredentialLinks(credentialLink: string | string[] | undefined): string[] {
  if (!credentialLink) return []
  if (Array.isArray(credentialLink)) return credentialLink
  if (typeof credentialLink === 'string') {
    try {
      // Check if it's the wrapper format first
      if (credentialLink.trim().startsWith('{') && credentialLink.includes('"fileId"')) {
        // This is the wrapper format, return it as-is
        return [credentialLink]
      }
      // Check for array format (from edit mode)
      const parsed = JSON.parse(credentialLink)
      if (Array.isArray(parsed)) {
        return parsed
      }
    } catch {
      // Not JSON, might be a simple URL or ID
      if (credentialLink.trim()) {
        return [credentialLink]
      }
    }
  }
  return []
}

/**
 * Parsed credential result containing the credential object and identifiers
 */
export interface ParsedCredential {
  credObj: any
  credId: string
  fileId: string
}

/**
 * Parses a single credential link and extracts credential data.
 * Handles multiple formats:
 * - Wrapper format: '{"credentialLink":"...","fileId":"..."}'
 * - Native format: 'fileid,{json}'
 * - External format: 'url,{json}'
 * - Pure JSON: '{json}'
 * - Plain ID: 'id-string'
 * 
 * @param link - Single credential link string
 * @returns Parsed credential object with credObj, credId, and fileId, or null if parsing fails
 */
export function parseCredentialLink(link: string): ParsedCredential | null {
  let credObj: any = null
  let credId = ''
  let fileId = ''

  try {
    // Check if this is an object wrapper with fileId
    if (link.startsWith('{') && link.includes('"fileId"')) {
      // Format: '{"credentialLink":"...","fileId":"..."}'
      const wrapper = JSON.parse(link)
      if (wrapper.fileId) {
        fileId = wrapper.fileId
        // Parse the actual credential from credentialLink
        if (wrapper.credentialLink) {
          const innerLink = wrapper.credentialLink
          if (innerLink.includes(',{')) {
            // Format: 'url,{json}' inside wrapper
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
    } else if (link.match(/^([\w-]+),\{.*\}$/)) {
      // Format: 'fileid,{json}' (native credentials)
      const commaIdx = link.indexOf(',')
      fileId = link.slice(0, commaIdx)
      credId = fileId // For native credentials, credId and fileId are the same
      const jsonStr = link.slice(commaIdx + 1)
      credObj = JSON.parse(jsonStr)
      credObj.credentialId = fileId
    } else if (link.includes(',{')) {
      // Format: 'url,{json}' (external credentials with URL)
      const commaIdx = link.indexOf(',')
      const urlPart = link.slice(0, commaIdx)
      const jsonStr = link.slice(commaIdx + 1)
      credObj = JSON.parse(jsonStr)
      // For external credentials, we need to extract the ID from somewhere
      // Check if there's an ID in the credential object
      if (credObj.id) {
        fileId = credObj.id
      } else if (credObj.credentialId) {
        fileId = credObj.credentialId
      } else {
        // Generate a fallback ID from the URL
        fileId = urlPart.split('/').pop() || urlPart
      }
      credObj.credentialId = fileId
    } else if (link.startsWith('{')) {
      // Format: '{json}'
      credObj = JSON.parse(link)
      credId = credObj.credentialId || credObj.id || ''
      fileId = credId // For this format, use credId as fileId
    } else if (link) {
      // Just a plain ID
      credId = link
      fileId = link

      // Create a minimal credential object for external credentials
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

/**
 * Extracts the first credential object from a credentialLink string.
 * Useful when only one credential is expected or when displaying a single credential.
 * 
 * @param credentialLink - Credential link string
 * @returns First credential object or null if none found
 */
export function getCredentialFromLink(credentialLink: string | undefined): any | null {
  if (!credentialLink) return null
  const links = getCredentialLinks(credentialLink)
  if (links.length === 0) return null
  const parsed = parseCredentialLink(links[0])
  return parsed?.credObj || null
}

/**
 * Extracts all credentials from a credentialLink, deduplicating by fileId.
 * 
 * @param credentialLink - Credential link in various formats
 * @returns Array of parsed credentials with deduplication
 */
export function getAllCredentialsFromLink(
  credentialLink: string | string[] | undefined
): ParsedCredential[] {
  const links = getCredentialLinks(credentialLink)
  const dedupedCreds: ParsedCredential[] = []
  const seen = new Set<string>()

  links.forEach(link => {
    const parsed = parseCredentialLink(link)
    if (parsed && !seen.has(parsed.fileId)) {
      dedupedCreds.push(parsed)
      seen.add(parsed.fileId)
    }
  })

  return dedupedCreds
}

/**
 * Extracts portfolio items from a credential link.
 * 
 * @param credentialLink - Credential link in various formats
 * @returns Array of portfolio items or undefined
 */
export function getPortfolioFromCredentialLink(
  credentialLink: string | string[] | undefined
): any[] | undefined {
  const credLinks = getCredentialLinks(credentialLink)
  if (credLinks.length === 0) return undefined

  const firstCred = parseCredentialLink(credLinks[0])
  return firstCred?.credObj?.credentialSubject?.portfolio
}

/**
 * Gets the name of a credential.
 * Re-exported from credentialUtils.ts as the single source of truth.
 */
export { _getCredentialName as getCredentialName }
