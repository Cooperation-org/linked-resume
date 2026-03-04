import { useCallback, useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { updateSection } from '../redux/slices/resume'
import { VerifiableItem, SelectedCredential } from '../components/ResumeEditor/types/section.types'
import { buildCredentialLinks, dedupeCredentials, resolveFileUrl } from '../components/ResumeEditor/utils/sectionUtils'

interface UseSectionItemsOptions<T extends VerifiableItem> {
  /** Redux section key (e.g. 'education', 'experience') */
  sectionId: string
  /** Picks the item array from resume state */
  reduxSelector: (resume: any) => T[] | undefined | null
  /** Maps a raw Redux record to a typed T */
  mapFromRedux: (item: any) => T
  /** Used when adding a blank new item */
  emptyItem: () => T
  /** Initial value for useDuration per-item toggle (default: false) */
  defaultUseDuration?: boolean
}

interface UseSectionItemsReturn<T extends VerifiableItem> {
  items: T[]
  setItems: React.Dispatch<React.SetStateAction<T[]>>
  expandedItems: Record<number, boolean>
  toggleExpanded: (index: number) => void
  useDuration: boolean[]
  setUseDuration: React.Dispatch<React.SetStateAction<boolean[]>>
  debouncedReduxUpdate: (items: T[]) => void
  handleAddAnotherItem: () => void
  handleDeleteItem: (index: number, onDelete?: () => void) => void
  handleOpenCredentialsOverlay: (index: number) => void
  handleCredentialSelect: (selectedIDs: string[], vcs: any[]) => void
  handleRemoveCredential: (itemIndex: number, credIndex: number) => void
  syncEvidence: (evidence: string[][], allFiles: Array<{ id: string; url?: string; googleId?: string }>) => void
  showCredentialsOverlay: boolean
  setShowCredentialsOverlay: React.Dispatch<React.SetStateAction<boolean>>
  activeSectionIndex: number | null
  reduxUpdateTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
}

export function useSectionItems<T extends VerifiableItem>(
  options: UseSectionItemsOptions<T>
): UseSectionItemsReturn<T> {
  const { sectionId, reduxSelector, mapFromRedux, emptyItem, defaultUseDuration = false } = options

  const dispatch = useDispatch()
  const resume = useSelector((state: any) => state.resume.resume)

  const reduxUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const initialLoadRef = useRef(true)

  const [items, setItems] = useState<T[]>([emptyItem()])
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({ 0: true })
  const [useDuration, setUseDuration] = useState<boolean[]>([defaultUseDuration])
  const [showCredentialsOverlay, setShowCredentialsOverlay] = useState(false)
  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(null)

  // ── Debounced Redux dispatch ──────────────────────────────────────────────
  const debouncedReduxUpdate = useCallback(
    (updated: T[]) => {
      if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
      reduxUpdateTimeoutRef.current = setTimeout(() => {
        dispatch(updateSection({ sectionId, content: { items: updated } }))
      }, 500)
    },
    [dispatch, sectionId]
  )

  // ── Load from Redux on mount / when Redux changes  ────────────────────────
  useEffect(() => {
    const reduxItems = reduxSelector(resume)
    if (!reduxItems || reduxItems.length === 0) return

    const typed = reduxItems.map(mapFromRedux) as T[]
    const needUpdate = initialLoadRef.current || typed.length !== items.length
    if (!needUpdate) return

    initialLoadRef.current = false
    setItems(typed)
    setUseDuration(typed.map(() => defaultUseDuration))

    if (typed.length !== Object.keys(expandedItems).length) {
      const initExp: Record<number, boolean> = {}
      typed.forEach((_, i) => {
        initExp[i] = i < Object.keys(expandedItems).length ? expandedItems[i] : true
      })
      setExpandedItems(initExp)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resume])

  // ── Cleanup debounce on unmount ───────────────────────────────────────────
  useEffect(() => {
    return () => {
      if (reduxUpdateTimeoutRef.current) clearTimeout(reduxUpdateTimeoutRef.current)
    }
  }, [])

  // ── Global openCredentialsOverlay event ──────────────────────────────────
  useEffect(() => {
    const handler = (event: CustomEvent) => {
      const { sectionId: evtSectionId, itemIndex } = event.detail
      if (evtSectionId === sectionId) {
        setActiveSectionIndex(itemIndex)
        setShowCredentialsOverlay(true)
      }
    }
    window.addEventListener('openCredentialsOverlay', handler as EventListener)
    return () => window.removeEventListener('openCredentialsOverlay', handler as EventListener)
  }, [sectionId])

  // ── CRUD ─────────────────────────────────────────────────────────────────
  const toggleExpanded = useCallback((index: number) => {
    setExpandedItems(prev => ({ ...prev, [index]: !prev[index] }))
  }, [])

  const handleAddAnotherItem = useCallback(() => {
    const newItem = emptyItem()
    setItems(prev => {
      const updated = [...prev, newItem]
      dispatch(updateSection({ sectionId, content: { items: updated } }))
      return updated
    })
    setUseDuration(prev => [...prev, defaultUseDuration])
    setExpandedItems(prev => ({ ...prev, [items.length]: true }))
  }, [emptyItem, dispatch, sectionId, items.length, defaultUseDuration])

  const handleDeleteItem = useCallback(
    (index: number, onDelete?: () => void) => {
      if (items.length <= 1) {
        onDelete?.()
        return
      }
      setItems(prev => {
        const updated = prev.filter((_, i) => i !== index)
        dispatch(updateSection({ sectionId, content: { items: updated } }))
        return updated
      })
      setUseDuration(prev => prev.filter((_, i) => i !== index))
      setExpandedItems(prev => {
        const newExp: Record<number, boolean> = {}
        items
          .filter((_, i) => i !== index)
          .forEach((_, i) => {
            newExp[i] = prev[i + (i >= index ? 1 : 0)] || false
          })
        return newExp
      })
    },
    [items, dispatch, sectionId]
  )

  // ── Credentials ───────────────────────────────────────────────────────────
  const handleOpenCredentialsOverlay = useCallback((index: number) => {
    setActiveSectionIndex(index)
    setShowCredentialsOverlay(true)
  }, [])

  const handleCredentialSelect = useCallback(
    (selectedIDs: string[], vcs: any[]) => {
      if (activeSectionIndex !== null && selectedIDs.length > 0) {
        if (reduxUpdateTimeoutRef.current) {
          clearTimeout(reduxUpdateTimeoutRef.current)
          reduxUpdateTimeoutRef.current = null
        }

        const selected: SelectedCredential[] = selectedIDs.map(id => {
          const credential = vcs?.find(
            (c: any) => (c?.originalItem?.id || c.id) === id
          )
          const fileId =
            credential?.originalItem?.id && !credential.originalItem.id.startsWith('urn:')
              ? credential.originalItem.id
              : credential?.id && !credential.id.startsWith('urn:')
              ? credential.id
              : id
          return {
            id: fileId,
            fileId,
            url: '',
            name:
              credential?.credentialSubject?.achievement?.[0]?.name ||
              `Credential ${id.substring(0, 5)}...`,
            vc: credential
          }
        })

        const deduped = dedupeCredentials(selected)
        const credLinks = buildCredentialLinks(deduped)

        setItems(prev => {
          const updated = [...prev]
          updated[activeSectionIndex] = {
            ...updated[activeSectionIndex],
            verificationStatus: 'verified',
            credentialLink: credLinks.length ? JSON.stringify(credLinks) : '',
            selectedCredentials: deduped
          }
          dispatch(updateSection({ sectionId, content: { items: updated } }))
          return updated
        })
      }
      setShowCredentialsOverlay(false)
      setActiveSectionIndex(null)
    },
    [activeSectionIndex, dispatch, sectionId]
  )

  const handleRemoveCredential = useCallback(
    (itemIndex: number, credIndex: number) => {
      setItems(prev => {
        const updated = [...prev]
        const item = { ...updated[itemIndex] }
        const newCreds = dedupeCredentials(
          item.selectedCredentials.filter((_, i) => i !== credIndex)
        )
        item.selectedCredentials = newCreds
        if (!newCreds.length) {
          item.verificationStatus = 'unverified'
          item.credentialLink = ''
        } else {
          const credLinks = buildCredentialLinks(newCreds)
          item.credentialLink = JSON.stringify(credLinks)
        }
        updated[itemIndex] = item
        dispatch(updateSection({ sectionId, content: { items: updated } }))
        return updated
      })
    },
    [dispatch, sectionId]
  )

  // ── Evidence (file) sync ─────────────────────────────────────────────────
  const syncEvidence = useCallback(
    (
      evidence: string[][],
      allFiles: Array<{ id: string; url?: string; googleId?: string }>
    ) => {
      setItems(prev => {
        const updated = [...prev]
        let hasChanges = false
        evidence.forEach((itemFiles, index) => {
          if (updated[index] && itemFiles?.length > 0) {
            const fileUrls = itemFiles.map(id => resolveFileUrl(id, allFiles))
            if (JSON.stringify(updated[index].attachedFiles) !== JSON.stringify(fileUrls)) {
              updated[index] = { ...updated[index], attachedFiles: fileUrls }
              hasChanges = true
            }
          }
        })
        if (hasChanges) {
          dispatch(updateSection({ sectionId, content: { items: updated } }))
        }
        return hasChanges ? updated : prev
      })
    },
    [dispatch, sectionId]
  )

  return {
    items,
    setItems,
    expandedItems,
    toggleExpanded,
    useDuration,
    setUseDuration,
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
  }
}
