import React, { useState, useCallback, useEffect, useRef } from 'react'
import {
  Box,
  TextField,
  Typography,
  Switch,
  styled,
  alpha,
  Checkbox,
  FormControlLabel,
  Button,
  IconButton,
  useTheme,
  useMediaQuery
} from '@mui/material'
import { SVGSectionIcon, SVGAddFiles, SVGDeleteSection } from '../../../assets/svgs'
import TextEditor from '../../TextEditor/Texteditor'
import { StyledButton } from './StyledButton'
import { updateSection } from '../../../redux/slices/resume'
import { RootState } from '../../../redux/store'
import { useAppDispatch, useAppSelector } from '../../../redux/hooks'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CloseIcon from '@mui/icons-material/Close'
import CredentialOverlay from '../../CredentialsOverlay'
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

interface VolunteerWorkProps {
  onAddFiles?: (itemIndex?: number) => void
  onDelete?: () => void
  onAddCredential?: (text: string) => void
  onFocus?: () => void
  evidence?: string[][]
  allFiles?: FileItem[]
  onRemoveFile?: (sectionId: string, itemIndex: number, fileIndex: number) => void
}

interface VolunteerWorkItem {
  role: string
  organization: string
  location: string
  startDate: string
  endDate: string
  currentlyVolunteering: boolean
  description: string
  duration: string
  id: string
  verificationStatus: string
  credentialLink: string
  selectedCredentials: SelectedCredential[]
}

