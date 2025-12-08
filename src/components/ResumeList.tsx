import React, { useCallback, useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { getLocalStorage } from '../tools/cookie'
import { GoogleDriveStorage, Resume } from '@cooperation/vc-storage'

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box
} from '@mui/material'
import { setSelectedResume } from '../redux/slices/resume'

interface PrevResumesListProps {
  open: boolean
  onClose: () => void
}

const PrevResumesList: React.FC<PrevResumesListProps> = ({ open, onClose }) => {
  const [userSessions, setUserSessions] = useState<
    { id: string; name: string; content: any }[]
  >([])
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch() // Access the Redux dispatch function
  const accessToken = getLocalStorage('auth')

  const getSessions = useCallback(async () => {
    try {
      if (!accessToken) {
        console.error('Access token not found.')
        return
      }

      setLoading(true)
      const storage = new GoogleDriveStorage(accessToken)
      const resumeManager = new Resume(storage)
      const nonSignedResumes = await resumeManager.getNonSignedResumes()

      // Map resumes to the required format for display
      const sessions = nonSignedResumes.map((resume: any) => ({
        id: resume.id,
        name: resume.name || 'Unnamed Resume',
        content: resume.content // Include content for dispatching
      }))
      setUserSessions(sessions)
    } catch (error) {
      console.error('Error fetching non-signed resumes:', error)
    } finally {
      setLoading(false)
    }
  }, [accessToken])

  useEffect(() => {
    if (open) {
      getSessions()
    }
  }, [open, getSessions])

  const handleSelectResume = (resume: { id: string; name: string; content: any }) => {
    dispatch(setSelectedResume(resume.content)) // Dispatch the selected resume content
    onClose() // Close the dialog
  }

  const renderContent = () => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
          <CircularProgress />
        </Box>
      )
    }

    if (userSessions.length === 0) {
      return <p>No resumes found.</p>
    }

    return (
      <List>
        {userSessions.map(session => (
          <ListItem
            sx={{
              cursor: 'pointer',
              boxShadow: '0 0 5px 0 rgba(0, 0, 0, 0.1)',
              borderRadius: '5px',
              marginBottom: '5px',

              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                transform: '0.3s'
              }
            }}
            key={session.id}
            onClick={() => handleSelectResume(session)} // Handle resume selection
          >
            <ListItemText primary={session.content.name} />
          </ListItem>
        ))}
      </List>
    )
  }

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
      <DialogTitle>Uncompleted Resumes</DialogTitle>
      <DialogContent dividers>{renderContent()}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color='primary'>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default PrevResumesList
