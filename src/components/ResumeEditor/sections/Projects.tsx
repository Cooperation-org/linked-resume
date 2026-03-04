import React, { useCallback, useEffect } from 'react'
import { Box, TextField, Typography, Button } from '@mui/material'
import { useTheme, useMediaQuery } from '@mui/material'
import TextEditor from '../../TextEditor/Texteditor'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../../../redux/slices/resume'
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'
import CredentialOverlay from '../../CredentialsOverlay'
import VerifiedCredentialsList from '../../common/VerifiedCredentialsList'
import AttachedFilesList from '../../common/AttachedFilesList'
import SectionItemCard from '../common/SectionItemCard'
import SectionActionButtons from '../common/SectionActionButtons'
import { useSectionItems } from '../../../hooks/useSectionItems'
import { SectionProps } from '../types/section.types'

interface ProjectItem {
  id: string
  name: string
  description: string
  url: string
  technologies: string[]
  verificationStatus: string
  credentialLink: string
  selectedCredentials: any[]
  attachedFiles?: string[]
}

function makeEmptyProject(): ProjectItem {
  return {
    id: `proj-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: '',
    description: '',
    url: '',
    technologies: [],
    verificationStatus: 'unverified',
    credentialLink: '',
    selectedCredentials: [],
    attachedFiles: []
  }
}

function mapFromRedux(item: any): ProjectItem {
  return {
    id: item.id || `proj-${Date.now()}`,
    name: item.name || '',
    description: item.description || '',
    url: item.url || '',
    technologies: item.technologies || [],
    verificationStatus: item.verificationStatus || 'unverified',
    credentialLink: item.credentialLink || '',
    selectedCredentials: item.selectedCredentials || [],
    attachedFiles: item.attachedFiles || []
  }
}

export default function Projects({
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
    items: projects,
    setItems: setProjects,
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
  } = useSectionItems<ProjectItem>({
    sectionId: 'projects',
    reduxSelector: resume =>
      resume?.projects?.items && Array.isArray(resume.projects.items)
        ? resume.projects.items
        : null,
    mapFromRedux,
    emptyItem: makeEmptyProject
  })

  useEffect(() => {
    if (evidence && allFiles) syncEvidence(evidence, allFiles)
  }, [evidence, allFiles, syncEvidence])

  const handleChange = useCallback(
    (index: number, field: keyof ProjectItem, value: any) => {
      setProjects(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], [field]: value }
        if (field !== 'description') debouncedReduxUpdate(updated)
        return updated
      })
    },
    [debouncedReduxUpdate, setProjects]
  )

  const handleDescriptionChange = useCallback(
    (index: number, value: string) => {
      setProjects(prev => {
        const updated = [...prev]
        updated[index] = { ...updated[index], description: value }
        if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
        reduxUpdateTimeoutRef.current = setTimeout(() => {
          dispatch(updateSection({ sectionId: 'projects', content: { items: updated } }))
        }, 1000)
        return updated
      })
    },
    [dispatch, setProjects, reduxUpdateTimeoutRef]
  )

  const handleRemoveFile = useCallback(
    (projIndex: number, fileIndex: number) => {
      onRemoveFile?.('Projects', projIndex, fileIndex)
    },
    [onRemoveFile]
  )

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {projects.map((project, index) => (
        <SectionItemCard
          key={`project-${index}`}
          collapsedLabel='Project:'
          collapsedValue={project.name || 'Untitled Project'}
          expandedLabel='Project Details'
          isExpanded={!!expandedItems[index]}
          onToggle={() => toggleExpanded(index)}
        >
          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Project Name'
            placeholder='Enter project name'
            value={project.name}
            onChange={e => handleChange(index, 'name', e.target.value)}
            variant='outlined'
          />

          <TextField
            sx={{ bgcolor: '#FFF' }}
            size='small'
            fullWidth
            label='Project URL (optional)'
            placeholder='https://example.com'
            value={project.url}
            onChange={e => handleChange(index, 'url', e.target.value)}
          />

          <Typography variant='body1'>Describe your project:</Typography>
          <TextEditor
            key={`editor-${index}`}
            value={project.description || ''}
            onChange={val => handleDescriptionChange(index, val)}
            onAddCredential={onAddCredential}
            onFocus={onFocus}
          />

          {Array.isArray(project.selectedCredentials) &&
            project.selectedCredentials.length > 0 && (
              <VerifiedCredentialsList
                credentials={project.selectedCredentials}
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
            activeSectionIndex !== null && projects[activeSectionIndex]
              ? projects[activeSectionIndex].selectedCredentials
              : []
          }
        />
      )}
    </Box>
  )
}
