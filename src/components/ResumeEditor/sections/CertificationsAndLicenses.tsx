import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  Typography,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { SVGSectionIcon, SVGAddFiles, SVGDeleteSection } from '../../../assets/svgs'
import { StyledButton } from './StyledButton'
import { updateSection } from '../../../redux/slices/resume'
import { RootState } from '../../../redux/store'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import VerifiedIcon from '@mui/icons-material/Verified'
import CloseIcon from '@mui/icons-material/Close'
import CredentialOverlay from '../../CredentialsOverlay'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import VerifiedCredentialsList from '../../common/VerifiedCredentialsList'
import {
  dedupeSelectedCredentials,
  buildCredentialLinks,
  parseCredentialLink
} from '../../../utils/resumeSections'
import { FileItem, SelectedCredential } from '../../../types/resumeSections'
import SectionHeader from '../../common/SectionHeader'

interface CertificationsAndLicensesProps {
  onAddFiles?: (itemIndex?: number) => void
  onDelete?: () => void
  onAddCredential?: (text: string) => void
  evidence?: string[][]
  allFiles?: FileItem[]
  onRemoveFile?: (sectionId: string, itemIndex: number, fileIndex: number) => void
}

interface CertificationItem {
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialId: string
  noExpiration: boolean
  id: string
  verificationStatus: string
  credentialLink: string
  selectedCredentials: SelectedCredential[]
}

