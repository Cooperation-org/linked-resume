import React from 'react'
import { Box, Tooltip } from '@mui/material'
import Logo from '../../assets/blue-logo.png'
import { SVGBadge } from '../../assets/svgs'

interface ResumeStatusBadgeProps {
  isSigned: boolean
  isCompletedUnsigned: boolean
}

/**
 * Shows one of three badges depending on the resume's signing state:
 * - Blue badge SVG for signed
 * - Filled circle for completed-but-unsigned
 * - Draft logo for plain drafts
 */
export default function ResumeStatusBadge({ isSigned, isCompletedUnsigned }: ResumeStatusBadgeProps) {
  if (isSigned) {
    return (
      <Tooltip title='Signed Resume' placement='top'>
        <Box>
          <SVGBadge />
        </Box>
      </Tooltip>
    )
  }

  if (isCompletedUnsigned) {
    return (
      <Tooltip title='Completed but Unsigned Resume' placement='top'>
        <Box
          sx={{
            height: 25,
            width: 25,
            backgroundColor: '#3c4599',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <Box
            sx={{ height: 15, width: 15, backgroundColor: 'white', borderRadius: '50%' }}
          />
        </Box>
      </Tooltip>
    )
  }

  return (
    <Tooltip title='Draft Resume' placement='top'>
      <Box>
        <img src={Logo} alt='Résumé Author' style={{ height: 25 }} />
      </Box>
    </Tooltip>
  )
}
