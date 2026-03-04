import React, { ReactNode } from 'react'
import { Box, Typography } from '@mui/material'
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import { BlueVerifiedBadge } from '../../assets/svgs'
import {
  getAllCredentialsFromLink,
  getCredentialName,
  getPortfolioFromCredentialLink
} from '../../utils/credentialParsingUtils'

export function openCredentialDialog(
  credObj: any,
  fileId: string,
  setDialogCredObj: any,
  setDialogImageUrl: any,
  setOpenCredDialog: any
) {
  const credentialToShow = credObj || {}
  credentialToShow.credentialId = fileId

  setDialogCredObj(credentialToShow)
  setDialogImageUrl(null)
  setOpenCredDialog(true)
}

export function renderSectionCredentials(
  credentialLink: string | string[] | undefined,
  setDialogCredObj: any,
  setDialogImageUrl: any,
  setOpenCredDialog: any
): ReactNode {
  const dedupedCreds = getAllCredentialsFromLink(credentialLink)

  if (dedupedCreds.length === 0) return null

  return (
    <Box
      className='rs-avoid-break'
      sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}
    >
      {dedupedCreds.map(({ credObj, credId, fileId }, idx) => (
        <Typography
          key={fileId || idx}
          variant='body2'
          sx={{
            color: '#2563EB',
            textDecoration: 'underline',
            fontWeight: 600,
            display: 'inline-flex',
            alignItems: 'center',
            mr: 2,
            cursor: 'pointer',
            gap: '6px',
            '&:hover': { opacity: 0.85 },
            '&:focus-visible': { outline: '2px solid #2563EB', outlineOffset: '2px' }
          }}
          onClick={() => {
            openCredentialDialog(
              credObj,
              fileId,
              setDialogCredObj,
              setDialogImageUrl,
              setOpenCredDialog
            )
          }}
        >
          <WorkspacePremiumIcon
            sx={{ fontSize: 16, color: '#2563EB', flex: '0 0 auto' }}
          />
          {credObj &&
            (credObj.credentialStatus === 'verified' ||
              credObj.credentialStatus?.status === 'verified') && (
              <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                <BlueVerifiedBadge />
              </span>
            )}
          {credObj && getCredentialName(credObj) !== 'Credential'
            ? getCredentialName(credObj)
            : `External Credential ${fileId.substring(0, 8)}...`}
        </Typography>
      ))}
    </Box>
  )
}

export function renderPortfolio(portfolio: any[] | undefined) {
  if (!portfolio || !Array.isArray(portfolio) || portfolio.length === 0) return null
  return (
    <ul style={{ paddingLeft: 20, margin: 0 }}>
      {portfolio.map((item, idx) =>
        item.name && item.url ? (
          <li key={idx} style={{ marginBottom: 2 }}>
            <a
              href={item.url}
              target='_blank'
              rel='noopener noreferrer'
              style={{ color: '#2563EB', textDecoration: 'underline' }}
            >
              {item.name}
            </a>
          </li>
        ) : null
      )}
    </ul>
  )
}

export function renderAttachedFiles(attachedFiles: string[] | undefined) {
  if (!attachedFiles || attachedFiles.length === 0) return null

  return (
    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
      {attachedFiles.map((fileUrl: string, idx: number) => {
        let fileName = `Attachment ${idx + 1}`
        try {
          if (fileUrl.includes('drive.google.com')) {
            fileName = `File ${idx + 1}`
          } else {
            const urlParts = fileUrl.split('/')
            const lastPart = urlParts[urlParts.length - 1]
            if (lastPart && !lastPart.includes('?')) {
              fileName = decodeURIComponent(lastPart)
            }
          }
        } catch (e) {
          console.error('Error parsing file URL:', e)
        }

        return (
          <Box
            key={`file-${idx}`}
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              '&:hover': { opacity: 0.8 }
            }}
            onClick={() => window.open(fileUrl, '_blank')}
          >
            <AttachFileIcon sx={{ fontSize: 16, color: '#2563EB' }} />
            <Typography
              variant='body2'
              sx={{
                color: '#2563EB',
                textDecoration: 'underline',
                fontSize: '14px',
                fontFamily: 'Arial'
              }}
            >
              {fileName}
            </Typography>
          </Box>
        )
      })}
    </Box>
  )
}
