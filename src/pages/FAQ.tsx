import React, { useState } from 'react'
import {
  Container,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip
} from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import { faqData } from '../utils/constant'

const Faq: React.FC = () => {
  const [expanded, setExpanded] = useState<string | false>('panel0')
  const handleChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false)
    }

  // Function to convert text with bullet points and sections into formatted components
  const formatAnswer = (text: string) => {
    const sections = text.split('\n\n')

    return (
      <Box>
        {sections.map((section, sectionIndex) => {
          // Handle bold headers
          if (section.startsWith('**') && section.endsWith('**')) {
            return (
              <Typography
                key={sectionIndex}
                variant='h6'
                sx={{ fontWeight: 600, mb: 1, color: 'primary.main' }}
              >
                {section.replace(/\*\*/g, '')}
              </Typography>
            )
          }

          // Handle bullet points
          if (section.includes('•')) {
            const [header, ...items] = section.split('•')
            return (
              <Box key={sectionIndex} sx={{ mb: 2 }}>
                {header.trim() && (
                  <Typography variant='subtitle1' sx={{ fontWeight: 600, mb: 1 }}>
                    {header.replace(/\*\*/g, '').trim()}
                  </Typography>
                )}
                <List dense sx={{ pl: 1 }}>
                  {items
                    .filter(item => item.trim())
                    .map((item, itemIndex) => (
                      <ListItem key={itemIndex} sx={{ py: 0.25, pl: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <PlayArrowIcon sx={{ fontSize: 12, color: 'primary.main' }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={item.trim().replace(/\*\*/g, '')}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.9rem',
                              lineHeight: 1.4
                            }
                          }}
                        />
                      </ListItem>
                    ))}
                </List>
              </Box>
            )
          }

          // Handle regular paragraphs
          return (
            <Typography
              key={sectionIndex}
              variant='body1'
              paragraph
              sx={{ mb: 2, lineHeight: 1.6 }}
            >
              {section.replace(/\*\*/g, '')}
            </Typography>
          )
        })}
      </Box>
    )
  }

  const getCategoryColor = (category?: string) => {
    switch (category) {
      case 'getting-started':
        return 'success'
      case 'using-app':
        return 'primary'
      case 'technical':
        return 'warning'
      case 'general':
        return 'info'
      default:
        return 'default'
    }
  }

  const getCategoryLabel = (category?: string) => {
    switch (category) {
      case 'getting-started':
        return 'Getting Started'
      case 'using-app':
        return 'Using the App'
      case 'technical':
        return 'Technical'
      case 'general':
        return 'General Info'
      default:
        return 'FAQ'
    }
  }

  return (
    <Container maxWidth='lg' sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
        <Typography
          variant='h3'
          component='h1'
          gutterBottom
          align='center'
          sx={{ mb: 2, fontWeight: 700, color: 'primary.main' }}
        >
          Resume Author User Guide
        </Typography>

        <Typography
          variant='h6'
          align='center'
          sx={{ mb: 4, color: 'text.secondary', fontWeight: 400 }}
        >
          Everything you need to know to create professional, verifiable resumes
        </Typography>

        <Divider sx={{ mb: 4 }} />

        {faqData.map((faq, index) => (
          <Accordion
            key={index}
            expanded={expanded === `panel${index}`}
            onChange={handleChange(`panel${index}`)}
            sx={{
              mb: 2,
              boxShadow: 'none',
              '&:before': { display: 'none' },
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px !important',
              overflow: 'hidden',
              '&.Mui-expanded': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }
            }}
          >
            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              sx={{
                bgcolor:
                  expanded === `panel${index}` ? 'primary.light' : 'background.default',
                color:
                  expanded === `panel${index}` ? 'primary.contrastText' : 'text.primary',
                '&:hover': {
                  bgcolor: expanded === `panel${index}` ? 'primary.light' : 'action.hover'
                },
                minHeight: 64,
                '& .MuiAccordionSummary-content': {
                  alignItems: 'center',
                  gap: 2
                }
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                <Typography sx={{ fontWeight: 600, flex: 1 }}>{faq.question}</Typography>
                {faq.category && (
                  <Chip
                    label={getCategoryLabel(faq.category)}
                    size='small'
                    color={getCategoryColor(faq.category)}
                    sx={{ ml: 'auto' }}
                  />
                )}
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 3, bgcolor: 'background.paper' }}>
              {formatAnswer(faq.answer)}
            </AccordionDetails>
          </Accordion>
        ))}

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.light', borderRadius: 2 }}>
          <Typography variant='h6' sx={{ mb: 1, color: 'info.contrastText' }}>
            Need More Help?
          </Typography>
          <Typography sx={{ color: 'info.contrastText' }}>
            If you can't find the answer you're looking for, please contact our support
            team at <strong>support@resume-author.com</strong> or visit our GitHub
            repository for technical documentation.
          </Typography>
        </Box>
      </Paper>
    </Container>
  )
}

export default Faq
