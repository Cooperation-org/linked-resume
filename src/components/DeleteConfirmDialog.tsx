import React from 'react'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { styled } from '@mui/material/styles'

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiPaper-root': {
    padding: theme.spacing(3),
    borderRadius: '12px',
    maxWidth: '400px'
  }
}))

const StyledCancelButton = styled(Button)({
  border: '1px solid #3c4599',
  color: '#3c4599',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '24px',
  padding: '8px 16px'
})

const StyledDeleteButton = styled(Button)({
  backgroundColor: '#3c4599',
  color: '#fff',
  fontWeight: 500,
  textTransform: 'none',
  borderRadius: '24px',
  padding: '8px 16px',
  '&:hover': {
    backgroundColor: '#2e347b'
  }
})

interface DeleteConfirmationDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

const DeleteConfirmationDialog = ({
  open,
  onClose,
  onConfirm
}: DeleteConfirmationDialogProps) => {
  return (
    <StyledDialog open={open} onClose={onClose}>
      <IconButton onClick={onClose} sx={{ position: 'absolute', top: 16, right: 16 }}>
        <CloseIcon />
      </IconButton>
      <DialogContent sx={{ py: 2 }}>
        <DialogTitle sx={{ fontWeight: 'bold', fontSize: '18px', mb: 1, p: 0 }}>
          Are you sure you want to delete this?
        </DialogTitle>
        <Typography sx={{ fontSize: '0.9rem', color: '#555' }}>
          Once an item is deleted, it cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', gap: 2, pb: 2 }}>
        <StyledCancelButton onClick={onClose}>No, Cancel</StyledCancelButton>
        <StyledDeleteButton onClick={onConfirm}>Yes, Delete</StyledDeleteButton>
      </DialogActions>
    </StyledDialog>
  )
}

export default DeleteConfirmationDialog
