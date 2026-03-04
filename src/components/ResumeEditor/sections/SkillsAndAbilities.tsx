import React, { useCallback, useEffect } from 'react'
import { Box, Typography, Button, IconButton } from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import TextEditor from '../../TextEditor/Texteditor'
import { SVGDownIcon } from '../../../assets/svgs'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../../../redux/slices/resume'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CredentialOverlay from '../../CredentialsOverlay'
import VerifiedCredentialsList from '../../common/VerifiedCredentialsList'
import AttachedFilesList from '../../common/AttachedFilesList'
import SectionActionButtons from '../common/SectionActionButtons'
import { useSectionItems } from '../../../hooks/useSectionItems'
import { SectionProps } from '../types/section.types'

interface SkillItem {
  id: string
  skills: string
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptySkill(): SkillItem {
  return {
    id: `skill-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    skills: '',
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): SkillItem {
  return {
    id: item.id || `skill-${Date.now()}`,
    skills: Array.isArray(item) ? item.join(', ') : item.skills || '',
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials: item.selectedCredentials || [],
    attachedFiles: item.attachedFiles || []
  }
}

export default function SkillsAndAbilities({
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
    items: skills,
    setItems: setSkills,
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
  } = useSectionItems<SkillItem>({
    sectionId: 'skills',
    reduxSelector: resume =>
      resume?.skills?.items && resume.skills.items.length > 0 ? resume.skills.items : null,
    mapFromRedux,
    emptyItem: makeEmptySkill
  })

  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  const handleSkillChange = useCallback(
    (index: number, field: keyof SkillItem, value: string) => {
      setSkills(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], [field]: value }
        debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, setSkills]
  )

  const handleRemoveFile = useCallback(
    (skillIndex: number, fileIndex: number) => {
      onRemoveFile?.('skills', skillIndex, fileIndex)
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <Typography variant='h6'>Skills and Abilities</Typography>

      {skills.map((skill, index) => (
        <Box
          key={`skill-${index}`}
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
          {/* Accordion header */}
          <Box
            display='flex'
            alignItems='center'
            justifyContent='space-between'
            onClick={() => toggleExpanded(index)}
            sx={{ cursor: 'pointer' }}
          >
            <Box display='flex' alignItems='center' gap={2} flexGrow={1}>
              {!expandedItems[index] ? (
                <Typography variant='body1'>Skills</Typography>
              ) : (
                <Typography
                  sx={{
                    fontFamily: 'Nunito Sans',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: 'normal',
                    letterSpacing: '0.16px'
                  }}
                >
                  Add skills and link them to credentials to strengthen their value on your resume.
                </Typography>
              )}
            </Box>
            <IconButton
              onClick={e => {
                e.stopPropagation()
                toggleExpanded(index)
              }}
              sx={{
                transform: expandedItems[index] ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: 'transform 0.3s ease'
              }}
            >
              <SVGDownIcon />
            </IconButton>
          </Box>

          {expandedItems[index] && (
            <>
              <TextEditor
                key={`editor-${index}`}
                value={skill.skills || ''}
                onChange={val => handleSkillChange(index, 'skills', val)}
                onAddCredential={onAddCredential}
                onFocus={onFocus}
              />

              {Array.isArray(skill.selectedCredentials) &&
                skill.selectedCredentials.length > 0 && (
                  <VerifiedCredentialsList
                    credentials={skill.selectedCredentials}
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
            </>
          )}
        </Box>
      ))}

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
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
            activeSectionIndex !== null && skills[activeSectionIndex]
              ? skills[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
