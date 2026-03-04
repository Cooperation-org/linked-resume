// Shared interfaces for all resume section components

export interface FileItem {
  id: string
  file: File
  name: string
  url: string
  uploaded: boolean
  fileExtension: string
  googleId?: string
}

export interface SelectedCredential {
  id: string
  url: string
  name: string
  vc?: any
  fileId?: string
}

/** Common prop shape shared by all multi-item section components */
export interface SectionProps {
  onAddFiles?: (itemIndex?: number) => void
  onDelete?: () => void
  onAddCredential?: (text: string) => void
  onFocus?: () => void
  evidence?: string[][]
  allFiles?: FileItem[]
  onRemoveFile?: (sectionId: string, itemIndex: number, fileIndex: number) => void
}

/** Any section item that supports credential verification */
export interface VerifiableItem {
  id: string
  selectedCredentials: SelectedCredential[]
  credentialLink: string
  verificationStatus: string
  description?: string
  attachedFiles?: string[]
}
