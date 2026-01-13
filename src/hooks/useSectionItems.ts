import { useCallback, useEffect, useRef, useState } from 'react'
import { useAppDispatch } from '../redux/hooks'
import { updateSection } from '../redux/slices/resume'
import { SectionListItem } from '../types/resumeSections'

type UseSectionItemsParams = {
  sectionId: string
  initialItems: SectionListItem[]
  debounceMs?: number
}

export const useSectionItems = ({
  sectionId,
  initialItems,
  debounceMs = 500
}: UseSectionItemsParams) => {
  const dispatch = useAppDispatch()
  const [items, setItems] = useState<SectionListItem[]>(initialItems || [])
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // keep local state in sync with upstream changes
  useEffect(() => {
    setItems(initialItems || [])
  }, [initialItems])

  const flushUpdate = useCallback(
    (next: SectionListItem[]) => {
      dispatch(updateSection({ sectionId, content: { items: next } }))
    },
    [dispatch, sectionId]
  )

  const updateItems = useCallback(
    (updater: (prev: SectionListItem[]) => SectionListItem[]) => {
      setItems(prev => {
        const next = updater(prev)
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
        timeoutRef.current = setTimeout(() => flushUpdate(next), debounceMs)
        return next
      })
    },
    [debounceMs, flushUpdate]
  )

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    },
    []
  )

  return { items, setItems, updateItems }
}

export default useSectionItems

