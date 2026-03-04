import React from 'react'
import { Box, Typography, Button, Divider } from '@mui/material'

interface LibraryCardProps {
  onImport: () => void
}

/**
 * The "Library" card at the top of the RightSidebar containing
 * the Import from Google Drive and Refresh Wallet buttons.
 */
export default function LibraryCard({ onImport }: LibraryCardProps) {
  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        backgroundColor: '#FFF',
        padding: '20px',
        borderRadius: 2,
        boxShadow: '0px 2px 20px rgba(0,0,0,0.10)'
      }}
    >
      <Typography sx={{ fontSize: 18, fontWeight: 700, color: 'black', fontFamily: 'Poppins' }}>
        Library
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Typography sx={{ fontSize: 16, color: '#47516B', fontFamily: 'Nunito Sans' }}>
          To access credentials from Google Drive, select the Import from Google Drive button.
        </Typography>
        <Button
          fullWidth
          variant='outlined'
          onClick={onImport}
          sx={{
            borderRadius: '100px',
            borderColor: '#3A35A2',
            color: '#3A35A2',
            fontSize: 16,
            textTransform: 'none',
            backgroundColor: 'transparent',
            fontFamily: 'Nunito Sans',
            py: { xs: 1.5, md: 1 },
            width: '100%'
          }}
        >
          Import Credentials from Google Drive
        </Button>
      </Box>

      <Divider sx={{ borderColor: '#47516B' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <Typography sx={{ fontSize: 16, color: '#47516B' }}>
          To check for new credentials in your wallet, select the refresh button below:
        </Typography>
        <Button
          disabled
          variant='outlined'
          fullWidth
          sx={{
            color: '#3A35A2',
            borderRadius: '100px',
            borderColor: '#3A35A2',
            fontSize: { xs: 16, md: 18 },
            textTransform: 'none',
            backgroundColor: 'transparent',
            py: { xs: 1.5, md: 2 },
            width: '100%'
          }}
        >
          Refresh Learner Credential Wallet
        </Button>
      </Box>
    </Box>
  )
}
