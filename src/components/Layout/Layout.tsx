// src/components/Layout/Layout.tsx
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { Outlet, useLocation, matchPath } from 'react-router-dom'
import { MainContent, SidebarContainer } from './styles'
import Sidebar from './Sidebar'
import { useState } from 'react'
import MenuIcon from '@mui/icons-material/Menu'

const Layout = () => {
  const location = useLocation()
  const chromeLessRoutes = [
    '/',
    '/home',
    '/login',
    '/login/wallet',
    '/login/Wallet',
    '/signup',
    '/SignUp2',
    '/login-scan',
    '/faq',
    '/privacy-policy',
    '/credential-raw/*',
    '/auth/callback'
  ]
  const shouldHideSidebar = chromeLessRoutes.some(pattern =>
    matchPath({ path: pattern, end: pattern === '/' }, location.pathname)
  )

  const [isExpanded, setIsExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleSidebarToggle = () => {
    setIsExpanded(!isExpanded)
  }

  const handleDrawerToggle = () => {
    setMobileOpen(prev => !prev)
  }

  if (shouldHideSidebar) {
    return <Outlet />
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        minHeight: '100vh',
        position: 'relative',
        bgcolor: 'background.default'
      }}
    >
      {!isMobile && (
        <SidebarContainer className={isExpanded ? 'expanded' : ''}>
          <Sidebar onToggle={handleSidebarToggle} isExpanded={isExpanded} />
        </SidebarContainer>
      )}

      {isMobile && (
        <>
          <AppBar
            position='fixed'
            color='default'
            elevation={0}
            sx={{
              borderBottom: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.default'
            }}
          >
            <Toolbar variant='dense' sx={{ minHeight: 48 }}>
              <IconButton
                edge='start'
                aria-label='Open navigation'
                onClick={handleDrawerToggle}
                size='small'
              >
                <MenuIcon />
              </IconButton>
            </Toolbar>
          </AppBar>
          <Drawer
            anchor='left'
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            PaperProps={{
              sx: {
                width: 240,
                pt: 1,
                background: 'linear-gradient(180deg, #361E7D, #414FCD)'
              }
            }}
          >
            <Sidebar onToggle={handleSidebarToggle} isExpanded={true} />
          </Drawer>
        </>
      )}

      <MainContent
        className={isExpanded ? 'sidebar-expanded' : ''}
        sx={{ pt: isMobile ? 7 : 0 }}
      >
        <Outlet />
      </MainContent>
    </Box>
  )
}

export default Layout
