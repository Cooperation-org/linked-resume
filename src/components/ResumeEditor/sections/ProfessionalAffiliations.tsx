import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  FormControlLabel,
  Checkbox,
  Typography,
  Switch,
  styled,
  alpha,
  Button,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { SVGSectionIcon, SVGAddFiles, SVGDeleteSection } from '../../../assets/svgs'
import { StyledButton } from './StyledButton'
import { updateSection } from '../../../redux/slices/resume'
import { RootState } from '../../../redux/store'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import CredentialOverlay from '../../CredentialsOverlay'
import TextEditor from '../../TextEditor/Texteditor'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import VerifiedCredentialsList from '../../common/VerifiedCredentialsList'
import {
  calculateDuration,
  dedupeSelectedCredentials,
  buildCredentialLinks,
  parseCredentialLink
} from '../../../utils/resumeSections'
import { FileItem, SelectedCredential } from '../../../types/resumeSections'
import SectionHeader from '../../common/SectionHeader'

const PinkSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase.Mui-checked': {
    color: '#34C759',
    '&:hover': {
      backgroundColor: alpha('#34C759', theme.palette.action.hoverOpacity)
    }
  },
  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
    backgroundColor: '#34C759'
  }
}))

interface ProfessionalAffiliationsProps {
  onAddFiles?: (itemIndex?: number) => void
  onDelete?: () => void
  onAddCredential?: (text: string) => void
  onFocus?: () => void
  evidence?: string[][]
  allFiles?: FileItem[]
  onRemoveFile?: (sectionId: string, itemIndex: number, fileIndex: number) => void
}

interface AffiliationItem {
  name: string
  organization: string
  startDate: string
  endDate: string
  activeAffiliation: boolean
  id: string
  verificationStatus: string
  credentialLink: string
  duration: string
  description: string
  selectedCredentials: SelectedCredential[]
}

