import React from 'react'
import { Box, Typography, IconButton } from '@mui/material'
import { SVGSectionIcon, SVGDownIcon } from '../../../assets/svgs'

interface SectionItemCardProps {
  /** Shown in the collapsed header (e.g. "Job Title:", "Program:") */
  collapsedLabel: string
  /** The actual value shown when collapsed (e.g. experience.title) */
  collapsedValue: string
  /** Label shown in the expanded header (e.g. "Job Title") */
  expandedLabel: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

/**
 * Accordion card wrapping used by every multi-item section.
 * Renders the SVGSectionIcon + collapsed title + expand chevron.
 */
export default function SectionItemCard({
  collapsedLabel,
  collapsedValue,
  expandedLabel,
  isExpanded,
  onToggle,
  children
}: SectionItemCardProps) {
  return (
    <Box
      sx={{
        backgroundColor: '#F1F1FB',
        px: '20px',
        py: '10px',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '4px',
        gap: 2
      }}
    >
      {/* Header / toggle row */}
      <Box
        display='flex'
        alignItems='center'
        justifyContent='space-between'
        onClick={onToggle}
        sx={{ cursor: 'pointer' }}
      >
        <Box display='flex' alignItems='center' gap={2} flexGrow={1}>
          <SVGSectionIcon />
          {!isExpanded ? (
            <>
              <Typography variant='body1'>{collapsedLabel}</Typography>
              <Typography variant='body1' sx={{ fontWeight: 'medium' }}>
                {collapsedValue}
              </Typography>
            </>
          ) : (
            <Box display='flex' alignItems='center'>
              <Typography variant='body1'>{expandedLabel}</Typography>
            </Box>
          )}
        </Box>

        <IconButton
          onClick={e => {
            e.stopPropagation()
            onToggle()
          }}
          sx={{
            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        >
          <SVGDownIcon />
        </IconButton>
      </Box>

      {/* Expanded content */}
      {isExpanded && children}
    </Box>
  )
}
