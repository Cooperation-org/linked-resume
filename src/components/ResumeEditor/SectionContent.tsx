import React, { useState, useEffect } from 'react'
import {
  Box,
  Button,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton
} from '@mui/material'
import { Trash2, Plus } from 'lucide-react'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../../redux/slices/resume'
import CredentialDialog from '../CredentialDialog'
import { SVGSectionIcon } from '../../assets/svgs'
import SectionDetails from './SectionDetails'
import TextEditor from '../TextEditor/Texteditor'

interface SectionContentProps {
  sectionId: keyof Resume
}

// Define types for our items
type CredentialItem = {
  text: string
  credentialId: string
  verified: boolean
}

const SectionContent: React.FC<SectionContentProps> = ({ sectionId }) => {
  const dispatch = useDispatch()
  const { vcs: claims } = useSelector((state: any) => state.vcReducer)
  const resume = useSelector((state: any) => state.resume.resume)
  const sectionData = resume[sectionId]

  const isStringBased = typeof sectionData === 'string'
  const isListBased = Array.isArray(sectionData?.items)

  const [content, setContent] = useState(sectionData || '')
  const [items, setItems] = useState<any[]>(sectionData?.items || [])
  const [editing, setEditing] = useState(false)
  const [newItemValue, setNewItemValue] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false)

  useEffect(() => {
    if (isListBased) {
      setItems(sectionData.items || [])
    } else {
      setContent(sectionData || '')
    }
  }, [sectionData, isListBased])
  //eslint-disable-next-line
  const toggleEdit = () => {
    if (editing) {
      const updatedContent = isStringBased ? content : { items }
      dispatch(updateSection({ sectionId, content: updatedContent }))
    }
    setEditing(!editing)
  }
  //eslint-disable-next-line
  const toggleVisibility = () => {
    setIsVisible(!isVisible)
  }

  const handleAddNewItem = () => {
    if (!newItemValue.trim()) return
    const updatedItems = [...items, newItemValue.trim()]
    setItems(updatedItems)
    dispatch(updateSection({ sectionId, content: { items: updatedItems } }))
    setNewItemValue('')
  }

  const handleUpdateItem = (index: number, newValue: string) => {
    const updatedItems = [...items]
    const currentItem = updatedItems[index]

    if (typeof currentItem === 'object') {
      updatedItems[index] = {
        ...currentItem,
        text: newValue
      }
    } else {
      updatedItems[index] = newValue
    }

    setItems(updatedItems)
    dispatch(updateSection({ sectionId, content: { items: updatedItems } }))
  }

  const handleRemoveItem = (index: number) => {
    const updatedItems = items.filter((_, i) => i !== index)
    setItems(updatedItems)
    dispatch(updateSection({ sectionId, content: { items: updatedItems } }))
  }

  const handleCredentialsSelected = (selectedClaims: any[]) => {
    const newCredentialItems: CredentialItem[] = selectedClaims.map(claim => ({
      text: `${claim.credentialSubject?.achievement[0]?.name} - ${claim.credentialSubject?.name}`,
      credentialId: claim[0]?.id,
      verified: true
    }))

    const updatedItems = [...items, ...newCredentialItems]
    setItems(updatedItems)
    dispatch(updateSection({ sectionId, content: { items: updatedItems } }))
  }

  const renderListItem = (item: any, index: number) => {
    const itemText = typeof item === 'string' ? item : item.text
    const isCredential = typeof item === 'object'

    return (
      <ListItem
        key={isCredential ? item.credentialId : index}
        sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
      >
        <ListItemText
          primary={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {editing ? (
                <TextEditor
                  value={itemText}
                  onChange={val => handleUpdateItem(index, val)}
                />
              ) : (
                <>
                  <Typography>{itemText}</Typography>
                  {isCredential && (
                    // we can remove it or use it as openCreds
                    <Typography
                      component='span'
                      sx={{
                        bgcolor: 'success.main',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem'
                      }}
                    >
                      Verified
                    </Typography>
                  )}
                </>
              )}
            </Box>
          }
        />
        <IconButton onClick={() => handleRemoveItem(index)}>
          <Trash2 size={16} />
        </IconButton>
      </ListItem>
    )
  }

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Section Header */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', p: '15px 0 20px 10px' }}>
        <SVGSectionIcon />
        <Typography variant='h6' fontWeight='600'>
          {sectionId.charAt(0).toUpperCase() + sectionId.slice(1)}
        </Typography>
      </Box>

      <SectionDetails sectionId={sectionId} />

      {isVisible && (
        <>
          {isStringBased ? (
            <Box>
              {editing ? (
                <TextEditor value={content} onChange={val => setContent(val)} />
              ) : (
                <Typography variant='body1'>
                  {content || `No ${sectionId} added yet.`}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              {items && (
                <List>{items.map((item, index) => renderListItem(item, index))}</List>
              )}

              {editing && (
                <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                  <TextEditor
                    value={newItemValue}
                    onChange={val => setNewItemValue(val)}
                  />
                  <Button
                    variant='outlined'
                    sx={{ borderRadius: 5 }}
                    startIcon={<Plus />}
                    onClick={handleAddNewItem}
                  >
                    Add
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </>
      )}

      <CredentialDialog
        open={isCredentialDialogOpen}
        onClose={() => setIsCredentialDialogOpen(false)}
        claims={claims || []}
        sectionId={sectionId}
        onCredentialsSelected={handleCredentialsSelected}
      />
    </Box>
  )
}

export default SectionContent
