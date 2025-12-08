import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Checkbox,
  Typography,
  Paper
} from '@mui/material'
import { useSelector, useDispatch } from 'react-redux'
import { selectCredential, unselectCredential } from '../redux/slices/resume'

interface CredentialDialogProps {
  open: boolean
  onClose: () => void
  claims: any[]
  sectionId: string
  onCredentialsSelected: (selectedClaims: any[]) => void
}

const CredentialDialog: React.FC<CredentialDialogProps> = ({
  open,
  onClose,
  claims,
  sectionId,
  onCredentialsSelected
}) => {
  const dispatch = useDispatch()
  const selectedCredentials = useSelector(
    (state: any) => state.resume.selectedCredentials
  )

  const handleToggleCredential = (claimId: string) => {
    if (selectedCredentials.includes(claimId)) {
      dispatch(unselectCredential(claimId))
    } else {
      dispatch(selectCredential(claimId))
    }
  }

  const handleConfirm = () => {
    const selectedClaims = claims.filter(claim =>
      selectedCredentials.includes(claim[0]?.id)
    )
    onCredentialsSelected(selectedClaims)
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth='md' fullWidth>
      <DialogTitle>Select Credentials for {sectionId}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {claims.map(claim => (
            <Paper
              key={claim[0]?.id}
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 2,
                border: '1px solid gray',
                display: 'flex',
                alignItems: 'center',
                gap: 2
              }}
            >
              <Checkbox
                checked={selectedCredentials.includes(claim[0]?.id)}
                onChange={() => handleToggleCredential(claim[0]?.id)}
              />
              <Box>
                <Typography variant='subtitle1' fontWeight='600'>
                  {claim.credentialSubject?.achievement[0]?.name}
                </Typography>
                <Typography variant='body2' color='text.secondary'>
                  {claim.credentialSubject?.name}
                </Typography>
              </Box>
            </Paper>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleConfirm} variant='contained'>
          Add Selected
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CredentialDialog
