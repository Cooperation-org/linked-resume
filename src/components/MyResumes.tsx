import React from 'react'
import { Box, Typography, Button, useTheme, useMediaQuery } from '@mui/material'
import ResumeCard from './ResumeCard'
import { Link } from 'react-router-dom'
import AuthErrorDisplay from './common/AuthErrorDisplay'
import { useMyResumes } from '../hooks/useMyResumes'

const buttonStyles = {
  background: '#3A35A2',
  padding: '10px 31px',
  borderRadius: '100px',
  color: '#FFF',
  textAlign: 'center' as const,
  fontFamily: 'Nunito Sans',
  fontSize: '16px',
  fontStyle: 'normal',
  fontWeight: 700,
  lineHeight: '24px',
  border: '3px solid #3A35A2',
  textDecoration: 'none'
}

const ResumeScreen: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const {
    signed, status, draftResumes, friendlyError, localDrafts, hasLocalDraft, handleLogout
  } = useMyResumes()

  return (
    <Box sx={{ mx: 'auto', p: { xs: 0, md: 3 }, display: 'flex', flexDirection: 'column', marginInline: { xs: 1, md: 3 }, gap: 2 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: { xs: 2, md: 4 }, mt: 2, gap: { xs: 2, md: 0 } }}>
        <Typography variant='h4' sx={{ color: '#2E2E48', fontWeight: 700, fontSize: { xs: '24px', sm: '28px', md: '32px' } }}>
          My Resumes
        </Typography>
        <Box sx={{ display: 'flex', gap: { xs: 1, md: 2 }, flexDirection: { xs: 'column', sm: 'row' }, width: { xs: '100%', sm: 'auto' } }}>
          <Link
            style={{ ...buttonStyles, padding: isMobile ? '8px 20px' : '10px 31px', fontSize: isMobile ? '14px' : '16px', textAlign: 'center', display: 'block' }}
            to='/resume/new'
          >
            Create new resume
          </Link>
          <Button
            onClick={handleLogout}
            sx={{
              ...buttonStyles,
              textTransform: 'capitalize',
              padding: isMobile ? '8px 20px' : '10px 31px',
              fontSize: isMobile ? '14px' : '16px',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': { background: '#322e8e', border: '3px solid #322e8e' }
            }}
          >
            Logout
          </Button>
        </Box>
      </Box>

      {/* States */}
      {status === 'loading' && !friendlyError && <Typography>Loading resumes...</Typography>}
      {friendlyError && <AuthErrorDisplay error={friendlyError} buttonStyles={buttonStyles} />}

      {/* Signed resumes */}
      {!friendlyError && (status === 'succeeded' || status === 'idle') && signed.length > 0 && (
        <>
          <Typography variant='h6' sx={{ color: '#2E2E48', fontWeight: 600, mt: 2, fontSize: { xs: '18px', md: '20px' } }}>
            Signed Resumes
          </Typography>
          {signed.map(resume => (
            <ResumeCard
              key={resume?.id}
              id={resume?.id}
              title={resume?.content?.credentialSubject?.person?.name?.formattedName}
              date={new Date(resume?.content?.issuanceDate).toLocaleDateString()}
              credentials={0}
              isDraft={false}
              resume={resume}
            />
          ))}
        </>
      )}

      {/* Draft resumes */}
      {!friendlyError && (status === 'succeeded' || status === 'idle') && draftResumes.length > 0 && (
        <>
          <Typography variant='h6' sx={{ color: '#2E2E48', fontWeight: 600, mt: 2, fontSize: { xs: '18px', md: '20px' } }}>
            Draft Resumes
          </Typography>
          {draftResumes.map(resume => (
            <ResumeCard
              key={resume.id}
              id={resume.id}
              title={resume?.name?.split('.')[0]}
              date={new Date().toLocaleDateString()}
              credentials={0}
              isDraft={true}
              resume={resume}
              hasLocalChanges={hasLocalDraft(resume.id)}
              localDraftTime={localDrafts[resume.id]?.localStorageLastUpdated || null}
            />
          ))}
        </>
      )}

      {!friendlyError && status === 'succeeded' && signed.length + draftResumes.length === 0 && (
        <Typography>You don't have any resumes.</Typography>
      )}
    </Box>
  )
}

export default ResumeScreen
