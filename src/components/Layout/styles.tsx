// src/components/Layout/styles.tsx
import { Box, styled } from '@mui/material'

export const SidebarContainer = styled(Box)(({ theme }) => ({
  width: 48,
  background: 'linear-gradient(180deg, #361E7D, #414FCD)',
  padding: theme.spacing(4, 4),
  height: '100%',
  position: 'fixed',
  left: 0,
  top: 0,
  transition: 'width 0.3s ease',
  [theme.breakpoints.down('md')]: {
    width: 28,
    padding: theme.spacing(2, 2)
  },
  '&.expanded': {
    width: 250,
    [theme.breakpoints.down('md')]: {
      width: 200
    }
  }
}))

export const MainContent = styled(Box)(({ theme }) => ({
  marginLeft: 75,
  minHeight: '100vh',
  width: 'calc(100% - 90px)',
  transition: 'width 0.3s ease',
  [theme.breakpoints.down('md')]: {
    width: 'calc(100% - 90px)',
    alignSelf: 'center'
  },
  '&.sidebar-expanded': {
    marginLeft: 300,
    [theme.breakpoints.down('md')]: {
      marginLeft: 240,
      width: 'calc(100% - 240px)'
    }
  }
}))

export const FullWidthContent = styled(Box)({
  width: '100%',
  minHeight: '100vh'
})
