import QRCode from 'qrcode'

/**
 * Generates a QR code as a base64 data URL for embedding in PDFs
 * @param url The URL to encode in the QR code
 * @param size The size of the QR code in pixels
 * @returns A promise that resolves to a base64 data URL
 */
export const generateQRCodeDataURL = async (
  url: string,
  size: number = 86
): Promise<string> => {
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: size,
      margin: 0,
      color: {
        dark: '#FFFFFF', // White QR code
        light: '#2563EB' // Blue background (matching the header QR section)
      },
      errorCorrectionLevel: 'L'
    })
    return dataUrl
  } catch (error) {
    console.error('Error generating QR code:', error)
    return ''
  }
}

/**
 * Generates the verification URL for a resume
 * @param resumeId The ID of the resume
 * @returns The full verification URL
 */
export const getVerificationUrl = (resumeId: string): string => {
  const baseUrl =
    typeof window !== 'undefined'
      ? window.location.origin
      : process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000'
  return `${baseUrl}/verify/${resumeId}`
}

