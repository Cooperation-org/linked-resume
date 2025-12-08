import React, { useState } from 'react'
import { Box, Typography, IconButton, Dialog, DialogContent } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MinimalCredentialViewer from '../MinimalCredentialViewer'

interface VerifiedCredentialsListProps {
  credentials: Array<any>
  onRemove: (index: number) => void
}

// getCredentialName logic from CredentialsOverlay.tsx
function getCredentialName(vc: any): string {
  try {
    if (!vc || typeof vc !== 'object') {
      return ''
    }
    const credentialSubject = vc.credentialSubject
    if (!credentialSubject || typeof credentialSubject !== 'object') {
      return ''
    }
    if (credentialSubject.employeeName) {
      return `Performance Review: ${credentialSubject.employeeJobTitle || 'Unknown Position'}`
    }
    if (credentialSubject.volunteerWork) {
      return `Volunteer: ${credentialSubject.volunteerWork}`
    }
    if (credentialSubject.role) {
      return `Employment: ${credentialSubject.role}`
    }
    if (credentialSubject.credentialName) {
      return credentialSubject.credentialName
    }
    if (
      Array.isArray(credentialSubject.achievement) &&
      credentialSubject.achievement.length > 0 &&
      credentialSubject.achievement[0]?.name
    ) {
      return credentialSubject.achievement[0].name
    }
    return ''
  } catch (error) {
    console.error('Error getting credential name:', error)
    return ''
  }
}

const VerifiedCredentialsList: React.FC<VerifiedCredentialsListProps> = ({
  credentials,
  onRemove
}) => {
  const [openDialog, setOpenDialog] = useState(false)
  const [dialogCredObj, setDialogCredObj] = useState<any>(null)

  if (!Array.isArray(credentials) || credentials.length === 0) return null
  return (
    <>
      <Box sx={{ mt: 2 }}>
        <Typography variant='body2' sx={{ fontWeight: 'bold', mb: 1 }}>
          Verified Credentials:
        </Typography>
        {credentials.filter(Boolean).map((credential, credIndex) => (
          <Box
            key={`credential-${credential.id}-${credIndex}`}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 0.5,
              backgroundColor: '#f5f5f5',
              p: 0.5,
              borderRadius: 1
            }}
          >
            <Typography
              variant='body2'
              sx={{
                color: 'primary.main',
                textDecoration: 'underline',
                cursor: 'pointer'
              }}
              onClick={() => {
                if (credential && (credential.vc || credential)) {
                  // Create a new object with the fileId set as credentialId
                  const originalCred = credential.vc || credential
                  const credToShow = {
                    ...originalCred,
                    credentialId:
                      credential.fileId || credential.id || originalCred.credentialId
                  }
                  setDialogCredObj(credToShow)
                  setOpenDialog(true)
                }
              }}
            >
              {credential && (credential.vc || credential)
                ? getCredentialName(credential.vc || credential) || 'Unnamed Credential'
                : 'Unnamed Credential'}
            </Typography>
            <IconButton
              size='small'
              onClick={e => {
                e.stopPropagation()
                onRemove(credIndex)
              }}
              sx={{
                p: 0.5,
                color: 'grey.500',
                '&:hover': {
                  color: 'error.main'
                }
              }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        ))}
      </Box>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth='xs'
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            background: 'rgba(255,255,255,0.95)',
            backdropFilter: 'blur(6px)',
            position: 'relative',
            overflow: 'visible'
          }
        }}
        BackdropProps={{
          sx: {
            background: 'rgba(30, 41, 59, 0.25)',
            backdropFilter: 'blur(2px)'
          }
        }}
      >
        <DialogContent
          sx={{ display: 'block', p: 0, background: 'transparent', position: 'relative' }}
        >
          {/* Close button */}
          <Box
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 2,
              cursor: 'pointer',
              color: '#222',
              bgcolor: 'rgba(255,255,255,0.7)',
              borderRadius: '50%',
              p: 0.5,
              transition: 'background 0.2s',
              '&:hover': { bgcolor: '#e0e7ef', color: '#003FE0' }
            }}
            onClick={() => setOpenDialog(false)}
          >
            <CloseIcon fontSize='medium' />
          </Box>
          {dialogCredObj && <MinimalCredentialViewer vcData={dialogCredObj} />}
        </DialogContent>
      </Dialog>
    </>
  )
}

export default VerifiedCredentialsList
