import React from 'react'
import { List, ListItem, ListItemText, Box, Typography, IconButton } from '@mui/material'
import { Trash2 } from 'lucide-react'
import TextEditor from '../TextEditor/Texteditor'

export type SectionListItem =
  | string
  | {
      text: string
      credentialId?: string
      verified?: boolean
    }

type SectionListProps = {
  items: SectionListItem[]
  editing: boolean
  onChangeItem: (index: number, value: string) => void
  onRemoveItem: (index: number) => void
}

const SectionList: React.FC<SectionListProps> = ({
  items,
  editing,
  onChangeItem,
  onRemoveItem
}) => {
  if (!items) return null

  return (
    <List>
      {items.map((item, index) => {
        const itemText = typeof item === 'string' ? item : item.text
        const isCredential = typeof item === 'object'

        return (
          <ListItem
            key={isCredential ? item.credentialId || index : index}
            sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
          >
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {editing ? (
                    <TextEditor value={itemText} onChange={val => onChangeItem(index, val)} />
                  ) : (
                    <>
                      <Typography>{itemText}</Typography>
                      {isCredential && (
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
            <IconButton onClick={() => onRemoveItem(index)}>
              <Trash2 size={16} />
            </IconButton>
          </ListItem>
        )
      })}
    </List>
  )
}

export default SectionList

