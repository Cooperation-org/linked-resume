import { Box, IconButton, Typography } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import React from 'react'

type SectionHeaderProps = {
  title: string
  subtitle?: string
  expanded?: boolean
  onToggle?: () => void
  icon?: React.ReactNode
  actions?: React.ReactNode
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  expanded = true,
  onToggle,
  icon,
  actions
}) => {
  return (
    <Box
      display='flex'
      alignItems='center'
      justifyContent='space-between'
      sx={{ cursor: onToggle ? 'pointer' : 'default', gap: 1 }}
      onClick={onToggle}
    >
      <Box display='flex' alignItems='center' gap={1.5} flexGrow={1}>
        {icon}
        <Box>
          <Typography variant='body1' fontWeight={600}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant='body2' color='text.secondary'>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      <Box display='flex' alignItems='center' gap={1}>
        {actions}
        {onToggle && (
          <IconButton
            size='small'
            onClick={e => {
              e.stopPropagation()
              onToggle()
            }}
            sx={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease'
            }}
          >
            <ExpandMoreIcon fontSize='small' />
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default SectionHeader

