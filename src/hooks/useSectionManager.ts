import { useState, useCallback } from 'react'
import { FileItem } from '../components/NewFileUpload/FileList'

export const useSectionManager = (
  activeSection: string,
  resume: any
) => {
  const [sectionOrder, setSectionOrder] = useState<string[]>([
    'Professional Summary',
    'Work Experience',
    'Education',
    'Professional Affiliations',
    'Skills and Abilities'
  ])
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null)
  const [sectionEvidence, setSectionEvidence] = useState<Record<string, string[][]>>({})
  const [fileSelectorOpen, setFileSelectorOpen] = useState(false)
  const [files, setFiles] = useState<FileItem[]>([])
  const [allFiles, setAllFiles] = useState<FileItem[]>([])
  const [activeItemIndex, setActiveItemIndex] = useState<number | undefined>(undefined)

  const requiredSections = [
    'Professional Summary',
    'Work Experience',
    'Education',
    'Professional Affiliations',
    'Skills and Abilities'
  ]

  const handleAddSection = useCallback((sectionId: string) => {
    setSectionOrder(prev => [...prev, sectionId])
  }, [])

  const handleRemoveSection = useCallback((sectionId: string) => {
    if (!requiredSections.includes(sectionId)) {
      setSectionOrder(prev => prev.filter(id => id !== sectionId))
    }
  }, [])

  const handleAddFiles = useCallback((sectionId: string, itemIndex?: number) => {
    setActiveSectionId(sectionId)
    setActiveItemIndex(itemIndex)
    setFileSelectorOpen(true)
  }, [])

  const handleFilesSelected = useCallback((newFiles: FileItem[]) => {
    setFiles(newFiles)
  }, [])

  const handleFileDelete = useCallback((event: React.MouseEvent, id: string) => {
    setFiles(prev => prev.filter(file => file.id !== id))
  }, [])

  const handleFileNameChange = useCallback((id: string, newName: string) => {
    setFiles(prev =>
      prev.map(file => (file.id === id ? { ...file, name: newName } : file))
    )
  }, [])

  const handleEvidenceSelected = useCallback((selectedFileIds: string[], itemIndex?: number) => {
    const targetItemIndex = itemIndex ?? activeItemIndex

    if (activeSectionId !== null && typeof targetItemIndex === 'number') {
      setSectionEvidence(prev => {
        const prevArr: string[][] =
          Array.isArray(prev[activeSectionId]) && Array.isArray(prev[activeSectionId][0])
            ? [...(prev[activeSectionId] as string[][])]
            : Array.from({ length: targetItemIndex + 1 }, () => [])
        prevArr[targetItemIndex] = [...selectedFileIds]

        return {
          ...prev,
          [activeSectionId]: prevArr
        }
      })
    }
    setFileSelectorOpen(false)
    setActiveSectionId(null)
    setActiveItemIndex(undefined)
  }, [activeItemIndex, activeSectionId])

  const handleRemoveFile = useCallback((sectionId: string, itemIndex: number, fileIndex: number) => {
    setSectionEvidence(prev => {
      const section = prev[sectionId] || []
      const newSection = [...section]

      if (newSection[itemIndex]) {
        const newItem = [...newSection[itemIndex]]
        newItem.splice(fileIndex, 1)
        newSection[itemIndex] = newItem
      }

      return {
        ...prev,
        [sectionId]: newSection
      }
    })
  }, [])

  const handleAddCredential = useCallback((text: string) => {
    if (!activeSection) {
      console.error('No active section found')
      return
    }

    const sectionComponents = {
      'Work Experience': 'experience',
      Education: 'education',
      'Skills and Abilities': 'skills',
      'Professional Affiliations': 'professionalAffiliations',
      'Volunteer Work': 'volunteerWork',
      Projects: 'projects',
      'Certifications and Licenses': 'certifications'
    } as const

    const sectionId = sectionComponents[activeSection as keyof typeof sectionComponents]
    if (!sectionId) {
      console.error('Invalid section:', activeSection)
      return
    }

    const section = resume?.[sectionId as keyof typeof resume]
    if (!section || typeof section !== 'object' || !('items' in section)) {
      console.error('Invalid section structure')
      return
    }

    const sectionItems = section.items
    if (!Array.isArray(sectionItems)) {
      console.error('Invalid section items')
      return
    }

    const matchesText = (value?: string) =>
      typeof value === 'string' && value.includes(text)

    const itemIndex = sectionItems.findIndex(item => {
      const candidate = item as any
      return (
        matchesText(candidate?.description) ||
        matchesText(candidate?.name) ||
        matchesText(candidate?.title)
      )
    })

    if (itemIndex === -1) {
      console.error('Could not find item containing selected text')
      return
    }

    const event = new CustomEvent('openCredentialsOverlay', {
      detail: {
        sectionId,
        itemIndex,
        selectedText: text
      }
    })
    window.dispatchEvent(event)
  }, [activeSection, resume])

  const getSectionEvidence = useCallback((sectionId: string, itemCount: number): string[][] => {
    const section = sectionEvidence[sectionId] || []
    if (Array.isArray(section) && Array.isArray(section[0])) return section as string[][]
    if (Array.isArray(section) && typeof section[0] === 'string') {
      const arr: string[][] = []
      for (let i = 0; i < itemCount; i++) {
        if (Array.isArray(section[i])) arr.push(section[i] as string[])
        else if (section[i]) arr.push([section[i] as unknown as string])
        else arr.push([])
      }
      return arr
    }
    return Array.from({ length: itemCount }, () => [])
  }, [sectionEvidence])

  const handleAllFilesUpdate = useCallback((combinedFiles: FileItem[]) => {
    setAllFiles(combinedFiles)
  }, [])

  return {
    // state
    sectionOrder, setSectionOrder,
    activeSectionId, setActiveSectionId,
    sectionEvidence, setSectionEvidence,
    fileSelectorOpen, setFileSelectorOpen,
    files, setFiles,
    allFiles, setAllFiles,
    activeItemIndex, setActiveItemIndex,
    requiredSections,
    // handlers
    handleAddSection,
    handleRemoveSection,
    handleAddFiles,
    handleFilesSelected,
    handleFileDelete,
    handleFileNameChange,
    handleEvidenceSelected,
    handleRemoveFile,
    handleAddCredential,
    getSectionEvidence,
    handleAllFilesUpdate
  }
}
