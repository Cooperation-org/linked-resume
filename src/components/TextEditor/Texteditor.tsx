import React, { useMemo, useState, useRef, useEffect } from 'react'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import { Box } from '@mui/material'
import './TextEditor.css'
import CredentialOverlay from '../CredentialsOverlay'

const Delta = Quill.import('delta')
const BaseClipboard = Quill.import('modules/clipboard')

const icons = Quill.import('ui/icons')
icons['link-to-credentials'] =
  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
  <g clip-path="url(#clip0_1381_33743)">
    <path d="M4 6.67578H2V20.6758C2 21.7808 2.895 22.6758 4 22.6758H18V20.6758H4V6.67578ZM20 2.67578H8C6.895 2.67578 6 3.57078 6 4.67578V16.6758C6 17.7808 6.895 18.6758 8 18.6758H20C21.105 18.6758 22 17.7808 22 16.6758V4.67578C22 3.57078 21.105 2.67578 20 2.67578ZM19 11.6758H15V15.6758H13V11.6758H9V9.67578H13V5.67578H15V9.67578H19V11.6758Z" fill="#000"/>
  </g>
  <defs>
    <clipPath id="clip0_1381_33743">
      <rect width="24" height="24" fill="white" transform="translate(0 0.675781)"/>
    </clipPath>
  </defs>
</svg>`

icons['undo'] = `<svg viewBox="0 0 18 18">
  <path d="M9 14c-2.8 0-5-2.2-5-5s2.2-5 5-5h4" stroke="currentColor" fill="none" stroke-width="2"/>
  <path d="M13 1l4 3-4 3" stroke="currentColor" fill="none" stroke-width="2"/>
</svg>`

icons['redo'] = `<svg viewBox="0 0 18 18">
  <path d="M9 14c2.8 0 5-2.2 5-5s-2.2-5-5-5H5" stroke="currentColor" fill="none" stroke-width="2"/>
  <path d="M5 1L1 4l4 3" stroke="currentColor" fill="none" stroke-width="2"/>
</svg>`

const BlockEmbed = Quill.import('blots/block/embed')
class BadgeBlot extends BlockEmbed {
  static blotName = 'badge'
  static tagName = 'div'

  static create(value: any) {
    const node = super.create()
    node.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 0L9.87 1.87L12.28 1.44L13.15 3.85L15.56 4.72L15.13 7.13L17 9L15.13 10.87L15.56 13.28L13.15 14.15L12.28 16.56L9.87 16.13L8 18L6.13 16.13L3.72 16.56L2.85 14.15L0.44 13.28L0.87 10.87L-1 9L0.87 7.13L0.44 4.72L2.85 3.85L3.72 1.44L6.13 1.87L8 0Z" fill="#2196F3"/>
      <path d="M11.45 5.45L6.75 10.15L4.55 7.95L3.85 8.65L6.75 11.55L12.15 6.15L11.45 5.45Z" fill="white"/>
    </svg>`
    return node
  }
}
Quill.register(BadgeBlot)

class PlainClipboard extends BaseClipboard {
  quill: any
  constructor(quill: any, options: any) {
    super(quill, options)
    this.quill = quill
  }

  onPaste(e: ClipboardEvent) {
    e.preventDefault()
    const range = this.quill.getSelection()
    if (range) {
      const text = (e.clipboardData || (window as any).clipboardData).getData(
        'text/plain'
      )
      const delta = new Delta().retain(range.index).delete(range.length).insert(text)
      this.quill.updateContents(delta, 'silent')
      this.quill.setSelection(range.index + text.length)
      this.quill.scrollIntoView()
    }
  }
}

Quill.register('modules/clipboard', PlainClipboard, true)

interface TextEditorProps {
  value: string
  onChange: (value: string) => void
  onAddCredential?: (text: string) => void
  onFocus?: () => void
}

// Generate unique ID for each editor instance
let editorCounter = 0

