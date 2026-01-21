import React from 'react'
import { Box, Typography, Tooltip } from '@mui/material'
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'
import ShieldIcon from '@mui/icons-material/Shield'
import RecommendIcon from '@mui/icons-material/Recommend'

interface TrustScoreProps {
  resume: Resume
  recommendations?: number
  isSigned?: boolean
  compact?: boolean
}

interface TrustStats {
  totalItems: number
  verifiedItems: number
  percentage: number
  level: 'verified' | 'partial' | 'unverified'
  label: string
  color: string
  bgColor: string
}

/**
 * Calculate trust score from resume data
 */
export const calculateTrustStats = (
  resume: Resume,
  recommendationCount: number = 0,
  isSigned: boolean = false
): TrustStats => {
  let totalItems = 0
  let verifiedItems = 0

  // Helper to check if an item is verified
  const isVerified = (item: any): boolean => {
    return (
      item?.verificationStatus === 'verified' ||
      (item?.credentialLink && item.credentialLink.length > 0)
    )
  }

  // Count experience items
  if (resume.experience?.items?.length) {
    totalItems += resume.experience.items.length
    verifiedItems += resume.experience.items.filter(isVerified).length
  }

  // Count education items
  if (resume.education?.items?.length) {
    totalItems += resume.education.items.length
    verifiedItems += resume.education.items.filter(isVerified).length
  }

  // Count skills
  if (resume.skills?.items?.length) {
    totalItems += resume.skills.items.length
    verifiedItems += resume.skills.items.filter(isVerified).length
  }

  // Count certifications
  if (resume.certifications?.items?.length) {
    totalItems += resume.certifications.items.length
    verifiedItems += resume.certifications.items.filter(isVerified).length
  }

  // Count projects
  if (resume.projects?.items?.length) {
    totalItems += resume.projects.items.length
    verifiedItems += resume.projects.items.filter(isVerified).length
  }

  // Count volunteer work
  if (resume.volunteerWork?.items?.length) {
    totalItems += resume.volunteerWork.items.length
    verifiedItems += resume.volunteerWork.items.filter(isVerified).length
  }

  // Count professional affiliations
  if (resume.professionalAffiliations?.items?.length) {
    totalItems += resume.professionalAffiliations.items.length
    verifiedItems += resume.professionalAffiliations.items.filter(isVerified).length
  }

  // Bonus: recommendations count as verified items
  if (recommendationCount > 0) {
    totalItems += recommendationCount
    verifiedItems += recommendationCount
  }

  // Bonus: signed resume adds to trust
  if (isSigned) {
    totalItems += 1
    verifiedItems += 1
  }

  const percentage = totalItems > 0 ? Math.round((verifiedItems / totalItems) * 100) : 0

  let level: 'verified' | 'partial' | 'unverified'
  let label: string
  let color: string
  let bgColor: string

  if (percentage >= 70) {
    level = 'verified'
    label = 'Verified Resume'
    color = '#059669' // green-600
    bgColor = '#D1FAE5' // green-100
  } else if (percentage >= 30) {
    level = 'partial'
    label = 'Partially Verified'
    color = '#D97706' // amber-600
    bgColor = '#FEF3C7' // amber-100
  } else {
    level = 'unverified'
    label = 'Unverified'
    color = '#6B7280' // gray-500
    bgColor = '#F3F4F6' // gray-100
  }

  return {
    totalItems,
    verifiedItems,
    percentage,
    level,
    label,
    color,
    bgColor
  }
}

/**
 * Trust Score Badge Component - Shows at-a-glance credibility indicator
 */
const TrustScoreBadge: React.FC<TrustScoreProps> = ({
  resume,
  recommendations = 0,
  isSigned = false,
  compact = false
}) => {
  const stats = calculateTrustStats(resume, recommendations, isSigned)

  const tooltipContent = (
    <Box sx={{ p: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
        Trust Score: {stats.percentage}%
      </Typography>
      <Typography variant="caption" sx={{ display: 'block' }}>
        {stats.verifiedItems} of {stats.totalItems} claims verified
      </Typography>
      {recommendations > 0 && (
        <Typography variant="caption" sx={{ display: 'block' }}>
          {recommendations} recommendation{recommendations > 1 ? 's' : ''}
        </Typography>
      )}
      {isSigned && (
        <Typography variant="caption" sx={{ display: 'block', color: '#059669' }}>
          Digitally signed
        </Typography>
      )}
    </Box>
  )

  if (compact) {
    return (
      <Tooltip title={tooltipContent} arrow placement="bottom">
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            px: 1,
            py: 0.25,
            borderRadius: '12px',
            backgroundColor: stats.bgColor,
            border: `1px solid ${stats.color}`,
            cursor: 'pointer'
          }}
        >
          {stats.level === 'verified' ? (
            <VerifiedUserIcon sx={{ fontSize: 14, color: stats.color }} />
          ) : (
            <ShieldIcon sx={{ fontSize: 14, color: stats.color }} />
          )}
          <Typography
            sx={{
              fontSize: '11px',
              fontWeight: 600,
              color: stats.color,
              lineHeight: 1
            }}
          >
            {stats.percentage}%
          </Typography>
        </Box>
      </Tooltip>
    )
  }

  return (
    <Tooltip title={tooltipContent} arrow placement="bottom">
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 1.5,
          py: 0.5,
          borderRadius: '20px',
          backgroundColor: stats.bgColor,
          border: `1.5px solid ${stats.color}`,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: `0 2px 8px ${stats.color}40`
          }
        }}
      >
        {stats.level === 'verified' ? (
          <VerifiedUserIcon sx={{ fontSize: 18, color: stats.color }} />
        ) : (
          <ShieldIcon sx={{ fontSize: 18, color: stats.color }} />
        )}
        <Typography
          sx={{
            fontSize: '13px',
            fontWeight: 700,
            color: stats.color,
            lineHeight: 1.2
          }}
        >
          {stats.label}
        </Typography>
        {recommendations > 0 && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.3,
              ml: 0.5,
              pl: 1,
              borderLeft: `1px solid ${stats.color}40`
            }}
          >
            <RecommendIcon sx={{ fontSize: 14, color: stats.color }} />
            <Typography
              sx={{
                fontSize: '12px',
                fontWeight: 600,
                color: stats.color
              }}
            >
              {recommendations}
            </Typography>
          </Box>
        )}
      </Box>
    </Tooltip>
  )
}

export default TrustScoreBadge

