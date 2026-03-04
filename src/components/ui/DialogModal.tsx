import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Box,
  IconButton
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import { Button } from './Button'

export interface DialogModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  primaryActionText?: string;
  onPrimaryAction?: () => void;
  isPrimaryActionLoading?: boolean;
  secondaryActionText?: string;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
}

export const DialogModal: React.FC<DialogModalProps> = ({
  open,
  onClose,
  title,
  children,
  primaryActionText,
  onPrimaryAction,
  isPrimaryActionLoading = false,
  secondaryActionText = 'Cancel',
  maxWidth = 'sm'
}) => {
  return (
    <Dialog 
      open={open} 
      onClose={isPrimaryActionLoading ? undefined : onClose} 
      maxWidth={maxWidth} 
      fullWidth
    >
      <DialogTitle sx={{ backgroundColor: '#2b2a2a', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant='h6' sx={{ fontFamily: 'Arial' }}>
          {title}
        </Typography>
        <IconButton
          aria-label='close'
          onClick={onClose}
          disabled={isPrimaryActionLoading}
          sx={{
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent sx={{ mt: 2 }}>
        {children}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose} 
          disabled={isPrimaryActionLoading}
          sx={{
            backgroundColor: 'transparent',
            color: '#666',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.05)',
            }
          }}
        >
          {secondaryActionText}
        </Button>
        {primaryActionText && onPrimaryAction && (
          <Button 
            onClick={onPrimaryAction} 
            isLoading={isPrimaryActionLoading}
          >
            {primaryActionText}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
}
