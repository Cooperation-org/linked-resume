import React from 'react'
import { Box } from '@mui/material'
import { BlueVerifiedBadge } from '../assets/svgs'

export const cleanHTML = (htmlContent: string): string => {
  if (!htmlContent) return ''

  return htmlContent
    .replace(/<p><br><\/p>/g, '')
    .replace(/<p><\/p>/g, '')
    .replace(/<br>/g, '')
    .replace(/class="[^"]*"/g, '')
    .replace(/style="[^"]*"/g, '')
}

interface HTMLContentProps {
  htmlContent: string | undefined
}

export const HTMLContent: React.FC<HTMLContentProps> = ({ htmlContent }) => {
  if (!htmlContent) return null

  const cleanedHTML = cleanHTML(htmlContent)
  return <div dangerouslySetInnerHTML={{ __html: cleanedHTML }} />
}

export const HTMLWithVerifiedLinks: React.FC<{ htmlContent: string }> = ({
  htmlContent
}) => {
  if (!htmlContent) return null

  const cleanedHTML = cleanHTML(htmlContent)
  const hasLinkedCredsLinks = cleanedHTML.includes('linkedcreds.allskillscount.org/view/')

  // Add styling to all links in the content
  const styledHTML = cleanedHTML.replace(
    /<a\s+([^>]*href=["'][^"']+["'][^>]*)>/gi,
    '<a $1 style="color: #2563EB; text-decoration: underline;">'
  )

  if (!hasLinkedCredsLinks) {
    return <span dangerouslySetInnerHTML={{ __html: styledHTML }} />
  }

  // Split the HTML into parts at each linkedcreds link
  const parts: Array<{ type: 'html' | 'verified-link'; content: string }> = []
  const regex =
    /(<a[^>]*href="[^"]*linkedcreds\.allskillscount\.org\/view\/[^"]*"[^>]*>.*?<\/a>)/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(styledHTML)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'html',
        content: styledHTML.substring(lastIndex, match.index)
      })
    }

    parts.push({
      type: 'verified-link',
      content: match[0]
    })

    lastIndex = match.index + match[0].length
  }

  if (lastIndex < styledHTML.length) {
    parts.push({
      type: 'html',
      content: styledHTML.substring(lastIndex)
    })
  }

  return (
    <>
      {parts.map((part, index) =>
        part.type === 'html' ? (
          <span key={index} dangerouslySetInnerHTML={{ __html: part.content }} />
        ) : (
          <Box key={index} sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <BlueVerifiedBadge />
            <span dangerouslySetInnerHTML={{ __html: part.content }} />
          </Box>
        )
      )}
    </>
  )
}

export const isVerifiedLink = (url: string): boolean => {
  if (!url) return false
  return url.includes('linkedcreds.allskillscount.org/view/')
}
