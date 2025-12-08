// src/components/Layout/Layout.tsx
import { Box } from '@mui/material'
import { Outlet, useLocation } from 'react-router-dom'
import { MainContent, SidebarContainer } from './styles'
import Sidebar from './Sidebar'
import { useState } from 'react'

const Layout = () => {
  const location = useLocation()
  const isLandingPage = location.pathname === '/'

  const [isExpanded, setIsExpanded] = useState(false)

  const handleSidebarToggle = () => {
    setIsExpanded(!isExpanded)
  }

  if (isLandingPage) {
    return <Outlet />
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <SidebarContainer className={isExpanded ? 'expanded' : ''}>
        <Sidebar onToggle={handleSidebarToggle} isExpanded={isExpanded} />
      </SidebarContainer>
      <MainContent className={isExpanded ? 'sidebar-expanded' : ''}>
        <Outlet />
      </MainContent>
    </Box>
  )
}

export default Layout
