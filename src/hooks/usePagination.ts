import React, { useState, useRef, useLayoutEffect, ReactNode } from 'react'
import { Box } from '@mui/material'

const PAGE_SIZE = { width: '210mm', height: '297mm' }
const HEADER_HEIGHT_PX = 150
const FOOTER_HEIGHT_PX = 60 // Footer height including padding (60px + 30px py)
const CONTENT_PADDING_TOP = 20
const CONTENT_PADDING_BOTTOM = 15

// Helper function to convert mm to px. Needs to match the one in resumePreview.tsx or be imported.
// A simple generic implementation or imported from utils if available.
const mmToPx = (mm: number) => {
  // Standard conversion assuming 96 DPI: 1 inch = 25.4 mm = 96 px -> 1 mm = 3.7795275591 px
  return mm * 3.78; 
};

// We need a proxy/stand-in for SectionTitle to check against, or simply check component name
// Since SectionTitle is defined in resumePreview.tsx, we can't easily import it here if it's there.
// Instead, we will pass a helper function `isSectionTitle` or check `type.name === 'SectionTitle'`

export function usePagination(content: ReactNode[], isSectionTitle?: (element: React.ReactElement) => boolean) {
  const [pages, setPages] = useState<ReactNode[][]>([])
  const measureRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    let timeoutId: NodeJS.Timeout

    const measureAndPaginate = () => {
      if (!measureRef.current) return

      const fullPageHeightPx = mmToPx(parseFloat(PAGE_SIZE.height))
      const firstPageContentMaxHeightPx =
        fullPageHeightPx -
        HEADER_HEIGHT_PX -
        FOOTER_HEIGHT_PX -
        CONTENT_PADDING_TOP -
        CONTENT_PADDING_BOTTOM
      const subsequentPageContentMaxHeightPx =
        fullPageHeightPx -
        60 -
        FOOTER_HEIGHT_PX -
        CONTENT_PADDING_TOP -
        CONTENT_PADDING_BOTTOM

      measureRef.current.style.width = PAGE_SIZE.width
      measureRef.current.style.padding = `${CONTENT_PADDING_TOP}px 50px ${CONTENT_PADDING_BOTTOM}px`

      const contentElements = Array.from(measureRef.current.children)
      if (contentElements.length === 0) {
        setPages([[]])
        return
      }

      const contentHeights = contentElements.map((el, idx) => {
        el.getBoundingClientRect()
        const computedStyle = window.getComputedStyle(el)
        const marginTop = parseFloat(computedStyle.marginTop)
        const marginBottom = parseFloat(computedStyle.marginBottom)
        const height = (el as HTMLElement).offsetHeight + marginTop + marginBottom
        return height
      })

      let currentPage: ReactNode[] = []
      let currentHeight = 0
      const paginated: ReactNode[][] = []
      const SAFETY_MARGIN = 50

      for (let i = 0; i < content.length; i++) {
        const element = content[i]
        const elementHeight = contentHeights[i] || 0
        const currentPageIndex = paginated.length
        const contentMaxHeightPx =
          currentPageIndex === 0
            ? firstPageContentMaxHeightPx
            : subsequentPageContentMaxHeightPx
        const effectiveMaxHeight = contentMaxHeightPx - SAFETY_MARGIN

        // --- PATCH: Prevent orphaned section titles ---
        const checkSectionTitle = isSectionTitle || ((el: React.ReactElement) => {
            // Default naive check if isSectionTitle is not provided.
            return el.props?.children && React.isValidElement(el.props.children) && (el.props.children.type as any)?.name === 'SectionTitle';
        })
        
        const isElementSectionTitle =
          React.isValidElement(element) &&
          element.type === Box &&
          checkSectionTitle(element);

        if (isElementSectionTitle && i + 1 < content.length) {
          const nextElementHeight = contentHeights[i + 1] || 0
          if (currentHeight + elementHeight + nextElementHeight > effectiveMaxHeight) {
            if (currentPage.length > 0) {
              paginated.push([...currentPage])
              currentPage = []
              currentHeight = 0
            }
          }
        }
        // --- END PATCH ---

        if (currentHeight > 0 && currentHeight + elementHeight > effectiveMaxHeight) {
          paginated.push([...currentPage])
          currentPage = []
          currentHeight = 0
        }
        currentPage.push(element)
        currentHeight += elementHeight
      }
      if (currentPage.length > 0) {
        paginated.push(currentPage)
      }
      if (paginated.length === 0) {
        paginated.push([])
      }
      setPages(paginated)
    }
    
    timeoutId = setTimeout(measureAndPaginate, 300)
    window.addEventListener('resize', measureAndPaginate)
    return () => {
      clearTimeout(timeoutId)
      window.removeEventListener('resize', measureAndPaginate)
    }
  }, [content, isSectionTitle])

  return { pages, measureRef }
}