export default function VolunteerWork({
  onAddFiles,
  onDelete,
  onAddCredential,
  onFocus,
  evidence = [],
  allFiles = [],
  onRemoveFile
}: Readonly<VolunteerWorkProps>) {
  const dispatch = useAppDispatch()
  const resume = useAppSelector((state: RootState) => state.resumeEditor.resume)
  const reduxUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)
  const theme = useTheme()
  const isSmallMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [showCredentialsOverlay, setShowCredentialsOverlay] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)
  const vcs = useAppSelector(state => state.vc.vcs)

  const [volunteerWorks, setVolunteerWorks] = useState<VolunteerWorkItem[]>([
    {
      role: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyVolunteering: false,
      description: '',
      duration: '',
      id: '',
      verificationStatus: 'unverified',
      credentialLink: '',
      selectedCredentials: []
    }
  ])

  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({
    0: true
  })

  const [useDuration, setUseDuration] = useState<boolean[]>([false])

  const calculateDurationMemo = useCallback(
    (startDate: string, endDate: string | undefined, currentlyVolunteering: boolean) =>
      calculateDuration(startDate, endDate, currentlyVolunteering),
    []
  )

  const debouncedReduxUpdate = useCallback(
    (items: VolunteerWorkItem[]) => {
      if (reduxUpdateTimeoutRef.current) {
        clearTimeout(reduxUpdateTimeoutRef.current)
      }
      reduxUpdateTimeoutRef.current = setTimeout(() => {
        dispatch(
          updateSection({
            sectionId: 'volunteerWork',
            content: { items }
          })
        )
      }, 500)
    },
    [dispatch]
  )

  const dateChangeString = volunteerWorks
    .map(vol => `${vol.startDate}-${vol.endDate}-${vol.currentlyVolunteering}`)
    .join('|')

  useEffect(() => {
    volunteerWorks.forEach((volunteer, index) => {
      if (useDuration[index]) {
        if (volunteer.startDate) {
          const calc = calculateDurationMemo(
            volunteer.startDate,
            volunteer.endDate,
            volunteer.currentlyVolunteering
          )
          if (calc && calc !== volunteer.duration) {
            setVolunteerWorks(prev => {
              const updated = [...prev]
              updated[index] = { ...updated[index], duration: calc }
              return updated
            })
            if (reduxUpdateTimeoutRef.current) {
              clearTimeout(reduxUpdateTimeoutRef.current)
            }
            reduxUpdateTimeoutRef.current = setTimeout(() => {
              dispatch(
                updateSection({
                  sectionId: 'volunteerWork',
                  content: {
                    items: volunteerWorks.map((v, i) =>
                      i === index ? { ...v, duration: calc } : v
                    )
                  }
                })
              )
            }, 1000)
          }
        }
      }
    })
  }, [dateChangeString, dispatch, volunteerWorks, useDuration, calculateDurationMemo])

  useEffect(() => {
    const items =
      resume && resume.volunteerWork && Array.isArray(resume.volunteerWork.items)
        ? resume.volunteerWork.items
        : []
    if (items.length > 0) {
      const typed = items.map((item: any, idx: number) => {
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
              'for volunteer item:',
              item.id || idx
            )
          }
        }

        return {
          role: item.role || '',
          organization: item.organization || '',
          location: item.location || '',
          startDate: item.startDate || '',
          endDate: item.endDate || '',
          currentlyVolunteering: !!item.currentlyVolunteering,
          description: item.description || '',
          duration: item.duration || '',
          id: item.id || '',
          verificationStatus: item.verificationStatus || 'unverified',
          credentialLink: item.credentialLink || '',
          selectedCredentials
        }
      }) as VolunteerWorkItem[]

      const needUpdate = initialLoadRef.current || typed.length !== volunteerWorks.length
      if (needUpdate) {
        initialLoadRef.current = false
        setVolunteerWorks(typed)
        const arr = typed.map(t => !!(!t.startDate && !t.endDate))
        setUseDuration(arr)
        if (typed.length !== Object.keys(expandedItems).length) {
          const initExp: Record<number, boolean> = {}
          typed.forEach((_, i) => {
            initExp[i] = i < Object.keys(expandedItems).length ? expandedItems[i] : true
          })
          setExpandedItems(initExp)
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

  const handleVolunteerWorkChange = useCallback(
    (index: number, field: string, value: any) => {
      setVolunteerWorks(prev => {
        const updated = [...prev]
        const item = { ...updated[index], [field]: value }
        if (!useDuration[index]) {
          item.duration = ''
        } else if (field === 'startDate' || field === 'endDate') {
          item.duration = calculateDurationMemo(
            item.startDate,
            item.endDate,
            item.currentlyVolunteering
          )
        }
        updated[index] = item
        if (field !== 'description') {
          debouncedReduxUpdate(updated)
        }
        return updated
      })
    },
    [debouncedReduxUpdate, useDuration, calculateDurationMemo]
  )

  const handleDescriptionChange = useCallback(
    (index: number, val: string) => {
      setVolunteerWorks(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: val }
        if (reduxUpdateTimeoutRef.current) {
          clearTimeout(reduxUpdateTimeoutRef.current)
        }
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(
            updateSection({
              sectionId: 'volunteerWork',
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
    const newItem: VolunteerWorkItem = {
      role: '',
      organization: '',
      location: '',
      startDate: '',
      endDate: '',
      currentlyVolunteering: false,
      description: '',
      duration: '',
      id: '',
      verificationStatus: 'unverified',
      credentialLink: '',
      selectedCredentials: []
    }
    setVolunteerWorks(prev => {
      const arr = [...prev, newItem]
      dispatch(
        updateSection({
          sectionId: 'volunteerWork',
          content: { items: arr }
        })
      )
      return arr
    })
    setUseDuration(prev => [...prev, false])

    const newIndex = volunteerWorks.length
    setExpandedItems(prev => ({
      ...prev,
      [newIndex]: true
    }))
  }, [volunteerWorks.length, dispatch])

  const handleDeleteVolunteerWork = useCallback(
    (index: number) => {
      if (volunteerWorks.length <= 1) {
        if (onDelete) onDelete()
        return
      }
      setVolunteerWorks(prev => {
        const arr = prev.filter((_, i) => i !== index)
        dispatch(
          updateSection({
            sectionId: 'volunteerWork',
            content: { items: arr }
          })
        )
        return arr
      })
      setUseDuration(prev => prev.filter((_, i) => i !== index))

      setExpandedItems(prev => {
        const newExp: Record<number, boolean> = {}
        volunteerWorks
          .filter((_, i) => i !== index)
          .forEach((_, i) => {
            newExp[i] = prev[i + (i >= index ? 1 : 0)] || false
          })
        return newExp
      })
    },
    [volunteerWorks, dispatch, onDelete]
  )

  const toggleExpanded = useCallback((i: number) => {
    setExpandedItems(prev => ({
      ...prev,
      [i]: !prev[i]
    }))
  }, [])

  const handleOpenCredentialsOverlay = useCallback((i: number) => {
    setActiveSectionIndex(i)
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
        setVolunteerWorks(prev => {
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
              sectionId: 'volunteerWork',
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
    (volIndex: number, credIndex: number) => {
      setVolunteerWorks(prev => {
        const updated = [...prev]
        const vol = { ...updated[volIndex] }
        const newCreds = vol.selectedCredentials.filter((_, i) => i !== credIndex)
        vol.selectedCredentials = dedupeSelectedCredentials(newCreds)
        if (!vol.selectedCredentials.length) {
          vol.verificationStatus = 'unverified'
          vol.credentialLink = ''
        } else {
          vol.credentialLink = buildCredentialLinks(vol.selectedCredentials)
        }
        updated[volIndex] = vol
        dispatch(
          updateSection({
            sectionId: 'volunteerWork',
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
      if (sectionId === 'volunteerWork') {
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
  const handleRemoveFile = (itemIndex: number, fileIndex: number) => {
    if (onRemoveFile) {
      onRemoveFile('volunteerWork', itemIndex, fileIndex)
    }
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Typography sx={{ fontSize: '14px', fontWeight: '500' }}>
        Add volunteer experience to showcase your community involvement and transferable
        skills. This can be especially valuable if you're a student, career changer, or
        have employment gaps.
      </Typography>

      {volunteerWorks.map((volunteer, index) => (
        <Box
          key={`volunteer-${index}`}
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
            title='Volunteer'
            subtitle={volunteer.role || 'Untitled Role'}
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
                label='Role Title'
                placeholder='e.g., Volunteer Coordinator'
                value={volunteer.role}
                onChange={e => handleVolunteerWorkChange(index, 'role', e.target.value)}
                variant='outlined'
              />

              <TextField
                sx={{ bgcolor: '#FFF' }}
                size='small'
                fullWidth
                label='Organization'
                placeholder='e.g., Red Cross'
                value={volunteer.organization}
                onChange={e =>
                  handleVolunteerWorkChange(index, 'organization', e.target.value)
                }
              />

              <TextField
                sx={{ bgcolor: '#FFF' }}
                size='small'
                fullWidth
                label='Location (optional)'
                placeholder='e.g., New York, NY'
                value={volunteer.location}
                onChange={e =>
                  handleVolunteerWorkChange(index, 'location', e.target.value)
                }
              />

              <Box display='flex' alignItems='start' flexDirection='column'>
                <Typography variant='body1'>Dates</Typography>
                <Box display='flex' alignItems='center'>
                  <PinkSwitch
                    checked={useDuration[index]}
                    onChange={() => {
                      setUseDuration(prev => {
                        const arr = [...prev]
                        arr[index] = !arr[index]
                        setVolunteerWorks(pV => {
                          const up = [...pV]
                          if (!arr[index]) {
                            up[index] = {
                              ...up[index],
                              duration: ''
                            }
                          } else {
                            up[index] = {
                              ...up[index],
                              startDate: '',
                              endDate: '',
                              currentlyVolunteering: false
                            }
                          }
                          debouncedReduxUpdate(up)
                          return up
                        })
                        return arr
                      })
                    }}
                    sx={{ color: '#34C759' }}
                  />
                  <Typography>Show duration instead of exact dates</Typography>
                </Box>
              </Box>

              {useDuration[index] ? (
                <TextField
                  sx={{ bgcolor: '#FFF' }}
                  size='small'
                  fullWidth
                  label='Duration'
                  placeholder='e.g., 6 months'
                  value={volunteer.duration}
                  onChange={e =>
                    handleVolunteerWorkChange(index, 'duration', e.target.value)
                  }
                  variant='outlined'
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
                    type='date'
                    label='Start Date'
                    value={volunteer.startDate}
                    onChange={e =>
                      handleVolunteerWorkChange(index, 'startDate', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                  />
                  <TextField
                    sx={{
                      bgcolor: '#FFF',
                      width: '50%',
                      '& .MuiInputLabel-root': {
                        transform: 'translate(14px, -9px) scale(0.75)'
                      }
                    }}
                    size='small'
                    type='date'
                    label='End Date'
                    value={volunteer.endDate}
                    onChange={e =>
                      handleVolunteerWorkChange(index, 'endDate', e.target.value)
                    }
                    InputLabelProps={{ shrink: true }}
                    disabled={volunteer.currentlyVolunteering}
                  />
                </Box>
              )}

              <FormControlLabel
                control={
                  <Checkbox
                    checked={volunteer.currentlyVolunteering}
                    onChange={e =>
                      handleVolunteerWorkChange(
                        index,
                        'currentlyVolunteering',
                        e.target.checked
                      )
                    }
                  />
                }
                label='I currently volunteer here'
              />

              <Typography variant='body1'>
                Describe your volunteer activities and achievements:
              </Typography>
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
                  onClick={() => handleDeleteVolunteerWork(index)}
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
          onClick={() => handleOpenCredentialsOverlay(volunteerWorks.length - 1)}
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
          Add another position
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
            volunteerWorks[activeSectionIndex] &&
            volunteerWorks[activeSectionIndex].selectedCredentials
              ? volunteerWorks[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
