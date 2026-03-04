import React from 'react'
import { Box } from '@mui/material'
import { SVGAddFiles, SVGDeleteSection } from '../../../assets/svgs'
import { StyledButton } from '../sections/StyledButton'

interface SectionActionButtonsProps {
  onAddFiles?: () => void
  onOpenCredentials?: () => void
  onDelete?: () => void
  isSmallMobile?: boolean
}

/**
 * Standard bottom action row shared by all multi-item section cards.
 * Contains: Add Files, Add Credential, and Delete buttons.
 */
export default function SectionActionButtons({
  onAddFiles,
  onOpenCredentials,
  onDelete,
  isSmallMobile = false
}: SectionActionButtonsProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: { xs: 'stretch', sm: 'space-between' },
        alignItems: { xs: 'stretch', sm: 'stretch' },
        marginTop: '20px',
        gap: { xs: '10px', md: '15px' }
      }}
    >
      <StyledButton
        startIcon={!isSmallMobile && <SVGAddFiles />}
        onClick={onAddFiles}
        sx={{
          fontSize: { xs: '14px', md: '16px' },
          padding: { xs: '8px 16px', md: '10px 20px' },
          height: { xs: 'auto', sm: '56px' },
          flex: { sm: 1 },
          minHeight: { sm: '56px' },
          whiteSpace: { sm: 'nowrap' }
        }}
      >
        Add file(s)
      </StyledButton>

      <StyledButton
        onClick={onOpenCredentials}
        sx={{
          fontSize: { xs: '14px', md: '16px' },
          padding: { xs: '8px 16px', md: '10px 20px' },
          height: { xs: 'auto', sm: '56px' },
          flex: { sm: 1 },
          minHeight: { sm: '56px' },
          whiteSpace: { sm: 'nowrap' }
        }}
      >
        Add credential
      </StyledButton>

      <StyledButton
        startIcon={!isSmallMobile && <SVGDeleteSection />}
        onClick={onDelete}
        sx={{
          fontSize: { xs: '14px', md: '16px' },
          padding: { xs: '8px 16px', md: '10px 20px' },
          height: { xs: 'auto', sm: '56px' },
          flex: { sm: 1 },
          minHeight: { sm: '56px' },
          whiteSpace: { sm: 'nowrap' }
        }}
      >
        Delete
      </StyledButton>
    </Box>
  )
}
