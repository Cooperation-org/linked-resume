import React, { useEffect, useMemo, useState } from 'react'
import {
  Box,
  Paper,
  Stack,
  Tabs,
  Tab,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material'
import ContentCopyIcon from '@mui/icons-material/ContentCopy'
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'
import { useAppSelector } from '../redux/hooks'
import { RootState } from '../redux/store'
import resumeToLatex from '../tools/resumeToLatex'
import { HtmlGenerator, parse } from 'latex.js'

import '../styles/latexPreview.css'

type PreviewTab = 'rendered' | 'source'

interface LaTeXResumePreviewProps {
  data?: Resume | null
}

const LaTeXResumePreview: React.FC<LaTeXResumePreviewProps> = ({ data }) => {
  const resumeFromStore = useAppSelector(
    (state: RootState) => state.resumeEditor.resume
  )
  const resume = data ?? resumeFromStore
  const latexSource = useMemo(() => (resume ? resumeToLatex(resume) : ''), [resume])
  const [compiledHtml, setCompiledHtml] = useState('')
  const [compileError, setCompileError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<PreviewTab>('rendered')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!latexSource.trim()) {
      setCompiledHtml('')
      setCompileError(null)
      return
    }
    let cancelled = false
    const compileTimeout = setTimeout(() => {
      try {
        const generator = parse(latexSource, {
          generator: new HtmlGenerator({
            hyphenate: false,
            documentClass: 'article'
          })
        })
        const doc = generator.htmlDocument()
        if (!cancelled) {
          setCompiledHtml(doc.body.innerHTML)
          setCompileError(null)
        }
      } catch (err) {
        if (!cancelled) {
          setCompiledHtml('')
          const errorMessage =
            err instanceof Error ? err.message : 'Unable to compile LaTeX.'
          console.error('LaTeX compilation error:', err)
          console.error('LaTeX source:', latexSource.substring(0, 500))
          setCompileError(errorMessage)
        }
      }
    }, 100) // Small delay to debounce rapid updates

    return () => {
      cancelled = true
      clearTimeout(compileTimeout)
    }
  }, [latexSource])

  const handleCopy = async () => {
    if (!latexSource) return
    try {
      await navigator.clipboard.writeText(latexSource)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch (err) {
      console.error('Failed to copy LaTeX source', err)
    }
  }

  const handleTabChange = (_: React.SyntheticEvent, nextValue: PreviewTab) => {
    setActiveTab(nextValue)
  }

  return (
    <Paper
      id='latex-preview'
      elevation={1}
      sx={{
        width: '100%',
        maxWidth: '900px',
        mx: 'auto',
        my: 4,
        p: { xs: 2, md: 3 },
        display: 'flex',
        flexDirection: 'column',
        gap: 2
      }}
    >
      <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Box>
          <Typography variant='h6'>LaTeX Preview</Typography>
          <Typography variant='body2' color='text.secondary'>
            {resume?.contact?.fullName ?? 'Resume'} · TeX template
          </Typography>
        </Box>
        <Tooltip title={copied ? 'Copied!' : 'Copy LaTeX source'}>
          <span>
            <IconButton
              size='small'
              onClick={handleCopy}
              disabled={!latexSource}
              color={copied ? 'success' : 'default'}
            >
              <ContentCopyIcon fontSize='small' />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label='LaTeX preview mode'
        variant='fullWidth'
      >
        <Tab label='Rendered' value='rendered' />
        <Tab label='LaTeX Source' value='source' />
      </Tabs>

      {compileError && (
        <Stack direction='row' alignItems='center' spacing={1} color='error.main'>
          <ErrorOutlineIcon fontSize='small' />
          <Typography variant='body2'>{compileError}</Typography>
        </Stack>
      )}

      {activeTab === 'rendered' ? (
        <Box
          sx={{
            minHeight: 640,
            borderRadius: 2,
            border: theme => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            overflow: 'auto',
            p: { xs: 2, md: 3 }
          }}
        >
          {compiledHtml ? (
            <Box
              className='latexjs-preview'
              sx={{
                '& p': { mb: 1.5 },
                color: '#1f2933'
              }}
              dangerouslySetInnerHTML={{ __html: compiledHtml }}
            />
          ) : (
            <Typography variant='body2' color='text.secondary'>
              {resume
                ? 'Adjust any form field to regenerate the LaTeX output instantly.'
                : 'Load a resume to view the LaTeX preview.'}
            </Typography>
          )}
        </Box>
      ) : (
        <Box
          component='pre'
          sx={{
            bgcolor: '#0b1727',
            color: '#f8fafc',
            borderRadius: 2,
            p: 2,
            fontFamily:
              'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono',
            fontSize: '0.85rem',
            lineHeight: 1.6,
            overflow: 'auto',
            maxHeight: '70vh'
          }}
        >
          {latexSource || '% No resume data available'}
        </Box>
      )}
    </Paper>
  )
}

export default LaTeXResumePreview
