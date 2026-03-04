import React from 'react'
import { Box, Typography, Stack, CircularProgress } from '@mui/material'
import { checkmarkBlueSVG, checkmarkgraySVG } from '../../../assets/svgs'
import { getCredentialName, getValidVCs } from '../../../hooks/useRightSidebarVCs'

interface CredentialsListProps {
  vcs: any[]
  isLoading: boolean
  isCredentialInUse: (vcId: string) => boolean
}

/**
 * Renders the "Your Credentials" panel: loading spinner, empty state,
 * or the list of VCs with blue/grey checkmarks.
 */
export default function CredentialsList({
  vcs,
  isLoading,
  isCredentialInUse
}: CredentialsListProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100px' }}>
        <CircularProgress size={36} sx={{ color: '#3A35A2' }} />
      </Box>
    )
  }

  const validVCs = getValidVCs(vcs)

  if (validVCs.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
        <Typography sx={{ fontSize: 16, color: '#9CA3AF', fontFamily: 'Nunito Sans' }}>
          No credentials found.
        </Typography>
      </Box>
    )
  }

  return (
    <Stack spacing={2}>
      {validVCs.map((vc: any) => {
        const isInUse = isCredentialInUse(vc.id || vc.originalItem?.id)
        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }} key={vc.id}>
            <Box sx={{ width: 24, height: 24, mr: '10px', display: 'flex' }}>
              {isInUse ? checkmarkBlueSVG() : checkmarkgraySVG()}
            </Box>
            <Typography
              sx={{
                fontSize: 16,
                fontWeight: 500,
                color: '#2563EB',
                textDecoration: 'underline',
                fontFamily: 'Nunito Sans',
                cursor: 'pointer'
              }}
            >
              {getCredentialName(vc)}
            </Typography>
          </Box>
        )
      })}
    </Stack>
  )
}
