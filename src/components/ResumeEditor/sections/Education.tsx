import React, { useCallback, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Button
} from '@mui/material'
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

interface EducationItem {
  id: string
  type: string
  programName: string
  institution: string
  degree: string
  field: string
  duration: string
  startDate: string
  endDate: string
  currentlyEnrolled: boolean
  inProgress: boolean
  awardEarned: boolean
  description: string
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptyEducation(): EducationItem {
  return {
    id: `edu-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type: 'Bachelors',
    programName: '',
    institution: '',
    degree: '',
    field: '',
    duration: '1 year',
    startDate: '',
    endDate: '',
    currentlyEnrolled: false,
    inProgress: false,
    awardEarned: false,
    description: '',
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): EducationItem {
  return {
    id: item.id || `edu-${Date.now()}`,
    type: item.type || 'Bachelors',
    programName: item.programName || '',
    institution: item.institution || '',
    degree: item.degree || '',
    field: item.field || '',
    duration: item.duration || '1 year',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    currentlyEnrolled: !!item.currentlyEnrolled,
    inProgress: !!item.inProgress,
    awardEarned: !!item.awardEarned,
    description: item.description || '',
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials: item.selectedCredentials || [],
    attachedFiles: item.attachedFiles || []
  }
}

export default function Education({
  onAddFiles,
  onDelete,
  onAddCredential,
  onFocus,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: Readonly<SectionProps>) {
  const dispatch = useDispatch()
  const resume = useSelector((state: RootState) => state.resume.resume)
  const vcs = useSelector((state: any) => state.vcReducer.vcs)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    items: educations,
    setItems: setEducations,
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
  } = useSectionItems<EducationItem>({
    sectionId: 'education',
    reduxSelector: resume =>
      resume?.education?.items && Array.isArray(resume.education.items)
        ? resume.education.items
        : null,
    mapFromRedux,
    emptyItem: makeEmptyEducation
  })

  // Sync evidence files
  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  // Call onFocus on mount
  useEffect(() => {
    onFocus?.()
  }, [onFocus])

  const handleChange = useCallback(
    (index: number, field: keyof EducationItem, value: any) => {
      setEducations(prev => {
        const updated = [...prev]
        const item = { ...updated[index], [field]: value }
        if (
          !useDuration[index] &&
          (field === 'startDate' || field === 'endDate' || field === 'currentlyEnrolled')
        ) {
          item.duration = calculateDuration(item.startDate, item.endDate, item.currentlyEnrolled)
        }
        updated[index] = item
        if (field !== 'description') debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, useDuration, setEducations]
  )

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      setEducations(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: value }
        if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(updateSection({ sectionId: 'education', content: { items: updated } }))
        }, 1000)
        return updated
      })
    },
    [dispatch, setEducations, reduxUpdateTimeoutRef]
  )

  const handleRemoveFile = useCallback(
    (eduIndex: number, fileIndex: number) => {
      onRemoveFile?.('Education', eduIndex, fileIndex)
    },
    [onRemoveFile]
  )

  const handleDurationToggle = useCallback(
    (index: number) => {
      setUseDuration(prev => {
        const newArr = [...prev]
        newArr[index] = !newArr[index]
        setEducations(prevEdu => {
          const eduArr = [...prevEdu]
          const item = { ...eduArr[index] }
          if (newArr[index]) {
            item.startDate = ''
            item.endDate = ''
          } else {
            item.duration = ''
          }
          eduArr[index] = item
          debouncedReduxUpdate(eduArr)
          return eduArr
        })
        return newArr
      })
    },
    [setUseDuration, setEducations, debouncedReduxUpdate]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }} onFocus={onFocus}>
      {educations.map((education, index) => (
        <SectionItemCard
          key={`education-${index}`}
          collapsedLabel='Program:'
          collapsedValue={education.programName || 'Untitled Program'}
          expandedLabel='Program Details'
          isExpanded={!!expandedItems[index]}
          onToggle={() => toggleExpanded(index)}
        >
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Type of Education (Masters, Bachelors, etc.)'
            value={education.type}
            onChange={e => handleChange(index, 'type', e.target.value)}
            variant='outlined'
          />

          <Typography>Program or Course Name</Typography>
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Enter program name'
            value={education.programName}
            onChange={e => handleChange(index, 'programName', e.target.value)}
          />

          <Typography>Institution or Organization Name</Typography>
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Enter institution name'
            value={education.institution}
            onChange={e => handleChange(index, 'institution', e.target.value)}
          />

          <SectionDateFields
            useDuration={!!useDuration[index]}
            onToggle={() => handleDurationToggle(index)}
            duration={education.duration}
            startDate={education.startDate}
            endDate={education.endDate}
            currentlyActive={education.currentlyEnrolled}
            onDurationChange={val => handleChange(index, 'duration', val)}
            onStartDateChange={val => handleChange(index, 'startDate', val)}
            onEndDateChange={val => handleChange(index, 'endDate', val)}
          />

          <FormGroup row sx={{ gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={education.currentlyEnrolled}
                  onChange={e => handleChange(index, 'currentlyEnrolled', e.target.checked)}
                />
              }
              label='Currently enrolled here'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={education.inProgress}
                  onChange={e => handleChange(index, 'inProgress', e.target.checked)}
                />
              }
              label='In progress'
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={education.awardEarned}
                  onChange={e => handleChange(index, 'awardEarned', e.target.checked)}
                />
              }
              label='Award earned'
            />
          </FormGroup>

          <Typography variant='body1'>
            Describe how this item relates to the job you want to get:
          </Typography>
          <TextEditor
            key={`editor-${index}`}
            value={education.description || ''}
            onChange={val => handleDescriptionChange(index, val)}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
          />

          {Array.isArray(education.selectedCredentials) &&
            education.selectedCredentials.length > 0 && (
              <VerifiedCredentialsList
                credentials={education.selectedCredentials}
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

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
        <Button
          variant='contained'
          color='primary'
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
          onClose={() => {
            setShowCredentialsOverlay(false)
          }}
          onSelect={ids => handleCredentialSelect(ids, vcs)}
          initialSelectedCredentials={
            activeSectionIndex !== null && educations[activeSectionIndex]
              ? educations[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
