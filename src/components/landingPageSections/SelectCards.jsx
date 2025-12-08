import React from 'react'
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material'

const SelectCards = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  const sectionData = [
    'People Skilled Through Alternative Routes (STARS)',
    'Job Seekers',
    'Career Changers',
    'Small to Medium Sized Business Owners',
    'Chamber of Commerce Foundation Partners',
    'Recruiters',
    'Students and Recent Graduates',
    'Freelancers',
    'International Workers',
    'People Returning to Work',
    'Open Source Software Companies ',
    'Hiring Managers'
  ]

  // Calculate how many items to show per column based on screen size
  const getColumnData = () => {
    if (isMobile) {
      return [sectionData] // All items in one column for mobile
    } else if (isTablet) {
      // Split into two columns for tablet
      const midpoint = Math.ceil(sectionData.length / 2)
      return [sectionData.slice(0, midpoint), sectionData.slice(midpoint)]
    } else {
      // Split into three columns for desktop
      const itemsPerColumn = Math.ceil(sectionData.length / 3)
      return [
        sectionData.slice(0, itemsPerColumn),
        sectionData.slice(itemsPerColumn, itemsPerColumn * 2),
        sectionData.slice(itemsPerColumn * 2)
      ]
    }
  }

  const columnData = getColumnData()

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: { xs: '60px 20px', sm: '80px 30px', md: '130px' },
        textAlign: 'center',
        backgroundColor: '#F3F5F8',
        gap: { xs: '20px', md: '30px' }
      }}
    >
      <Typography
        variant='h1'
        sx={{
          color: '#292489',
          fontSize: { xs: '32px', sm: '42px', md: '55px' },
          fontWeight: '600',
          marginBottom: { xs: '10px', md: '16px' },
          px: { xs: 2, sm: 3 }
        }}
      >
        Who can benefit from Resume Author?
      </Typography>

      <Typography
        sx={{
          color: '#000',
          fontSize: { xs: '20px', sm: '24px', md: '32px' },
          marginBottom: { xs: '40px', md: '70px' }
        }}
      >
        Select any card to learn more.
      </Typography>

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'center', sm: 'flex-start' },
          justifyContent: 'center',
          gap: { xs: '20px', sm: '30px', md: '60px' },
          width: '100%'
        }}
      >
        {columnData.map((column, colIndex) => (
          <Box
            key={colIndex}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: {
                xs: '100%',
                sm: colIndex === 0 && columnData.length === 2 ? '45%' : 'auto',
                md: 'auto'
              },
              flex: { sm: 1 },
              p: { xs: '20px', md: '30px' }
            }}
          >
            {column.map((item, index) => (
              <Box
                key={index}
                sx={{
                  borderRadius: '20px',
                  background: '#E9E6F8',
                  p: { xs: '20px', md: '30px' },
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  mb: '15px',
                  width: '100%'
                }}
              >
                <Typography
                  variant='h4'
                  sx={{
                    color: '#292489',
                    fontSize: { xs: '16px', sm: '18px', md: '24px' },
                    fontWeight: '600',
                    textAlign: 'center'
                  }}
                >
                  {isMobile ? item : `${colIndex * column.length + index + 1}. ${item}`}
                </Typography>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  )
}

export default SelectCards