export default function ProfessionalAffiliations({
  onAddFiles,
  onDelete,
  onAddCredential,
  onFocus,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: ProfessionalAffiliationsProps) {
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

  const [affiliations, setAffiliations] = useState<AffiliationItem[]>([
    {
      name: '',
      organization: '',
      startDate: '',
      endDate: '',
      activeAffiliation: false,
      id: '',
      verificationStatus: 'unverified',
      credentialLink: '',
      duration: '',
      description: '',
      selectedCredentials: []
    }
  ])

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({ 0: true })
  const [useDuration, setUseDuration] = useState<boolean[]>([false])

  const debouncedReduxUpdate = useCallback(
    (items: AffiliationItem[]) => {
      if (reduxUpdateTimeoutRef.current) {
        clearTimeout(reduxUpdateTimeoutRef.current)
      }
      reduxUpdateTimeoutRef.current = setTimeout(() => {
        dispatch(
          updateSection({
            sectionId: 'professionalAffiliations',
            content: {
              items
            }
          })
        )
      }, 500)
    },
    [dispatch]
  )

  const calculateDurationMemo = useCallback(
    (startDate: string, endDate: string | undefined, activeAffiliation: boolean) =>
      calculateDuration(startDate, endDate, activeAffiliation),
    []
  )

  useEffect(() => {
    const items =
      resume &&
      resume.professionalAffiliations &&
      Array.isArray(resume.professionalAffiliations.items)
        ? resume.professionalAffiliations.items
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
              'for affiliation item:',
              item.id || idx
            )
          }
        }

        return {
          name: item.name || '',
          organization: item.organization || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          activeAffiliation: !!item.activeAffiliation,
          id: item.id || '',
          verificationStatus: item.verificationStatus || 'unverified',
          credentialLink: item.credentialLink || '',
          duration: item.duration || '',
          description: item.description || '',
          selectedCredentials
        }
      }) as AffiliationItem[]

      const needUpdate =
        initialLoadRef.current || typedItems.length !== affiliations.length
      if (needUpdate) {
        initialLoadRef.current = false
        setAffiliations(typedItems)

        const arr = typedItems.map(a => !!(!a.startDate && !a.endDate))
        setUseDuration(arr)

        if (typedItems.length !== Object.keys(expandedItems).length) {
          const initExp: Record<number, boolean> = {}
          typedItems.forEach((_, idx) => {
            initExp[idx] =
              idx < Object.keys(expandedItems).length ? expandedItems[idx] : true
          })
          setExpandedItems(initExp)
        }
      }
    }
    return () => {
      if (reduxUpdateTimeoutRef.current) {
        clearTimeout(reduxUpdateTimeoutRef.current)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume])

  useEffect(() => {
    affiliations.forEach((affiliation, index) => {
      if (useDuration[index]) {
        if (affiliation.startDate && affiliation.endDate) {
          const newDur = calculateDurationMemo(
            affiliation.startDate,
            affiliation.endDate,
            affiliation.activeAffiliation
          )
          if (newDur && newDur !== affiliation.duration) {
            setAffiliations(prev => {
              const updated = [...prev]
              updated[index] = { ...updated[index], duration: newDur }
              return updated
            })
            if (reduxUpdateTimeoutRef.current) {
              clearTimeout(reduxUpdateTimeoutRef.current)
            }
            reduxUpdateTimeoutRef.current = setTimeout(() => {
              dispatch(
                updateSection({
                  sectionId: 'professionalAffiliations',
                  content: {
                    items: affiliations.map((aff, i) =>
                      i === index ? { ...aff, duration: newDur } : aff
                    )
                  }
                })
              )
            }, 1000)
          }
        }
      }
    })
  }, [affiliations, useDuration, dispatch, calculateDurationMemo])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (reduxUpdateTimeoutRef.current) {
        clearTimeout(reduxUpdateTimeoutRef.current)
      }
    }
  }, [])

  const handleAffiliationChange = useCallback(
    (index: number, field: keyof AffiliationItem, value: any) => {
      setAffiliations(prev => {
        const updated = [...prev]
        const aff = { ...updated[index], [field]: value }
        if (!useDuration[index]) {
          aff.duration = ''
        } else if (field === 'startDate' || field === 'endDate') {
          aff.duration = calculateDurationMemo(
            aff.startDate,
            aff.endDate,
            aff.activeAffiliation
          )
        }
        updated[index] = aff
        if (field !== 'description') {
          debouncedReduxUpdate(updated)
        }
        return updated
      })
    },
    [debouncedReduxUpdate, useDuration, calculateDurationMemo]
  )

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      setAffiliations(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: value }

        if (reduxUpdateTimeoutRef.current) {
          clearTimeout(reduxUpdateTimeoutRef.current)
        }
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(
            updateSection({
              sectionId: 'professionalAffiliations',
              content: { items: updated }
            })
          )
        }, 1000)
        return updated
      })
    },
    [dispatch]
  )

  const handleAddAnotherItem = useCallback(() => {
    const emptyItem: AffiliationItem = {
      name: '',
      organization: '',
      startDate: '',
      endDate: '',
      activeAffiliation: false,
      id: '',
      verificationStatus: 'unverified',
      credentialLink: '',
      duration: '',
      description: '',
      selectedCredentials: []
    }
    setAffiliations(prev => {
      const newAff = [...prev, emptyItem]
      dispatch(
        updateSection({
          sectionId: 'professionalAffiliations',
          content: { items: newAff }
        })
      )
      return newAff
    })
    setUseDuration(prev => [...prev, false])

    const newIndex = affiliations.length
    setExpandedItems(prev => ({
      ...prev,
      [newIndex]: true
    }))
  }, [affiliations.length, dispatch])

  const handleDeleteAffiliation = useCallback(
    (index: number) => {
      if (affiliations.length <= 1) {
        if (onDelete) onDelete()
        return
      }
      setAffiliations(prev => {
        const updated = prev.filter((_, i) => i !== index)
        dispatch(
          updateSection({
            sectionId: 'professionalAffiliations',
            content: { items: updated }
          })
        )
        return updated
      })
      setUseDuration(prev => prev.filter((_, i) => i !== index))

      setExpandedItems(prev => {
        const newExp: Record<number, boolean> = {}
        affiliations
          .filter((_, i) => i !== index)
          .forEach((_, i) => {
            newExp[i] = prev[i + (i >= index ? 1 : 0)] || false
          })
        return newExp
      })
    },
    [affiliations, dispatch, onDelete]
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
          return {
            id: id,
            url: '',
            name:
              credential?.credentialSubject?.achievement?.[0]?.name ||
              `Credential ${id.substring(0, 5)}...`,
            vc: credential
          }
        })
        const deduped: SelectedCredential[] =
          dedupeSelectedCredentials(selectedCredentials)
        setAffiliations(prev => {
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
              sectionId: 'professionalAffiliations',
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
    (affIndex: number, credIndex: number) => {
      setAffiliations(prev => {
        const updated = [...prev]
        const aff = { ...updated[affIndex] }
        const newCreds = aff.selectedCredentials.filter((_, i) => i !== credIndex)
        aff.selectedCredentials = dedupeSelectedCredentials(newCreds)
        if (!aff.selectedCredentials.length) {
          aff.verificationStatus = 'unverified'
          aff.credentialLink = ''
        } else {
          aff.credentialLink = buildCredentialLinks(aff.selectedCredentials)
        }
        updated[affIndex] = aff
        dispatch(
          updateSection({
            sectionId: 'professionalAffiliations',
            content: { items: updated }
          })
        )
        return updated
      })
    },
    [dispatch]
  )

  useEffect(() => {
    // Add event listener for opening credentials overlay
    const handleOpenCredentialsEvent = (event: CustomEvent) => {
      const { sectionId, itemIndex } = event.detail
      if (sectionId === 'professionalAffiliations') {
        setActiveSectionIndex(itemIndex)
        setShowCredentialsOverlay(true)
      }
    }

    window.addEventListener(
      'openCredentialsOverlay',
      handleOpenCredentialsEvent as EventListener
    )

    return () => {
      window.removeEventListener(
        'openCredentialsOverlay',
        handleOpenCredentialsEvent as EventListener
      )
    }
  }, [])
  const handleRemoveFile = useCallback(
    (affiliationIndex: number, fileIndex: number) => {
      if (onRemoveFile) {
        onRemoveFile('Professional Affiliations', affiliationIndex, fileIndex)
      }
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {affiliations.map((affiliation, index) => (
        <Box
          key={`affiliation-${index}`}
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
            title='Affiliation'
            subtitle={affiliation.name || 'Untitled Affiliation'}
            expanded={!!expandedItems[index]}
            onToggle={() => toggleExpanded(index)}
            icon={<SVGSectionIcon />}
          />

          {expandedItems[index] && (
            <>
              <TextField
                sx={{ bgcolor: '#FFF' }}
                size='small'
                fullWidth
                placeholder='Member'
                label='Name'
                value={affiliation.name}
                onChange={e => handleAffiliationChange(index, 'name', e.target.value)}
              />

              <TextField
                sx={{ bgcolor: '#FFF' }}
                size='small'
                fullWidth
                placeholder='UXPA'
                label='Organization'
                value={affiliation.organization}
                onChange={e =>
                  handleAffiliationChange(index, 'organization', e.target.value)
                }
              />

              <Box display='flex' alignItems='center' justifyContent='space-between'>
                <Typography>Dates</Typography>
                <FormControlLabel
                  control={
                    <PinkSwitch
                      checked={useDuration[index]}
                      onChange={() => {
                        setUseDuration(prev => {
                          const arr = [...prev]
                          arr[index] = !arr[index]
                          setAffiliations(pA => {
                            const upd = [...pA]
                            if (arr[index]) {
                              upd[index] = {
                                ...upd[index],
                                startDate: '',
                                endDate: ''
                              }
                            } else {
                              upd[index] = {
                                ...upd[index],
                                duration: ''
                              }
                            }
                            debouncedReduxUpdate(upd)
                            return upd
                          })
                          return arr
                        })
                      }}
                      sx={{ color: '#34C759' }}
                    />
                  }
                  label='Show duration instead of exact dates'
                />
              </Box>

              {useDuration[index] ? (
                <TextField
                  sx={{ bgcolor: '#FFF' }}
                  size='small'
                  placeholder='Enter total duration (e.g., 2 years)'
                  value={affiliation.duration}
                  onChange={e =>
                    handleAffiliationChange(index, 'duration', e.target.value)
                  }
                  variant='outlined'
                  fullWidth
                />
              ) : (
                <Box display='flex' gap={2}>
                  <TextField
                    sx={{
                      bgcolor: '#FFF',
                      width: '50%',
                      '& .MuiInputLabel-root': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                    size='small'
                    label='Start Date'
                    type='date'
                    value={affiliation.startDate}
                    onChange={e =>
                      handleAffiliationChange(index, 'startDate', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  {!affiliation.activeAffiliation && (
                    <TextField
                      sx={{
                        bgcolor: '#FFF',
                        width: '50%',
                        '& .MuiInputLabel-root': {
                          transform: 'translate(14px, -9px) scale(0.75)'
                        }
                      }}
                      size='small'
                      label='End Date'
                      type='date'
                      value={affiliation.endDate}
                      onChange={e =>
                        handleAffiliationChange(index, 'endDate', e.target.value)
                      }
                      InputLabelProps={{ shrink: true }}
                    />
                  )}
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={affiliation.activeAffiliation}
                    onChange={e =>
                      handleAffiliationChange(
                        index,
                        'activeAffiliation',
                        e.target.checked
                      )
                    }
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
                  onClick={() => handleDeleteAffiliation(index)}
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
      ))}

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
          onClick={() => handleOpenCredentialsOverlay(affiliations.length - 1)}
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
            affiliations[activeSectionIndex] &&
            affiliations[activeSectionIndex].selectedCredentials
              ? affiliations[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
