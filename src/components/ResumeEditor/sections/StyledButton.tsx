import { Button, styled, Theme } from '@mui/material'

export const StyledButton = styled(Button)(({ theme }: { theme: Theme }) => ({
  backgroundColor: '#FFFFFF',
  width: '100%',
  color: '#2E2E48',
  fontFamily: 'Nunito Sans',
  fontSize: '14px',
  fontWeight: 500,
  letterSpacing: '0.14px',
  gap: '11px',
  flex: '1 0 0',
  textTransform: 'none',
  '&:hover': {
    backgroundColor: '#F5F5F5'
  },
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '4px',
  '& .MuiButton-startIcon': {
    padding: '5px 0 0 0'
  },
  padding: '0 10px'
}))

export default StyledButton
