/**
 * Utility functions for formatting platform names
 */

/**
 * Formats a platform name to its proper display format
 * @param platform - The platform name (e.g., "linkedin", "github", "portfolio")
 * @returns The formatted platform name (e.g., "LinkedIn", "GitHub", "Portfolio")
 */
export const formatPlatformName = (platform: string): string => {
  const platformMap: Record<string, string> = {
    linkedin: 'LinkedIn',
    github: 'GitHub',
    portfolio: 'Portfolio',
    instagram: 'Instagram',
    twitter: 'Twitter',
    facebook: 'Facebook',
    website: 'Website'
  }
  
  const lowerPlatform = platform.toLowerCase()
  return platformMap[lowerPlatform] || platform.charAt(0).toUpperCase() + platform.slice(1).toLowerCase()
}
