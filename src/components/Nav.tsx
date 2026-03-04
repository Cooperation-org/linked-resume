import Logo from '../assets/logo.png'
import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Stack,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  useMediaQuery,
  useTheme
} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import Notification from './common/Notification'
import MenuIcon from '@mui/icons-material/Menu'
import CloseIcon from '@mui/icons-material/Close'
import { useState } from 'react'
import { useNav } from '../hooks/useNav'

const navStyles = {
  color: 'white',
  textTransform: 'capitalize',
  fontWeight: 600,
  fontSize: '16px',
  fontFamily: 'Nunito Sans'
}

const mobileNavStyles = {
  color: '#4527A0',
  textTransform: 'capitalize',
  fontWeight: 600,
  fontSize: '18px',
  fontFamily: 'Nunito sans',
  padding: '12px 16px'
}

const Nav = () => {
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [showNotification, setShowNotification] = useState(false)

  const { isLogged, mobileMenuOpen, setMobileMenuOpen, navItems, handleLogout, handleLogin } = useNav()

  const onLogout = () => {
    handleLogout()
    setShowNotification(true)
  }

  return (
    <>
      <AppBar position='static' elevation={0} sx={{ bgcolor: '#4527A0', pt: 1, px: { xs: 2, sm: 3, md: 4 } }}>
        <Toolbar sx={{ display: 'flex', justifyContent: 'space-between', padding: { xs: '0 4px', md: '0 16px' } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
            <img src={Logo} alt='Résumé Author' style={{ height: isMobile ? '40px' : '50px' }} />
            <Typography sx={{ fontFamily: 'Poppins', fontSize: { xs: '24px', md: '32px' }, fontWeight: 700 }}>
              Resume Author
            </Typography>
          </Box>

          {isMobile ? (
            <>
              <IconButton color='inherit' aria-label='open menu' onClick={() => setMobileMenuOpen(true)} edge='end'>
                <MenuIcon fontSize='large' />
              </IconButton>
              <Drawer anchor='right' open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} PaperProps={{ sx: { width: '70%', maxWidth: '300px', padding: '16px', backgroundColor: '#FFFFFF' } }}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                  <IconButton onClick={() => setMobileMenuOpen(false)}><CloseIcon /></IconButton>
                </Box>
                <List>
                  <ListItem disablePadding>
                    <Button fullWidth onClick={() => { navigate('/faq'); setMobileMenuOpen(false) }} sx={mobileNavStyles}>
                      Help & FAQ
                    </Button>
                  </ListItem>
                  {!isLogged ? (
                    <>
                      {navItems.filter(item => item.label !== 'Help & FAQ').map((item, i) => (
                        <ListItem key={i} disablePadding>
                          <Button fullWidth onClick={item.action} sx={mobileNavStyles}>{item.label}</Button>
                        </ListItem>
                      ))}
                      <ListItem disablePadding>
                        <Button fullWidth onClick={handleLogin} sx={mobileNavStyles}>Login</Button>
                      </ListItem>
                    </>
                  ) : (
                    <ListItem disablePadding>
                      <Button fullWidth onClick={onLogout} sx={mobileNavStyles}>Logout</Button>
                    </ListItem>
                  )}
                </List>
              </Drawer>
            </>
          ) : !isLogged ? (
            <Stack direction='row' spacing={{ sm: 2, md: 5 }}>
              {navItems.filter(item => item.label !== 'Help & FAQ').map((item, i) => (
                <Button key={i} color='inherit' sx={navStyles} onClick={item.action}>{item.label}</Button>
              ))}
              <Button color='inherit' sx={navStyles} onClick={() => navigate('/faq')}>Help & FAQ</Button>
              <Button color='inherit' sx={navStyles} onClick={handleLogin}>Login</Button>
            </Stack>
          ) : (
            <Stack direction='row' spacing={{ sm: 2, md: 5 }}>
              <Button color='inherit' sx={navStyles} onClick={() => navigate('/faq')}>Help & FAQ</Button>
              <Button color='inherit' sx={navStyles} onClick={onLogout}>Logout</Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>

      <Notification
        open={showNotification}
        message="You've been successfully logged out"
        severity='success'
        onClose={() => setShowNotification(false)}
      />
    </>
  )
}

export default Nav
