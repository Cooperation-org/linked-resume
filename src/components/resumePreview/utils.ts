// Helper to render date or duration for sections
export function renderDateOrDuration({
  duration,
  startDate,
  endDate,
  currentlyVolunteering,
  noExpiration,
  issueDate
}: {
  duration?: string
  startDate?: string
  endDate?: string
  currentlyVolunteering?: boolean
  noExpiration?: boolean
  issueDate?: string
}) {
  if (duration) {
    return duration
  }
  if (noExpiration) {
    return 'No Expiration'
  }
  if (issueDate) {
    return `Issued on ${issueDate}`
  }
  const start = startDate ?? ''
  let end = endDate ?? ''
  if (!endDate && (currentlyVolunteering || start)) {
    end = 'Present'
  }
  if (!start && !end) {
    return ''
  }
  return `${start}${start ? ' - ' : ''}${end}`
}
