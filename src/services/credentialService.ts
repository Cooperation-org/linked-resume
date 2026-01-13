/**
 * Fetch the full credential object from Google Drive using the credential ID
 * This gets the complete file content from Google Drive
 */
export const fetchCredentialFromDrive = async (
  credentialId: string,
  vcs?: any[]
): Promise<any> => {
  try {
    // First try to find in existing VCs from Redux state
    if (vcs && Array.isArray(vcs)) {
      const existingVC = vcs.find(
        (vc: any) => (vc?.originalItem?.id || vc.id) === credentialId
      )
      if (existingVC) {
        return existingVC
      }
    }

    // If not found in VCs, try to fetch from Google Drive directly
    // This would require the Google Drive API to fetch the file content
    // For now, return null as fallback
    console.warn(
      'Credential not found in VCs, would need to fetch from Google Drive:',
      credentialId
    )
    return null
  } catch (error) {
    console.error('Error fetching credential from drive:', error)
    return null
  }
}

/**
 * Replace credential links with full content from Google Drive
 * If link is found, fetch the full credential and replace the link
 */
export const replaceCredentialLinksWithContent = async (
  item: any,
  vcs?: any[]
): Promise<any> => {
  // If no VCs provided, try to get from Redux store
  if (!vcs) {
    try {
      // Import here to avoid circular dependency
      const { store } = await import('../redux/store')
      const state = store.getState()
      vcs = state.vc.vcs || []
    } catch (error) {
      console.warn('Could not get VCs from Redux store:', error)
      vcs = []
    }
  }
  try {
    // Check if item has a credentialLink that looks like a URL
    if (
      item.credentialLink &&
      typeof item.credentialLink === 'string' &&
      item.credentialLink.includes('linkedcreds.allskillscount.org/view/')
    ) {
      // Extract credential ID from URL
      const credentialId = item.credentialLink.split('/view/')[1]

      if (credentialId) {
        // Fetch the full credential content
        const fullCredential = await fetchCredentialFromDrive(credentialId, vcs)

        if (fullCredential) {
          // Replace the link with the full credential object
          return {
            ...item,
            credentialLink: JSON.stringify(fullCredential), // Store as JSON string
            fullCredential: fullCredential // Also store as object for easy access
          }
        } else {
          console.warn(
            '❌ Could not fetch credential, keeping original link:',
            credentialId
          )
        }
      }
    }

    // Return original item if no link found or fetch failed
    return item
  } catch (error) {
    console.error('Error replacing credential link with content:', error)
    return item
  }
}
