import React from 'react'
import ResumeEditor from '../components/Editor'
import PrevResumesList from '../components/ResumeList'

const Resume = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [open, setOpen] = React.useState(true) //NOSONAR

  const handleClose = () => {
    setOpen(false)
  }

  return (
    <div>
      <PrevResumesList open={false} onClose={handleClose} />
      <ResumeEditor />
    </div>
  )
}

export default Resume
