import React from 'react'
import { Box, Typography } from '@mui/material'
import { SectionTitle } from './SectionTitle'
import { renderSectionCredentials } from './Renderers'
import { extractSkillsFromHTML } from '../../utils/credentialParsingUtils'
import { getCredentialLinks } from '../../utils/credentialParsingUtils'

export const SkillsSection: React.FC<{
  items: Skill[]
  setDialogCredObj: (obj: any) => void
  setDialogImageUrl: (url: string | null) => void
  setOpenCredDialog: (open: boolean) => void
}> = ({ items, setDialogCredObj, setDialogImageUrl, setOpenCredDialog }) => {
  if (!items?.length) return null

  // Extract all skills from all items and flatten into a single array
  const allSkills = items.flatMap(item => extractSkillsFromHTML(item.skills || ''))

  // Collect all credential links from all skill items
  const allCredLinks = items.flatMap(item => {
    const links = getCredentialLinks(item.credentialLink)

    return links
  })
  const combinedCredentialLink = allCredLinks.length > 0 ? allCredLinks : undefined

  return (
    <Box sx={{ mb: '15px' }}>
      <SectionTitle>Skills</SectionTitle>
      <Typography
        sx={{
          fontWeight: 400,
          fontSize: '16px',
          fontFamily: 'Arial',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '4px 8px',
          alignItems: 'center'
        }}
      >
        {allSkills.map((skill, index) => (
          <React.Fragment key={index}>
            <span>{skill}</span>
            {index < allSkills.length - 1 && <span style={{ color: '#666' }}>•</span>}
          </React.Fragment>
        ))}
      </Typography>
      {/* Render all credentials at the end of the section */}
      {renderSectionCredentials(
        combinedCredentialLink,
        setDialogCredObj,
        setDialogImageUrl,
        setOpenCredDialog
      )}
    </Box>
  )
}
