import React, { useCallback, useEffect } from 'react'
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
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

interface AffiliationItem {
  id: string
  name: string
  organization: string
  startDate: string
  endDate: string
  activeAffiliation: boolean
  duration: string
  description: string
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptyAffiliation(): AffiliationItem {
  return {
    id: `aff-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    organization: '',
    startDate: '',
    endDate: '',
    activeAffiliation: false,
    duration: '',
    description: '',
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): AffiliationItem {
  return {
    id: item.id || `aff-${Date.now()}`,
    name: item.name || '',
    organization: item.organization || '',
    startDate: item.startDate || '',
    endDate: item.endDate || '',
    activeAffiliation: !!item.activeAffiliation,
    duration: item.duration || '',
    description: item.description || '',
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials: item.selectedCredentials || [],
    attachedFiles: item.attachedFiles || []
  }
}

export default function ProfessionalAffiliations({
  onAddFiles,
  onDelete,
  onAddCredential,
  onFocus,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: SectionProps) {
  const dispatch = useDispatch()
  const vcs = useSelector((state: any) => state.vcReducer.vcs)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    items: affiliations,
    setItems: setAffiliations,
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
  } = useSectionItems<AffiliationItem>({
    sectionId: 'professionalAffiliations',
    reduxSelector: resume =>
      resume?.professionalAffiliations?.items &&
      Array.isArray(resume.professionalAffiliations.items)
        ? resume.professionalAffiliations.items
        : null,
    mapFromRedux,
    emptyItem: makeEmptyAffiliation
  })

  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  const handleChange = useCallback(
    (index: number, field: keyof AffiliationItem, value: any) => {
      setAffiliations(prev => {
        const updated = [...prev]
        const item = { ...updated[index], [field]: value }
        if (
          useDuration[index] &&
          (field === 'startDate' || field === 'endDate')
        ) {
          item.duration = calculateDuration(item.startDate, item.endDate, item.activeAffiliation)
        }
        updated[index] = item
        if (field !== 'description') debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, useDuration, setAffiliations]
  )

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      setAffiliations(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: value }
        if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(
            updateSection({ sectionId: 'professionalAffiliations', content: { items: updated } })
          )
        }, 1000)
        return updated
      })
    },
    [dispatch, setAffiliations, reduxUpdateTimeoutRef]
  )

  const handleDurationToggle = useCallback(
    (index: number) => {
      setUseDuration(prev => {
        const arr = [...prev]
        arr[index] = !arr[index]
        setAffiliations(p => {
          const up = [...p]
          if (arr[index]) {
            up[index] = { ...up[index], startDate: '', endDate: '' }
          } else {
            up[index] = { ...up[index], duration: '' }
          }
          debouncedReduxUpdate(up)
          return up
        })
        return arr
      })
    },
    [setUseDuration, setAffiliations, debouncedReduxUpdate]
  )

  const handleRemoveFile = useCallback(
    (affIndex: number, fileIndex: number) => {
      onRemoveFile?.('Professional Affiliations', affIndex, fileIndex)
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {affiliations.map((affiliation, index) => (
        <SectionItemCard
          key={`affiliation-${index}`}
          collapsedLabel='Affiliation:'
          collapsedValue={affiliation.name || 'Untitled Affiliation'}
          expandedLabel='Affiliation Details'
          isExpanded={!!expandedItems[index]}
          onToggle={() => toggleExpanded(index)}
        >
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='Member'
            label='Name'
            value={affiliation.name}
            onChange={e => handleChange(index, 'name', e.target.value)}
          />

          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            placeholder='UXPA'
            label='Organization'
            value={affiliation.organization}
            onChange={e => handleChange(index, 'organization', e.target.value)}
          />

          <SectionDateFields
            useDuration={!!useDuration[index]}
            onToggle={() => handleDurationToggle(index)}
            duration={affiliation.duration}
            startDate={affiliation.startDate}
            endDate={affiliation.endDate}
            currentlyActive={affiliation.activeAffiliation}
            onDurationChange={val => handleChange(index, 'duration', val)}
            onStartDateChange={val => handleChange(index, 'startDate', val)}
            onEndDateChange={val => handleChange(index, 'endDate', val)}
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={affiliation.activeAffiliation}
                onChange={e => handleChange(index, 'activeAffiliation', e.target.checked)}
              />
            }
            label='Active affiliation'
          />

          <Typography variant='body1'>
            Describe how this item relates to the job you want to get:
          </Typography>
          <TextEditor
            key={`editor-${index}`}
            value={affiliation.description || ''}
            onChange={val => handleDescriptionChange(index, val)}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
          />

          {Array.isArray(affiliation.selectedCredentials) &&
            affiliation.selectedCredentials.length > 0 && (
              <VerifiedCredentialsList
                credentials={affiliation.selectedCredentials}
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
            activeSectionIndex !== null && affiliations[activeSectionIndex]
              ? affiliations[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
