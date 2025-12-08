import { useState, useEffect, useCallback } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { GoogleDriveStorage, Resume, ResumeVC } from '@cooperation/vc-storage' //NOSONAR
import { useDispatch } from 'react-redux'
import { setAuth } from '../redux/slices/auth'
import { getLocalStorage } from '../tools/cookie'
import { authenticatedFetch } from '../tools/auth'
import StorageService from '../storage-singlton'

interface ClaimDetail {
  data: {
    '@context': string[]
    id: string
    type: string[]
    issuer: {
      id: string
      type: string[]
    }
    issuanceDate: string
    expirationDate: string
    credentialSubject: {
      [x: string]: any
      type: string[]
      name: string
      achievement: any
      duration: string
      portfolio: any
    }
  }
}

export interface DriveFileMeta {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
}

const useGoogleDrive = () => {
  const accessToken = getLocalStorage('auth')
  const dispatch = useDispatch()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    if (accessToken) {
      try {
        // Initialize the singleton with current token
        const storageService = StorageService.getInstance()
        storageService.initialize(accessToken)
        storageService.setTokenUpdateCallback((token: string) => {
          dispatch(setAuth({ accessToken: token }))
        })
        setIsInitialized(true)
      } catch (error) {
        console.error('Error initializing GoogleDriveStorage:', error)
        setIsInitialized(false)
      }
    } else {
      console.warn('No access token available.')
      setIsInitialized(false)
    }
  }, [accessToken, dispatch])

  const getContent = useCallback(
    async (fileID: string): Promise<ClaimDetail | null> => {
      if (!isInitialized) {
        console.warn('Storage instance is not available.')
        return null
      }

      try {
        const storageService = StorageService.getInstance()
        const storage = storageService.getStorage()
        const file = await storage.retrieve(fileID)
        return file as unknown as ClaimDetail
      } catch (error) {
        console.error('Error retrieving file:', error)
        return null
      }
    },
    [isInitialized]
  )

  // Get instances from the singleton
  const getInstances = useCallback(() => {
    if (!isInitialized) {
      return {
        storage: null,
        resumeManager: null,
        resumeVC: null
      }
    }

    const storageService = StorageService.getInstance()
    return {
      storage: storageService.getStorage(),
      resumeManager: storageService.getResumeManager(),
      resumeVC: storageService.getResumeVC()
    }
  }, [isInitialized])

  const listFilesMetadata = useCallback(
    async (folderId: string): Promise<DriveFileMeta[]> => {
      try {
        const url = new URL('https://www.googleapis.com/drive/v3/files')
        url.searchParams.set('q', `'${folderId}' in parents and trashed=false`)
        url.searchParams.set('fields', 'files(id,name,mimeType,thumbnailLink)')

        const response = await authenticatedFetch(url.toString(), {}, (token: string) => {
          dispatch(setAuth({ accessToken: token }))
        })

        if (!response.ok) {
          throw new Error(
            `Failed to fetch files: ${response.status} ${response.statusText}`
          )
        }

        const json = await response.json()
        return json.files ?? []
      } catch (error) {
        console.error('Error listing files metadata:', error)
        return []
      }
    },
    [dispatch]
  )

  return {
    getContent,
    instances: getInstances(),
    isInitialized,
    listFilesMetadata
  }
}

export default useGoogleDrive