export default function CertificationsAndLicenses({
  onAddFiles,
  onDelete,
  onAddCredential,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: Readonly<CertificationsAndLicensesProps>) {
  const dispatch = useAppDispatch()
  const resume = useAppSelector((state: RootState) => state.resumeEditor.resume)
  const reduxUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showCredentialsOverlay, setShowCredentialsOverlay] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)
  const vcs = useAppSelector(state => state.vc.vcs)
  // const [openCredDialog, setOpenCredDialog] = useState(false)
  // const [dialogCredObj, setDialogCredObj] = useState<any>(null)

  const [certifications, setCertifications] = useState<CertificationItem[]>([
    {
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '',
      noExpiration: false,
      id: '', // Do not prefill id, only use what user types
      verificationStatus: 'unverified',
      credentialLink: '', // Always a string, never null
      selectedCredentials: []
    }
  ])

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({
    0: true
  })

  const debouncedReduxUpdate = useCallback(
    (items: CertificationItem[]) => {
      if (reduxUpdateTimeoutRef.current) {
        clearTimeout(reduxUpdateTimeoutRef.current)
      }
      reduxUpdateTimeoutRef.current = setTimeout(() => {
        dispatch(
          updateSection({
            sectionId: 'certifications',
            content: {
              items: items
            }
          })
        )
      }, 500)
    },
    [dispatch]
  )

  useEffect(() => {
    const items =
      resume && resume.certifications && Array.isArray(resume.certifications.items)
        ? resume.certifications.items
        : []
    if (items.length > 0) {
      const typedItems = items.map((item: any, idx: number) => {
        let selectedCredentials: SelectedCredential[] = item.selectedCredentials || []
        if (
          (!selectedCredentials || selectedCredentials.length === 0) &&
          item.credentialLink
        ) {
          try {
            const credLinksArray = JSON.parse(item.credentialLink)
            if (Array.isArray(credLinksArray)) {
              const parsed = credLinksArray
                .map((credLink: string) => parseCredentialLink(credLink))
                .filter(Boolean) as {
                credObj: any
                credId: string
                fileId: string
              }[]
              selectedCredentials = parsed.map(p => ({
                id: p.fileId || p.credId,
                url: '',
                name:
                  p.credObj?.credentialSubject?.achievement?.[0]?.name ||
                  p.credObj?.credentialSubject?.credentialName ||
                  'Credential',
                vc: p.credObj,
                fileId: p.fileId
              }))
              selectedCredentials = dedupeSelectedCredentials(selectedCredentials)
            }
          } catch (e) {
            console.error(
              'Error parsing credentialLink:',
              e,
              'for certification item:',
              item.id || idx
            )
          }
        }

        return {
          name: item.name || '',
          issuer: item.issuer || '',
          issueDate: item.issueDate || '',
          expiryDate: item.expiryDate || '',
          credentialId: '', // always empty, never prefilled
          noExpiration: Boolean(item.noExpiration),
          id: item.id || '',
          verificationStatus: item.verificationStatus || 'unverified',
          credentialLink: item.credentialLink || '',
          selectedCredentials,
          ...item
        }
      })

      const shouldUpdate =
        initialLoadRef.current || typedItems.length !== certifications.length

      if (shouldUpdate) {
        initialLoadRef.current = false

        setCertifications(typedItems)
        if (typedItems.length !== Object.keys(expandedItems).length) {
          const initialExpanded: Record<number, boolean> = {}
          typedItems.forEach((_, index) => {
            initialExpanded[index] =
              index < Object.keys(expandedItems).length ? expandedItems[index] : true
          })
          setExpandedItems(initialExpanded)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume])

  useEffect(() => {
    return () => {
      if (reduxUpdateTimeoutRef.current) {
        clearTimeout(reduxUpdateTimeoutRef.current)
      }
    }
  }, [])

  const handleCertificationChange = useCallback(
    (index: number, field: string, value: any) => {
      setCertifications(prevCertifications => {
        const updatedCertifications = [...prevCertifications]
        updatedCertifications[index] = {
          ...updatedCertifications[index],
          [field]: value
        }

        if (field === 'noExpiration' && value === true) {
          updatedCertifications[index].expiryDate = ''
        }

        debouncedReduxUpdate(updatedCertifications)
        return updatedCertifications
      })
    },
    [debouncedReduxUpdate]
  )

  const handleAddAnotherItem = useCallback(() => {
    const emptyItem: CertificationItem = {
      name: '',
      issuer: '',
      issueDate: '',
      expiryDate: '',
      credentialId: '', // always empty
      noExpiration: false,
      id: '',
      verificationStatus: 'unverified',
      credentialLink: '',
      selectedCredentials: []
    }

    setCertifications(prevCertifications => {
      const updatedCertifications = [...prevCertifications, emptyItem]

      dispatch(
        updateSection({
          sectionId: 'certifications',
          content: {
            items: updatedCertifications
          }
        })
      )

      return updatedCertifications
    })

    const newIndex = certifications.length
    setExpandedItems(prev => ({
      ...prev,
      [newIndex]: true
    }))
  }, [certifications.length, dispatch])

  const handleDeleteCertification = useCallback(
    (index: number) => {
      if (certifications.length <= 1) {
        if (onDelete) onDelete()
        return
      }

      setCertifications(prevCertifications => {
        const updatedCertifications = prevCertifications.filter((_, i) => i !== index)
        dispatch(
          updateSection({
            sectionId: 'certifications',
            content: {
              items: updatedCertifications
            }
          })
        )

        return updatedCertifications
      })

      setExpandedItems(prev => {
        const newExpandedState: Record<number, boolean> = {}
        certifications
          .filter((_, i) => i !== index)
          .forEach((_, i) => {
            if (i === 0 && certifications.length - 1 === 1) {
              newExpandedState[i] = true
            } else if (i < index) {
              newExpandedState[i] = prev[i] || false
            } else {
              newExpandedState[i] = prev[i + 1] || false
            }
          })
        return newExpandedState
      })
    },
    [certifications, dispatch, onDelete]
  )

  const toggleExpanded = useCallback((index: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }, [])

  const handleOpenCredentialsOverlay = useCallback((index: number) => {
    setActiveSectionIndex(index)
    setShowCredentialsOverlay(true)
  }, [])

  const handleCredentialSelect = useCallback(
    (selectedCredentialIDs: string[]) => {
      if (activeSectionIndex !== null && selectedCredentialIDs.length > 0) {
        const selectedCredentials = selectedCredentialIDs.map(id => {
          const credential = vcs.find((c: any) => (c?.originalItem?.id || c.id) === id)
          // Extract fileId: prefer credential.originalItem.id if present and not a URN, else credential.id if not a URN, else fallback to id
          let fileId = ''
          if (
            credential?.originalItem?.id &&
            !credential.originalItem.id.startsWith('urn:')
          ) {
            fileId = credential.originalItem.id
          } else if (credential?.id && !credential.id.startsWith('urn:')) {
            fileId = credential.id
          } else {
            fileId = id
          }
          return {
            id: id,
            url: '', // not used, but required by interface
            name:
              credential?.credentialSubject?.achievement[0]?.name ||
              `Credential ${id.substring(0, 5)}...`,
            isAttestation: false,
            vc: credential, // full object
            fileId: fileId
          }
        })
        const deduped: SelectedCredential[] =
          dedupeSelectedCredentials(selectedCredentials)
        setCertifications(prev => {
          const updated = [...prev]
          const credLinksString = buildCredentialLinks(deduped)
          updated[activeSectionIndex] = {
            ...updated[activeSectionIndex],
            verificationStatus: 'verified',
            credentialLink: credLinksString,
            selectedCredentials: deduped
          }
          dispatch(
            updateSection({
              sectionId: 'certifications',
              content: { items: updated }
            })
          )
          return updated
        })
      }
      setShowCredentialsOverlay(false)
      setActiveSectionIndex(null)
    },
    [activeSectionIndex, dispatch, vcs]
  )

  const handleRemoveCredential = useCallback(
    (certIndex: number, credIndex: number) => {
      setCertifications(prev => {
        const updated = [...prev]
        const cert = { ...updated[certIndex] }
        const newCreds = cert.selectedCredentials.filter((_, i) => i !== credIndex)
        cert.selectedCredentials = dedupeSelectedCredentials(newCreds)
        if (!cert.selectedCredentials.length) {
          cert.verificationStatus = 'unverified'
          cert.credentialLink = ''
        } else {
          cert.credentialLink = buildCredentialLinks(cert.selectedCredentials)
        }
        updated[certIndex] = cert
        dispatch(
          updateSection({
            sectionId: 'certifications',
            content: { items: updated }
          })
        )
        return updated
      })
    },
    [dispatch]
  )

  const handleRemoveFile = (itemIndex: number, fileIndex: number) => {
    if (onRemoveFile) {
      onRemoveFile('certifications', itemIndex, fileIndex)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>
        Add certifications and licenses to showcase your professional qualifications.
        These can significantly enhance your resume, especially for roles requiring
        specific credentials.
      </Typography>

      {(Array.isArray(certifications) ? certifications : []).map(
        (certification, index) => (
          <Box
            key={`certification-${index}`}
            sx={{
              backgroundColor: '#F1F1FB',
              px: '20px',
              py: '10px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '4px',
              gap: 2
            }}
          >
            <SectionHeader
              title='Certification'
              subtitle={certification.name || 'Untitled Certification'}
              expanded={!!expandedItems[index]}
              onToggle={() => toggleExpanded(index)}
              icon={<SVGSectionIcon />}
              actions={
                certification.verificationStatus === 'verified' ? (
                  <Tooltip title='Verified credential'>
                    <VerifiedIcon sx={{ color: '#34C759', fontSize: 18 }} />
                  </Tooltip>
                ) : undefined
              }
            />

            {expandedItems[index] && (
              <>
                <TextField
                  sx={{ bgcolor: '#FFF' }}
                  size='small'
                  fullWidth
                  label='Certification/License Name'
                  placeholder='e.g., Professional Project Manager (PMP)'
                  value={certification.name}
                  onChange={e => handleCertificationChange(index, 'name', e.target.value)}
                  variant='outlined'
                />

                <TextField
                  sx={{ bgcolor: '#FFF' }}
                  size='small'
                  fullWidth
                  label='Issuing Organization'
                  placeholder='e.g., Project Management Institute'
                  value={certification.issuer}
                  onChange={e =>
                    handleCertificationChange(index, 'issuer', e.target.value)
                  }
                />

                <LocalizationProvider dateAdapter={AdapterDateFns}>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ width: '50%' }}>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        Issue Date
                      </Typography>
                      <TextField
                        sx={{
                          bgcolor: '#FFF',
                          '& .MuiInputLabel-root': {
                            transform: 'translate(14px, -9px) scale(0.75)'
                          }
                        }}
                        size='small'
                        fullWidth
                        type='date'
                        value={certification.issueDate}
                        onChange={e =>
                          handleCertificationChange(index, 'issueDate', e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>

                    <Box sx={{ width: '50%' }}>
                      <Typography variant='body2' sx={{ mb: 1 }}>
                        Expiry Date
                      </Typography>
                      <TextField
                        sx={{
                          bgcolor: '#FFF',
                          '& .MuiInputLabel-root': {
                            transform: 'translate(14px, -9px) scale(0.75)'
                          }
                        }}
                        size='small'
                        fullWidth
                        type='date'
                        value={certification.expiryDate}
                        onChange={e =>
                          handleCertificationChange(index, 'expiryDate', e.target.value)
                        }
                        InputLabelProps={{ shrink: true }}
                        disabled={certification.noExpiration}
                      />
                    </Box>
                  </Box>
                </LocalizationProvider>

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={certification.noExpiration}
                      onChange={e =>
                        handleCertificationChange(index, 'noExpiration', e.target.checked)
                      }
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
                  onChange={e =>
                    handleCertificationChange(index, 'credentialId', e.target.value)
                  }
                />

                {Array.isArray(certification.selectedCredentials) &&
                  certification.selectedCredentials.length > 0 && (
                    <VerifiedCredentialsList
                      credentials={certification.selectedCredentials}
                      onRemove={credIndex => handleRemoveCredential(index, credIndex)}
                    />
                  )}

                {Array.isArray(evidence?.[index]) && evidence[index].length > 0 && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant='body2' sx={{ fontWeight: 'bold', mb: 1 }}>
                      Attached Files:
                    </Typography>
                    {(evidence[index] || []).map((fileId, fileIndex) => {
                      const file = allFiles.find(f => f.id === fileId)
                      return (
                        <Box
                          key={`file-${fileId || ''}-${fileIndex}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mb: 0.5,
                            backgroundColor: '#e8f4f8',
                            p: 0.5,
                            borderRadius: 1
                          }}
                        >
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AttachFileIcon fontSize='small' color='primary' />
                            <Typography
                              variant='body2'
                              sx={{
                                color: 'primary.main',
                                cursor: 'pointer'
                              }}
                              onClick={() => {
                                if (file?.url) {
                                  window.open(file.url, '_blank')
                                }
                              }}
                            >
                              {file?.name || `File ${fileIndex + 1}`}
                            </Typography>
                          </Box>
                          <IconButton
                            size='small'
                            onClick={e => {
                              e.stopPropagation()
                              handleRemoveFile(index, fileIndex)
                            }}
                            sx={{
                              p: 0.5,
                              color: 'grey.500',
                              '&:hover': {
                                color: 'error.main'
                              }
                            }}
                          >
                            <CloseIcon fontSize='small' />
                          </IconButton>
                        </Box>
                      )
                    })}
                  </Box>
                )}

                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: { xs: 'stretch', sm: 'space-between' },
                    alignItems: { xs: 'stretch', sm: 'stretch' },
                    marginTop: '20px',
                    gap: { xs: '10px', md: '15px' }
                  }}
                >
                  <StyledButton
                    startIcon={!isSmallMobile && <SVGAddFiles />}
                    onClick={() => onAddFiles && onAddFiles(index)}
                    sx={{
                      fontSize: { xs: '14px', md: '16px' },
                      padding: { xs: '8px 16px', md: '10px 20px' },
                      height: { xs: 'auto', sm: '56px' },
                      flex: { sm: 1 },
                      minHeight: { sm: '56px' },
                      whiteSpace: { sm: 'nowrap' }
                    }}
                  >
                    Add file(s)
                  </StyledButton>
                  <StyledButton
                    startIcon={!isSmallMobile && <SVGDeleteSection />}
                    onClick={() => handleDeleteCertification(index)}
                    sx={{
                      fontSize: { xs: '14px', md: '16px' },
                      padding: { xs: '8px 16px', md: '10px 20px' },
                      height: { xs: 'auto', sm: '56px' },
                      flex: { sm: 1 },
                      minHeight: { sm: '56px' },
                      whiteSpace: { sm: 'nowrap' }
                    }}
                  >
                    Delete this item
                  </StyledButton>
                </Box>
              </>
            )}
          </Box>
        )
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px'
        }}
      >
        <Button
          variant='contained'
          color='primary'
          onClick={() => handleOpenCredentialsOverlay(certifications.length - 1)}
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
          Add credential
        </Button>

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
            setActiveSectionIndex(null)
          }}
          onSelect={handleCredentialSelect}
          initialSelectedCredentials={
            activeSectionIndex !== null &&
            certifications[activeSectionIndex] &&
            certifications[activeSectionIndex].selectedCredentials
              ? certifications[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
