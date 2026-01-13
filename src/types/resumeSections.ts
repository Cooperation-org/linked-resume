export interface Language {
  code: string
  name: string
  nativeName: string
  flag: string
}

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
  isAttestation?: boolean
  vc?: any
  fileId?: string
}

export interface RecommendationEntry {
  id: string
  author: string
  message: string
  relationship?: string
  email?: string
  skills?: string[]
  createdAt?: string
}

export type CredentialLink = string | string[] | undefined

export type SectionListItem =
  | string
  | {
      text: string
      credentialId?: string
      verified?: boolean
    }

