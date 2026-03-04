import { useState, useCallback } from 'react'
import React from 'react'
import { pdf } from '@react-pdf/renderer'
import { ResumePDFDocument, generateQRCodeDataURL, getVerificationUrl } from '../components/pdf'
import { HtmlGenerator, parse } from 'latex.js'
import html2pdf from 'html2pdf.js'
import resumeToLatex from '../tools/resumeToLatex'
import { RecommendationEntry } from '../services/recommendationService'

export interface SnackbarState {
  open: boolean
  message: string
  severity: 'success' | 'info' | 'error'
}

interface UseResumeExportsReturn {
  isLatexPdfGenerating: boolean
  snackbar: SnackbarState
  setSnackbar: React.Dispatch<React.SetStateAction<SnackbarState>>
  exportResumeToPDF: () => Promise<void>
  handleCopyLink: () => Promise<void>
  handleAskForRecommendation: () => void
  handleDownloadJson: () => void
  handleDownloadLatexSource: () => void
  exportLatexPdf: () => Promise<void>
}

/**
 * Encapsulates all export/share actions for PreviewPageFromDrive.
 */
export function useResumeExports(
  resumeData: Resume | null,
  resumeId: string | undefined,
  recommendations: RecommendationEntry[]
): UseResumeExportsReturn {
  const [isLatexPdfGenerating, setIsLatexPdfGenerating] = useState(false)
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: '',
    severity: 'success'
  })

  const latexSource = resumeData ? resumeToLatex(resumeData) : ''

  const exportResumeToPDF = useCallback(async () => {
    if (!resumeData) return
    try {
      let qrCodeDataUrl: string | undefined
      if (resumeId) {
        const verificationUrl = getVerificationUrl(resumeId)
        qrCodeDataUrl = await generateQRCodeDataURL(verificationUrl)
      }
      const blob = await pdf(
        <ResumePDFDocument
          resume={resumeData}
          recommendations={recommendations}
          resumeId={resumeId}
          qrCodeDataUrl={qrCodeDataUrl}
        />
      ).toBlob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${resumeData.contact?.fullName ?? 'Resume'}_Resume.pdf`
      document.body.appendChild(link)
      link.click()
      URL.revokeObjectURL(url)
      document.body.removeChild(link)
      setSnackbar({ open: true, message: 'PDF downloaded successfully', severity: 'success' })
    } catch (err) {
      console.error('Error generating PDF:', err)
      setSnackbar({ open: true, message: 'Failed to generate PDF', severity: 'error' })
    }
  }, [resumeData, resumeId, recommendations])

  const handleCopyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setSnackbar({ open: true, message: 'Link copied to clipboard', severity: 'success' })
    } catch {
      setSnackbar({ open: true, message: 'Failed to copy link', severity: 'error' })
    }
  }, [])

  const handleAskForRecommendation = useCallback(() => {
    if (!resumeId) return
    const recommendationFormUrl = `${window.location.origin}/resume/recommend/${resumeId}`
    const resumeLink = window.location.href
    const userEmail = resumeData?.contact?.email || ''
    const fullName = resumeData?.contact?.fullName || 'my resume'
    const subject = encodeURIComponent(`Recommendation request for ${fullName}`)
    const body = encodeURIComponent(
      `Hi there,\n\nCould you please share a quick recommendation for my resume? You can review my resume here:\n${resumeLink}\n\nPlease submit your recommendation using this form:\n${recommendationFormUrl}\n\nThank you!\n${fullName}${
        userEmail ? `\n\nYou can reply to me at: ${userEmail}` : ''
      }`
    )
    window.location.href = `mailto:?subject=${subject}&body=${body}`
  }, [resumeId, resumeData])

  const handleDownloadJson = useCallback(() => {
    if (!resumeData) return
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${resumeData.contact?.fullName ?? 'Resume'}.json`
    document.body.appendChild(a)
    a.click()
    URL.revokeObjectURL(a.href)
    document.body.removeChild(a)
  }, [resumeData])

  const handleDownloadLatexSource = useCallback(() => {
    if (!latexSource) return
    const sourceBlob = new Blob([latexSource], { type: 'application/x-tex' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(sourceBlob)
    const baseName = (resumeData?.contact?.fullName || 'Resume').replace(/\s+/g, '_')
    link.download = `${baseName}.tex`
    document.body.appendChild(link)
    link.click()
    URL.revokeObjectURL(link.href)
    document.body.removeChild(link)
  }, [latexSource, resumeData])

  const exportLatexPdf = useCallback(async () => {
    if (!latexSource.trim()) return
    setIsLatexPdfGenerating(true)
    let tempContainer: HTMLDivElement | null = null
    try {
      const generator = parse(latexSource, {
        generator: new HtmlGenerator({ hyphenate: false, documentClass: 'article' })
      })
      tempContainer = document.createElement('div')
      tempContainer.style.cssText =
        'position:fixed;top:-10000px;left:0;width:794px;background-color:#fff'
      tempContainer.className = 'latex-export-container'
      tempContainer.innerHTML = generator.htmlDocument().body.innerHTML
      document.body.appendChild(tempContainer)

      const baseName = (resumeData?.contact?.fullName || 'Resume').replace(/\s+/g, '_')
      await html2pdf()
        .set({
          margin: [10, 10, 10, 10],
          filename: `${baseName}_LaTeX.pdf`,
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        })
        .from(tempContainer)
        .save()
      setSnackbar({ open: true, message: 'LaTeX PDF downloaded', severity: 'success' })
    } catch (err) {
      console.error('Failed to export LaTeX PDF', err)
      setSnackbar({ open: true, message: 'Failed to export LaTeX PDF', severity: 'error' })
    } finally {
      if (tempContainer?.parentNode) tempContainer.parentNode.removeChild(tempContainer)
      setIsLatexPdfGenerating(false)
    }
  }, [latexSource, resumeData])

  return {
    isLatexPdfGenerating,
    snackbar,
    setSnackbar,
    exportResumeToPDF,
    handleCopyLink,
    handleAskForRecommendation,
    handleDownloadJson,
    handleDownloadLatexSource,
    exportLatexPdf
  }
}
