import React, { useCallback, useEffect } from 'react'
import { Box, TextField, Checkbox, FormControlLabel, Button, Typography } from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import TextEditor from '../../TextEditor/Texteditor'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../../../redux/slices/resume'
import { RootState } from '../../../redux/store'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CredentialOverlay from '../../CredentialsOverlay'
import VerifiedCredentialsList from '../../common/VerifiedCredentialsList'
import AttachedFilesList from '../../common/AttachedFilesList'
import SectionItemCard from '../common/SectionItemCard'
import SectionDateFields from '../common/SectionDateFields'
import SectionActionButtons from '../common/SectionActionButtons'
import { useSectionItems } from '../../../hooks/useSectionItems'
import { SectionProps } from '../types/section.types'
import { calculateDuration } from '../utils/sectionUtils'

interface VolunteerWorkItem {
  id: string
  role: string
  organization: string
  location: string
  startDate: string
  endDate: string
  currentlyVolunteering: boolean
  description: string
  duration: string
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptyVolunteerWork(): VolunteerWorkItem {
  return {
    id: `vol-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    role: '',
    organization: '',
    location: '',
    startDate: '',
    endDate: '',
    currentlyVolunteering: false,
    description: '',
    duration: '',
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): VolunteerWorkItem {
  return {
    id: item.id || `vol-${Date.now()}`,
    role: item.role || '',
    organization: item.organization || '',
    location: item.location || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    currentlyVolunteering: !!item.currentlyVolunteering,
    description: item.description || '',
    duration: item.duration || '',
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials: item.selectedCredentials || [],
    attachedFiles: item.attachedFiles || []
  }
}

export default function VolunteerWork({
  onAddFiles,
  onDelete,
  onAddCredential,
  onFocus,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: Readonly<SectionProps>) {
  const dispatch = useDispatch()
  const vcs = useSelector((state: any) => state.vcReducer.vcs)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    items: volunteerWorks,
    setItems: setVolunteerWorks,
    expandedItems,
    toggleExpanded,
    useDuration,
    setUseDuration,
    debouncedReduxUpdate,
    handleAddAnotherItem,
    handleDeleteItem,
    handleOpenCredentialsOverlay,
    handleCredentialSelect,
    handleRemoveCredential,
    syncEvidence,
    showCredentialsOverlay,
    setShowCredentialsOverlay,
    activeSectionIndex,
    reduxUpdateTimeoutRef
  } = useSectionItems<VolunteerWorkItem>({
    sectionId: 'volunteerWork',
    reduxSelector: resume =>
      resume?.volunteerWork?.items && Array.isArray(resume.volunteerWork.items)
        ? resume.volunteerWork.items
        : null,
    mapFromRedux,
    emptyItem: makeEmptyVolunteerWork
  })

  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  const handleChange = useCallback(
    (index: number, field: keyof VolunteerWorkItem, value: any) => {
      setVolunteerWorks(prev => {
        const updated = [...prev]
        const item = { ...updated[index], [field]: value }
        if (
          useDuration[index] &&
          (field === 'startDate' || field === 'endDate' || field === 'currentlyVolunteering')
        ) {
          item.duration = calculateDuration(item.startDate, item.endDate, item.currentlyVolunteering)
        }
        updated[index] = item
        if (field !== 'description') debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, useDuration, setVolunteerWorks]
  )

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      setVolunteerWorks(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: value }
        if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(updateSection({ sectionId: 'volunteerWork', content: { items: updated } }))
        }, 1000)
        return updated
      })
    },
    [dispatch, setVolunteerWorks, reduxUpdateTimeoutRef]
  )

  const handleDurationToggle = useCallback(
    (index: number) => {
      setUseDuration(prev => {
        const arr = [...prev]
        arr[index] = !arr[index]
        setVolunteerWorks(p => {
          const up = [...p]
          if (!arr[index]) {
            up[index] = { ...up[index], duration: '' }
          } else {
            up[index] = { ...up[index], startDate: '', endDate: '', currentlyVolunteering: false }
          }
          debouncedReduxUpdate(up)
          return up
        })
        return arr
      })
    },
    [setUseDuration, setVolunteerWorks, debouncedReduxUpdate]
  )

  const handleRemoveFile = useCallback(
    (volIndex: number, fileIndex: number) => {
      onRemoveFile?.('volunteerWork', volIndex, fileIndex)
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>
        Add volunteer experience to showcase your community involvement and transferable
        skills. This can be especially valuable if you're a student, career changer, or have
        employment gaps.
      </Typography>

      {volunteerWorks.map((volunteer, index) => (
        <SectionItemCard
          key={`volunteer-${index}`}
          collapsedLabel='Role:'
          collapsedValue={volunteer.role || 'Untitled Role'}
          expandedLabel='Volunteer Details'
          isExpanded={!!expandedItems[index]}
          onToggle={() => toggleExpanded(index)}
        >
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Role Title'
            placeholder='e.g., Volunteer Coordinator'
            value={volunteer.role}
            onChange={e => handleChange(index, 'role', e.target.value)}
            variant='outlined'
          />

          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Organization'
            placeholder='e.g., Red Cross'
            value={volunteer.organization}
            onChange={e => handleChange(index, 'organization', e.target.value)}
          />

          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Location (optional)'
            placeholder='e.g., New York, NY'
            value={volunteer.location}
            onChange={e => handleChange(index, 'location', e.target.value)}
          />

          <SectionDateFields
            useDuration={!!useDuration[index]}
            onToggle={() => handleDurationToggle(index)}
            duration={volunteer.duration}
            startDate={volunteer.startDate}
            endDate={volunteer.endDate}
            currentlyActive={volunteer.currentlyVolunteering}
            durationPlaceholder='e.g., 6 months'
            onDurationChange={val => handleChange(index, 'duration', val)}
            onStartDateChange={val => handleChange(index, 'startDate', val)}
            onEndDateChange={val => handleChange(index, 'endDate', val)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={volunteer.currentlyVolunteering}
                onChange={e => handleChange(index, 'currentlyVolunteering', e.target.checked)}
              />
            }
            label='I currently volunteer here'
          />

          <Typography variant='body1'>Describe your volunteer activities and achievements:</Typography>
          <TextEditor
            key={`editor-${index}`}
            value={volunteer.description || ''}
            onChange={val => handleDescriptionChange(index, val)}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
          />

          {Array.isArray(volunteer.selectedCredentials) &&
            volunteer.selectedCredentials.length > 0 && (
              <VerifiedCredentialsList
                credentials={volunteer.selectedCredentials}
                onRemove={credIndex => handleRemoveCredential(index, credIndex)}
              />
            )}

          {Array.isArray(evidence?.[index]) && evidence[index].length > 0 && (
            <AttachedFilesList
              files={evidence[index].map(fileId => {
                const file = allFiles.find(f => f.id === fileId)
                return (
                  file || {
                    id: fileId,
                    name: `File ${evidence[index].indexOf(fileId) + 1}`,
                    url: '',
                    uploaded: false,
                    fileExtension: '',
                    file: new File([], '')
                  }
                )
              })}
              onRemove={fileIndex => handleRemoveFile(index, fileIndex)}
            />
          )}

          <SectionActionButtons
            onAddFiles={() => onAddFiles?.(index)}
            onOpenCredentials={() => handleOpenCredentialsOverlay(index)}
            onDelete={() => handleDeleteItem(index, onDelete)}
            isSmallMobile={isSmallMobile}
          />
        </SectionItemCard>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center' }}>
        <Button
          variant='contained'
          onClick={handleAddAnotherItem}
          sx={{
            borderRadius: '4px',
            width: '100%',
            textTransform: 'none',
            padding: '8px 44px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#F3F5F8',
            color: '#2E2E48',
            boxShadow: 'none',
            fontFamily: 'Nunito sans',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          <AddCircleOutlineIcon
            sx={{ marginRight: 1, width: '16px', height: '16px', color: '#2E2E48' }}
          />
          Add another item
        </Button>
      </Box>

      {showCredentialsOverlay && (
        <CredentialOverlay
          onClose={() => setShowCredentialsOverlay(false)}
          onSelect={ids => handleCredentialSelect(ids, vcs)}
          initialSelectedCredentials={
            activeSectionIndex !== null && volunteerWorks[activeSectionIndex]
              ? volunteerWorks[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
