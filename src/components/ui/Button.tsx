import React from 'react'
import { Button as MuiButton, ButtonProps, CircularProgress } from '@mui/material'
import { styled } from '@mui/material/styles'

const StyledButton = styled(MuiButton)(() => ({
  backgroundColor: '#2563EB',
  color: '#FFFFFF',
  textTransform: 'none',
  fontSize: '16px',
  fontWeight: 600,
  padding: '12px 24px',
  borderRadius: '8px',
  '&:hover': {
    backgroundColor: '#1d4ed8'
  },
  '&:disabled': {
    backgroundColor: '#9CA3AF',
    color: '#FFFFFF'
  }
}))

export interface CustomButtonProps extends ButtonProps {
  isLoading?: boolean;
}

export const Button: React.FC<CustomButtonProps> = ({ 
  children, 
  isLoading = false, 
  disabled, 
  ...props 
}) => {
  return (
    <StyledButton
      disabled={isLoading || disabled}
      startIcon={isLoading ? <CircularProgress size={20} color='inherit' /> : props.startIcon}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </StyledButton>
  )
}
