'use client'
import React, { useState, useEffect } from 'react'
import { Box, Button, Typography } from '@mui/material'
import { Plus } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '../../redux/hooks'
import { updateSection } from '../../redux/slices/resume'
import CredentialDialog from '../CredentialDialog'
import { SVGSectionIcon } from '../../assets/svgs'
import SectionDetails from './SectionDetails'
import TextEditor from '../TextEditor/Texteditor'
import { SectionListItem } from '../../types/resumeSections'
import SectionContainer from '../common/SectionContainer'
import SectionList from '../common/SectionList'

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
  const dispatch = useAppDispatch()
  const { vcs: claims } = useAppSelector(state => state.vc)
  const resume = useAppSelector(state => state.resumeEditor.resume)

  const sectionData = (resume?.[sectionId] as any) ?? ''
  const hasItems =
    typeof sectionData === 'object' && sectionData !== null && 'items' in sectionData

  const isStringBased = typeof sectionData === 'string'
  const isListBased = hasItems

  const [content, setContent] = useState<string>(
    isStringBased ? (sectionData as string) : ''
  )
  const [items, setItems] = useState<SectionListItem[]>(
    isListBased ? (sectionData.items as SectionListItem[]) || [] : []
  )
  const [editing, setEditing] = useState(false)
  const [newItemValue, setNewItemValue] = useState('')
  const [isVisible, setIsVisible] = useState(true)
  const [isCredentialDialogOpen, setIsCredentialDialogOpen] = useState(false)

  useEffect(() => {
    if (isListBased) {
      setItems(sectionData.items || [])
    } else {
      setContent((sectionData as string) || '')
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

  if (!resume) return null

  return (
    <SectionContainer>
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
                <TextEditor value={content} onChange={val => setContent(val || '')} />
              ) : (
                <Typography variant='body1'>
                  {content || `No ${sectionId} added yet.`}
                </Typography>
              )}
            </Box>
          ) : (
            <Box>
              {items && (
                <SectionList
                  items={items}
                  editing={editing}
                  onChangeItem={handleUpdateItem}
                  onRemoveItem={handleRemoveItem}
                />
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
    </SectionContainer>
  )
}

export default SectionContent
