import React from 'react'
import { Box, Typography, Grid, Paper, IconButton, Tooltip } from '@mui/material'
import { Plus } from 'lucide-react'
import { useDispatch } from 'react-redux'
import { updateSection } from '../../redux/slices/resume'
import { SVGSectionIcon } from '../../assets/svgs'

interface OptionalSectionCardProps {
  title: string
  icon?: React.ReactNode
  onClick: () => void
}

const OptionalSectionCard: React.FC<OptionalSectionCardProps> = ({
  title,
  icon = <SVGSectionIcon />,
  onClick
}) => {
  return (
    <Paper
      sx={{
        p: 2,
        display: 'flex',
        alignItems: 'center',
        bgcolor: '#F9F9FE',
        borderRadius: '4px',
        cursor: 'pointer',
        '&:hover': {
          bgcolor: '#F1F1FB'
        }
      }}
      onClick={onClick}
    >
      <Box
        sx={{
          mr: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#2E2E48'
        }}
      >
        {icon}
      </Box>
      <Typography
        sx={{
          fontWeight: 500,
          fontSize: '16px',
          color: '#2E2E48',
          fontFamily: 'DM Sans',
          flexGrow: 1
        }}
      >
        {title}
      </Typography>
      <Tooltip title={`Add ${title}`}>
        <IconButton size='small'>
          <Plus size={16} />
        </IconButton>
      </Tooltip>
    </Paper>
  )
}

interface OptionalSectionsManagerProps {
  activeSections: string[]
  onAddSection: (sectionId: string) => void
}

const OptionalSectionsManager: React.FC<OptionalSectionsManagerProps> = ({
  activeSections,
  onAddSection
}) => {
  const dispatch = useDispatch()

  const optionalSections = [
    {
      id: 'Hobbies and Interests',
      title: 'Hobbies and Interests',
      initialValue: []
    },
    {
      id: 'Projects',
      title: 'Projects',
      initialValue: { items: [] }
    },
    {
      id: 'Volunteer Work',
      title: 'Volunteer Work',
      initialValue: { items: [] }
    },
    {
      id: 'Professional Affiliations',
      title: 'Professional Affiliations',
      initialValue: { items: [] }
    },
    {
      id: 'Certifications and Licenses',
      title: 'Certifications and Licenses',
      initialValue: { items: [] }
    }
  ]

  const availableSections = optionalSections.filter(
    section => !activeSections.includes(section.id)
  )

  if (availableSections.length === 0) {
    return null
  }

  const handleSectionAdd = (sectionId: string) => {
    const section = optionalSections.find(s => s.id === sectionId)

    if (section) {
      dispatch(
        updateSection({
          sectionId: sectionId.toLowerCase().replace(/ /g, ''),
          content: section.initialValue
        })
      )

      onAddSection(sectionId)
    }
  }

  return (
    <Box sx={{ mt: 4, mb: 4 }}>
      <Typography
        variant='h6'
        sx={{
          color: '#2E2E48',
          fontFamily: 'DM Sans',
          fontSize: '18px',
          fontWeight: 500,
          mb: 2
        }}
      >
        Add additional sections
      </Typography>
      <Grid container spacing={2}>
        {availableSections.map(section => (
          <Grid item xs={12} sm={6} md={4} key={section.id}>
            <OptionalSectionCard
              title={section.title}
              onClick={() => handleSectionAdd(section.id)}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}

export default OptionalSectionsManager