function TextEditor({
  value,
  onChange,
  onAddCredential,
  onFocus
}: Readonly<TextEditorProps>) {
  const [showCredentialsOverlay, setShowCredentialsOverlay] = useState(false)
  const [selectedTextRange, setSelectedTextRange] = useState<any>(null)
  const quillRef = React.useRef<any>(null)
  const editorIdRef = useRef(`editor-${++editorCounter}-${Date.now()}`)
  const lastValueRef = useRef(value)

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          ['bold', 'italic', 'underline', 'strike', 'link'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['undo', 'redo'],
          ['link-to-credentials']
        ],
        handlers: {
          'link-to-credentials': () => {
            const range = quillRef.current?.getEditor().getSelection()
            if (range) {
              setSelectedTextRange(range)
              setShowCredentialsOverlay(true)
            }
          },
          undo: () => {
            const quill = quillRef.current?.getEditor()
            if (quill) {
              quill.history.undo()
            }
          },
          redo: () => {
            const quill = quillRef.current?.getEditor()
            if (quill) {
              quill.history.redo()
            }
          }
        }
      },
      clipboard: { matchVisual: false },
      history: {
        delay: 1000,
        maxStack: 100,
        userOnly: true
      }
    }),
    []
  )

  const formats = ['bold', 'italic', 'underline', 'strike', 'link', 'list', 'bullet']

  // Ensure proper cleanup and value synchronization
  useEffect(() => {
    // Only update if value actually changed to prevent unnecessary re-renders
    if (value !== lastValueRef.current && quillRef.current) {
      const quill = quillRef.current.getEditor()
      if (quill && quill.root.innerHTML !== value) {
        const selection = quill.getSelection()
        quill.root.innerHTML = value || ''
        if (selection) {
          quill.setSelection(selection)
        }
      }
      lastValueRef.current = value
    }
  }, [value])

  const handleCredentialSelect = (selectedCredentials: string[]) => {
    if (selectedTextRange && selectedCredentials.length > 0) {
      const quill = quillRef.current?.getEditor()
      const text = quill?.getText(selectedTextRange.index, selectedTextRange.length)

      const credentialLink = `https://linkedcreds.allskillscount.org/view/${selectedCredentials[0]}`
      quill?.formatText(
        selectedTextRange.index,
        selectedTextRange.length,
        'link',
        credentialLink
      )

      quill?.insertEmbed(
        selectedTextRange.index + selectedTextRange.length,
        'badge',
        true
      )

      if (onAddCredential) {
        onAddCredential(text)
      }

      setShowCredentialsOverlay(false)
      setSelectedTextRange(null)
    }
  }

  // Handle change with proper isolation
  const handleChange = (newValue: string) => {
    lastValueRef.current = newValue
    onChange(newValue)
  }

  return (
    <Box
      sx={{ width: '100%', borderRadius: '8px', height: 'auto', position: 'relative' }}
      onFocus={onFocus}
      data-editor-id={editorIdRef.current}
    >
      <Box
        className='text-editor-container'
        sx={{ borderRadius: '8px', height: 'auto' }}
        onFocus={onFocus}
      >
        <ReactQuill
          ref={quillRef}
          theme='snow'
          value={value}
          onChange={handleChange}
          modules={modules}
          formats={formats}
          placeholder={
            'Add and edit text here \n\nUse the toolbar to markup your text as follows:\n• Bold\n• Italic\n• Add links\n• Unordered lists\n• Undo / redo\n• Add credentials'
          }
          style={{ marginTop: '4px', borderRadius: '8px', height: 'auto' }}
          onFocus={onFocus}
        />
      </Box>
      {showCredentialsOverlay && (
        <CredentialOverlay
          onClose={() => {
            setShowCredentialsOverlay(false)
            setSelectedTextRange(null)
          }}
          onSelect={handleCredentialSelect}
        />
      )}
    </Box>
  )
}

export default TextEditor
