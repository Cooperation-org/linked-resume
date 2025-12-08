import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'

// Set the worker source for pdfjs-dist
GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js'

/**
 * Extracts text content from a PDF file
 * @param file - The PDF file to extract text from
 * @returns Promise that resolves to the extracted text string
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    // Load the PDF document
    const loadingTask = getDocument({ data: uint8Array })
    const pdf = await loadingTask.promise

    // Extract text from all pages
    const numPages = pdf.numPages
    const textParts: string[] = []

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdf.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Combine text items from the page
      const pageText = textContent.items
        .map((item: any) => {
          // Handle both string and text item formats
          if (typeof item === 'string') {
            return item
          }
          return item.str || ''
        })
        .join(' ')

      textParts.push(pageText)
    }

    // Combine all pages with page breaks
    const fullText = textParts.join('\n\n--- Page Break ---\n\n')

    return fullText.trim()
  } catch (error) {
    console.error('Error extracting text from PDF:', error)
    
    if (error instanceof Error) {
      // Handle specific error types
      if (error.message.includes('password') || error.message.includes('encrypted')) {
        throw new Error('This PDF is password-protected. Please provide an unencrypted PDF.')
      }
      if (error.message.includes('Invalid PDF')) {
        throw new Error('Invalid PDF file. Please ensure the file is a valid PDF document.')
      }
      throw new Error(`Failed to extract text from PDF: ${error.message}`)
    }
    
    throw new Error('Failed to extract text from PDF. Please ensure the file is a valid PDF document.')
  }
}

