import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Downloads an HTML element as a PDF.
 * @param elementId The ID of the HTML element to convert into a PDF.
 * @param fileName The name of the downloaded PDF file.
 * USAGE: 
      <div id="pdf-content">
        <h1>My PDF Content</h1>
        <p>This content will be captured and downloaded as a PDF.</p>
      </div>
      <button onClick={() => downloadHtmlAsPDF("pdf-content", "MyFile.pdf")}>
        Download as PDF
      </button>
 */
export const downloadHtmlAsPDF = async (
  elementId: string,
  fileName: string = 'download.pdf'
) => {
  const element = document.getElementById(elementId)

  if (!element) {
    console.error(`Element with ID "${elementId}" not found.`)
    return
  }

  try {
    const canvas = await html2canvas(element)
    const imgData = canvas.toDataURL('image/png')

    const pdf = new jsPDF('p', 'mm', 'a4')
    const imgWidth = 210 // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width

    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(fileName)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
