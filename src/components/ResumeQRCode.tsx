import React, { useEffect, useState } from 'react'
import { Box, Typography } from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import { useLocation, useParams } from 'react-router-dom'

interface QRCodeComponentProps {
  size: number
  bgColor: string
  fgColor: string
  forcedId?: string // Added this prop to force a specific ID
  onLinkGenerated?: (link: string, isValid: boolean) => void
}

const ResumeQRCode: React.FC<QRCodeComponentProps> = ({
  size,
  bgColor,
  fgColor,
  forcedId,
  onLinkGenerated
}) => {
  const [qrLink, setQrLink] = useState<string>('')
  const [hasValidId, setHasValidId] = useState<boolean>(false)
  const location = useLocation()
  const { id } = useParams<{ id?: string }>()

  useEffect(() => {
    // If forcedId is provided, use it directly and ignore URL params
    if (forcedId) {
      const link = `${process.env.REACT_APP_SERVER_URL}/api/credential-raw/${forcedId}`
      setQrLink(link)
      setHasValidId(true)

      if (onLinkGenerated) {
        onLinkGenerated(link, true)
      }
      return
    }

    // Otherwise, determine the ID from the URL as before
    const pathParts = location.pathname.split('/')
    const isViewRoute = pathParts.includes('view')
    const hasId =
      !!id || (pathParts.length > 0 && pathParts[pathParts.length - 1] !== 'view')

    const isValid = isViewRoute && hasId
    setHasValidId(isValid)

    if (isViewRoute && hasId) {
      // If we have an ID, use it in the QR link
      const resumeId = id || pathParts[pathParts.length - 1]
      const link = `${process.env.REACT_APP_SERVER_URL}/api/credential-raw/${resumeId}`
      setQrLink(link)

      // Notify parent component about the generated link and validity
      if (onLinkGenerated) {
        onLinkGenerated(link, isValid)
      }
    } else {
      // Otherwise set empty string that will trigger the message display
      setQrLink('')
      if (onLinkGenerated) {
        onLinkGenerated('', false)
      }
    }
  }, [location.pathname, id, onLinkGenerated, forcedId])

  if (!hasValidId) {
    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          width: '100%',
          backgroundColor: bgColor
        }}
      >
        <Typography
          variant='caption'
          align='center'
          sx={{
            color: fgColor,
            fontSize: size > 50 ? '10px' : '8px',
            padding: '4px'
          }}
        >
          No verifiable version of the resume is created yet
        </Typography>
      </Box>
    )
  }

  return (
    <QRCodeSVG value={qrLink} size={size} level='L' bgColor={bgColor} fgColor={fgColor} />
  )
}

export default ResumeQRCode
