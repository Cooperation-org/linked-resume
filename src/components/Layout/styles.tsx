// src/components/Layout/styles.tsx
import { Box, styled } from '@mui/material'

export const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 48,
  background: 'linear-gradient(180deg, #361E7D, #414FCD)',
  padding: theme.spacing(3, 2.5),
  height: '100%',
  position: 'fixed',
  left: 0,
  top: 0,
  zIndex: 1100,
  display: 'flex',
  flexDirection: 'column',
  flexShrink: 0,
  boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
  transition: 'width 0.3s ease, padding 0.3s ease',
  [theme.breakpoints.down('md')]: {
    display: 'none'
  },
  '&.expanded': {
    width: 250,
    padding: theme.spacing(3, 2.5),
    [theme.breakpoints.down('md')]: {
      width: 220,
      padding: theme.spacing(2.5, 2)
    }
  }
}))

export const MainContent = styled(Box)(({ theme }) => ({
  marginLeft: 55,
  minHeight: '100vh',
  width: 'calc(100% - 55px)',
  display: 'flex',
  flexDirection: 'column',
  transition: 'margin-left 0.3s ease, width 0.3s ease',
  padding: theme.spacing(0, 2),
  [theme.breakpoints.down('md')]: {
    marginLeft: 0,
    width: '100%',
    padding: theme.spacing(0, 1.5)
  },
  '&.sidebar-expanded': {
    marginLeft: 250,
    width: 'calc(100% - 250px)',
    [theme.breakpoints.down('md')]: {
      marginLeft: 0,
      width: '100%'
    }
  }
}))

export const FullWidthContent = styled(Box)({
  width: '100%',
  minHeight: '100vh'
})
