import React, { useCallback, useEffect } from 'react'
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Tooltip,
  Button
} from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../../../redux/slices/resume'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import VerifiedIcon from '@mui/icons-material/Verified'
import CredentialOverlay from '../../CredentialsOverlay'
import VerifiedCredentialsList from '../../common/VerifiedCredentialsList'
import AttachedFilesList from '../../common/AttachedFilesList'
import SectionItemCard from '../common/SectionItemCard'
import SectionActionButtons from '../common/SectionActionButtons'
import { useSectionItems } from '../../../hooks/useSectionItems'
import { SectionProps } from '../types/section.types'

interface CertificationItem {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  noExpiration: boolean
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptyCertification(): CertificationItem {
  return {
    id: `cert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialId: '',
    noExpiration: false,
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): CertificationItem {
  return {
    id: item.id || `cert-${Date.now()}`,
    name: item.name || '',
    issuer: item.issuer || '',
    issueDate: item.issueDate || '',
    expiryDate: item.expiryDate || '',
    credentialId: '', // always empty, never prefilled
    noExpiration: !!item.noExpiration,
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials: item.selectedCredentials || [],
    attachedFiles: item.attachedFiles || []
  }
}

export default function CertificationsAndLicenses({
  onAddFiles,
  onDelete,
  onAddCredential,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: Readonly<SectionProps>) {
  const dispatch = useDispatch()
  const vcs = useSelector((state: any) => state.vcReducer.vcs)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))

  const {
    items: certifications,
    setItems: setCertifications,
    expandedItems,
    toggleExpanded,
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
  } = useSectionItems<CertificationItem>({
    sectionId: 'certifications',
    reduxSelector: resume =>
      resume?.certifications?.items && Array.isArray(resume.certifications.items)
        ? resume.certifications.items
        : null,
    mapFromRedux,
    emptyItem: makeEmptyCertification
  })

  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  const handleChange = useCallback(
    (index: number, field: keyof CertificationItem, value: any) => {
      setCertifications(prev => {
        const updated = [...prev]
        const item = { ...updated[index], [field]: value }
        // If noExpiration is toggled on, clear expiry date
        if (field === 'noExpiration' && value === true) {
          item.expiryDate = ''
        }
        updated[index] = item
        debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, setCertifications]
  )

  const handleRemoveFile = useCallback(
    (certIndex: number, fileIndex: number) => {
      onRemoveFile?.('certifications', certIndex, fileIndex)
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>
        Add certifications and licenses to showcase your professional qualifications. These can
        significantly enhance your resume, especially for roles requiring specific credentials.
      </Typography>

      {certifications.map((certification, index) => (
        <SectionItemCard
          key={`certification-${index}`}
          collapsedLabel='Certification:'
          collapsedValue={certification.name || 'Untitled Certification'}
          expandedLabel='Certification Details'
          isExpanded={!!expandedItems[index]}
          onToggle={() => toggleExpanded(index)}
        >
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Certification/License Name'
            placeholder='e.g., Professional Project Manager (PMP)'
            value={certification.name}
            onChange={e => handleChange(index, 'name', e.target.value)}
            variant='outlined'
          />

          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Issuing Organization'
            placeholder='e.g., Project Management Institute'
            value={certification.issuer}
            onChange={e => handleChange(index, 'issuer', e.target.value)}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ width: '50%' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>Issue Date</Typography>
              <TextField
                sx={{
                  bgcolor: '#FFF',
                  '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' }
                }}
                size='small'
                fullWidth
                type='date'
                value={certification.issueDate}
                onChange={e => handleChange(index, 'issueDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
            <Box sx={{ width: '50%' }}>
              <Typography variant='body2' sx={{ mb: 1 }}>Expiry Date</Typography>
              <TextField
                sx={{
                  bgcolor: '#FFF',
                  '& .MuiInputLabel-root': { transform: 'translate(14px, -9px) scale(0.75)' }
                }}
                size='small'
                fullWidth
                type='date'
                value={certification.expiryDate}
                onChange={e => handleChange(index, 'expiryDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={certification.noExpiration}
              />
            </Box>
          </Box>

          <FormControlLabel
            control={
              <Checkbox
                checked={certification.noExpiration}
                onChange={e => handleChange(index, 'noExpiration', e.target.checked)}
              />
            }
            label='This certification does not expire'
          />

          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Credential ID (optional)'
            placeholder='e.g., ABC123456'
            value={certification.credentialId}
            onChange={e => handleChange(index, 'credentialId', e.target.value)}
          />

          {Array.isArray(certification.selectedCredentials) &&
            certification.selectedCredentials.length > 0 && (
              <VerifiedCredentialsList
                credentials={certification.selectedCredentials}
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
            activeSectionIndex !== null && certifications[activeSectionIndex]
              ? certifications[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
