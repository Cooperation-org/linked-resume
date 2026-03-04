import React, { useCallback, useEffect } from 'react'
import {
  Box,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
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

interface WorkExperienceItem {
  id: string
  title: string
  company: string
  position: string
  duration: string
  startDate: string
  endDate: string
  currentlyEmployed: boolean
  description: string
  achievements: string[]
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptyExperience(): WorkExperienceItem {
  return {
    id: `work-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    title: '',
    company: '',
    position: '',
    duration: '',
    startDate: '',
    endDate: '',
    currentlyEmployed: false,
    description: '',
    achievements: [],
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): WorkExperienceItem {
  const id = item.id || `work-exp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

  // Parse credentialLink if needed
  let selectedCredentials = item.selectedCredentials || []
  if (item.credentialLink && selectedCredentials.length === 0) {
    try {
      const arr = JSON.parse(item.credentialLink)
      if (Array.isArray(arr)) {
        selectedCredentials = arr
          .map((credLink: string) => {
            const comma = credLink.indexOf(',')
            if (comma > -1) {
              const fileId = credLink.substring(0, comma)
              try {
                const vc = JSON.parse(credLink.substring(comma + 1))
                return { id: fileId, fileId, url: '', name: vc?.credentialSubject?.achievement?.[0]?.name || 'Credential', vc }
              } catch {
                return null
              }
            }
            return null
          })
          .filter(Boolean)
      }
    } catch {
      /* ignore */
    }
  }

  return {
    id,
    title: item.title || '',
    company: item.company || '',
    position: item.position || '',
    duration: item.duration || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    currentlyEmployed: !!item.currentlyEmployed,
    description: item.description || '',
    achievements: item.achievements || [],
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials,
    attachedFiles: item.attachedFiles || []
  }
}

export default function WorkExperience({
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
  const resume = useSelector((state: RootState) => state.resume.resume)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    items: experiences,
    setItems: setExperiences,
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
  } = useSectionItems<WorkExperienceItem>({
    sectionId: 'experience',
    reduxSelector: resume =>
      resume?.experience?.items?.length > 0 ? resume.experience.items : null,
    mapFromRedux,
    emptyItem: makeEmptyExperience,
    defaultUseDuration: true
  })

  // Sync evidence files
  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  // Call onFocus on mount
  useEffect(() => {
    onFocus?.()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleChange = useCallback(
    (index: number, field: keyof WorkExperienceItem, value: any) => {
      setExperiences(prev => {
        const updated = [...prev]
        const item = { ...updated[index], [field]: value }
        if (
          useDuration[index] &&
          (field === 'startDate' || field === 'endDate' || field === 'currentlyEmployed')
        ) {
          item.duration = calculateDuration(item.startDate, item.endDate, item.currentlyEmployed)
        }
        updated[index] = item
        if (field !== 'description') debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, useDuration, setExperiences]
  )

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      setExperiences(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: value }
        if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(updateSection({ sectionId: 'experience', content: { items: updated } }))
        }, 1000)
        return updated
      })
    },
    [dispatch, setExperiences, reduxUpdateTimeoutRef]
  )

  const handleDurationToggle = useCallback(
    (index: number) => {
      setUseDuration(prev => {
        const arr = [...prev]
        arr[index] = !arr[index]
        setExperiences(p => {
          const up = [...p]
          if (!arr[index]) {
            up[index] = { ...up[index], duration: '' }
          } else {
            up[index] = { ...up[index], startDate: '', endDate: '', currentlyEmployed: false }
          }
          debouncedReduxUpdate(up)
          return up
        })
        return arr
      })
    },
    [setUseDuration, setExperiences, debouncedReduxUpdate]
  )

  const handleRemoveFile = useCallback(
    (expIndex: number, fileIndex: number) => {
      onRemoveFile?.('Work Experience', expIndex, fileIndex)
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {experiences.map((experience, index) => (
        <SectionItemCard
          key={`experience-${experience.id || index}`}
          collapsedLabel='Job Title:'
          collapsedValue={experience.title || 'Untitled Position'}
          expandedLabel='Job Title'
          isExpanded={!!expandedItems[index]}
          onToggle={() => toggleExpanded(index)}
        >
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Title of your position'
            value={experience.title}
            onChange={e => handleChange(index, 'title', e.target.value)}
            variant='outlined'
          />

          <Typography>Company</Typography>
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Employer name'
            value={experience.company}
            onChange={e => handleChange(index, 'company', e.target.value)}
          />

          <Typography>Position</Typography>
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Your position/role'
            value={experience.position}
            onChange={e => handleChange(index, 'position', e.target.value)}
          />

          <SectionDateFields
            useDuration={!!useDuration[index]}
            onToggle={() => handleDurationToggle(index)}
            duration={experience.duration}
            startDate={experience.startDate}
            endDate={experience.endDate}
            currentlyActive={experience.currentlyEmployed}
            durationPlaceholder='Enter total duration (e.g., 2 years)'
            onDurationChange={val => handleChange(index, 'duration', val)}
            onStartDateChange={val => handleChange(index, 'startDate', val)}
            onEndDateChange={val => handleChange(index, 'endDate', val)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={experience.currentlyEmployed}
                onChange={e => handleChange(index, 'currentlyEmployed', e.target.checked)}
              />
            }
            label='Currently employed here'
          />

          <Typography
            variant='body1'
            sx={{
              fontFamily: 'Nunito Sans',
              fontWeight: 500,
              fontSize: '16px',
              lineHeight: 'normal',
              letterSpacing: '0.16px'
            }}
          >
            Describe your role at this company:
          </Typography>
          <TextEditor
            key={`work-experience-editor-${experience.id}`}
            value={experience.description || ''}
            onChange={val => handleDescriptionChange(index, val)}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
          />

          {Array.isArray(experience.selectedCredentials) &&
            experience.selectedCredentials.length > 0 && (
              <VerifiedCredentialsList
                credentials={experience.selectedCredentials}
                onRemove={credIndex => handleRemoveCredential(index, credIndex)}
              />
            )}

          {evidence[index] && evidence[index].length > 0 && (
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
          onClose={() => setShowCredentialsOverlay(false)}
          onSelect={ids => handleCredentialSelect(ids, vcs)}
          initialSelectedCredentials={
            activeSectionIndex !== null && experiences[activeSectionIndex]
              ? experiences[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
